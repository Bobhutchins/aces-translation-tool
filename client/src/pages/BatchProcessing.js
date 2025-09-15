import React, { useState } from 'react';
import { Layers, Upload, Play, Pause, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const BatchProcessing = () => {
  const [batchJobs, setBatchJobs] = useState([
    {
      id: 1,
      name: 'IEP Documents - January 2024',
      status: 'completed',
      totalDocuments: 25,
      processedDocuments: 25,
      failedDocuments: 0,
      createdAt: '2024-01-15T10:30:00Z',
      completedAt: '2024-01-15T11:45:00Z'
    },
    {
      id: 2,
      name: 'Report Cards - Q1 2024',
      status: 'processing',
      totalDocuments: 150,
      processedDocuments: 87,
      failedDocuments: 2,
      createdAt: '2024-01-15T14:20:00Z'
    },
    {
      id: 3,
      name: 'Parent Communications - Spanish',
      status: 'pending',
      totalDocuments: 45,
      processedDocuments: 0,
      failedDocuments: 0,
      createdAt: '2024-01-15T16:00:00Z'
    }
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge-success">Completed</span>;
      case 'processing':
        return <span className="badge-warning">Processing</span>;
      case 'pending':
        return <span className="badge-gray">Pending</span>;
      case 'failed':
        return <span className="badge-error">Failed</span>;
      default:
        return <span className="badge-gray">Unknown</span>;
    }
  };

  const getProgressPercentage = (job) => {
    return Math.round((job.processedDocuments / job.totalDocuments) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Batch Processing
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Process multiple documents efficiently with queue management
              </p>
            </div>
          </div>
          <button className="btn-primary">
            <Upload className="h-4 w-4 mr-2" />
            Create Batch Job
          </button>
        </div>
      </div>

      {/* Batch Jobs */}
      <div className="space-y-4">
        {batchJobs.map((job) => (
          <div key={job.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {job.name}
                </h3>
                {getStatusBadge(job.status)}
              </div>
              <div className="flex items-center space-x-2">
                {job.status === 'pending' && (
                  <button className="btn-primary">
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </button>
                )}
                {job.status === 'processing' && (
                  <button className="btn-secondary">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </button>
                )}
                <button className="btn-secondary">
                  View Details
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Progress: {job.processedDocuments} / {job.totalDocuments} documents
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {getProgressPercentage(job)}%
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${getProgressPercentage(job)}%` }}
                />
              </div>
            </div>

            {/* Job Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Processed: {job.processedDocuments}
                </span>
              </div>
              {job.failedDocuments > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-error-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Failed: {job.failedDocuments}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Created: {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
              {job.completedAt && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Completed: {new Date(job.completedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Batch Processing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Processed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">98.4%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchProcessing;
