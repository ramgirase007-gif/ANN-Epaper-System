PAGE_RULES = {
    1: ["Lead", "Breaking"],
    2: ["महाराष्ट्र", "राजकारण"],
    3: ["देश", "आंतरराष्ट्रीय"],
    4: ["प्रादेशिक"],
    5: ["क्राईम", "न्यायालय"],
    6: ["Business", "Technology", "Entertainment", "Editorial"]
}


def allocate_pages(articles):

    pages = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: []
    }

    # Front Page
    pages[1] = articles[:6]

    # Remaining
    remaining = articles[6:]

    for article in remaining:

        category = article["category"]

        if category in PAGE_RULES[2]:
            pages[2].append(article)

        elif category in PAGE_RULES[3]:
            pages[3].append(article)

        elif category in PAGE_RULES[4]:
            pages[4].append(article)

        elif category in PAGE_RULES[5]:
            pages[5].append(article)

        else:
            pages[6].append(article)

    return pages