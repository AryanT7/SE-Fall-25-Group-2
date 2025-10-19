# OCR Menu Processing Service

This service provides OCR (Optical Character Recognition) functionality for processing restaurant menu PDFs and converting them into structured JSON format using Mistral AI.

## Features

- **PDF Text Extraction**: Extract text content from PDF menu files
- **AI-Powered Parsing**: Use Mistral AI to intelligently parse menu text and extract structured data
- **Structured Output**: Convert raw menu text into JSON format with standardized fields
- **RESTful API**: FastAPI endpoints for easy integration with frontend applications

## Setup

### Prerequisites

1. **Mistral API Key**: You need a valid Mistral API key to use this service
2. **Python Dependencies**: Install required packages

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set your Mistral API key:
```bash
export MISTRAL_API_KEY="your-mistral-api-key-here"
```

### Environment Variables

- `MISTRAL_API_KEY`: Your Mistral API key (required)

## API Endpoints

### 1. Parse Menu from PDF

**POST** `/ocr/parse-menu`

Upload a PDF file containing a restaurant menu to extract structured menu items.

**Request:**
- Content-Type: `multipart/form-data`
- Body: PDF file upload

**Response:**
```json
{
  "items": [
    {
      "name": "Grilled Chicken Sandwich",
      "calories": 450,
      "price": 12.99,
      "ingredients": "chicken breast, lettuce, tomato, mayo",
      "quantity": "1 sandwich",
      "servings": 1.0,
      "veg_flag": false,
      "kind": "main"
    }
  ]
}
```

### 2. Parse Menu from Text

**POST** `/ocr/parse-menu-text`

Parse menu items from raw text content (useful for testing or when you already have extracted text).

**Request:**
```json
{
  "text_content": "Menu text content here..."
}
```

**Response:** Same as above

### 3. Health Check

**GET** `/ocr/health`

Check if the OCR service and Mistral API are working correctly.

**Response:**
```json
{
  "status": "healthy",
  "mistral_api": "connected",
  "service": "OCR Service"
}
```

## Menu Item Schema

Each parsed menu item contains the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name of the menu item |
| `calories` | integer | Yes | Estimated calories per serving |
| `price` | float | Yes | Price in USD |
| `ingredients` | string | No | List of main ingredients |
| `quantity` | string | No | Serving size (e.g., "350ml", "1 slice") |
| `servings` | float | No | Number of servings per item |
| `veg_flag` | boolean | No | Whether the item is vegetarian (default: true) |
| `kind` | string | No | Category (e.g., "appetizer", "main", "dessert", "beverage") |

## Usage Examples

### Python Client Example

```python
import requests

# Upload PDF file
with open("menu.pdf", "rb") as f:
    files = {"file": f}
    response = requests.post(
        "http://localhost:8000/ocr/parse-menu",
        files=files,
        headers={"Authorization": "Bearer your-jwt-token"}
    )

menu_data = response.json()
print(f"Parsed {len(menu_data['items'])} menu items")
```

### cURL Example

```bash
curl -X POST "http://localhost:8000/ocr/parse-menu" \
  -H "Authorization: Bearer your-jwt-token" \
  -F "file=@menu.pdf"
```

## Testing

Run the test script to verify OCR functionality:

```bash
cd proj2/backend
python test_ocr.py
```

This will test:
- Mistral API connectivity
- Menu text parsing
- JSON output validation

## Error Handling

The service handles various error scenarios:

- **Invalid file format**: Only PDF files are accepted
- **Empty files**: Files with no content are rejected
- **File size limits**: Files larger than 10MB are rejected
- **API errors**: Mistral API failures are handled gracefully
- **Parsing errors**: Invalid JSON responses are caught and reported

## Performance Considerations

- **File size limit**: 10MB maximum for PDF uploads
- **Processing time**: Depends on PDF complexity and Mistral API response time
- **Rate limits**: Subject to Mistral API rate limits
- **Memory usage**: PDFs are processed in memory

## Security

- **Authentication required**: All endpoints require valid JWT tokens
- **File validation**: Only PDF files are accepted
- **Input sanitization**: All inputs are validated and sanitized

## Troubleshooting

### Common Issues

1. **"Mistral API key not set"**
   - Solution: Set the `MISTRAL_API_KEY` environment variable

2. **"No text content found in PDF"**
   - Solution: Ensure the PDF contains extractable text (not just images)

3. **"Failed to parse JSON response from Mistral"**
   - Solution: Check Mistral API status and try again

4. **"File size too large"**
   - Solution: Reduce PDF file size or compress the PDF

### Debug Mode

Enable debug logging by setting the log level:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Future Enhancements

- Support for image-based PDFs using OCR libraries
- Batch processing for multiple PDFs
- Custom menu templates for different restaurant types
- Integration with existing menu management systems
- Caching for improved performance
