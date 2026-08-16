import os
import shutil
from PIL import Image

bg_hex = '#05102c'
bg_xml = f'''<?xml version="1.0" encoding="utf-8"?>
<color xmlns:android="http://schemas.android.com/apk/res/android"
    android:color="{bg_hex}" />
'''

res_dir = 'catla-tech-app/app/src/main/res'
drawable_dir = os.path.join(res_dir, 'drawable')

# 1. Update background XML
with open(os.path.join(drawable_dir, 'ic_launcher_background.xml'), 'w') as f:
    f.write(bg_xml)

# 2. Delete foreground XML if it exists
fg_xml = os.path.join(drawable_dir, 'ic_launcher_foreground.xml')
if os.path.exists(fg_xml):
    os.remove(fg_xml)

# 3. Generate mipmap images
# We use the new user uploaded logo for the foreground
# We use app-icon-512.png (solid bg) for the fallback ic_launcher / round

fg_img = Image.open('C:\\Users\\ZOHEB\\.gemini\\antigravity\\brain\\3d9fa087-e74b-4f84-9f60-4588b1db8d58\\.user_uploaded\\media_1786879141619.png').convert('RGBA')
solid_img = Image.open('public/app-icon-512.png').convert('RGBA')

sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}

for folder, size in sizes.items():
    folder_path = os.path.join(res_dir, folder)
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    
    # Adaptive foreground (transparent) - needs to be slightly smaller to fit safely
    # Guidelines say adaptive icon foreground is 108x108 with 72x72 safe zone
    # So for the final size, the logo should take up about 66% of the image.
    fg_canvas = Image.new('RGBA', (size, size), (0,0,0,0))
    fg_size = int(size * 0.66)
    fg_resized = fg_img.resize((fg_size, fg_size), Image.Resampling.LANCZOS)
    offset = ((size - fg_size)//2, (size - fg_size)//2)
    fg_canvas.paste(fg_resized, offset, fg_resized)
    fg_canvas.save(os.path.join(folder_path, 'ic_launcher_foreground.png'), 'PNG')
    
    # Fallback legacy icons (solid background)
    solid_resized = solid_img.resize((size, size), Image.Resampling.LANCZOS)
    
    for name in ['ic_launcher', 'ic_launcher_round']:
        solid_resized.save(os.path.join(folder_path, f'{name}.png'), 'PNG')
        solid_resized.save(os.path.join(folder_path, f'{name}.webp'), 'WEBP')

print('Icon generation complete!')
