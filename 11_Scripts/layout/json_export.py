import json
from pathlib import Path

# =====================================================
# Project Root
# =====================================================
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# =====================================================
# Output Folder
# =====================================================
OUTPUT = BASE_DIR / "03_Layouts"


def export_layout(layout):
    """
    Export newspaper layout to edition.json
    """

    # Create Output Folder if it doesn't exist
    OUTPUT.mkdir(parents=True, exist_ok=True)

    # Output File
    file = OUTPUT / "edition.json"

    # Save JSON
    with open(file, "w", encoding="utf-8") as fp:
        json.dump(
            layout,
            fp,
            ensure_ascii=False,
            indent=4
        )

    print()
    print("=" * 60)
    print("LAYOUT EXPORT")
    print("=" * 60)
    print("Saving To   :", file.resolve())
    print("File Name   :", file.name)
    print("Status      : SUCCESS")
    print("=" * 60)