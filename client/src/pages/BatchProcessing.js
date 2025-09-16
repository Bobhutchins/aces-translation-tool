import React, { useState, useEffect } from 'react';
import { Layers, Upload, Play, Pause, CheckCircle, AlertCircle, Clock, Plus, Settings, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const BatchProcessing = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newBatchJob, setNewBatchJob] = useState({
    name: '',
    sourceLanguage: 'English',
    targetLanguage: 'Spanish',
    documentType: 'general',
    priority: 'normal'
  });

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

  const handleCreateBatchJob = async () => {
    if (!newBatchJob.name.trim()) {
      toast.error('Please enter a batch job name');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement create batch job API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newJob = {
        id: Date.now(),
        ...newBatchJob,
        status: 'pending',
        totalDocuments: 0,
        processedDocuments: 0,
        failedDocuments: 0,
        createdAt: new Date().toISOString()
      };

      setBatchJobs(prev => [newJob, ...prev]);
      setShowCreateModal(false);
      setNewBatchJob({
        name: '',
        sourceLanguage: 'English',
        targetLanguage: 'Spanish',
        documentType: 'general',
        priority: 'normal'
      });
      toast.success('Batch job created successfully');
    } catch (error) {
      toast.error('Failed to create batch job');
    } finally {
      setLoading(false);
    }
  };

  const handleStartBatchJob = async (jobId) => {
    setLoading(true);
    try {
      // TODO: Implement start batch job API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBatchJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'processing' }
          : job
      ));
      toast.success('Batch job started');
    } catch (error) {
      toast.error('Failed to start batch job');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseBatchJob = async (jobId) => {
    setLoading(true);
    try {
      // TODO: Implement pause batch job API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBatchJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'pending' }
          : job
      ));
      toast.success('Batch job paused');
    } catch (error) {
      toast.error('Failed to pause batch job');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatchJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this batch job?')) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement delete batch job API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBatchJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('Batch job deleted');
    } catch (error) {
      toast.error('Failed to delete batch job');
    } finally {
      setLoading(false);
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
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
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
                  <button 
                    onClick={() => handleStartBatchJob(job.id)}
                    disabled={loading}
                    className="btn-primary"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </button>
                )}
                {job.status === 'processing' && (
                  <button 
                    onClick={() => handlePauseBatchJob(job.id)}
                    disabled={loading}
                    className="btn-secondary"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </button>
                )}
                {job.status === 'completed' && (
                  <button className="btn-success">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                )}
                <button className="btn-secondary">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
                <button 
                  onClick={() => handleDeleteBatchJob(job.id)}
                  disabled={loading}
                  className="btn-error"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
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

      {/* Create Batch Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Batch Job
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Name
                </label>
                <input
                  type="text"
                  value={newBatchJob.name}
                  onChange={(e) => setNewBatchJob(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="Enter batch job name..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Source Language
                  </label>
                  <select
                    value={newBatchJob.sourceLanguage}
                    onChange={(e) => setNewBatchJob(prev => ({ ...prev, sourceLanguage: e.target.value }))}
                    className="select"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Language
                  </label>
                  <select
                    value={newBatchJob.targetLanguage}
                    onChange={(e) => setNewBatchJob(prev => ({ ...prev, targetLanguage: e.target.value }))}
                    className="select"
                  >
                    <option value="Spanish">Spanish</option>
                    <option value="English">English</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Type
                </label>
                <select
                  value={newBatchJob.documentType}
                  onChange={(e) => setNewBatchJob(prev => ({ ...prev, documentType: e.target.value }))}
                  className="select"
                >
                  <option value="general">General</option>
                  <option value="iep">IEP</option>
                  <option value="report_card">Report Card</option>
                  <option value="parent_communication">Parent Communication</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={newBatchJob.priority}
                  onChange={(e) => setNewBatchJob(prev => ({ ...prev, priority: e.target.value }))}
                  className="select"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBatchJob}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Creating...' : 'Create Batch Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchProcessing;
