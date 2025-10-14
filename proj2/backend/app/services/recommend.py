def daily_calorie_recommendation(height_cm: float, weight_kg: float, sex: str, age_years: int, activity: str) -> int:
    if sex.upper().startswith("M"):
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age_years + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age_years - 161
    factors = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9,
    }
    tdee = bmr * factors.get(activity, 1.55)
    return int(round(tdee))
