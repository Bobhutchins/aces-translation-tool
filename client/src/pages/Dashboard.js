import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Globe,
  BarChart3,
  Activity,
  AlertCircle
} from 'lucide-react';
import { translationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTranslations: 0,
    totalWords: 0,
    averageConfidence: 0,
    topLanguages: [],
    documentTypeBreakdown: {},
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await translationAPI.getAnalytics({ period: '30d' });
      if (response.success) {
        setStats(response.analytics);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Upload Document',
      description: 'Upload a new document for translation',
      icon: Upload,
      href: '/upload',
      color: 'bg-primary-500 hover:bg-primary-600'
    },
    {
      title: 'Translation Workspace',
      description: 'Access your translation workspace',
      icon: FileText,
      href: '/workspace',
      color: 'bg-success-500 hover:bg-success-600'
    },
    {
      title: 'Quality Control',
      description: 'Review and approve translations',
      icon: CheckCircle,
      href: '/quality-control',
      color: 'bg-warning-500 hover:bg-warning-600'
    },
    {
      title: 'Batch Processing',
      description: 'Process multiple documents',
      icon: BarChart3,
      href: '/batch',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const statCards = [
    {
      title: 'Total Translations',
      value: stats.totalTranslations.toLocaleString(),
      icon: FileText,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900'
    },
    {
      title: 'Words Translated',
      value: stats.totalWords.toLocaleString(),
      icon: Globe,
      color: 'text-success-600',
      bgColor: 'bg-success-100 dark:bg-success-900'
    },
    {
      title: 'Average Confidence',
      value: `${(stats.averageConfidence * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100 dark:bg-warning-900'
    },
    {
      title: 'Active Users',
      value: '12', // Mock data
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening with your translations today.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-success-500" />
            <span className="text-sm text-success-600 dark:text-success-400 font-medium">
              System Online
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.href}
              className="group block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Languages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Languages
          </h3>
          <div className="space-y-3">
            {stats.topLanguages && stats.topLanguages.length > 0 ? (
              stats.topLanguages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-primary-500 rounded-full" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {lang.language}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {lang.count}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No translation data available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Document Types */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Document Types
          </h3>
          <div className="space-y-3">
            {stats.documentTypeBreakdown && Object.keys(stats.documentTypeBreakdown).length > 0 ? (
              Object.entries(stats.documentTypeBreakdown).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {count}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No document type data available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="h-2 w-2 bg-primary-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No recent activity
              </p>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-success-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Claude API
              </p>
              <p className="text-xs text-success-600 dark:text-success-400">
                Operational
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-success-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Document Processing
              </p>
              <p className="text-xs text-success-600 dark:text-success-400">
                Operational
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-success-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Security & Compliance
              </p>
              <p className="text-xs text-success-600 dark:text-success-400">
                FERPA Compliant
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
