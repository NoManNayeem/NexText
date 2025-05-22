import os
from dotenv import load_dotenv

# Load .env from project root
BASE_DIR = os.path.abspath( os.path.join(os.path.dirname(__file__), "../../") )
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

# Database
DATABASE_URL = os.getenv("DATABASE_URL")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# CORS settings
_raw_origins = os.getenv("FRONTEND_ORIGINS", "")
# Parse comma-separated list into Python list, stripping whitespace
CORS_ORIGINS = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()]
