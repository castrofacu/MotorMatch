import json
import logging
import os
import re
import unicodedata
from datetime import datetime, timezone
from typing import Optional

import requests
from bs4 import BeautifulSoup, Tag

URL = "https://www.autoblog.com.uy/p/precios-0km.html"
OUTPUT_DIR = "data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "autoblog_0km_prices.json")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept-Language": "es-UY,es;q=0.9,en;q=0.8",
}

REQUEST_TIMEOUT = 30  # seconds

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("motormatch")


def clean_price(text: str) -> Optional[int]:
    """Extracts integer value from price strings like 'USD 21.990'."""
    if not text:
        return None
    
    match = re.search(r"[\d.,]+", text)
    if not match:
        return None
    
    numeric_part = match.group(0)
    # Remove dots or commas
    digits_only = re.sub(r"[^\d]", "", numeric_part)
    
    if not digits_only:
        return None
    return int(digits_only)


def normalize_text(text: str) -> str:
    return " ".join(text.strip().split()).title()


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    
    text = re.sub(r"\.(?=\d)", "", text) # Remove version dots like 1.0 -> 10
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


DOMAIN_BRAND_MAP: dict[str, str] = {
    "multimotors": "Ford",
    "autoboulevard": "Baw",
    "gacmotor": "Gac",
    "dongfenguruguay": "Dongfeng Pick-Up",
    "dongfengmotors": "Dongfeng",
    "noderal": "Forthing",
    "fotonuruguay": "Foton",
    "bestune": "Bestune",
    "dfsk": "Dfsk",
    "farizon": "Farizon",
    "deepal": "Deepal",
    "baicuruguay": "Baic",
    "hondauruguay": "Honda",
    "jacauto": "Jac",
    "volvocars": "Volvo",
}

def brand_from_url(url_text: str) -> Optional[str]:
    """
    Identifies the car brand from a URL.
    Returns None if it's an internal Autoblog link to avoid state corruption.
    """
    u = url_text.lower().replace("http://", "").replace("https://", "")
    domain = u.split("/")[0].replace("www.", "").split(".")[0]
    
    if "autoblog" in domain or domain == "p":
        return None
    
    if domain in DOMAIN_BRAND_MAP:
        return DOMAIN_BRAND_MAP[domain]
    
    return domain.title()


def parse_price_item(li_tag: Tag) -> Optional[tuple[str, int]]:
    full_text = li_tag.get_text(separator=" ", strip=True)
    parts = full_text.rsplit(" - ", maxsplit=1)
    
    if len(parts) != 2:
        return None

    description = parts[0].strip()
    price_val = clean_price(parts[1].strip())
    
    if price_val is None:
        return None

    return description, price_val


def scrape(url: str) -> list[dict]:
    log.info("Fetching %s...", url)
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        log.error("Network error: %s", e)
        raise

    log.info("Page downloaded (%d bytes). Parsing HTML...", len(resp.content))

    soup = BeautifulSoup(resp.content, "lxml")
    query_date = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    records: list[dict] = []

    content = (
        soup.find("div", class_="post-body")
        or soup.find("div", class_="entry-content")
        or soup.find("article")
    )

    if content is None:
        log.warning("Main container not found. Falling back to body.")
        content = soup.body

    current_brand = "No Brand"

    RE_BRAND_URL = re.compile(
        r"^(www\.|http[s]?://www\.)[a-z0-9\-]+\.[a-z]{2,}",
        re.IGNORECASE,
    )

    for element in content.descendants:
        if not isinstance(element, Tag):
            continue

        tag_name = element.name.lower()

        if tag_name == "a":
            href = element.get("href", "")
            text = element.get_text(strip=True)
            candidate = text if RE_BRAND_URL.match(text) else (
                href if RE_BRAND_URL.match(href) else None
            )
            if candidate:
                detected_brand = brand_from_url(candidate)
                if detected_brand:
                    current_brand = detected_brand
                continue

        if tag_name == "li":
            result = parse_price_item(element)
            if result:
                description, price_usd = result
                
                full_model = normalize_text(description)
                
                if "Α" in full_model:
                    full_model = full_model.replace("Α", "A")
                
                slug = slugify(f"{current_brand} {full_model}")

                records.append({
                    "id": slug,
                    "brand": normalize_text(current_brand),
                    "model": full_model,
                    "price_usd": price_usd,
                    "queried_at": query_date,
                })
                
    seen = set()
    unique_records = []
    for r in records:
        if r["id"] not in seen:
            seen.add(r["id"])
            unique_records.append(r)

    log.info("Extraction finished: %d unique records found.", len(unique_records))
    return unique_records


def save_json(records: list[dict], path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    log.info("Results saved to %s", path)


def main() -> None:
    log.info("=== MotorMatch Ingestor — Autoblog Uruguay ===")
    try:
        data = scrape(URL)
        if data:
            save_json(data, OUTPUT_FILE)
            print(f"\nSuccessfully scraped {len(data)} vehicles.")
            print(f"Sample: {data[0]['brand']} {data[0]['model']} - ${data[0]['price_usd']}")
        else:
            log.warning("No data extracted.")
    except Exception as e:
        log.error("Fatal error: %s", e)
        raise SystemExit(1)


if __name__ == "__main__":
    main()