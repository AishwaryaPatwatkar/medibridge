import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models.user import User
from backend.models.report import Report
from backend.models.analysis import Analysis
from backend.schemas.report import ReportResponse
from backend.schemas.analysis import AnalysisResponse
from backend.auth.security import get_current_user
from backend.services.cloudinary_service import upload_to_cloudinary
from backend.services.ocr_service import extract_text
from backend.services.ai_service import analyze_report_text, answer_report_question
from fastapi.responses import StreamingResponse
from backend.services.pdf_service import generate_report_pdf
from backend.schemas.question import QuestionRequest, QuestionResponse
from backend.models.report_question import ReportQuestion

router = APIRouter(prefix="/reports", tags=["Reports"])

def make_report_response(report: Report) -> ReportResponse:
    """Helper to convert a Report ORM model into a ReportResponse schema."""
    fn = report.filename
    if not fn and report.file_url:
        fn = report.file_url.split('/')[-1]
    return ReportResponse(
        id=report.id,
        user_id=report.user_id,
        file_url=report.file_url,
        filename=fn,
        report_type=report.report_type,
        uploaded_at=report.uploaded_at,
        extracted_text=report.extracted_text,
        has_analysis=report.analysis is not None
    )

@router.post("/upload", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def upload_report(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accepts PDF, JPG, PNG. Validates file format and size (max 10MB),
    uploads to Cloudinary, performs OCR extraction, and saves report details.
    """
    filename = file.filename
    ext = filename.split('.')[-1].lower() if '.' in filename else ''
    
    if ext not in ['pdf', 'png', 'jpg', 'jpeg']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only PDF, PNG, JPG, and JPEG are allowed."
        )
    
    # Read file content and validate size (max 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024 # 10MB
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the limit of 10MB."
        )
    
    # 1. Upload file to Cloudinary
    try:
        file_io = io.BytesIO(content)
        file_url = upload_to_cloudinary(file_io, filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cloudinary upload failed: {str(e)}"
        )
    
    # 2. Extract Text via OCR
    try:
        extracted_text = extract_text(content, filename)
    except Exception as e:
        # Do not block upload if OCR fails, but log the warning and store empty text
        print(f"Warning: OCR extraction failed for file {filename}: {str(e)}")
        extracted_text = ""

    # 3. Save Report in Database
    new_report = Report(
        user_id=current_user.id,
        file_url=file_url,
        filename=filename,
        extracted_text=extracted_text,
        report_type=ext.upper()
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    return make_report_response(new_report)

@router.get("", response_model=List[ReportResponse])
def get_reports(
    q: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns all reports uploaded by the logged-in user.
    Allows searching reports by text query.
    """
    query = db.query(Report).filter(Report.user_id == current_user.id)
    
    if q:
        # Search match within filename, file_url, or extracted text (case-insensitive)
        query = query.filter(
            (Report.filename.ilike(f"%{q}%")) |
            (Report.file_url.ilike(f"%{q}%")) |
            (Report.extracted_text.ilike(f"%{q}%"))
        )
        
    reports = query.order_by(Report.uploaded_at.desc()).all()
    return [make_report_response(r) for r in reports]

@router.get("/{report_id}", response_model=ReportResponse)
def get_report_by_id(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves metadata of a specific report.
    """
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical report not found."
        )
    return make_report_response(report)

@router.post("/{report_id}/analyze", response_model=AnalysisResponse)
def analyze_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sends the extracted report text to Gemini AI, generates patient-friendly summary,
    flags abnormal values, and lists questions to ask the doctor.
    """
    # 1. Fetch report and verify ownership
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical report not found."
        )
        
    # 2. Return existing analysis if already performed
    if report.analysis:
        return report.analysis
        
    # 3. Check if report contains text
    extracted_text = report.extracted_text
    if not extracted_text or not extracted_text.strip():
        # Let's perform a minor mock/warning or try to re-extract in case it was uploaded blank
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The report has no extracted text. OCR may have failed or the file contains no readable content. Cannot run AI analysis."
        )

    # 4. Trigger Gemini AI analysis
    ai_results = analyze_report_text(extracted_text)
    
    # 5. Save Analysis in Database
    new_analysis = Analysis(
        report_id=report.id,
        summary=ai_results.get("summary"),
        abnormal_values=ai_results.get("abnormal_values"),
        doctor_questions=ai_results.get("doctor_questions")
    )
    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)
    
    return new_analysis

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes the medical report and its associated AI analysis.
    """
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical report not found."
        )
    
    db.delete(report)
    db.commit()
    return {"message": "Medical report successfully deleted."}

@router.get("/{report_id}/download")
def download_analysis_pdf(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates and downloads a professional PDF copy of the simplified report analysis.
    """
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical report not found."
        )
    
    if not report.analysis:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="AI analysis is not available for this report yet. Run the analysis first."
        )

    pdf_buffer = generate_report_pdf(report)
    filename = report.filename or report.file_url.split('/')[-1]
    name_part = filename.rsplit('.', 1)[0]
    download_filename = f"MediBridge_Analysis_{name_part}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={download_filename}"}
    )

@router.get("/{report_id}/questions", response_model=List[QuestionResponse])
def get_report_questions(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves user questions and AI answers chat history for a specific report.
    """
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical report not found."
        )
    
    questions = db.query(ReportQuestion).filter(ReportQuestion.report_id == report_id).order_by(ReportQuestion.asked_at.asc()).all()
    return questions

@router.post("/{report_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def ask_question_about_report(
    report_id: int,
    payload: QuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a user question about the medical report, invokes Gemini AI for a contextual,
    report-specific response, stores the conversation in the database, and returns the result.
    """
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical report not found."
        )
    
    if not report.analysis:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please analyze the medical report first before asking questions about it."
        )

    # Call AI service to get the answer
    answer = answer_report_question(
        extracted_text=report.extracted_text or "",
        analysis_summary=report.analysis.summary,
        question=payload.question
    )

    new_question = ReportQuestion(
        report_id=report.id,
        question=payload.question,
        answer=answer
    )
    
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    
    return new_question
