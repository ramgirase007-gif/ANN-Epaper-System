"""
ANN Publisher
Story Classification Engine
Version : 1.0
"""

LEAD_SCORE = 90
SECONDARY_SCORE = 75
REGULAR_SCORE = 55


def classify_story(article):
    """
    Classify one article based on AI score.
    """

    score = article.get("score", 0)

    if score >= LEAD_SCORE:
        article["story_type"] = "LEAD"

    elif score >= SECONDARY_SCORE:
        article["story_type"] = "SECONDARY"

    elif score >= REGULAR_SCORE:
        article["story_type"] = "REGULAR"

    else:
        article["story_type"] = "BRIEF"

    return article


def classify_articles(articles):
    """
    Classify all articles.
    """

    output = []

    for article in articles:
        output.append(classify_story(article))

    return output