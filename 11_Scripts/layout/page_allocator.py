"""
============================================================
ANN Publisher
Production Page Allocator v1.0
============================================================
"""

from typing import Dict, List


# ============================================================
# Default Category Rules
# ============================================================

PAGE_RULES = {

    1: ["Lead", "Breaking"],

    2: ["महाराष्ट्र", "राजकारण"],

    3: ["देश", "आंतरराष्ट्रीय"],

    4: ["प्रादेशिक"],

    5: ["क्राईम", "न्यायालय"],

    6: [
        "Business",
        "Technology",
        "Entertainment",
        "Editorial"
    ]

}


# ============================================================
# Page Allocator
# ============================================================

class PageAllocator:

    def __init__(self):

        self.rules = PAGE_RULES

        self.pages: Dict[int, List[dict]] = {
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: []
        }

    # ========================================================
    # Reset Pages
    # ========================================================

    def reset(self):

        self.pages = {
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: []
        }

    # ========================================================
    # Add Story
    # ========================================================

    def add_story(self, page, article):

        article["page"] = page

        self.pages[page].append(article)

    # ========================================================
    # Front Page Allocation
    # ========================================================

    def allocate_front_page(self, articles):

        lead = sorted(
            articles,
            key=lambda x: x.get("score", 0),
            reverse=True
        )

        front = lead[:6]

        for story in front:
            self.add_story(1, story)

        return lead[6:]
    # ========================================================
    # Category Allocation
    # ========================================================

    def allocate_categories(self, articles):

        for article in articles:

            category = article.get("category", "")

            allocated = False

            for page, categories in self.rules.items():

                if page == 1:
                    continue

                if category in categories:

                    self.add_story(page, article)

                    allocated = True

                    break

            if not allocated:

                self.add_story(6, article)
    # ========================================================
    # Balance Pages
    # ========================================================

    def balance_pages(self):

        overflow = []

        for page in range(2, 7):

            while len(self.pages[page]) > 8:

                overflow.append(self.pages[page].pop())

        for story in overflow:

            placed = False

            for page in range(2, 7):

                if len(self.pages[page]) < 8:

                    self.pages[page].append(story)

                    placed = True

                    break

            if not placed:

                self.pages[6].append(story)  
    # ========================================================
    # Allocate
    # ========================================================

    def allocate(self, articles):

        self.reset()

        if not articles:
            return self.pages

        remaining = self.allocate_front_page(articles)

        self.allocate_categories(remaining)

        self.balance_pages()

        return self.pages     
# ============================================================
# Public Function
# ============================================================

def allocate_pages(articles):

    allocator = PageAllocator()

    return allocator.allocate(articles)                                         