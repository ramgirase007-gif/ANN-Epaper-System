"""
============================================================
ANN Publisher
Production Layout Engine v1.0
============================================================
"""

from dataclasses import dataclass
from typing import Dict, List, Any


# ============================================================
# Slot Definition
# ============================================================

@dataclass
class LayoutSlot:
    page: int
    frame: str

    columns: int

    width: int
    height: int

    priority: int

    image: bool = False

    used: bool = False


# ============================================================
# Layout Engine
# ============================================================

class LayoutEngine:

    def __init__(self):

        self.pages: Dict[int, List[dict]] = {}

        self.slots: List[LayoutSlot] = []

        self.build_slots()

    def build_slots(self):
        """
        Build page slots.
        """
        self.slots.clear()

        # ----------------------------------------------------
        # FRONT PAGE
        # ----------------------------------------------------

        self.slots.extend([

            LayoutSlot(
                1,
                "LEAD",
                4,
                980,
                360,
                100,
                True
            ),

            LayoutSlot(
                1,
                "SECOND",
                3,
                720,
                260,
                90,
                True
            ),

            LayoutSlot(
                1,
                "PHOTO",
                2,
                460,
                240,
                80,
                True
            ),

            LayoutSlot(
                1,
                "BRIEF_1",
                1,
                230,
                180,
                60,
                False
            ),

            LayoutSlot(
                1,
                "BRIEF_2",
                1,
                230,
                180,
                60,
                False
            ),

            LayoutSlot(
                1,
                "BOTTOM",
                4,
                980,
                120,
                20,
                False
            ),

        ])
        # ----------------------------------------------------
        # PAGE 2 TO PAGE 6
        # ----------------------------------------------------

        for page in range(2, 7):

            self.slots.extend([

                LayoutSlot(
                    page,
                    "LEAD",
                    3,
                    720,
                    280,
                    90,
                    True
                ),

                LayoutSlot(
                    page,
                    "PHOTO",
                    2,
                    460,
                    240,
                    80,
                    True
                ),

                LayoutSlot(
                    page,
                    "REGULAR_1",
                    2,
                    460,
                    220,
                    70,
                    False
                ),

                LayoutSlot(
                    page,
                    "REGULAR_2",
                    2,
                    460,
                    220,
                    70,
                    False
                ),

                LayoutSlot(
                    page,
                    "REGULAR_3",
                    2,
                    460,
                    220,
                    70,
                    False
                ),

                LayoutSlot(
                    page,
                    "BRIEF_1",
                    1,
                    230,
                    170,
                    50,
                    False
                ),

                LayoutSlot(
                    page,
                    "BRIEF_2",
                    1,
                    230,
                    170,
                    50,
                    False
                ),

            ])
    # ========================================================
    # Get Page Slots
    # ========================================================

    def get_page_slots(self, page):

        return [

            slot

            for slot in self.slots

            if slot.page == page

        ]

    # ========================================================
    # Get Free Slot
    # ========================================================

    def get_free_slot(self, page):

        slots = self.get_page_slots(page)

        for slot in sorted(

            slots,

            key=lambda x: x.priority,

            reverse=True

        ):

            if not slot.used:

                return slot

        return None
    # ========================================================
    # Story Height
    # ========================================================

    def calculate_height(self, article):

        words = len(article.get("content", "").split())

        if words < 150:
            return 140

        elif words < 350:
            return 220

        elif words < 700:
            return 300

        return 380
    # ========================================================
    # Assign Story
    # ========================================================

    def assign_story(self, article):

        page = article.get("page", 6)

        slot = self.get_free_slot(page)

        if slot is None:
            return None

        slot.used = True

        story = {

            "title": article.get("title", ""),
            "category": article.get("category", ""),
            "score": article.get("score", 0),
            "story_type": article.get("story_type", "regular"),

            "page": page,

            "frame": slot.frame,

            "columns": slot.columns,

            "width": slot.width,

            "height": self.calculate_height(article),

            "image": slot.image,

            "priority": slot.priority,

            "slug": article.get("slug", ""),

            "date": article.get("date", ""),

            "content": article.get("content", ""),

            "image_url": article.get("image", "")

        }

        return story
    # ========================================================
    # Create Layout
    # ========================================================

    def create(self, articles):

        self.pages = {}

        # Reset all slots
        for slot in self.slots:
            slot.used = False

        for article in articles:

            story = self.assign_story(article)

            if story is None:
                continue

            page = story["page"]

            if page not in self.pages:
                self.pages[page] = []

            self.pages[page].append(story)

        return self.pages                                    
# ============================================================
# Public Function
# ============================================================

def create_layout(articles):

    engine = LayoutEngine()

    return engine.create(articles)