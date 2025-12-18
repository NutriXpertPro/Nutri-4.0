
import sys
import os
import base64
from PIL import Image, ImageDraw

def remove_background_floodfill(input_path, output_png_path, tolerance=30):
    print(f"Opening image: {input_path}")
    try:
        img = Image.open(input_path).convert("RGBA")
    except Exception as e:
        print(f"Failed to open image: {e}")
        return False

    width, height = img.size
    pixels = img.load()
    
    # Analyze corners to identify background color
    corners = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    bg_candidates = [pixels[x, y] for x, y in corners]
    
    # Simple heuristic: take top-left as seed
    seed_color = bg_candidates[0]
    print(f"Assuming background color from top-left: {seed_color}")

    # BFS Floodfill
    # Visited set not needed if we mark pixels as transparent? 
    # But transparent pixels are (0,0,0,0). We need to distinguish "visited/processed" vs "to process".
    # Using a set of visited coordinates for safety to avoid infinite loops if tolerance is weird.
    
    queue = [corners[0], corners[1], corners[2], corners[3]]
    visited = set(queue)
    
    # Helper to check color difference
    def is_similar(c1, c2, tol):
        # c1 is current pixel (RGBA), c2 is seed/bg
        diff = abs(c1[0] - c2[0]) + abs(c1[1] - c2[1]) + abs(c1[2] - c2[2])
        return diff < tol * 3

    # We might need to process a lot of pixels. Recursion limit is risky. Using list queue.
    # Optimization: processing purely in python is slow for 4K images.
    # Small optimization: checking if pixel is already transparent.

    processed_count = 0
    
    # To speed up, we don't 'visit' every single background pixel if it's large.
    # But we have to in order to fill.
    # LIMITATION: Python loops are slow. For 1MP image, this takes seconds/minutes.
    # Hope the image is not huge.
    
    while queue:
        x, y = queue.pop(0)
        current_color = pixels[x, y]
        
        # If it's already transparent, skip
        if current_color[3] == 0:
            continue
            
        # Make transparent
        pixels[x, y] = (0, 0, 0, 0)
        processed_count += 1
        
        # Check neighbors
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    neighbor_color = pixels[nx, ny]
                    # Check similarity to SEED (original bg color) or LOCAL neighbor?
                    # Usually SEED is safer to avoid drift, but local handles gradients better.
                    # Using SEED for simplicity of "background removal".
                    if is_similar(neighbor_color, seed_color, tolerance):
                        visited.add((nx, ny))
                        queue.append((nx, ny))

    print(f"Processed {processed_count} pixels.")
    img.save(output_png_path)
    print(f"Saved transparent PNG: {output_png_path}")
    return True

def convert_to_svg_embed(png_path, svg_path):
    print(f"Embedding {png_path} into {svg_path}...")
    try:
        img = Image.open(png_path)
        width, height = img.size
        
        with open(png_path, "rb") as f:
            png_data = f.read()
            b64_data = base64.b64encode(png_data).decode("utf-8")
            
        svg_content = f"""<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <image width="{width}" height="{height}" xlink:href="data:image/png;base64,{b64_data}"/>
</svg>"""

        with open(svg_path, "w", encoding="utf-8") as f:
            f.write(svg_content)
            
        print("SVG created successfully.")
        return True
    except Exception as e:
        print(f"Error creating SVG: {e}")
        return False

if __name__ == "__main__":
    input_file = r"C:\Nutri 4.0\imagem\download.jpg"
    temp_png = r"C:\Nutri 4.0\imagem\download_nobg.png"
    output_svg = r"C:\Nutri 4.0\imagem\download.svg"
    
    if not os.path.exists(input_file):
        print("Input file not found.")
        sys.exit(1)

    print("Step 1: Removing Background (Floodfill)...")
    success = remove_background_floodfill(input_file, temp_png)
    
    if success:
        print("Step 2: Converting to SVG...")
        convert_to_svg_embed(temp_png, output_svg)
        print("Done!")
    else:
        print("Background removal failed.")
