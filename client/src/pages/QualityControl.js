import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Star, Filter, Search, Eye, Edit, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const QualityControl = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const filteredItems = getFilteredTranslations();
    setSelectedItems(
      selectedItems.length === filteredItems.length 
        ? [] 
        : filteredItems.map(item => item.id)
    );
  };

  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to approve');
      return;
    }
    
    setLoading(true);
    try {
      // TODO: Implement bulk approve API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${selectedItems.length} items approved successfully`);
      setSelectedItems([]);
    } catch (error) {
      toast.error('Failed to approve items');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to reject');
      return;
    }
    
    setLoading(true);
    try {
      // TODO: Implement bulk reject API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${selectedItems.length} items rejected successfully`);
      setSelectedItems([]);
    } catch (error) {
      toast.error('Failed to reject items');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTranslations = () => {
    let filtered = mockTranslations;
    
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.status === filter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sourceLanguage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.targetLanguage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
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
        
        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {selectedItems.length} item(s) selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkApprove}
                  disabled={loading}
                  className="btn-success"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Selected
                </button>
                <button
                  onClick={handleBulkReject}
                  disabled={loading}
                  className="btn-error"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Reject Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Translation List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Translations Pending Review
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedItems.length === getFilteredTranslations().length && getFilteredTranslations().length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-500">Select All</span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {getFilteredTranslations().map((translation) => (
            <div key={translation.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(translation.id)}
                    onChange={() => handleSelectItem(translation.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
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
                    <button 
                      className="btn-secondary"
                      onClick={() => window.open(`/translation-workspace/${translation.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </button>
                    <button 
                      className="btn-success"
                      onClick={() => handleBulkApprove([translation.id])}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button 
                      className="btn-error"
                      onClick={() => handleBulkReject([translation.id])}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Reject
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
