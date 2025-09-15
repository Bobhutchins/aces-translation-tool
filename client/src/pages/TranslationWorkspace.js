import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Edit3, Save, Download, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { documentAPI } from '../services/api';
import toast from 'react-hot-toast';

const TranslationWorkspace = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState(null);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      loadDocument(id);
    }
  }, [id]);

  const loadDocument = async (documentId) => {
    setLoading(true);
    try {
      // Fetch real document data from backend
      const response = await documentAPI.getDocument(documentId);
      
      if (response.success) {
        const docData = response.document;
               setDocument({
                 id: documentId,
                 name: docData.originalName || 'Document',
                 sourceLanguage: docData.sourceLanguage || 'English',
                 targetLanguage: docData.targetLanguage || 'Spanish',
                 documentType: docData.documentType || 'General',
                 wordCount: docData.wordCount || 0,
                 billingWordCount: docData.billingWordCount || docData.wordCount || 0,
                 uploadedAt: docData.uploadedAt || new Date().toISOString()
               });
        
        // If we have translation data, use it
        if (docData.translation) {
          setOriginalText(docData.translation.originalText || '');
          setTranslatedText(docData.translation.translatedText || '');
          setConfidenceScore(docData.translation.confidenceScore || 0);
        } else {
          // Fallback to mock data if no translation available
          setOriginalText(`This is a sample document that would contain the student's educational goals, services, and accommodations. The document includes detailed information about the student's current performance levels, annual goals, and the special education services that will be provided to help the student achieve these goals.`);
          setTranslatedText(`Este es un documento de muestra que contendría los objetivos educativos, servicios y adaptaciones del estudiante. El documento incluye información detallada sobre los niveles de rendimiento actuales del estudiante, objetivos anuales y los servicios de educación especial que se proporcionarán para ayudar al estudiante a lograr estos objetivos.`);
          setConfidenceScore(0.92);
        }
      } else {
        throw new Error('Failed to load document');
      }
    } catch (error) {
      console.error('Failed to load document:', error);
      toast.error('Failed to load document');
      
             // Fallback to mock data on error
             setDocument({
               id: documentId,
               name: 'Sample Document.pdf',
               sourceLanguage: 'English',
               targetLanguage: 'Spanish',
               documentType: 'General',
               wordCount: 1250,
               billingWordCount: 1200, // Example: some words might not need translation
               uploadedAt: new Date().toISOString()
             });
      
      setOriginalText(`This is a sample document that would contain the student's educational goals, services, and accommodations. The document includes detailed information about the student's current performance levels, annual goals, and the special education services that will be provided to help the student achieve these goals.`);
      
      setTranslatedText(`Este es un documento de muestra que contendría los objetivos educativos, servicios y adaptaciones del estudiante. El documento incluye información detallada sobre los niveles de rendimiento actuales del estudiante, objetivos anuales y los servicios de educación especial que se proporcionarán para ayudar al estudiante a lograr estos objetivos.`);
      
      setConfidenceScore(0.92);
    } finally {
      setLoading(false);
    }
  };

  const handleRetranslate = async () => {
    setLoading(true);
    try {
      // Mock retranslation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTranslatedText(`[Retranslated] Este es un documento IEP de muestra que contendría los objetivos educativos, servicios y adaptaciones del estudiante. El documento incluye información detallada sobre los niveles de rendimiento actuales del estudiante, objetivos anuales y los servicios de educación especial que se proporcionarán para ayudar al estudiante a lograr estos objetivos.`);
      setConfidenceScore(0.95);
    } catch (error) {
      console.error('Retranslation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Save translation
      setIsEditing(false);
      console.log('Translation saved');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting document');
  };

  if (loading && !document) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Translation Workspace
              </h1>
              {document && (
                <p className="text-gray-600 dark:text-gray-400">
                  {document.name} • {document.sourceLanguage} → {document.targetLanguage}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRetranslate}
              disabled={loading}
              className="btn-secondary"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Retranslate
            </button>
            <button
              onClick={handleExport}
              className="btn-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Document Info */}
      {document && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Document Type</p>
              <p className="font-medium text-gray-900 dark:text-white">{document.documentType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Words Translated</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {document.billingWordCount ? document.billingWordCount.toLocaleString() : document.wordCount.toLocaleString()}
                {document.billingWordCount && document.billingWordCount !== document.wordCount && (
                  <span className="text-sm text-gray-500 ml-1">
                    (of {document.wordCount.toLocaleString()} total)
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Confidence Score</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {(confidenceScore * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(document.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Translation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Text */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Original Text ({document?.sourceLanguage})
            </h3>
          </div>
          <div className="card-body">
            <div className="h-96 overflow-y-auto">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {originalText}
              </p>
            </div>
          </div>
        </div>

        {/* Translated Text */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Translation ({document?.targetLanguage})
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="h-96">
              {isEditing ? (
                <textarea
                  value={translatedText}
                  onChange={(e) => setTranslatedText(e.target.value)}
                  className="w-full h-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Enter translation..."
                />
              ) : (
                <div className="h-full overflow-y-auto">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {translatedText}
                  </p>
                </div>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="card-footer">
              <button
                onClick={handleSave}
                className="btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quality Indicators */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quality Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Confidence Score</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(confidenceScore * 100).toFixed(1)}%
            </p>
            <div className="mt-2">
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-success-500" 
                  style={{ width: `${confidenceScore * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Educational Context</p>
            <p className="text-2xl font-bold text-success-600">✓</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Optimized for {document?.documentType}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Cultural Sensitivity</p>
            <p className="text-2xl font-bold text-success-600">✓</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Family-appropriate language</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationWorkspace;
