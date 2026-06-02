import cloudinary
import cloudinary.uploader
from backend.config import settings

# Configure Cloudinary credentials
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def upload_to_cloudinary(file_obj, filename: str) -> str:
    """
    Uploads a file object to Cloudinary and returns the secure URL.
    """
    try:
        # Extract name without extension for public_id
        name_part = filename.rsplit('.', 1)[0]
        # Clean special characters if necessary, but cloudinary handles it mostly
        public_id = f"medibridge/{name_part}"
        
        result = cloudinary.uploader.upload(
            file_obj,
            public_id=public_id,
            resource_type="raw" if filename.lower().endswith('.pdf') else "image"
        )
        return result.get("secure_url")
    except Exception as e:
        raise RuntimeError(f"Failed to upload report to Cloudinary: {str(e)}")
