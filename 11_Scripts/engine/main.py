import sys
from pathlib import Path

# =====================================================
# Project Path
# =====================================================
sys.path.append(str(Path(__file__).resolve().parent.parent))

# =====================================================
# WordPress Modules
# =====================================================
from wordpress.fetch_news import fetch_news
from wordpress.fetch_categories import fetch_categories
from wordpress.news_parser import parse_news
from wordpress.category_mapper import set_category_map

# =====================================================
# Image Downloader
# =====================================================
from images.download_images import download_image

# =====================================================
# AI Ranking
# =====================================================
from ai.story_ranker import rank_articles

# =====================================================
# Story Classifier
# =====================================================
from layout.story_classifier import classify_articles

# =====================================================
# Page Selector
# =====================================================
from layout.page_selector import assign_pages

# =====================================================
# Dynamic Layout Engine
# =====================================================
from layout.layout_engine import create_layout
from layout.json_export import export_layout

# =====================================================
# InDesign JSX Export
# =====================================================
from indesign.export_idjs import export_jsx


def main():

    print("=" * 60)
    print("ANN Publisher")
    print("=" * 60)

    # =====================================================
    # Load Categories
    # =====================================================
    category_map = fetch_categories()
    set_category_map(category_map)

    print("Categories Loaded :", len(category_map))

    # =====================================================
    # Fetch News
    # =====================================================
    posts = fetch_news()

    # =====================================================
    # Parse News
    # =====================================================
    articles = parse_news(posts)

    # =====================================================
    # AI Ranking
    # =====================================================
    articles = rank_articles(articles)

    # =====================================================
    # Story Classification
    # =====================================================
    articles = classify_articles(articles)

    # =====================================================
    # Page Selection
    # =====================================================
    articles = assign_pages(articles)

    # =====================================================
    # Safety Limit (Version 1.0)
    # =====================================================
    MAX_ARTICLES = 30

    if len(articles) > MAX_ARTICLES:

        print()
        print("=" * 60)
        print("VERSION 1.0 SAFETY")
        print("=" * 60)
        print(f"Articles Fetched : {len(articles)}")
        print(f"Processing Only  : {MAX_ARTICLES}")
        print("Remaining articles will be skipped.")
        print("=" * 60)

        articles = articles[:MAX_ARTICLES]

    print()
    print("Total Articles :", len(articles))
    print()

    # =====================================================
    # Download Images
    # =====================================================
    for article in articles:

        if article["image"]:

            path = download_image(
                article["image"],
                article["slug"]
            )

            print("Downloaded :", path)

    # =====================================================
    # Dynamic Layout Engine
    # =====================================================
    print()
    print("=" * 60)
    print("BUILDING DYNAMIC LAYOUT")
    print("=" * 60)

    layout = create_layout(articles)

    print("Layout Created Successfully")
    print("Total Pages :", len(layout))

    for page_no in sorted(layout.keys()):
        print(f"Page {page_no} : {len(layout[page_no])} Articles")

    # =====================================================
    # Export Layout JSON
    # =====================================================
    print()
    print("=" * 60)
    print("EXPORTING JSON")
    print("=" * 60)

    export_layout(layout)

    print("JSON Export Completed")

    # =====================================================
    # Export InDesign JSX
    # =====================================================
    print()
    print("=" * 60)
    print("EXPORTING INDESIGN JSX")
    print("=" * 60)

    export_jsx()

    print("JSX Export Completed")

    # =====================================================
    # Top 10 News Preview
    # =====================================================
    print()
    print("=" * 60)
    print("TOP 10 RANKED NEWS")
    print("=" * 60)

    for article in articles[:10]:

        print("-" * 60)
        print("Score     :", article["score"])
        print("Type      :", article["story_type"])
        print("Page      :", article["page"])
        print("Title     :", article["title"])
        print("Category  :", article["category"])
        print("Date      :", article["date"])
        print("Image     :", article["image"])

    print()
    print("=" * 60)
    print("ANN Publisher : Sprint 6 - Dynamic Layout Engine Completed")
    print("=" * 60)


if __name__ == "__main__":
    main()