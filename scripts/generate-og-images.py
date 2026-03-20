#!/usr/bin/env python3
"""Generate OG images for all pages on lakshveer.com"""

from PIL import Image, ImageDraw, ImageFont
import os

# Constants
WIDTH = 1200
HEIGHT = 630
BG_COLOR = (5, 5, 8)  # #050508
ACCENT_COLOR = (34, 211, 238)  # #22d3ee
TEXT_PRIMARY = (244, 244, 245)  # #f4f4f5
TEXT_SECONDARY = (161, 161, 170)  # #a1a1aa
TEXT_MUTED = (113, 113, 122)  # #71717a
BORDER_COLOR = (39, 39, 42, 30)  # rgba(255,255,255,0.12)

OUTPUT_DIR = "/home/user/lakshveer-website/public/og"

# Page configurations
PAGES = {
    "universe": {
        "title": "Lakshveer's Learning Universe",
        "subtitle": "Build to Learn — 170+ projects, skills, and possibilities"
    },
    "journey": {
        "title": "The Journey",
        "subtitle": "From first robot at age 5 to shipping products at age 8"
    },
    "systems": {
        "title": "Systems",
        "subtitle": "Autonomous vehicles, robots, and AI-powered solutions"
    },
    "impact": {
        "title": "Impact",
        "subtitle": "170+ projects • 3 products shipped • ₹1.4L+ in grants"
    },
    "recognition": {
        "title": "Voices",
        "subtitle": "What founders and builders say about Lakshveer"
    },
    "venture": {
        "title": "Projects by Laksh",
        "subtitle": "A father-son venture building hardware education products"
    },
    "collaborate": {
        "title": "Collaborate",
        "subtitle": "Partner on hardware projects, workshops, or research"
    },
    "invite": {
        "title": "Invite Laksh",
        "subtitle": "Guest talks, hackathons, and events"
    },
    "press": {
        "title": "Press Kit",
        "subtitle": "Media resources, photos, and key facts"
    },
    "endorse": {
        "title": "Endorse Lakshveer",
        "subtitle": "Add your voice to support his builder journey"
    },
}

def get_font(size, bold=False):
    """Get a font, with fallbacks"""
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in font_paths:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

def draw_text_wrapped(draw, text, x, y, max_width, font, fill, line_spacing=1.4):
    """Draw text with word wrapping"""
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    
    if current_line:
        lines.append(' '.join(current_line))
    
    current_y = y
    for line in lines[:2]:  # Max 2 lines for title
        draw.text((x, current_y), line, font=font, fill=fill)
        bbox = draw.textbbox((0, 0), line, font=font)
        current_y += (bbox[3] - bbox[1]) * line_spacing
    
    return current_y

def create_og_image(page_name, title, subtitle):
    """Create an OG image for a page"""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Add subtle gradient overlay (approximate with rectangles)
    for i in range(100):
        alpha = int(3 * (1 - i / 100))
        if alpha > 0:
            color = (ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2])
            draw.rectangle([0, i * 6, WIDTH, (i + 1) * 6], fill=color)
    
    # Redraw background with transparency
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Border
    draw.rectangle([30, 30, WIDTH - 30, HEIGHT - 30], outline=(255, 255, 255, 25), width=2)
    
    # Accent bar
    draw.rectangle([80, 150, 86, 230], fill=ACCENT_COLOR)
    
    # Title
    title_font = get_font(52, bold=True)
    draw.text((110, 160), title, font=title_font, fill=TEXT_PRIMARY)
    
    # Subtitle
    if subtitle:
        subtitle_font = get_font(28)
        draw.text((80, 280), subtitle, font=subtitle_font, fill=TEXT_SECONDARY)
    
    # Bottom branding bar
    draw.rectangle([0, 530, WIDTH, HEIGHT], fill=(0, 0, 0, 76))
    
    # Name
    name_font = get_font(24, bold=True)
    draw.text((80, 560), "Lakshveer Rao", font=name_font, fill=TEXT_PRIMARY)
    
    age_font = get_font(20)
    draw.text((250, 562), "(Age 8)", font=age_font, fill=TEXT_MUTED)
    
    # Tagline
    tagline_font = get_font(18)
    draw.text((80, 595), "Hardware + AI Systems Builder", font=tagline_font, fill=ACCENT_COLOR)
    
    # URL
    url_font = get_font(20)
    url_text = "lakshveer.com"
    bbox = draw.textbbox((0, 0), url_text, font=url_font)
    draw.text((WIDTH - 80 - (bbox[2] - bbox[0]), 575), url_text, font=url_font, fill=TEXT_MUTED)
    
    # Save
    output_path = os.path.join(OUTPUT_DIR, f"{page_name}.png")
    img.save(output_path, "PNG", optimize=True)
    print(f"Created: {output_path}")
    return output_path

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    for page_name, config in PAGES.items():
        create_og_image(page_name, config["title"], config["subtitle"])
    
    print(f"\nGenerated {len(PAGES)} OG images in {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
