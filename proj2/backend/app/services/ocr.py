from typing import List
from ..schemas import OCRMenuItem

def parse_menu_pdf(file_bytes: bytes) -> List[OCRMenuItem]:
    # Stub: replace with OCR + LLM extraction
    return [
        OCRMenuItem(name="Grilled Paneer Wrap", calories=550, price=8.99, veg_flag=True, kind="wrap"),
        OCRMenuItem(name="Chicken Caesar Salad", calories=430, price=9.49, veg_flag=False, kind="salad"),
    ]
