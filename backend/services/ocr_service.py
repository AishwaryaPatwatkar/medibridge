import os
import io
import pytesseract
from PIL import Image
import pdfplumber
from backend.config import settings

# Configure Tesseract path
# If settings.TESSERACT_CMD exists as a file, use it; otherwise rely on system PATH
if os.path.exists(settings.TESSERACT_CMD):
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
else:
    # Default to assuming 'tesseract' executable is in system PATH (Linux/Docker)
    pytesseract.pytesseract.tesseract_cmd = 'tesseract'

def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Extracts text from image bytes using pytesseract.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"OCR image text extraction failed: {str(e)}")

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts text from PDF bytes using pdfplumber.
    If text is empty (scanned PDF), tries to render pages to images and run OCR.
    """
    extracted_text = ""
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page_num, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    extracted_text += page_text + "\n"
                else:
                    # If page has no text, it might be scanned.
                    # Attempt to render page to image using pdfplumber's page.to_image() and run OCR.
                    try:
                        im = page.to_image(resolution=150)
                        # im.original is a PIL Image object
                        ocr_text = pytesseract.image_to_string(im.original)
                        if ocr_text.strip():
                            extracted_text += ocr_text + "\n"
                    except Exception as ocr_e:
                        # Log error and continue if rendering/OCR fails for a page
                        print(f"Warning: OCR on page {page_num + 1} failed: {str(ocr_e)}")
                        continue
        return extracted_text.strip()
    except Exception as e:
        raise RuntimeError(f"PDF text extraction failed: {str(e)}")

def extract_text(file_bytes: bytes, filename: str) -> str:
    """
    Determines file type based on extension and extracts text.
    """
    ext = filename.split('.')[-1].lower()
    if ext == 'pdf':
        return extract_text_from_pdf(file_bytes)
    elif ext in ['jpg', 'jpeg', 'png']:
        return extract_text_from_image(file_bytes)
    else:
        raise ValueError("Unsupported file format for text extraction. Only PDF, JPG, JPEG, and PNG are allowed.")
