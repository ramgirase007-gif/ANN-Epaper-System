from layout.page_allocator import allocate_pages
from layout.page_exporter import export_pages


def build_pages(articles):

    pages = allocate_pages(articles)

    export_pages(pages)

    return pages