import os
from dotenv import load_dotenv

load_dotenv()

BASE_HOST = os.environ.get("BASE_HOST", "http://localhost")
UPLOAD_FOLDER = os.environ.get("API_UPLOAD_FOLDER", "upload_files")
DB_LINK = os.environ.get("DB_LINK", "")