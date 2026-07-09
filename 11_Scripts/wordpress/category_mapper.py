CATEGORY_MAP = {}


def set_category_map(category_map):
    global CATEGORY_MAP
    CATEGORY_MAP = category_map


def get_category(category_ids):

    if not category_ids:
        return "Uncategorized"

    category_id = category_ids[0]

    return CATEGORY_MAP.get(category_id, "Other")