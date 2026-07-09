import requests
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_FILE = BASE_DIR / "10_WordPress" / "wordpress_config.json"


def load_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def fetch_categories():

    config = load_config()

    url = f"{config['api_url']}/categories?per_page=100"

    response = requests.get(url, timeout=30)
    response.raise_for_status()

    data = response.json()

    category_map = {}

    for item in data:
        category_map[item["id"]] = item["name"]

    return category_map