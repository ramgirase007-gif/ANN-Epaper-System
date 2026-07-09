import requests
from pathlib import Path


PHOTO_FOLDER = Path("../../02_Input/Photos")


def download_image(url, filename):

    PHOTO_FOLDER.mkdir(parents=True, exist_ok=True)

    extension = url.split("?")[0].split(".")[-1]

    if extension.lower() not in ["jpg", "jpeg", "png", "webp"]:
        extension = "jpg"

    file_path = PHOTO_FOLDER / f"{filename}.{extension}"

    if file_path.exists():
        return str(file_path)

    response = requests.get(url, timeout=30)

    response.raise_for_status()

    with open(file_path, "wb") as image:

        image.write(response.content)

    return str(file_path)