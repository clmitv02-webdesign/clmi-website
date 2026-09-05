"""Build compact labelled sheets from local browser QA screenshots, not site assets."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[1] / 'docs/evidence/inner'
for kind, width, height, columns in [('desktop', 384, 240, 3), ('mobile', 195, 422, 5)]:
    shots = sorted(root.glob(f'{kind}-*.png'))
    for offset in range(0, len(shots), columns * 3):
        group = shots[offset:offset + columns * 3]
        canvas = Image.new('RGB', (width * columns, (height + 32) * ((len(group) + columns - 1)//columns)), '#ddd')
        draw = ImageDraw.Draw(canvas)
        for i, path in enumerate(group):
            x, y = (i % columns) * width, (i // columns) * (height + 32)
            with Image.open(path) as original:
                thumb = ImageOps.contain(original.convert('RGB'), (width, height))
                canvas.paste(thumb, (x, y+32))
            draw.text((x+5,y+8), path.stem[len(kind)+1:], fill='#111')
        canvas.save(root / f'sheet-{kind}-{offset//(columns*3)+1}.jpg')
