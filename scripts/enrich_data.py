import json
import os
import time
from typing import List
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GOOGLE_API_KEY"),
    http_options=types.HttpOptions(
        retry_options=types.HttpRetryOptions(
            initial_delay=2.0,
            max_delay=60.0,
            attempts=5,
            http_status_codes=[503, 429, 500]
        )
    )
)

class CarTechnicalDetails(BaseModel):
    id: str
    transmission: str = Field(description="Manual or Automatic")
    engine_type: str = Field(description="Electric, Hybrid, or Combustion")
    is_turbo: bool = Field(description="True if engine is Turbo (TSI, T, Turbo, etc)")
    fuel_type: str = Field(description="Gasoline, Diesel, or Electric")
    segment: str = Field(description="SUV, Hatchback, Sedan, Pickup, etc.")
    airbags: int = Field(description="Number of airbags (int).")

def enrich_cars_batch(car_batch: List[dict]) -> List[dict]:
    prompt = """
    Eres un experto automotriz en Uruguay. Extrae specs técnicas.
    Tips: 'Tiptronic/AT/CVT' -> Automatic. 'TSI/T/Turbo' -> is_turbo=True.
    """
    
    input_text = json.dumps([
        {"id": c["id"], "text": f"{c['brand']} {c['model']} {c['version']}"} 
        for c in car_batch
    ])

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite-preview",
        contents=f"{prompt}\n\nDATA:\n{input_text}",
        config={
            "response_mime_type": "application/json",
            "response_schema": list[CarTechnicalDetails],
        }
    )
    
    return response.parsed

def main():
    input_path = "data/autoblog_0km_prices.json"
    output_path = "data/enriched_0km_prices.json"
    
    with open(input_path, "r", encoding="utf-8") as f:
        cars = json.load(f)

    print(f"Enriching {len(cars)} cars...")
    
    batch_size = 25
    final_data = []

    for i in range(0, len(cars), batch_size):
        batch = cars[i : i + batch_size]
        print(f"Processing batch {i//batch_size + 1} of {len(cars)//batch_size + 1}...")
        
        try:
            enriched_results = enrich_cars_batch(batch)
            enriched_map = {res.id: res for res in enriched_results}
            
            for raw_car in batch:
                if raw_car["id"] in enriched_map:
                    extra_info = enriched_map[raw_car["id"]].model_dump()
                    final_data.append({**raw_car, **extra_info})
                else:
                    print(f"Car omitted '{raw_car['id']}'. Using default values.")
                    fallback_info = {
                        "transmission": "Unknown",
                        "engine_type": "Unknown",
                        "is_turbo": False,
                        "fuel_type": "Unknown",
                        "segment": "Unknown",
                        "airbags": 0
                    }
                    final_data.append({**raw_car, **fallback_info})
            
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(final_data, f, ensure_ascii=False, indent=2)
            
            print(f"  ✓ Batch saved. Total accumulated: {len(final_data)}")
            
            time.sleep(6)
            
        except Exception as e:
            print(f"Error in batch {i}: {e}")
            break

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nDone! Enriched data saved to {output_path}")

if __name__ == "__main__":
    main()