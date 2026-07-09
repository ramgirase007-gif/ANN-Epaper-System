"""
ANN Publisher
Production Layout Engine v2.0 (starter)
"""

from dataclasses import dataclass
from typing import Dict, List


@dataclass
class LayoutSlot:
    page:int
    frame:str
    columns:int
    width:int
    height:int
    priority:int
    image:bool=False
    used:bool=False


class LayoutEngine:

    def __init__(self):
        self.pages:Dict[int, List[dict]]={}
        self.slots:List[LayoutSlot]=[]
        self.build_slots()

    def build_slots(self):
        self.slots.clear()
        for page in range(1,7):
            self.slots.extend([
                LayoutSlot(page,"LEAD",3,720,280,90,True),
                LayoutSlot(page,"PHOTO",2,460,240,80,True),
                LayoutSlot(page,"REGULAR_1",2,460,220,70),
                LayoutSlot(page,"REGULAR_2",2,460,220,70),
                LayoutSlot(page,"REGULAR_3",2,460,220,70),
                LayoutSlot(page,"BRIEF_1",1,230,170,50),
                LayoutSlot(page,"BRIEF_2",1,230,170,50),
            ])

    def get_page_slots(self,page):
        return [s for s in self.slots if s.page==page]

    def get_free_slot(self,start_page):
        for p in range(start_page,7):
            for s in sorted(self.get_page_slots(p), key=lambda x:x.priority, reverse=True):
                if not s.used:
                    return p,s
        for p in range(1,start_page):
            for s in sorted(self.get_page_slots(p), key=lambda x:x.priority, reverse=True):
                if not s.used:
                    return p,s
        return None,None

    def calculate_height(self,article):
        words=len(article.get("content","").split())
        if words<150:return 140
        if words<350:return 220
        if words<700:return 300
        return 380

    def create(self,articles):
        self.pages={}
        for s in self.slots:
            s.used=False
        for article in articles:
            page,slot=self.get_free_slot(article.get("page",6))
            if slot is None:
                continue
            slot.used=True
            story=dict(article)
            story["page"]=page
            story["frame"]=slot.frame
            story["columns"]=slot.columns
            story["width"]=slot.width
            story["height"]=self.calculate_height(article)
            story["image"]=slot.image
            self.pages.setdefault(page,[]).append(story)
        return self.pages

def create_layout(articles):
    return LayoutEngine().create(articles)
