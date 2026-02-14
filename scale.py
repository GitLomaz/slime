import os
from PIL import Image

INPUT_FOLDER = "images"  # change as needed
SCALE_FACTOR = 1.5

SUPPORTED_EXTENSIONS = (".png", ".jpg", ".jpeg", ".bmp", ".gif", ".tiff", ".webp")

def scale_image(input_path, output_path, scale):
    with Image.open(input_path) as img:
        width, height = img.size

        new_width = int(width * scale)
        new_height = int(height * scale)

        resized = img.resize((new_width, new_height), Image.NEAREST)

        resized.save(output_path)
        print(f"Created: {output_path} ({width}x{height} → {new_width}x{new_height})")

def process_folder(folder):
    for filename in os.listdir(folder):
        if not filename.lower().endswith(SUPPORTED_EXTENSIONS):
            continue

        name, ext = os.path.splitext(filename)

        input_path = os.path.join(folder, filename)
        output_filename = f"{name}_big{ext}"
        output_path = os.path.join(folder, output_filename)

        scale_image(input_path, output_path, SCALE_FACTOR)

if __name__ == "__main__":
    process_folder(INPUT_FOLDER)
