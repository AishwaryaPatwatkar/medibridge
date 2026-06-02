from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models.user import User
from backend.models.report import Report
from backend.models.analysis import Analysis
from backend.auth.security import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("")
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns profile information for the authenticated user along with report statistics.
    """
    # Count total uploaded reports
    total_reports = db.query(Report).filter(Report.user_id == current_user.id).count()
    
    # Count total reports that have been analyzed by AI
    total_analyzed = (
        db.query(Analysis)
        .join(Report)
        .filter(Report.user_id == current_user.id)
        .count()
    )
    
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "created_at": current_user.created_at,
        "total_reports": total_reports,
        "total_analyzed": total_analyzed
    }
overwrites = False
