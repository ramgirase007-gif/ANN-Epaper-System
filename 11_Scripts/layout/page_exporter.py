"""
============================================================
ANN Publisher
Production Page Exporter v1.0
============================================================
"""

import json
from pathlib import Path
from datetime import datetime


# ============================================================
# Output Folder
# ============================================================

OUTPUT = Path("03_Layouts")


# ============================================================
# Page Exporter
# ============================================================

class PageExporter:

    def __init__(self):

        self.output = OUTPUT

        self.output.mkdir(parents=True, exist_ok=True)

    # ========================================================
    # Export One Page
    # ========================================================

    def export_page(self, page_number, data):

        filename = self.output / f"page_{page_number:02}.json"

        payload = {
            "page": page_number,
            "exported_at": datetime.now().isoformat(),
            "data": data
        }

        with open(filename, "w", encoding="utf-8") as file:

            json.dump(
                payload,
                file,
                ensure_ascii=False,
                indent=4
            )

        print(f"✓ Exported : {filename}")

    # ========================================================
    # Export All Pages
    # ========================================================

    def export(self, pages):

        for page_number in sorted(pages.keys()):

            self.export_page(

                page_number,

                pages[page_number]

            )


# ============================================================
# Public Function
# ============================================================

def export_pages(pages):

    exporter = PageExporter()

    exporter.export(pages)