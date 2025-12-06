from PIL import Image, ImageDraw

def remove_background_flood(input_path, output_path, tolerance=30):
    print(f"Opening {input_path}")
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # Get the color of the top-left corner to assume as background
    bg_color = img.getpixel((0, 0))
    print(f"Background color detected at (0,0): {bg_color}")
    
    # Helper to check if a pixel matches background within tolerance
    def is_bg(color, bg, tol):
        return (abs(color[0] - bg[0]) <= tol and
                abs(color[1] - bg[1]) <= tol and
                abs(color[2] - bg[2]) <= tol)

    # We will do a BFS flood fill from all 4 corners
    # (assuming functionality similar to magic wand tool)
    
    # Create a mask initialized to 0 (exclude)
    # We want to find connected background pixels
    visited = set()
    queue = []
    
    corners = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    for x, y in corners:
        if is_bg(img.getpixel((x, y)), bg_color, tolerance):
            queue.append((x, y))
            visited.add((x, y))
    
    pixels = img.load()
    
    count = 0
    while queue:
        x, y = queue.pop(0)
        
        # Set pixel to transparent
        pixels[x, y] = (0, 0, 0, 0)
        count += 1
        
        # Check neighbors
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    if is_bg(pixels[nx, ny], bg_color, tolerance):
                        visited.add((nx, ny))
                        queue.append((nx, ny))
    
    print(f"Processed {count} pixels.")
    img.save(output_path)
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    input_p = "C:/Users/ander/.gemini/antigravity/brain/100b9843-d7fa-47fd-8c80-1fdf16aeb93a/uploaded_image_1765041000480.jpg"
    output_p = "C:/Users/ander/.gemini/antigravity/brain/100b9843-d7fa-47fd-8c80-1fdf16aeb93a/nutrixpert_logo_flood.png"
    
    remove_background_flood(input_p, output_p, tolerance=50)
