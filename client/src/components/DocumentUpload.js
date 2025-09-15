import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { documentAPI } from '../services/api';
import toast from 'react-hot-toast';

const DocumentUpload = ({ onUploadSuccess, onUploadError }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [documentType, setDocumentType] = useState('general');

  const supportedLanguages = {
    'en': 'English',
    'es': 'Spanish',
    'pt': 'Portuguese',
    'fr': 'French',
    'it': 'Italian',
    'de': 'German',
    'ru': 'Russian',
    'zh': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'ur': 'Urdu',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'pl': 'Polish',
    'tr': 'Turkish',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
    'he': 'Hebrew',
    'el': 'Greek',
    'cs': 'Czech',
    'hu': 'Hungarian',
    'ro': 'Romanian',
    'bg': 'Bulgarian',
    'hr': 'Croatian',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'et': 'Estonian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'mt': 'Maltese',
    'ga': 'Irish',
    'cy': 'Welsh',
    'eu': 'Basque',
    'ca': 'Catalan',
    'gl': 'Galician'
  };

  const documentTypes = {
    'general': 'General Educational Document',
    'iep': 'Individualized Education Program (IEP)',
    'report_card': 'Report Card',
    'parent_communication': 'Parent/Guardian Communication',
    'evaluation': 'Educational Evaluation',
    'assessment': 'Assessment Report',
    'discipline': 'Disciplinary Action',
    'medical': 'Medical Documentation',
    'legal': 'Legal Document'
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0,
      error: null
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/rtf': ['.rtf']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    if (!sourceLanguage || !targetLanguage) {
      toast.error('Please select source and target languages');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const results = [];
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const fileItem = uploadedFiles[i];
        
        // Update file status to uploading
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'uploading', progress: 0 }
              : f
          )
        );

        const formData = new FormData();
        formData.append('document', fileItem.file);
        formData.append('sourceLanguage', sourceLanguage);
        formData.append('targetLanguage', targetLanguage);
        formData.append('documentType', documentType);

        try {
          const response = await documentAPI.upload(formData, (progress) => {
            // Update individual file progress (0-30% for upload)
            const uploadProgress = Math.round(progress * 0.3);
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileItem.id 
                  ? { ...f, progress: uploadProgress }
                  : f
              )
            );
            
            // Update overall progress
            const overallProgress = Math.round(((i * 100) + uploadProgress) / uploadedFiles.length);
            console.log(`Upload progress: file ${i}, upload: ${uploadProgress}%, overall: ${overallProgress}%`);
            setUploadProgress(overallProgress);
          });

          if (response.success) {
            // Update status to processing translation (30% complete)
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileItem.id 
                  ? { ...f, status: 'translating', progress: 30 }
                  : f
              )
            );
            
            // Update overall progress to reflect translation start (30% for this file)
            const overallProgress = Math.round(((i * 100) + 30) / uploadedFiles.length);
            console.log(`Translation started: file ${i}, overall: ${overallProgress}%`);
            setUploadProgress(overallProgress);

            // Now translate the document with progress simulation
            try {
              // Simulate translation progress (30% to 90%)
              let currentProgress = 30;
              const translationProgressInterval = setInterval(() => {
                currentProgress = Math.min(currentProgress + 15, 90);
                setUploadedFiles(prev => 
                  prev.map(f => {
                    if (f.id === fileItem.id && f.status === 'translating') {
                      return { ...f, progress: currentProgress };
                    }
                    return f;
                  })
                );
                
                // Update overall progress during translation (30% to 90% for this file)
                const overallProgress = Math.round(((i * 100) + currentProgress) / uploadedFiles.length);
                console.log(`Translation progress: file ${i}, current: ${currentProgress}%, overall: ${overallProgress}%`);
                setUploadProgress(overallProgress);
              }, 800);

              const translationResponse = await documentAPI.translate({
                fileId: response.document.fileId,
                sourceLanguage,
                targetLanguage,
                documentType
              });

              // Clear the progress simulation interval
              clearInterval(translationProgressInterval);

              if (translationResponse.success) {
                // Small delay to ensure user sees the completion
                setTimeout(() => {
                  setUploadedFiles(prev => 
                    prev.map(f => 
                      f.id === fileItem.id 
                        ? { ...f, status: 'completed', progress: 100 }
                        : f
                    )
                  );
                  
                  // Update overall progress to 100% for this file
                  const overallProgress = Math.round(((i + 1) * 100) / uploadedFiles.length);
                  console.log(`Translation completed: file ${i}, overall: ${overallProgress}%`);
                  setUploadProgress(overallProgress);
                }, 200);
                
                results.push({ 
                  success: true, 
                  data: { 
                    ...response.document, 
                    translation: translationResponse.translation 
                  } 
                });
              } else {
                throw new Error(translationResponse.error || 'Translation failed');
              }
            } catch (translationError) {
              setUploadedFiles(prev => 
                prev.map(f => 
                  f.id === fileItem.id 
                    ? { ...f, status: 'error', error: translationError.message }
                    : f
                )
              );
              results.push({ success: false, error: translationError.message });
              
              // Update overall progress even for failed translations
              const overallProgress = Math.round(((i + 1) * 100) / uploadedFiles.length);
              setUploadProgress(overallProgress);
            }
          } else {
            throw new Error(response.error || 'Upload failed');
          }
        } catch (error) {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileItem.id 
                ? { ...f, status: 'error', error: error.message }
                : f
            )
          );
          results.push({ success: false, error: error.message });
          
          // Update overall progress even for failed uploads
          const overallProgress = Math.round(((i + 1) * 100) / uploadedFiles.length);
          setUploadProgress(overallProgress);
        }

        // Overall progress is now updated within the success/error handlers above
      }

      const successfulUploads = results.filter(r => r.success);
      const failedUploads = results.filter(r => !r.success);

      if (successfulUploads.length > 0) {
        toast.success(`${successfulUploads.length} file(s) uploaded successfully`);
        if (onUploadSuccess) {
          onUploadSuccess(successfulUploads.map(r => r.data));
        }
      }

      if (failedUploads.length > 0) {
        toast.error(`${failedUploads.length} file(s) failed to upload`);
        if (onUploadError) {
          onUploadError(failedUploads);
        }
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
      if (onUploadError) {
        onUploadError([{ error: error.message }]);
      }
    } finally {
      setUploadProgress(100);
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      case 'rtf':
        return '📄';
      default:
        return '📁';
    }
  };

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Source Language
          </label>
          <select
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
            className="select w-full"
            disabled={uploading}
          >
            <option value="">Select source language</option>
            {Object.entries(supportedLanguages).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Language
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="select w-full"
            disabled={uploading}
          >
            <option value="">Select target language</option>
            {Object.entries(supportedLanguages).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="select w-full"
            disabled={uploading}
          >
            {Object.entries(documentTypes).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          or click to select files
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Supports PDF, DOC, DOCX, TXT, RTF (max 50MB each)
        </p>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Uploading files...
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(uploadProgress)}%
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Selected Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(fileItem.file.name)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(fileItem.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {fileItem.status === 'pending' && (
                    <span className="text-gray-400">Ready</span>
                  )}
                  {fileItem.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="loading-spinner h-4 w-4" />
                      <span className="text-sm text-gray-500">
                        Uploading {fileItem.progress}%
                      </span>
                    </div>
                  )}
                  {fileItem.status === 'translating' && (
                    <div className="flex items-center space-x-2">
                      <div className="loading-spinner h-4 w-4" />
                      <span className="text-sm text-gray-500">
                        Translating {fileItem.progress}%
                      </span>
                    </div>
                  )}
                  {fileItem.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-success-500" />
                  )}
                  {fileItem.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-error-500" />
                  )}
                  {!uploading && (
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="text-gray-400 hover:text-error-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {uploadedFiles.length > 0 && !uploading && (
        <div className="flex justify-end">
          <button
            onClick={uploadFiles}
            disabled={!sourceLanguage || !targetLanguage}
            className="btn-primary"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload {uploadedFiles.length} File{uploadedFiles.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
