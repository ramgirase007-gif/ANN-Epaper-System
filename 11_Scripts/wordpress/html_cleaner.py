import html
import re

def clean_html(text):
    if not text:
        return ""

    # HTML Entities Decode
    text = html.unescape(text)

    # HTML Tags Remove
    text = re.sub(r"<[^>]+>", "", text)

    # Extra Spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()