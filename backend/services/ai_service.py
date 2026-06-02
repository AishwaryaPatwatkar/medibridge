import json
import google.generativeai as genai
from backend.config import settings

# Initialize Gemini SDK
genai.configure(api_key=settings.GEMINI_API_KEY)

def analyze_report_text(extracted_text: str) -> dict:
    """
    Sends the extracted medical text to Gemini AI to generate a simplified explanation,
    detect abnormal values, and suggest questions for their doctor, formatted as JSON.
    """
    if not extracted_text or not extracted_text.strip():
        return {
            "summary": "The uploaded medical report contains no readable text. Please ensure the upload is clear and contains legible medical data.",
            "abnormal_values": [],
            "doctor_questions": ["Please review this report with your healthcare provider."]
        }

    # Prompt structured for safety, clarity, and JSON compliance
    prompt = f"""
You are a helpful, expert medical AI assistant. Your goal is to help patients understand their medical reports in simple terms.
Analyze the following extracted medical report text:

--- BEGIN REPORT TEXT ---
{extracted_text}
--- END REPORT TEXT ---

Provide:
1. A patient-friendly summary that explains the report in simple, easy-to-understand language.
2. A list of abnormal values detected (i.e. values outside of reference ranges, high/low flags, or unusual findings).
3. A list of 3-5 specific questions the patient should ask their doctor based on these findings.

SAFETY AND MEDICAL COMPLIANCE COMPULSORY RULES:
- DO NOT diagnose the patient.
- Do NOT provide medical prescriptions or treatment plans.
- Clearly note that this is an AI simplification for educational purposes and NOT professional medical advice.
- Explicitly recommend consulting their physician.

You MUST return your response as a JSON object matching this schema:
{{
  "summary": "A detailed, easy-to-understand translation of the report's main findings. Make it reassuring, informative, and avoid dense jargon.",
  "abnormal_values": [
    {{
      "parameter": "Name of test/value (e.g. WBC, TSH, Systolic BP)",
      "value": "The value in the report (e.g. 11.2, 4.8, 140)",
      "reference_range": "The normal reference range (e.g. 4.0 - 11.0, 0.45 - 4.5, <120)",
      "interpretation": "A brief layperson explanation of why this is flagged and what it typically means."
    }}
  ],
  "doctor_questions": [
    "Question string 1",
    "Question string 2",
    "Question string 3"
  ]
}}

Make sure the JSON is valid. If there are no abnormal values, return an empty list for "abnormal_values".
"""

    try:
        # Use gemini-2.5-flash for fast, structured translation
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Parse the JSON response
        data = json.loads(response.text)
        
        # Validate keys exist
        if "summary" not in data:
            data["summary"] = "No summary was generated."
        if "abnormal_values" not in data or not isinstance(data["abnormal_values"], list):
            data["abnormal_values"] = []
        if "doctor_questions" not in data or not isinstance(data["doctor_questions"], list):
            data["doctor_questions"] = []
            
        return data

    except Exception as e:
        print(f"Error communicating with Gemini: {str(e)}")
        # Graceful fallback response
        return {
            "summary": "We were unable to complete the AI analysis because of an issue connecting to the AI service. However, your report text has been successfully extracted.",
            "abnormal_values": [
                {
                    "parameter": "AI System Status",
                    "value": "Unavailable",
                    "reference_range": "Online",
                    "interpretation": f"Error parsing AI response: {str(e)}"
                }
            ],
            "doctor_questions": [
                "Could you review this medical report with me?",
                "Are there any specific values in this report that I should be concerned about?"
            ]
        }

def answer_report_question(extracted_text: str, analysis_summary: str, question: str) -> str:
    """
    Uses Gemini AI to answer a patient's question specifically about their medical report content.
    Refuses to answer unrelated questions to maintain focus and safety.
    """
    if not extracted_text or not extracted_text.strip():
        return "I cannot answer questions about this report because there is no readable text extracted from it."

    prompt = f"""
You are a helpful, expert medical AI assistant. Your goal is to answer the patient's questions about their uploaded medical report.
You must base your answer strictly on the provided medical report text and its parsed summary analysis.

--- BEGIN MEDICAL REPORT TEXT ---
{extracted_text}
--- END MEDICAL REPORT TEXT ---

--- BEGIN ANALYSIS SUMMARY ---
{analysis_summary}
--- END ANALYSIS SUMMARY ---

USER QUESTION: {question}

STRICT SAFETY AND RESPONSE RULES:
1. FOCUS: Answer the question ONLY if it is related to the medical report details, parameters, diagnoses, next steps, or definitions within this report.
2. REFUSAL: If the user's question is NOT related to this specific medical report (e.g. general chit-chat, programming, unrelated health issues, recipe questions, etc.), politely decline to answer by stating: "I can only answer questions related to this specific medical report."
3. COMPLIANCE: Do NOT diagnose the patient or prescribe medication. Keep explanations simple, educational, and patient-friendly. Always recommend consulting their doctor for professional guidance.
"""

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error answering question with Gemini: {str(e)}")
        return f"Sorry, I encountered an issue connecting to the AI service to answer your question. (Error: {str(e)})"
