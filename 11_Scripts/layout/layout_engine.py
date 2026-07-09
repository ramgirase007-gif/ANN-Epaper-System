"""
ANN Publisher
Production Layout Engine
Version : 2.0
"""

PAGE_LIMITS = {
    1: 6,
    2: 8,
    3: 8,
    4: 8,
    5: 8,
    6: 8,
}


def create_layout(articles):

    pages = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: []
    }

    overflow = []

    for article in articles:

        page = article.get("page", 2)

        if page not in pages:
            page = 2

        if len(pages[page]) < PAGE_LIMITS[page]:
            pages[page].append(article)
        else:
            overflow.append(article)

    # Fill empty slots with overflow
    for article in overflow:

        for page in range(2, 7):

            if len(pages[page]) < PAGE_LIMITS[page]:
                pages[page].append(article)
                break

    return pages