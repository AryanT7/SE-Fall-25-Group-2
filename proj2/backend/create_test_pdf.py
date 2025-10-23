#!/usr/bin/env python3
"""
Script to create a test PDF with menu data for OCR testing
"""

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def create_test_menu_pdf():
    """Create a test PDF with menu data."""
    
    # Create PDF document
    filename = "test_menu.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter)
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Create custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    
    section_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=12,
        spaceBefore=20
    )
    
    item_style = ParagraphStyle(
        'MenuItem',
        parent=styles['Normal'],
        fontSize=12,
        spaceAfter=6,
        leftIndent=20
    )
    
    # Content
    story = []
    
    # Title
    story.append(Paragraph("THE GOLDEN CAFE", title_style))
    story.append(Spacer(1, 20))
    
    # Appetizers Section
    story.append(Paragraph("APPETIZERS", section_style))
    story.append(Paragraph("Buffalo Wings - $9.99<br/>Spicy chicken wings with celery and blue cheese dip", item_style))
    story.append(Paragraph("Mozzarella Sticks - $7.99<br/>Golden fried mozzarella cheese with marinara sauce", item_style))
    story.append(Paragraph("Garlic Bread - $5.99<br/>Fresh baked bread with garlic butter and herbs", item_style))
    
    # Main Courses Section
    story.append(Paragraph("MAIN COURSES", section_style))
    story.append(Paragraph("Grilled Salmon - $18.99<br/>Fresh Atlantic salmon with lemon herb butter", item_style))
    story.append(Paragraph("Vegetarian Pasta - $14.99<br/>Penne pasta with seasonal vegetables in tomato sauce", item_style))
    story.append(Paragraph("Chicken Caesar Salad - $12.99<br/>Romaine lettuce with grilled chicken, parmesan, and croutons", item_style))
    story.append(Paragraph("Beef Burger - $15.99<br/>Juicy beef patty with lettuce, tomato, onion, and special sauce", item_style))
    
    # Beverages Section
    story.append(Paragraph("BEVERAGES", section_style))
    story.append(Paragraph("Fresh Orange Juice - $4.99<br/>Freshly squeezed orange juice, 12oz", item_style))
    story.append(Paragraph("Craft Coffee - $3.99<br/>Premium blend coffee, 16oz", item_style))
    story.append(Paragraph("Iced Tea - $2.99<br/>House-brewed iced tea with lemon", item_style))
    
    # Desserts Section
    story.append(Paragraph("DESSERTS", section_style))
    story.append(Paragraph("Chocolate Lava Cake - $6.99<br/>Warm chocolate cake with vanilla ice cream", item_style))
    story.append(Paragraph("Tiramisu - $5.99<br/>Classic Italian dessert with coffee and mascarpone", item_style))
    story.append(Paragraph("Apple Pie - $4.99<br/>Homemade apple pie with cinnamon and whipped cream", item_style))
    
    # Build PDF
    doc.build(story)
    print(f"Test PDF created: {filename}")
    return filename

if __name__ == "__main__":
    create_test_menu_pdf()
