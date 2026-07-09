import json
from pathlib import Path

OUTPUT = Path("../../03_Layouts")


def export_pages(pages):

    OUTPUT.mkdir(parents=True, exist_ok=True)

    for page_no, data in pages.items():

        filename = OUTPUT / f"page_{page_no:02}.json"

        with open(filename, "w", encoding="utf-8") as file:

            json.dump(
                data,
                file,
                ensure_ascii=False,
                indent=4
            )

        print(f"Exported : {filename}")