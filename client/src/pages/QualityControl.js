import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Star, Filter, Search } from 'lucide-react';

const QualityControl = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const mockTranslations = [
    {
      id: 1,
      documentName: 'IEP - John Smith.pdf',
      sourceLanguage: 'English',
      targetLanguage: 'Spanish',
      confidenceScore: 0.95,
      status: 'pending_review',
      uploadedAt: '2024-01-15',
      wordCount: 1250
    },
    {
      id: 2,
      documentName: 'Report Card - Maria Garcia.docx',
      sourceLanguage: 'English',
      targetLanguage: 'Portuguese',
      confidenceScore: 0.87,
      status: 'approved',
      uploadedAt: '2024-01-14',
      wordCount: 850
    },
    {
      id: 3,
      documentName: 'Parent Communication - Ahmed Hassan.pdf',
      sourceLanguage: 'English',
      targetLanguage: 'Arabic',
      confidenceScore: 0.72,
      status: 'needs_revision',
      uploadedAt: '2024-01-13',
      wordCount: 450
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge-success">Approved</span>;
      case 'pending_review':
        return <span className="badge-warning">Pending Review</span>;
      case 'needs_revision':
        return <span className="badge-error">Needs Revision</span>;
      default:
        return <span className="badge-gray">Unknown</span>;
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.9) return 'text-success-600';
    if (score >= 0.7) return 'text-warning-600';
    return 'text-error-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quality Control
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and approve translations for accuracy and quality
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="select"
            >
              <option value="all">All Status</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="needs_revision">Needs Revision</option>
            </select>
            <button className="btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Translation List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Translations Pending Review
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {mockTranslations.map((translation) => (
            <div key={translation.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {translation.documentName}
                    </h4>
                    {getStatusBadge(translation.status)}
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{translation.sourceLanguage} → {translation.targetLanguage}</span>
                    <span>{translation.wordCount} words</span>
                    <span>Uploaded {translation.uploadedAt}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Confidence</p>
                    <p className={`text-lg font-semibold ${getConfidenceColor(translation.confidenceScore)}`}>
                      {(translation.confidenceScore * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="btn-secondary">
                      Review
                    </button>
                    <button className="btn-primary">
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Quality Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">94.2%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityControl;
