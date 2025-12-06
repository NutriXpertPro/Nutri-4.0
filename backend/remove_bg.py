from rembg import remove
from PIL import Image

input_path = "C:/Users/ander/.gemini/antigravity/brain/100b9843-d7fa-47fd-8c80-1fdf16aeb93a/uploaded_image_1765041000480.jpg"
output_path = "c:/Nutri 4.0/frontend/public/logo.png"

try:
    print(f"Opening image: {input_path}")
    input_image = Image.open(input_path)
    
    print("Removing background...")
    output_image = remove(input_image)
    
    print(f"Saving to: {output_path}")
    output_image.save(output_path)
    print("Success!")
except Exception as e:
    print(f"Error: {e}")
