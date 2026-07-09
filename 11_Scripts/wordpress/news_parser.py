from wordpress.html_cleaner import clean_html
from wordpress.category_mapper import get_category


def parse_news(posts):

    articles = []

    for post in posts:

        # Featured Image
        featured = ""

        if "_embedded" in post:
            media = post["_embedded"].get("wp:featuredmedia")

            if media:
                featured = media[0].get("source_url", "")

        article = {

            "id": post["id"],

            "title": clean_html(post["title"]["rendered"]),

            "date": post["date"],

            "slug": post["slug"],

            "link": post["link"],

            "excerpt": clean_html(post["excerpt"]["rendered"]),

            "content": clean_html(post["content"]["rendered"]),

            "category": get_category(post["categories"]),

            "image": featured

        }

        articles.append(article)

    return articles