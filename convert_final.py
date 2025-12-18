
import base64
import os

def convert_to_svg_embed(png_path, svg_path):
    print(f"Embedding {png_path} into {svg_path}...")
    try:
        if not os.path.exists(png_path):
            print(f"Error: File not found {png_path}")
            return False

        with open(png_path, "rb") as f:
            png_data = f.read()
            b64_data = base64.b64encode(png_data).decode("utf-8")
        
        # We need width/height. 
        # Since we can't easily rely on external libs in this env (issues with cv2/pil on 3.14),
        # let's try to parse PNG header for IHDR chunk.
        # PNG signature: 8 bytes
        # IHDR chunk: 4 bytes length, 4 bytes type (IHDR), 4 bytes width, 4 bytes height
        
        width = 500 # Default fallback
        height = 500 # Default fallback
        
        try:
            with open(png_path, "rb") as f:
                f.seek(16)
                width_bytes = f.read(4)
                height_bytes = f.read(4)
                width = int.from_bytes(width_bytes, byteorder='big')
                height = int.from_bytes(height_bytes, byteorder='big')
            print(f"Detected dimensions: {width}x{height}")
        except Exception as e:
            print(f"Could not detect dimensions, using default 500x500. Error: {e}")

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
    input_file = r"C:\Nutri 4.0\imagem\logo oficial.png"
    # Generate directly to assets to save a copy step if we wanted, but let's stick to generating in imagem first.
    output_svg = r"C:\Nutri 4.0\imagem\logo_final.svg"
    
    convert_to_svg_embed(input_file, output_svg)
