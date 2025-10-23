from app.services.recommend import daily_calorie_recommendation
from app.services.ocr import parse_menu_pdf

def test_daily_calorie_recommendation_male_moderate():
    cals = daily_calorie_recommendation(height_cm=175, weight_kg=70, sex="M", age_years=30, activity="moderate")
    assert isinstance(cals, int)
    assert 2200 <= cals <= 2800

def test_daily_calorie_recommendation_female_sedentary():
    cals = daily_calorie_recommendation(height_cm=160, weight_kg=60, sex="F", age_years=28, activity="sedentary")
    assert 1400 <= cals <= 2000

def test_parse_menu_pdf_stub():
    items = parse_menu_pdf(b"fake-pdf")
    assert len(items) >= 2
    names = [i.name for i in items]
    assert "Grilled Paneer Wrap" in names
