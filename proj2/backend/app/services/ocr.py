import json
import logging
from typing import List, Optional
import PyPDF2
import io
import requests
from ..schemas import OCRMenuItem
from ..config import settings

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        self.api_key = settings.MISTRAL_API_KEY
        self.mistral_url = "https://api.mistral.ai/v1/chat/completions"
    
    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """Extract text content from PDF file bytes."""
        try:
            pdf_file = io.BytesIO(file_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text_content = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text_content += page.extract_text() + "\n"
            
            logger.info(f"Extracted {len(text_content)} characters from PDF")
            return text_content.strip()
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
    
    def parse_menu_with_mistral(self, text_content: str) -> List[OCRMenuItem]:
        """Use Mistral API to parse menu text and extract structured menu items."""
        try:
            prompt = f"""
You are an expert menu parser. Extract menu items from the following restaurant menu text and return them as a JSON array.

For each menu item, extract:
- name: The dish name (required)
- calories: Estimated calories per serving (required, integer)
- price: Price in USD (required, float)
- ingredients: List of main ingredients (optional)
- quantity: Serving size/quantity (optional, e.g., "350ml", "1 slice")
- servings: Number of servings per item (optional, float)
- veg_flag: Whether it's vegetarian (boolean, default true)
- kind: Category like "appetizer", "main", "dessert", "beverage", etc. (optional)

Rules:
1. Only extract actual menu items, not headers or descriptions
2. Estimate calories reasonably based on typical food items
3. Extract prices accurately from the text
4. Set veg_flag to false for meat/seafood items
5. Return ONLY valid JSON array, no other text

Menu text:
{text_content}

Return the JSON array of menu items:
"""

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "mistral-ocr-latest",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "max_tokens": 2000
            }
            
            response = requests.post(self.mistral_url, headers=headers, json=payload)
            if response.status_code != 200:
                print(f"Mistral API error {response.status_code}: {response.text}")

            response.raise_for_status()
            
            response_data = response.json()
            response_text = response_data["choices"][0]["message"]["content"].strip()
            
            # Try to find JSON array in the response
            if response_text.startswith('[') and response_text.endswith(']'):
                json_text = response_text
            else:
                # Look for JSON array within the response
                start_idx = response_text.find('[')
                end_idx = response_text.rfind(']') + 1
                if start_idx != -1 and end_idx != 0:
                    json_text = response_text[start_idx:end_idx]
                else:
                    raise ValueError("No valid JSON array found in Mistral response")
            
            # Parse JSON and convert to OCRMenuItem objects
            menu_data = json.loads(json_text)
            menu_items = []
            
            for item_data in menu_data:
                try:
                    # Convert ingredients list to string if it's a list
                    ingredients = item_data.get('ingredients')
                    if isinstance(ingredients, list):
                        ingredients = ', '.join(ingredients)
                    
                    menu_item = OCRMenuItem(
                        name=item_data.get('name', ''),
                        calories=int(item_data.get('calories', 0)),
                        price=float(item_data.get('price', 0.0)),
                        ingredients=ingredients,
                        quantity=item_data.get('quantity'),
                        servings=item_data.get('servings'),
                        veg_flag=item_data.get('veg_flag', True),
                        kind=item_data.get('kind')
                    )
                    menu_items.append(menu_item)
                except (ValueError, TypeError) as e:
                    logger.warning(f"Skipping invalid menu item: {item_data}, error: {str(e)}")
                    continue
            
            logger.info(f"Successfully parsed {len(menu_items)} menu items")
            return menu_items
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}")
            raise ValueError(f"Failed to parse JSON response from Mistral: {str(e)}")
        except Exception as e:
            logger.error(f"Error parsing menu with Mistral: {str(e)}")
            raise ValueError(f"Failed to parse menu with Mistral API: {str(e)}")

def parse_menu_pdf(file_bytes: bytes) -> List[OCRMenuItem]:
    """
    Main function to parse menu PDF and extract structured menu items.
    
    Args:
        file_bytes: PDF file content as bytes
        
    Returns:
        List of OCRMenuItem objects
    """
    ocr_service = OCRService()
    
    # Extract text from PDF
    text_content = ocr_service.extract_text_from_pdf(file_bytes)
    
    if not text_content.strip():
        raise ValueError("No text content found in PDF")
    
    # Parse menu using Mistral API
    menu_items = ocr_service.parse_menu_with_mistral(text_content)
    
    if not menu_items:
        raise ValueError("No menu items could be extracted from the PDF")
    
    return menu_items