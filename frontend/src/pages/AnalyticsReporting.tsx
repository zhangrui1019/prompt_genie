import { useState, useEffect } from 'react';
import { Search, Filter, Download, BarChart3, PieChart, LineChart, Calendar, FileText, Settings, ChevronRight, ChevronDown, Plus, X, Menu, Bell, User, RefreshCw, Clock, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface Metric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface Report {
  id: string;
  name: string;
  type: string;
  created: string;
  status: 'completed' | 'pending' | 'failed';
  size: string;
  format: string;
}

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

const AnalyticsReporting = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  useEffect(() => {
    // 模拟API调用获取分析数据
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟指标数据
        const mockMetrics: Metric[] = [
          {
            id: '1',
            name: 'Total Prompts',
            value: 12543,
            change: 12.5,
            trend: 'up',
            icon: <FileText className="h-6 w-6" />,
            color: 'bg-blue-500'
          },
          {
            id: '2',
            name: 'Active Agents',
            value: 234,
            change: 8.3,
            trend: 'up',
            icon: <Bell className="h-6 w-6" />,
            color: 'bg-green-500'
          },
          {
            id: '3',
            name: 'API Calls',
            value: 54321,
            change: -2.1,
            trend: 'down',
            icon: <RefreshCw className="h-6 w-6" />,
            color: 'bg-red-500'
          },
          {
            id: '4',
            name: 'Average Response Time',
            value: 1200,
            change: -5.7,
            trend: 'down',
            icon: <Clock className="h-6 w-6" />,
            color: 'bg-yellow-500'
          }
        ];

        // 模拟报告数据
        const mockReports: Report[] = [
          {
            id: '1',
            name: 'Weekly Performance Report',
            type: 'Performance',
            created: '2026-04-04',
            status: 'completed',
            size: '2.4 MB',
            format: 'PDF'
          },
          {
            id: '2',
            name: 'Monthly Agent Usage',
            type: 'Usage',
            created: '2026-04-01',
            status: 'completed',
            size: '1.8 MB',
            format: 'Excel'
          },
          {
            id: '3',
            name: 'Quarterly Analytics',
            type: 'Analytics',
            created: '2026-03-31',
            status: 'completed',
            size: '3.2 MB',
            format: 'PDF'
          },
          {
            id: '4',
            name: 'Daily Activity Log',
            type: 'Log',
            created: '2026-04-05',
            status: 'pending',
            size: 'N/A',
            format: 'CSV'
          }
        ];

        setMetrics(mockMetrics);
        setReports(mockReports);
      } catch (error) {
        toast.error('Failed to fetch analytics data');
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const handleExportReport = (reportId: string) => {
    toast.success('Report exported successfully');
  };

  const handleGenerateReport = () => {
    toast.success('Report generation started');
    // 模拟报告生成
    setTimeout(() => {
      const newReport: Report = {
        id: `${reports.length + 1}`,
        name: `Custom Report - ${new Date().toISOString().split('T')[0]}`,
        type: 'Custom',
        created: new Date().toISOString().split('T')[0],
        status: 'completed',
        size: '1.2 MB',
        format: 'PDF'
      };
      setReports([newReport, ...reports]);
      toast.success('Report generated successfully');
    }, 2000);
  };

  // 模拟图表数据
  const promptUsageData: ChartData[] = [
    { name: 'Mon', value: 1200 },
    { name: 'Tue', value: 1900 },
    { name: 'Wed', value: 1500 },
    { name: 'Thu', value: 2100 },
    { name: 'Fri', value: 1800 },
    { name: 'Sat', value: 900 },
    { name: 'Sun', value: 700 }
  ];

  const agentUsageData: ChartData[] = [
    { name: 'Customer Support', value: 35 },
    { name: 'Content Creation', value: 25 },
    { name: 'Code Assistant', value: 20 },
    { name: 'Financial Advisor', value: 10 },
    { name: 'Other', value: 10 }
  ];

  const responseTimeData: ChartData[] = [
    { name: 'Jan', value: 1800 },
    { name: 'Feb', value: 1600 },
    { name: 'Mar', value: 1400 },
    { name: 'Apr', value: 1200 },
    { name: 'May', value: 1300 },
    { name: 'Jun', value: 1100 }
  ];

  const renderTrendIcon = (trend: 'up' | 'down' | 'neutral', change: number) => {
    if (trend === 'up') {
      return (
        <div className="flex items-center text-green-500">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">{change.toFixed(1)}%</span>
        </div>
      );
    } else if (trend === 'down') {
      return (
        <div className="flex items-center text-red-500">
          <TrendingDown className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-500">
          <span className="text-sm font-medium">{change.toFixed(1)}%</span>
        </div>
      );
    }
  };

  const renderStatusIcon = (status: 'completed' | 'pending' | 'failed') => {
    if (status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === 'pending') {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const renderChart = (type: string, data: ChartData[]) => {
    // 简化的图表渲染，实际项目中可以使用Chart.js或其他图表库
    if (type === 'bar') {
      return (
        <div className="h-64 flex items-end justify-around p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-10 bg-indigo-500 rounded-t-md" 
                style={{ height: `${(item.value / Math.max(...data.map(d => d.value))) * 200}px` }}
              ></div>
              <span className="mt-2 text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
            </div>
          ))}
        </div>
      );
    } else if (type === 'pie') {
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
      return (
        <div className="h-64 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 rounded-full border-8 border-gray-200 dark:border-gray-700"></div>
            {data.map((item, index) => {
              const percentage = (item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100;
              return (
                <div key={index} className="mt-2 flex items-center">
                  <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                  <span className="ml-auto text-sm font-medium text-gray-900 dark:text-white">{percentage.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else if (type === 'line') {
      return (
        <div className="h-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="w-full h-full relative">
            {data.map((item, index) => (
              <div key={index} className="absolute" style={{ 
                left: `${(index / (data.length - 1)) * 100}%`, 
                bottom: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%`,
                transform: 'translate(-50%, 50%)'
              }}>
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
              </div>
            ))}
            {/* 简化的线条连接 */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
              <polyline 
                points={data.map((item, index) => {
                  const x = (index / (data.length - 1)) * 400;
                  const y = 200 - ((item.value / Math.max(...data.map(d => d.value))) * 200);
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Prompt Genie</span>
              </Link>
              <nav className="hidden md:ml-6 md:flex space-x-8">
                <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/agents" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium">
                  Agents
                </Link>
                <Link to="/analytics" className="text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 px-3 py-2 text-sm font-medium">
                  Analytics
                </Link>
                <Link to="/agent-ecosystem" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium">
                  Ecosystem
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Bell className="h-6 w-6" />
              </button>
              <div className="ml-3 relative">
                <div>
                  <button className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" id="user-menu">
                    <span className="sr-only">Open user menu</span>
                    <User className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reporting</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track performance and generate detailed reports
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                className="block pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
            <button
              onClick={handleGenerateReport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'custom' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              Custom Reports
            </button>
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                metrics.map((metric) => (
                  <div key={metric.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                ))
              ) : (
                metrics.map((metric) => (
                  <div key={metric.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className={`${metric.color} rounded-full p-2 inline-block mb-4`}>
                      {metric.icon}
                    </div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{metric.name}</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {metric.name === 'Average Response Time' ? `${metric.value}ms` : metric.value.toLocaleString()}
                    </p>
                    {renderTrendIcon(metric.trend, metric.change)}
                  </div>
                ))
              )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Prompt Usage</h2>
                {renderChart('bar', promptUsageData)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agent Distribution</h2>
                {renderChart('pie', agentUsageData)}
              </div>
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Response Time Trend</h2>
                {renderChart('line', responseTimeData)}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Reports</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Size
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Format
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoading ? (
                      [...Array(4)].map((_, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      reports.map((report) => (
                        <tr key={report.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              {report.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {report.created}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {renderStatusIcon(report.status)}
                              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {report.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {report.format}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {report.status === 'completed' && (
                              <button
                                onClick={() => handleExportReport(report.id)}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3"
                              >
                                <Download className="h-4 w-4 inline mr-1" />
                                Export
                              </button>
                            )}
                            <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                              <Settings className="h-4 w-4 inline mr-1" />
                              Settings
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Custom Reports Tab */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Custom Report</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="report-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Report Name
                  </label>
                  <input
                    type="text"
                    id="report-name"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Report Type
                  </label>
                  <select
                    id="report-type"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="performance">Performance</option>
                    <option value="usage">Usage</option>
                    <option value="analytics">Analytics</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="report-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Format
                  </label>
                  <select
                    id="report-format"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time Range
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="start-date" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="start-date"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="end-date" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="end-date"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full"
                      >
                        Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Report Templates</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {[
                  { name: 'Weekly Performance', description: 'Track weekly performance metrics' },
                  { name: 'Monthly Usage', description: 'Monitor monthly usage patterns' },
                  { name: 'Quarterly Analytics', description: 'Analyze quarterly trends' },
                  { name: 'Custom Agent Report', description: 'Detailed agent performance' },
                  { name: 'API Usage Report', description: 'Track API call patterns' },
                  { name: 'User Activity Log', description: 'Monitor user activities' }
                ].map((template, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{template.description}</p>
                    <button className="inline-flex items-center px-3 py-1 border border-indigo-300 dark:border-indigo-700 text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                © 2026 Prompt Genie. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">
                Terms
              </Link>
              <Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">
                Privacy
              </Link>
              <Link to="/support" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AnalyticsReporting;