from datetime import datetime
from pydantic import BaseModel

class ReportResponse(BaseModel):
    id: int
    user_id: int
    file_url: str
    filename: str | None = None
    report_type: str
    uploaded_at: datetime
    extracted_text: str | None = None
    has_analysis: bool = False

    class Config:
        from_attributes = True
