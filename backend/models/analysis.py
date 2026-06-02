from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class Analysis(Base):
    __tablename__ = "analyses" # using plural name for table consistency, or 'analysis'

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), unique=True, nullable=False)
    summary = Column(Text, nullable=False)
    abnormal_values = Column(JSON, nullable=False) # Store as JSON list or object
    doctor_questions = Column(JSON, nullable=False) # Store as JSON list of questions
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    report = relationship("Report", back_populates="analysis")
