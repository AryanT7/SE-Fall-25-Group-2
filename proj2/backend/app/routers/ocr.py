from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List
import logging
from ..schemas import OCRResult, OCRMenuItem
from ..services.ocr import parse_menu_pdf
from ..deps import get_current_user
from ..models import User

router = APIRouter(prefix="/ocr", tags=["OCR"])
logger = logging.getLogger(__name__)

@router.post("/parse-menu", response_model=OCRResult)
async def parse_menu_from_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Parse a menu PDF file and extract structured menu items using OCR and Mistral AI.
    
    Args:
        file: PDF file containing the menu
        current_user: Current authenticated user
        
    Returns:
        OCRResult containing list of parsed menu items
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are supported"
            )
        
        # Read file content
        file_content = await file.read()
        
        if len(file_content) == 0:
            raise HTTPException(
                status_code=400,
                detail="Empty file provided"
            )
        
        # Check file size (limit to 10MB)
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File size too large. Maximum size is 10MB"
            )
        
        logger.info(f"Processing PDF file: {file.filename} ({len(file_content)} bytes)")
        
        # Parse the PDF using OCR service
        menu_items = parse_menu_pdf(file_content)
        
        logger.info(f"Successfully parsed {len(menu_items)} menu items from {file.filename}")
        
        return OCRResult(items=menu_items)
        
    except ValueError as e:
        logger.error(f"OCR parsing error: {str(e)}")
        raise HTTPException(
            status_code=422,
            detail=f"Failed to parse menu: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error during OCR processing: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during menu parsing"
        )

@router.post("/parse-menu-text", response_model=OCRResult)
async def parse_menu_from_text(
    text_content: str,
    current_user: User = Depends(get_current_user)
):
    """
    Parse menu text content and extract structured menu items using Mistral AI.
    This endpoint is useful for testing or when you already have extracted text.
    
    Args:
        text_content: Raw text content of the menu
        current_user: Current authenticated user
        
    Returns:
        OCRResult containing list of parsed menu items
    """
    try:
        if not text_content.strip():
            raise HTTPException(
                status_code=400,
                detail="Empty text content provided"
            )
        
        logger.info(f"Processing menu text content ({len(text_content)} characters)")
        
        # Import OCRService to use parse_menu_with_mistral directly
        from ..services.ocr import OCRService
        ocr_service = OCRService()
        
        # Parse the text using Mistral API
        menu_items = ocr_service.parse_menu_with_mistral(text_content)
        
        logger.info(f"Successfully parsed {len(menu_items)} menu items from text content")
        
        return OCRResult(items=menu_items)
        
    except ValueError as e:
        logger.error(f"Menu parsing error: {str(e)}")
        raise HTTPException(
            status_code=422,
            detail=f"Failed to parse menu text: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error during menu text parsing: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during menu text parsing"
        )

@router.get("/health")
async def ocr_health_check():
    """
    Health check endpoint for OCR service.
    """
    try:
        # Test Mistral API connection
        from ..services.ocr import OCRService
        ocr_service = OCRService()
        
        # Simple test to verify API key is working
        headers = {
            "Authorization": f"Bearer {ocr_service.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Cafe Calories OCR Health Check"
        }
        
        payload = {
            "model": "mistralai/mistral-small-latest",
            "messages": [{"role": "user", "content": "Hello"}],
            "max_tokens": 10,
            "stream": False
        }
        
        import requests
        test_response = requests.post(ocr_service.openrouter_url, headers=headers, json=payload)
        test_response.raise_for_status()
        
        return {
            "status": "healthy",
            "mistral_api": "connected",
            "service": "OCR Service"
        }
        
    except Exception as e:
        logger.error(f"OCR health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "mistral_api": "disconnected",
                "error": str(e),
                "service": "OCR Service"
            }
        )
