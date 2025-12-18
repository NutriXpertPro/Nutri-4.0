
import sys
import os
import cv2
import numpy as np
from PIL import Image
import warnings

# Suppress some warnings
warnings.filterwarnings("ignore")

def remove_background_rembg(input_path, output_png_path):
    print(f"Loading rembg...")
    try:
        from rembg import remove
        print(f"Processing image with rembg: {input_path}")
        
        with open(input_path, 'rb') as i:
            with open(output_png_path, 'wb') as o:
                input_data = i.read()
                output_data = remove(input_data)
                o.write(output_data)
        print(f"Background removed. Saved to: {output_png_path}")
        return True
    except ImportError:
        print("Error: rembg not installed. Cannot remove background successfully.")
        return False
    except Exception as e:
        print(f"Error executing rembg: {e}")
        return False

def image_to_svg_contours(image_path, output_svg_path):
    print(f"Vectorizing image: {image_path} -> {output_svg_path}")
    
    # Read image with alpha
    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    
    if img is None:
        print("Error reading intermediate image.")
        return

    # Extract alpha channel
    if img.shape[2] == 4:
        alpha = img[:, :, 3]
    else:
        # If no alpha, assume black background or just grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, alpha = cv2.threshold(gray, 1, 255, cv2.THRESH_BINARY)

    # Find contours
    contours, hierarchy = cv2.findContours(alpha, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # SVG Header
    height, width = alpha.shape
    svg_content = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" version="1.1">',
        f'  <desc>Converted from {os.path.basename(image_path)}</desc>'
    ]

    # Process contours
    print(f"Found {len(contours)} contours.")
    for i, cnt in enumerate(contours):
        if cv2.contourArea(cnt) < 50: # Filter noise
            continue
            
        # Simplify contour
        epsilon = 0.005 * cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        
        path_data = "M"
        for point in approx:
            x, y = point[0]
            path_data += f" {x},{y}"
        path_data += " Z"
        
        # Color: Just using block black for silhouette, or try to sample color?
        # User asked for "image" conversion. A full color vectorizer is complex.
        # "Adapts to sizes" -> The silhouette is most important or just embedding the bitmap which is NOT pure vector.
        # But user asked for SVG specifically.
        # Let's try to sample the average color of the contour area.
        mask = np.zeros(alpha.shape, np.uint8)
        cv2.drawContours(mask, [cnt], -1, 255, -1)
        mean_color = cv2.mean(img, mask=mask)
        # OpenCV is BGR
        color_hex = "#{:02x}{:02x}{:02x}".format(int(mean_color[2]), int(mean_color[1]), int(mean_color[0]))

        svg_content.append(f'  <path d="{path_data}" fill="{color_hex}" stroke="none" />')

    svg_content.append('</svg>')
    
    with open(output_svg_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(svg_content))
    print("SVG saved.")

if __name__ == "__main__":
    input_file = r"C:\Nutri 4.0\imagem\download.jpg"
    temp_png = r"C:\Nutri 4.0\imagem\temp_nobg.png"
    output_svg = r"C:\Nutri 4.0\imagem\download.svg"
    
    if not os.path.exists(input_file):
        print(f"File not found: {input_file}")
        sys.exit(1)

    # 1. Remove Background
    success = remove_background_rembg(input_file, temp_png)
    
    # 2. Convert to SVG
    if success:
        image_to_svg_contours(temp_png, output_svg)
    else:
        print("Skipping SVG conversion due to background removal failure.")
