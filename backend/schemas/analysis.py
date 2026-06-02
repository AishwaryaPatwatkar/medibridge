from datetime import datetime
from pydantic import BaseModel
from typing import List, Dict, Any

class AnalysisResponse(BaseModel):
    id: int
    report_id: int
    summary: str
    abnormal_values: List[Any]  # Can be list of strings or structured dictionaries
    doctor_questions: List[str]  # List of recommended questions
    created_at: datetime

    class Config:
        from_attributes = True
