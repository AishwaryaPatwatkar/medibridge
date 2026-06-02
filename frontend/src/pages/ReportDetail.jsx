import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import reportService from '../services/reportService';
import Loader from '../components/Loader';
import { formatDate } from '../utils/formatters';
import { 
  FileText, Brain, Stethoscope, AlertTriangle, HelpCircle, 
  ChevronDown, ChevronUp, ExternalLink, ArrowLeft, ShieldAlert,
  CheckSquare, Square, Download, Loader2, Send, MessageSquare
} from 'lucide-react';
import { toast } from 'react-toastify';

const ReportDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  
  // PDF download state
  const [downloading, setDownloading] = useState(false);

  // Q&A states
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  
  // Interactive checklist for doctor questions
  const [checkedQuestions, setCheckedQuestions] = useState({});

  const fetchReportDetails = async () => {
    setLoading(true);
    try {
      const reportData = await reportService.getReportById(id);
      setReport(reportData);
      
      if (reportData.has_analysis) {
        // Fetch existing analysis and chat history in parallel
        const [analysisData, questionsData] = await Promise.all([
          reportService.analyzeReport(id),
          reportService.getQuestions(id)
        ]);
        setAnalysis(analysisData);
        setQuestions(questionsData);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load report details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      toast.info('Gemini AI is analyzing your medical data...', { autoClose: 5000 });
      const analysisData = await reportService.analyzeReport(id);
      setAnalysis(analysisData);
      setReport(prev => ({ ...prev, has_analysis: true }));
      toast.success('AI analysis completed successfully!');
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Analysis failed. The report content might be unreadable.';
      toast.error(detail);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const filename = report.filename || report.file_url.split('/').pop();
      await reportService.downloadAnalysisPdf(id, filename);
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate and download PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    
    const questionText = newQuestion;
    setNewQuestion('');
    setAsking(true);
    
    // Optimistic UI update: render question bubbles immediately with loader
    const tempId = Date.now();
    setQuestions(prev => [
      ...prev,
      { id: tempId, question: questionText, answer: "...", asked_at: new Date().toISOString() }
    ]);
    
    try {
      const response = await reportService.askQuestion(id, questionText);
      // Replace loader bubble with real AI response content
      setQuestions(prev => prev.map(q => q.id === tempId ? response : q));
    } catch (err) {
      console.error(err);
      toast.error('Failed to get answer from AI assistant.');
      setQuestions(prev => prev.filter(q => q.id !== tempId));
      setNewQuestion(questionText); // restore user's input
    } finally {
      setAsking(false);
    }
  };

  const toggleQuestion = (index) => {
    setCheckedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader size="lg" text="Retrieving medical record details..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 space-y-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-medical-950 font-sans">Report not found</h2>
        <p className="text-sm text-medical-500">The report you are trying to view does not exist or has been deleted.</p>
        <Link to="/dashboard" className="inline-flex items-center text-medical-700 hover:text-primary-600 font-bold">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const isImage = ['PNG', 'JPG', 'JPEG'].includes(report.report_type);
  const filename = report.filename || report.file_url.split('/').pop();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back button and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm font-semibold text-medical-600 hover:text-primary-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-medical-200/50 shadow-sm w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Link>

          {analysis && (
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex items-center space-x-2 text-sm font-semibold text-white bg-medical-700 hover:bg-medical-800 disabled:opacity-50 transition-colors px-4 py-2 rounded-xl shadow-sm cursor-pointer"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-medical-500 font-medium">
          <span>Uploaded {formatDate(report.uploaded_at)}</span>
          <span>&bull;</span>
          <span className="uppercase font-bold text-medical-600 bg-medical-100 px-2 py-0.5 rounded">
            {report.report_type}
          </span>
        </div>
      </div>

      {/* Critical Medical Disclaimer Banner */}
      <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 flex items-start space-x-3 text-red-800">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600 animate-pulse" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <span className="font-extrabold uppercase">Important Disclaimer:</span> This is an AI-generated simplification tool designed for educational purposes only. It is <strong>NOT</strong> a medical diagnosis, prescription, or clinical recommendation. Always consult with a qualified doctor or healthcare provider to interpret your official test results.
        </div>
      </div>

      {/* Main Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Original file & AI trigger */}
        <div className="space-y-6 lg:col-span-1">
          {/* File Card */}
          <div className="bg-white rounded-3xl border border-medical-200/60 p-5 shadow-premium">
            <h3 className="font-bold text-medical-950 font-sans text-lg mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-medical-600" />
              Source File
            </h3>
            
            <div className="p-4 bg-medical-50/30 border border-medical-200/40 rounded-2xl flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isImage ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
              }`}>
                <FileText className="w-6 h-6" />
              </div>
              <div className="overflow-hidden flex-grow">
                <p className="font-bold text-sm text-medical-950 truncate" title={filename}>
                  {filename}
                </p>
                <a
                  href={report.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700 mt-1"
                >
                  View original <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>

            {/* Run Analysis Trigger Card */}
            {!report.has_analysis && !analysis && (
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-tr from-medical-50 to-primary-50/30 border border-primary-200/30">
                <p className="text-sm text-medical-700 font-medium leading-relaxed">
                  This report has not been simplified yet. Tap below to prompt Gemini AI.
                </p>
                <button
                  onClick={handleRunAnalysis}
                  disabled={analyzing}
                  className="w-full mt-4 bg-medical-700 hover:bg-medical-800 text-white font-bold py-3 px-4 rounded-xl shadow transition-all flex items-center justify-center space-x-2 text-sm"
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing Report...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      <span>Start AI Analysis</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Collapsible raw text */}
          <div className="bg-white rounded-3xl border border-medical-200/60 p-5 shadow-premium">
            <button
              onClick={() => setShowRawText(!showRawText)}
              className="w-full flex items-center justify-between text-medical-950 hover:text-medical-800 focus:outline-none"
            >
              <span className="font-bold text-sm font-sans flex items-center">
                <FileText className="w-4.5 h-4.5 mr-2 text-medical-500" />
                Extracted Report Text
              </span>
              {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showRawText && (
              <div className="mt-4 p-3 bg-medical-50/50 rounded-xl max-h-60 overflow-y-auto text-xs text-medical-600 font-mono leading-relaxed border border-medical-200/30 whitespace-pre-wrap">
                {report.extracted_text || "No text could be extracted. The file may be empty or illegible."}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Analysis details (Visible only if analyzed) */}
        <div className="lg:col-span-2 space-y-6">
          {analyzing ? (
            <div className="bg-white rounded-3xl border border-medical-200/60 p-12 text-center shadow-premium flex flex-col items-center justify-center min-h-[300px]">
              <Loader size="lg" text="Gemini AI is examining your report... This may take up to 10 seconds as we structure abnormal ranges and consultation checksheets." />
            </div>
          ) : analysis ? (
            <>
              {/* Simplified Summary Card */}
              <div className="bg-white rounded-3xl border border-medical-200/60 p-6 sm:p-8 shadow-premium space-y-4">
                <h3 className="font-extrabold text-medical-950 font-sans text-xl flex items-center border-b border-medical-100 pb-3">
                  <Brain className="w-6 h-6 mr-2.5 text-primary-500" />
                  Simplified Explanation
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-medical-700 font-medium whitespace-pre-line">
                  {analysis.summary}
                </p>
              </div>

              {/* Lab Values Card */}
              <div className="bg-white rounded-3xl border border-medical-200/60 p-6 sm:p-8 shadow-premium space-y-4">
                <h3 className="font-extrabold text-medical-950 font-sans text-xl flex items-center border-b border-medical-100 pb-3">
                  <AlertTriangle className="w-6 h-6 mr-2.5 text-amber-500" />
                  Abnormal Values Highlighted
                </h3>
                
                {analysis.abnormal_values && analysis.abnormal_values.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    {analysis.abnormal_values.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-medical-950">
                            {item.parameter || "Unknown parameter"}
                          </h4>
                          <p className="text-xs text-medical-500 font-medium">
                            Report Value: <span className="font-bold text-red-600">{item.value || "N/A"}</span>
                            {item.reference_range && ` (Normal range: ${item.reference_range})`}
                          </p>
                          <p className="text-sm text-medical-700 font-medium mt-2 leading-relaxed">
                            {item.interpretation || "No explanation provided."}
                          </p>
                        </div>
                        <span className="inline-flex items-center self-start px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-red-100 text-red-800 border border-red-200/30 tracking-wider">
                          Out of range
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-medical-500 text-sm font-medium">
                    No values were flagged as out of range by the AI.
                  </div>
                )}
              </div>

              {/* Questions Checklist Card */}
              <div className="bg-white rounded-3xl border border-medical-200/60 p-6 sm:p-8 shadow-premium space-y-4">
                <h3 className="font-extrabold text-medical-950 font-sans text-xl flex items-center border-b border-medical-100 pb-3">
                  <Stethoscope className="w-6 h-6 mr-2.5 text-medical-600" />
                  Recommended Doctor Questions
                </h3>
                <p className="text-xs text-medical-500 font-semibold mb-4">
                  Check these off during your next appointment as you review this report together.
                </p>
                
                {analysis.doctor_questions && analysis.doctor_questions.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.doctor_questions.map((question, idx) => {
                      const isChecked = !!checkedQuestions[idx];
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleQuestion(idx)}
                          className={`w-full flex items-start text-left p-3.5 rounded-2xl border transition-all duration-200 ${
                            isChecked
                              ? 'bg-medical-50 border-medical-200 text-medical-500 line-through'
                              : 'bg-white border-medical-200/80 hover:border-medical-300 text-medical-800 hover:bg-medical-50/20'
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5 mr-3">
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 text-primary-500" />
                            ) : (
                              <Square className="w-5 h-5 text-medical-300" />
                            )}
                          </div>
                          <span className="text-sm font-semibold leading-relaxed">
                            {question}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-medical-500 text-sm font-medium">
                    No consultation questions generated.
                  </div>
                )}
              </div>

              {/* Report Q&A Assistant Card */}
              <div className="bg-white rounded-3xl border border-medical-200/60 p-6 sm:p-8 shadow-premium space-y-4">
                <h3 className="font-extrabold text-medical-950 font-sans text-xl flex items-center border-b border-medical-100 pb-3">
                  <MessageSquare className="w-6 h-6 mr-2.5 text-primary-500" />
                  Ask Questions About Report
                </h3>
                <p className="text-xs text-medical-500 font-semibold mb-2">
                  Have questions about specific values or terminology? Ask the AI assistant below.
                </p>

                {/* Chat History Panel */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto p-4 bg-medical-50/20 border border-medical-100 rounded-2xl">
                  {questions.length > 0 ? (
                    questions.map((q) => (
                      <div key={q.id} className="space-y-3 animate-fadeIn">
                        {/* User Question */}
                        <div className="flex justify-end">
                          <div className="bg-gradient-to-r from-medical-700 to-primary-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[85%] shadow-sm text-sm font-semibold">
                            {q.question}
                          </div>
                        </div>
                        {/* AI Answer */}
                        <div className="flex justify-start">
                          <div className="bg-white border border-medical-200 text-medical-800 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[85%] shadow-sm text-sm leading-relaxed whitespace-pre-line">
                            {q.answer === "..." ? (
                              <div className="flex items-center space-x-1 py-1">
                                <div className="w-1.5 h-1.5 bg-medical-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-medical-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-medical-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            ) : (
                              q.answer
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-medical-400 text-sm font-medium">
                      No questions asked yet. Type your question below to start.
                    </div>
                  )}
                </div>

                {/* Question Input Form */}
                <form onSubmit={handleAskQuestion} className="flex space-x-2 mt-4">
                  <input
                    type="text"
                    placeholder="Ask a question about this report (e.g. What is TSH?)..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    disabled={asking}
                    className="flex-grow px-4 py-3 rounded-xl border border-medical-200 bg-medical-50/10 text-medical-950 focus:border-primary-500 focus:ring focus:ring-primary-100 transition-all outline-none text-sm placeholder:text-medical-400 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={asking || !newQuestion.trim()}
                    className="bg-medical-700 hover:bg-medical-800 disabled:bg-medical-300 disabled:cursor-not-allowed text-white px-4 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer"
                  >
                    {asking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Blank state waiting for trigger */
            <div className="bg-white rounded-3xl border border-medical-200/60 p-12 text-center shadow-premium flex flex-col items-center justify-center min-h-[350px]">
              <Brain className="w-16 h-16 text-medical-300 mb-4 animate-pulse" />
              <h3 className="font-bold text-lg text-medical-950 font-sans">AI Analysis Pending</h3>
              <p className="text-sm text-medical-500 max-w-sm mt-2 leading-relaxed">
                Unlock patient-friendly insights, out-of-range highlighting, and doctor consultation checklists.
              </p>
              <button
                onClick={handleRunAnalysis}
                className="mt-6 bg-gradient-to-r from-medical-700 to-primary-600 hover:from-medical-800 hover:to-primary-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center space-x-2"
              >
                <Brain className="w-4.5 h-4.5" />
                <span>Simplify Report Now</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
