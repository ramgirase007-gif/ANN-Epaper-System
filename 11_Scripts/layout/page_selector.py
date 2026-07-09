"""
ANN Publisher
Page Selector Engine
Version 1.0
"""

CATEGORY_PAGES = {

    # Front Page
    "Lead": 1,
    "Breaking": 1,

    # Maharashtra
    "महाराष्ट्र": 2,
    "राज्य": 2,
    "#महाराष्ट्र": 2,

    # National
    "भारत": 3,
    "#भारत": 3,
    "देश": 3,
    "राष्ट्रीय": 3,
    "राजकारण": 3,

    # Crime
    "क्राईम": 4,
    "Crime": 4,
    "न्यायालय": 4,

    # Business
    "Business": 5,
    "Technology": 5,
    "व्यवसाय": 5,
    "तंत्रज्ञान": 5,
    "शेती": 5,

    # Sports / Entertainment
    "क्रीडा": 6,
    "Sports": 6,
    "Entertainment": 6,
    "मनोरंजन": 6,
    "Editorial": 6
}


def select_page(article):

    story_type = article.get("story_type", "BRIEF")
    category = article.get("category", "Other")

    if story_type == "LEAD":
        article["page"] = 1
    else:
        article["page"] = CATEGORY_PAGES.get(category, 2)

    return article


def assign_pages(articles):

    return [select_page(article) for article in articles]