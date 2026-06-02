import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FileImage, Trash2, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const ReportCard = ({ report, onDelete }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isImage = ['PNG', 'JPG', 'JPEG'].includes(report.report_type);

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(report.id);
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  const filename = report.filename || report.file_url.split('/').pop();

  return (
    <>
      <div className="relative group bg-white rounded-2xl border border-medical-200/60 p-5 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          
          {/* Document Icon & Details */}
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isImage 
                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {isImage ? (
                <FileImage className="w-6 h-6" />
              ) : (
                <FileText className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-medical-950 font-sans truncate max-w-[180px] sm:max-w-xs" title={filename}>
                {filename}
              </h3>
              <p className="text-xs text-medical-500 font-medium mt-1">
                Uploaded: {formatDate(report.uploaded_at)}
              </p>
            </div>
          </div>

          {/* Delete button */}
          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-xl border transition-all duration-200 bg-white text-medical-400 border-medical-200/50 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
            title="Delete report"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-medical-100/70 flex items-center justify-between">
          {/* Analysis Status Badge */}
          <div>
            {report.has_analysis ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Analyzed
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                Pending Analysis
              </span>
            )}
          </div>

          {/* Action link */}
          <Link
            to={`/report/${report.id}`}
            className="flex items-center text-sm font-semibold text-medical-600 hover:text-primary-600 transition-colors group-hover:translate-x-0.5 duration-200"
          >
            <span>{report.has_analysis ? "View Analysis" : "Analyze Report"}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-medical-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl border border-medical-100 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-medical-950">Delete Medical Report?</h3>
            </div>
            
            <p className="text-sm text-medical-600 leading-relaxed">
              This will permanently delete the report file, its extracted contents, and its AI-generated analysis records. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-medical-200 bg-white text-medical-700 hover:bg-medical-50 disabled:opacity-50 text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center space-x-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Report</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportCard;
