from datetime import datetime
from pydantic import BaseModel, Field

class QuestionRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)

class QuestionResponse(BaseModel):
    id: int
    report_id: int
    question: str
    answer: str
    asked_at: datetime

    class Config:
        from_attributes = True
