import base64
from PIL import Image
import io

def analyze_logo():
    try:
        with open('c:/Nutri 4.0/frontend/public/logo.svg', 'r') as f:
            content = f.read()
        
        # Extract base64
        marker = 'xlink:href="data:image/png;base64,'
        start = content.find(marker)
        if start == -1:
            print("Marker not found")
            return
        
        start += len(marker)
        end = content.find('"', start)
        if end == -1:
            print("End quote not found")
            return
        
        b64 = content[start:end]
        img_data = base64.b64decode(b64)
        img = Image.open(io.BytesIO(img_data)).convert('RGBA')
        data = img.getdata()
        
        colors = {}
        for r, g, b, a in data:
            if a > 200: # Opacity threshold
                rgb = (r, g, b)
                colors[rgb] = colors.get(rgb, 0) + 1
        
        sorted_colors = sorted(colors.items(), key=lambda x: x[1], reverse=True)
        for (r, g, b), count in sorted_colors[:50]:
            print(f"#{r:02x}{g:02x}{b:02x} : {count}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    analyze_logo()
