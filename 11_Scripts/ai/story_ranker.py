from datetime import datetime


KEYWORDS = {

    "lead": [
        "मुख्यमंत्री",
        "सरकार",
        "मंत्रिमंडळ",
        "हायकोर्ट",
        "सर्वोच्च",
        "मोदी",
        "फडणवीस",
        "अजित पवार",
        "शिंदे",
        "पावस",
        "पूर",
        "अपघात",
        "हत्या",
        "निवडणूक"
    ]

}


def score_article(article):

    score = 0

    title = article["title"].lower()

    for keyword in KEYWORDS["lead"]:

        if keyword.lower() in title:

            score += 30

    score += len(article["content"]) // 250

    return score


def rank_articles(articles):

    for article in articles:

        article["score"] = score_article(article)

    articles.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return articles