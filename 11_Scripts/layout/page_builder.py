"""
============================================================
ANN Publisher
Production Page Builder v1.0
============================================================
"""

from typing import Dict

from layout.page_allocator import allocate_pages
from layout.page_exporter import export_pages


class PageBuilder:

    def __init__(self):

        self.document = {}

    # ========================================================
    # Reset
    # ========================================================

    def reset(self):

        self.document = {}

    # ========================================================
    # Build One Page
    # ========================================================

    def build_page(self, page_number, stories):

        return {
            "page": page_number,
            "story_count": len(stories),
            "stories": stories
        }

    # ========================================================
    # Build Document
    # ========================================================

    def build(self, articles):

        self.reset()

        pages = allocate_pages(articles)

        for page_number in sorted(pages.keys()):

            self.document[page_number] = self.build_page(

                page_number,

                pages[page_number]

            )

        export_pages(self.document)

        return self.document


# ============================================================
# Public Function
# ============================================================

def build_pages(articles):

    builder = PageBuilder()

    return builder.build(articles)