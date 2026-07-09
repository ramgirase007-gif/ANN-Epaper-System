"""
ANN Publisher
Page Selector Engine
Version 1.0
"""

CATEGORY_PAGES = {
    "राज्य": 2,
    "देश": 3,
    "राजकारण": 3,
    "क्राईम": 4,
    "व्यवसाय": 5,
    "तंत्रज्ञान": 5,
    "शेती": 5,
    "क्रीडा": 6,
    "मनोरंजन": 6,
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