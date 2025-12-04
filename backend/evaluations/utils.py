import math

def calculate_navy_body_fat(gender, height_m, waist_cm, neck_cm, hip_cm=None):
    """
    Calculates body fat percentage using the U.S. Navy Method.

    Args:
        gender (str): The gender of the person ('male' or 'female').
        height_m (float): Height in meters.
        waist_cm (float): Waist circumference in centimeters.
        neck_cm (float): Neck circumference in centimeters.
        hip_cm (float, optional): Hip circumference in centimeters (required for females).

    Returns:
        float: The calculated body fat percentage, or None if inputs are invalid.
    """
    if not all([gender, height_m, waist_cm, neck_cm]):
        return None

    try:
        height_cm = height_m * 100
        if height_cm <= 0 or waist_cm <= 0 or neck_cm <= 0:
            return None

        if gender.lower() == 'male':
            # Formula for men
            body_fat = 86.010 * math.log10(waist_cm - neck_cm) - 70.041 * math.log10(height_cm) + 36.76
        elif gender.lower() == 'female':
            if not hip_cm or hip_cm <= 0:
                return None
            # Formula for women
            body_fat = 163.205 * math.log10(waist_cm + hip_cm - neck_cm) - 97.684 * math.log10(height_cm) - 78.387
        else:
            return None
        
        return round(body_fat, 2)

    except (ValueError, TypeError):
        # Catches math domain errors (e.g., log10 of a non-positive number)
        return None