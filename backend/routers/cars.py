import sqlite3
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from database import get_connection

router = APIRouter(tags=["cars"])


class Car(BaseModel):
    id: str
    brand: str
    model: str
    price_usd: int
    segment: Optional[str] = None
    transmission: Optional[str] = None
    fuel_type: Optional[str] = None
    engine_type: Optional[str] = None
    is_turbo: Optional[bool] = None
    airbags: Optional[int] = None
    queried_at: Optional[str] = None


class CarsResponse(BaseModel):
    total: int
    page: int
    page_size: int
    results: list[Car]


VALID_SORT_FIELDS = {"price_usd", "brand", "model", "airbags"}

@router.get("/cars", response_model=CarsResponse, summary="List cars")
def list_cars(
    brand: Optional[str] = Query(None, description="Filter by brand (case-insensitive)"),
    segment: Optional[str] = Query(None, description="Filter by segment, e.g., SUV, Sedan"),
    fuel_type: Optional[str] = Query(None, description="Filter by fuel type: Gasoline, Electric, Diesel"),
    transmission: Optional[str] = Query(None, description="Filter by transmission: Automatic, Manual"),
    is_turbo: Optional[bool] = Query(None, description="Filter by turbo"),
    min_price: Optional[int] = Query(None, ge=0, description="Minimum price in USD"),
    max_price: Optional[int] = Query(None, ge=0, description="Maximum price in USD"),
    sort_by: str = Query("price_usd", description="Field to sort by"),
    order: Literal["asc", "desc"] = Query("asc", description="Sort order"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Results per page"),
):
    if sort_by not in VALID_SORT_FIELDS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sort_by. Options: {', '.join(VALID_SORT_FIELDS)}",
        )

    conditions: list[str] = []
    params: list = []

    if brand:
        conditions.append("LOWER(brand) LIKE LOWER(?)")
        params.append(f"%{brand}%")
    if segment:
        conditions.append("LOWER(segment) = LOWER(?)")
        params.append(segment)
    if fuel_type:
        conditions.append("LOWER(fuel_type) = LOWER(?)")
        params.append(fuel_type)
    if transmission:
        conditions.append("LOWER(transmission) = LOWER(?)")
        params.append(transmission)
    if is_turbo is not None:
        conditions.append("is_turbo = ?")
        params.append(1 if is_turbo else 0)
    if min_price is not None:
        conditions.append("price_usd >= ?")
        params.append(min_price)
    if max_price is not None:
        conditions.append("price_usd <= ?")
        params.append(max_price)

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    order_clause = f"ORDER BY {sort_by} {order.upper()}"
    offset = (page - 1) * page_size

    with get_connection() as conn:
        total = conn.execute(
            f"SELECT COUNT(*) FROM cars {where_clause}", params
        ).fetchone()[0]

        rows = conn.execute(
            f"SELECT * FROM cars {where_clause} {order_clause} LIMIT ? OFFSET ?",
            params + [page_size, offset],
        ).fetchall()

    def _row_to_car(row: sqlite3.Row) -> Car:
        data = dict(row)
        data["is_turbo"] = bool(data["is_turbo"]) if data["is_turbo"] is not None else None
        return Car(**data)

    return CarsResponse(
        total=total,
        page=page,
        page_size=page_size,
        results=[_row_to_car(row) for row in rows],
    )


@router.get("/cars/{car_id}", response_model=Car, summary="Get car by ID")
def get_car(car_id: str):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM cars WHERE id = ?", (car_id,)).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Car not found")

    data = dict(row)
    data["is_turbo"] = bool(data["is_turbo"]) if data["is_turbo"] is not None else None
    return Car(**data)


@router.get("/cars/meta/segments", summary="Get available segments")
def get_segments() -> list[str]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT DISTINCT segment FROM cars WHERE segment IS NOT NULL ORDER BY segment"
        ).fetchall()
    return [r[0] for r in rows]


@router.get("/cars/meta/brands", summary="Get available brands")
def get_brands() -> list[str]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT DISTINCT brand FROM cars WHERE brand IS NOT NULL ORDER BY brand"
        ).fetchall()
    return [r[0] for r in rows]
