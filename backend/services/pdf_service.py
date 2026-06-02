import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from backend.models.report import Report

def generate_report_pdf(report: Report) -> io.BytesIO:
    """
    Generates a professional, health-themed PDF analysis summary from a Report model database record.
    """
    buffer = io.BytesIO()
    
    # Setup document template with 0.75in (54 points) margins
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Healthcare aesthetic palette
    primary_color = colors.HexColor("#2C4873") # Royal medical blue
    accent_color = colors.HexColor("#0D9488")  # Teal accent
    dark_neutral = colors.HexColor("#1F2937")  # Charcoal text
    light_neutral = colors.HexColor("#F4F7FB") # Cool light background
    border_color = colors.HexColor("#E2E8F0")
    
    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=accent_color,
        spaceAfter=10
    )
    
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#64748B")
    )
    
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=dark_neutral,
        spaceAfter=8
    )
    
    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=dark_neutral,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=6
    )
    
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )
    
    table_body_style = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=dark_neutral
    )

    disclaimer_style = ParagraphStyle(
        'DocDisclaimer',
        parent=styles['Italic'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#64748B"),
        spaceBefore=20
    )
    
    elements = []
    
    # 1. Header Banner
    elements.append(Paragraph("MediBridge AI", title_style))
    elements.append(Paragraph("SIMPLIFIED MEDICAL REPORT ANALYSIS", subtitle_style))
    
    # Meta details
    filename = report.filename or report.file_url.split('/')[-1]
    date_str = report.uploaded_at.strftime("%B %d, %Y")
    meta_text = f"<b>Report File:</b> {filename}   |   <b>Analysis Date:</b> {date_str}"
    elements.append(Paragraph(meta_text, meta_style))
    
    # Divider Rule
    elements.append(Spacer(1, 8))
    divider = Table([[""]], colWidths=[504])
    divider.setStyle(TableStyle([
        ('LINEABOVE', (0,0), (-1,-1), 1.5, primary_color),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(divider)
    elements.append(Spacer(1, 12))
    
    # 2. Summary
    analysis = report.analysis
    if analysis:
        elements.append(Paragraph("Patient-Friendly Summary", h2_style))
        summary_text = analysis.summary.replace("\n", "<br/>")
        elements.append(Paragraph(summary_text, body_style))
        elements.append(Spacer(1, 10))
        
        # 3. Abnormal Values
        elements.append(Paragraph("Identified Abnormal Values", h2_style))
        abnormal_list = analysis.abnormal_values or []
        if abnormal_list and isinstance(abnormal_list, list):
            table_data = [[
                Paragraph("Parameter", table_header_style),
                Paragraph("Value", table_header_style),
                Paragraph("Normal Range", table_header_style),
                Paragraph("Interpretation", table_header_style),
            ]]
            
            for item in abnormal_list:
                table_data.append([
                    Paragraph(item.get("parameter", "N/A"), table_body_style),
                    Paragraph(item.get("value", "N/A"), table_body_style),
                    Paragraph(item.get("reference_range", "N/A"), table_body_style),
                    Paragraph(item.get("interpretation", "N/A"), table_body_style),
                ])
            
            # Widths: Parameter(100), Value(50), Normal Range(90), Interpretation(264)
            t = Table(table_data, colWidths=[100, 50, 90, 264])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), primary_color),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_neutral]),
                ('BOX', (0,0), (-1,-1), 0.5, border_color),
                ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('LEFTPADDING', (0,0), (-1,-1), 8),
                ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ]))
            elements.append(t)
        else:
            elements.append(Paragraph("No specific out-of-range or abnormal parameters were identified in this report.", body_style))
            
        elements.append(Spacer(1, 10))
        
        # 4. Questions
        elements.append(Paragraph("Recommended Questions for Your Doctor", h2_style))
        questions = analysis.doctor_questions or []
        if questions and isinstance(questions, list):
            for q in questions:
                elements.append(Paragraph(f"&bull; {q}", bullet_style))
        else:
            elements.append(Paragraph("&bull; Could you review this medical report with me?", bullet_style))
            elements.append(Paragraph("&bull; Are there any specific values in this report that I should be concerned about?", bullet_style))
            
        elements.append(Spacer(1, 10))
    else:
        elements.append(Paragraph("AI analysis results are pending or unavailable for this report.", body_style))
    
    # 5. Disclaimer
    disclaimer_text = (
        "<b>Important Medical Disclaimer:</b> This document is an automated AI-generated simplification "
        "of your medical report. It is intended for educational purposes only and does NOT constitute professional "
        "medical advice, diagnosis, or treatment. Always consult your physician or a qualified healthcare professional "
        "with any questions you may have regarding a medical condition or interpreting test results."
    )
    elements.append(Paragraph(disclaimer_text, disclaimer_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
