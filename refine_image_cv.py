
import cv2
import numpy as np
import sys
import os
import base64

def remove_background_chromakey(input_path, output_png_path):
    print(f"Opening image: {input_path}")
    img = cv2.imread(input_path)
    if img is None:
        print("Failed to load image.")
        return False

    # Convert to HSV
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # Define color ranges to remove
    # User said: "preto" (black) and "verde" (green) background pieces
    
    # 1. Green Mask
    # Green in HSV is roughly 35-85 hue
    lower_green = np.array([35, 30, 30])
    upper_green = np.array([85, 255, 255])
    mask_green = cv2.inRange(hsv, lower_green, upper_green)

    # 2. Black Mask
    # Black is low Value (brightness). Saturation can vary.
    lower_black = np.array([0, 0, 0])
    upper_black = np.array([180, 255, 40]) # Value < 40 is very dark
    mask_black = cv2.inRange(hsv, lower_black, upper_black)

    # 3. Combine masks (pixels to REMOVE)
    mask_to_remove = cv2.bitwise_or(mask_green, mask_black)

    # Invert mask (pixels to KEEP)
    mask_keep = cv2.bitwise_not(mask_to_remove)

    # Optional: Morphological operations to clean up noise
    kernel = np.ones((3,3), np.uint8)
    mask_keep = cv2.morphologyEx(mask_keep, cv2.MORPH_OPEN, kernel, iterations=1)
    mask_keep = cv2.morphologyEx(mask_keep, cv2.MORPH_DILATE, kernel, iterations=1)

    # Create RGBA image
    b, g, r = cv2.split(img)
    rgba = [b, g, r, mask_keep]
    dst = cv2.merge(rgba, 4)

    cv2.imwrite(output_png_path, dst)
    print(f"Saved refined PNG: {output_png_path}")
    return True

def convert_to_svg_embed(png_path, svg_path):
    # Same embed logic as before, just to ensure consistency
    try:
        with open(png_path, "rb") as f:
            png_data = f.read()
            b64_data = base64.b64encode(png_data).decode("utf-8")
        
        # Read dimensions from PNG header or just trust CV2 output
        # CV2 wrote it, let's read it back or assume size matches original calculation? 
        # Simpler to read back just to be safe on bytes
        try:
           from PIL import Image
           img = Image.open(png_path)
           width, height = img.size
        except:
           # Fallback if PIL fails, usually cv2 is installed if we are here
           img_cv = cv2.imread(png_path, cv2.IMREAD_UNCHANGED)
           height, width, _ = img_cv.shape

        svg_content = f"""<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <image width="{width}" height="{height}" xlink:href="data:image/png;base64,{b64_data}"/>
</svg>"""

        with open(svg_path, "w", encoding="utf-8") as f:
            f.write(svg_content)
        return True
    except Exception as e:
        print(f"SVG Error: {e}")
        return False

if __name__ == "__main__":
    input_file = r"C:\Nutri 4.0\imagem\download.jpg"
    temp_png = r"C:\Nutri 4.0\imagem\download_refined.png"
    output_svg = r"C:\Nutri 4.0\imagem\download.svg"
    
    if remove_background_chromakey(input_file, temp_png):
        convert_to_svg_embed(temp_png, output_svg)
        print("Done.")
    else:
        sys.exit(1)
