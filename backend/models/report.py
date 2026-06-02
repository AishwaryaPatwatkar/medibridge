from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_url = Column(String(500), nullable=False)
    filename = Column(String(255), nullable=True)
    extracted_text = Column(Text, nullable=True)
    report_type = Column(String(50), nullable=False) # e.g. "PDF", "JPG", "PNG"
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="reports")
    analysis = relationship("Analysis", back_populates="report", uselist=False, cascade="all, delete-orphan")
    questions = relationship("ReportQuestion", back_populates="report", cascade="all, delete-orphan")
