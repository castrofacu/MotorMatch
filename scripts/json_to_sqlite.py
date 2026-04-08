import sqlite3
import json
import os
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("motormatch_db")

INPUT_JSON = "data/enriched_0km_prices.json"
DB_PATH = "data/motormatch.db"

def create_table(cursor: sqlite3.Cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cars (
            id TEXT PRIMARY KEY,
            brand TEXT NOT NULL,
            model TEXT NOT NULL,
            version TEXT,
            price_usd INTEGER NOT NULL,
            category TEXT,
            segment TEXT,
            transmission TEXT,
            fuel_type TEXT,
            engine_type TEXT,
            is_turbo INTEGER,
            airbags INTEGER,
            queried_at TEXT
        )
    """)

def main():
    if not os.path.exists(INPUT_JSON):
        log.error(f"File not found: {INPUT_JSON}")
        return

    with open(INPUT_JSON, "r", encoding="utf-8") as f:
        cars = json.load(f)

    log.info(f"Processing {len(cars)} records. Connecting to SQLite...")

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    create_table(cursor)

    records_to_insert = []
    for car in cars:
        records_to_insert.append((
            car.get("id"),
            car.get("brand", "Unknown"),
            car.get("model", "Unknown"),
            car.get("version", ""),
            car.get("price_usd", 0),
            car.get("segment", "Unknown"),
            car.get("transmission", "Unknown"),
            car.get("fuel_type", "Unknown"),
            car.get("engine_type", "Unknown"),
            1 if car.get("is_turbo") else 0,
            car.get("airbags", 0),
            car.get("queried_at")
        ))

    query = """
        INSERT INTO cars (
            id, brand, model, version, price_usd, segment, 
            transmission, fuel_type, engine_type, is_turbo, airbags, queried_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            brand=excluded.brand,
            model=excluded.model,
            version=excluded.version,
            price_usd=excluded.price_usd,
            segment=excluded.segment,
            transmission=excluded.transmission,
            fuel_type=excluded.fuel_type,
            engine_type=excluded.engine_type,
            is_turbo=excluded.is_turbo,
            airbags=excluded.airbags,
            queried_at=excluded.queried_at
    """

    try:
        cursor.executemany(query, records_to_insert)
        conn.commit()
        log.info(f"Success: {cursor.rowcount} records consolidated in {DB_PATH}.")
    except Exception as e:
        log.error(f"Database error while upserting cars into SQLite database at {DB_PATH}: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    main()