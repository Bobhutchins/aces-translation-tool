import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentUpload from '../components/DocumentUpload';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DocumentUploadPage = () => {
  const navigate = useNavigate();
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  const handleUploadSuccess = (documents) => {
    setUploadedDocuments(prev => [...prev, ...documents]);
    toast.success(`${documents.length} document(s) uploaded successfully!`);
  };

  const handleUploadError = (errors) => {
    console.error('Upload errors:', errors);
    toast.error('Some documents failed to upload');
  };

  const handleTranslateDocument = (document) => {
    navigate(`/workspace/${document.fileId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
            <Upload className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Document Upload
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload documents for translation using Claude Sonnet 4
            </p>
          </div>
        </div>
      </div>

      {/* Upload Component */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <DocumentUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>

      {/* Recently Uploaded Documents */}
      {uploadedDocuments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recently Uploaded Documents
          </h2>
          <div className="space-y-3">
            {uploadedDocuments.map((doc, index) => (
              <div
                key={doc.fileId || index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {doc.originalName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {doc.sourceLanguage} → {doc.targetLanguage} • {doc.wordCount} words
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="badge-primary">
                    {doc.documentType}
                  </span>
                  <button
                    onClick={() => handleTranslateDocument(doc)}
                    className="btn-primary"
                  >
                    Translate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
          Upload Instructions
        </h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Supported formats: PDF, DOC, DOCX, TXT, RTF</p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Maximum file size: 50MB per file</p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Select appropriate document type for better translation quality</p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Documents are processed securely and FERPA-compliant</p>
          </div>
        </div>
      </div>

      {/* Document Type Guidelines */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Document Type Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white">IEP Documents</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Individualized Education Programs with legal terminology and service descriptions
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white">Report Cards</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Student performance reports with grade-level appropriate language
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white">Parent Communications</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Family correspondence with culturally sensitive language
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white">Evaluations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Educational assessments with psychological terminology
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white">General Documents</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Standard educational documents and communications
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white">Legal Documents</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Official legal documents requiring precise terminology
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadPage;
