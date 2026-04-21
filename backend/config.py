import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration loaded from environment variables."""

    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "medassist-dev-secret-key")
    DEBUG = os.getenv("FLASK_ENV", "development") == "development"

    # Database (MySQL)
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", 3306))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASS = os.getenv("DB_PASS", "")
    DB_NAME = os.getenv("DB_NAME", "medassist_db")

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET", "medassist-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_TOKEN_EXPIRES", 900))  # 15 min

    # Model
    MODEL_PATH = os.getenv(
        "MODEL_PATH", os.path.join(os.path.dirname(__file__), "ml", "model.pkl")
    )
    SYMPTOM_COLUMNS_PATH = os.getenv(
        "SYMPTOM_COLUMNS_PATH",
        os.path.join(os.path.dirname(__file__), "ml", "symptom_columns.json"),
    )
