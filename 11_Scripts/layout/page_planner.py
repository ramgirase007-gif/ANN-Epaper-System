from layout.page_rules import PAGE_RULES

def build_layout(articles):

    layout = {}

    layout["page_1"] = {
        "lead": articles[0],
        "secondary": articles[1],
        "headlines": articles[2:7],
        "briefs": articles[7:12]
    }

    remaining = articles[12:]

    layout["page_2"] = remaining[0:10]
    layout["page_3"] = remaining[10:20]
    layout["page_4"] = remaining[20:30]
    layout["page_5"] = remaining[30:40]
    layout["page_6"] = remaining[40:50]

    return layout