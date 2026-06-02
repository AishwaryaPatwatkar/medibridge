import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import reportService from '../services/reportService';
import { UploadCloud, File, FileText, Image as ImageIcon, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      const err = "Unsupported file format. Please upload PDF, JPG, or PNG files.";
      setError(err);
      toast.error(err);
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      const err = "File size exceeds the limit of 10MB.";
      setError(err);
      toast.error(err);
      return false;
    }

    setError('');
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    
    try {
      toast.info('Uploading file and extracting medical text...', { autoClose: 3000 });
      const response = await reportService.uploadReport(file);
      toast.success('Report uploaded and processed successfully!');
      
      // Navigate straight to the report detail/analysis trigger page
      navigate(`/report/${response.id}`);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to upload report. Please check server connection.';
      setError(detail);
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isPDF = file?.name.toLowerCase().endsWith('.pdf');

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-medical-950 tracking-tight font-sans">
          Upload Medical Report
        </h1>
        <p className="text-medical-500 text-sm mt-1">
          Upload your scanned lab report or physician summary (PDF, JPG, PNG up to 10MB) for AI simplification.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start space-x-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-medical-200/60 p-6 sm:p-8 shadow-premium">
        
        {/* Drag and Drop Zone */}
        {!file ? (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
              dragActive 
                ? 'border-primary-500 bg-primary-50/20' 
                : 'border-medical-200 hover:border-primary-400 hover:bg-medical-50/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            
            <div className="w-16 h-16 rounded-2xl bg-medical-50 text-primary-500 flex items-center justify-center mx-auto mb-4 border border-medical-100/50">
              <UploadCloud className="w-8 h-8" />
            </div>
            
            <h3 className="text-lg font-bold text-medical-950 font-sans">
              Drag & drop your file here
            </h3>
            <p className="text-sm text-medical-400 mt-1.5">
              or click to browse from files
            </p>
            <div className="mt-4 inline-flex items-center space-x-3 text-xs text-medical-500 font-semibold bg-medical-50 border border-medical-200/40 px-3 py-1.5 rounded-full">
              <span>PDF, JPG, PNG</span>
              <span className="w-1 h-1 bg-medical-300 rounded-full" />
              <span>Max 10MB</span>
            </div>
          </div>
        ) : (
          /* File Selected Panel */
          <div className="border border-medical-200/60 rounded-2xl p-6 bg-medical-50/25">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  isPDF 
                    ? 'bg-red-50 text-red-600 border-red-100' 
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {isPDF ? (
                    <FileText className="w-6 h-6" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-medical-950 font-sans truncate max-w-[260px] sm:max-w-md">
                    {file.name}
                  </h3>
                  <p className="text-xs text-medical-500 font-semibold mt-1">
                    Size: {formatBytes(file.size)}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleRemoveFile}
                disabled={loading}
                className="p-1.5 rounded-xl border border-medical-200 text-medical-400 hover:text-red-500 hover:bg-white hover:border-red-100 transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100/50 p-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>File validation checks passed. Ready for AI processing.</span>
            </div>
          </div>
        )}

        {/* Upload Trigger */}
        {file && (
          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full bg-medical-700 hover:bg-medical-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 text-sm tracking-wide flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing & OCR Extraction...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  <span>Upload & Analyze Report</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
