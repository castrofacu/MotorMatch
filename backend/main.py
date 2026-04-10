from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import cars

app = FastAPI(
    title="MotorMatch API",
    description="API for querying prices and features of cars in the Uruguayan market.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cars.router, prefix="/api")
