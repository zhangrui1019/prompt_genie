import { useState, useEffect } from 'react';
import { Shield, Lock, Users, FileText, Activity, AlertTriangle, CheckCircle, Settings, ChevronRight, ChevronDown, Plus, X, Menu, Bell, User, Eye, EyeOff, RefreshCw, Download, Filter, Search, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  status: 'enabled' | 'disabled';
  category: string;
  lastUpdated: string;
}

interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'warning';
  lastChecked: string;
  severity: 'low' | 'medium' | 'high';
}

interface AccessControl {
  id: string;
  role: string;
  permissions: string[];
  members: number;
  lastUpdated: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  ip: string;
  status: 'success' | 'failure';
}

const SecurityCompliance = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [accessControls, setAccessControls] = useState<AccessControl[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 模拟API调用获取安全和合规数据
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟安全设置数据
        const mockSecuritySettings: SecuritySetting[] = [
          {
            id: '1',
            name: 'Two-Factor Authentication',
            description: 'Require 2FA for all user logins',
            status: 'enabled',
            category: 'Authentication',
            lastUpdated: '2026-04-01'
          },
          {
            id: '2',
            name: 'Password Policy',
            description: 'Enforce strong password requirements',
            status: 'enabled',
            category: 'Authentication',
            lastUpdated: '2026-03-15'
          },
          {
            id: '3',
            name: 'IP Whitelisting',
            description: 'Restrict access to specific IP addresses',
            status: 'disabled',
            category: 'Access Control',
            lastUpdated: '2026-02-20'
          },
          {
            id: '4',
            name: 'Data Encryption',
            description: 'Encrypt sensitive data at rest and in transit',
            status: 'enabled',
            category: 'Data Protection',
            lastUpdated: '2026-03-30'
          },
          {
            id: '5',
            name: 'Audit Logging',
            description: 'Record all system activities',
            status: 'enabled',
            category: 'Monitoring',
            lastUpdated: '2026-04-02'
          }
        ];

        // 模拟合规性检查数据
        const mockComplianceChecks: ComplianceCheck[] = [
          {
            id: '1',
            name: 'GDPR Compliance',
            description: 'General Data Protection Regulation compliance',
            status: 'compliant',
            lastChecked: '2026-04-04',
            severity: 'high'
          },
          {
            id: '2',
            name: 'HIPAA Compliance',
            description: 'Health Insurance Portability and Accountability Act compliance',
            status: 'warning',
            lastChecked: '2026-04-03',
            severity: 'high'
          },
          {
            id: '3',
            name: 'SOC 2 Compliance',
            description: 'Service Organization Control 2 compliance',
            status: 'compliant',
            lastChecked: '2026-03-28',
            severity: 'medium'
          },
          {
            id: '4',
            name: 'PCI DSS Compliance',
            description: 'Payment Card Industry Data Security Standard compliance',
            status: 'non-compliant',
            lastChecked: '2026-04-01',
            severity: 'high'
          }
        ];

        // 模拟访问控制数据
        const mockAccessControls: AccessControl[] = [
          {
            id: '1',
            role: 'Admin',
            permissions: ['Manage Users', 'Manage Security Settings', 'Access Audit Logs', 'Manage Billing'],
            members: 5,
            lastUpdated: '2026-03-10'
          },
          {
            id: '2',
            role: 'Team Manager',
            permissions: ['Manage Team Members', 'Create Agents', 'Access Reports'],
            members: 12,
            lastUpdated: '2026-03-15'
          },
          {
            id: '3',
            role: 'Developer',
            permissions: ['Create Prompts', 'Test Agents', 'Access Documentation'],
            members: 24,
            lastUpdated: '2026-03-20'
          },
          {
            id: '4',
            role: 'Viewer',
            permissions: ['View Dashboard', 'Access Reports'],
            members: 8,
            lastUpdated: '2026-03-25'
          }
        ];

        // 模拟审计日志数据
        const mockAuditLogs: AuditLog[] = [
          {
            id: '1',
            action: 'User login',
            user: 'admin@example.com',
            timestamp: '2026-04-05T10:30:00',
            ip: '192.168.1.1',
            status: 'success'
          },
          {
            id: '2',
            action: 'Security setting updated',
            user: 'admin@example.com',
            timestamp: '2026-04-05T09:15:00',
            ip: '192.168.1.1',
            status: 'success'
          },
          {
            id: '3',
            action: 'User login failed',
            user: 'user@example.com',
            timestamp: '2026-04-05T08:45:00',
            ip: '10.0.0.1',
            status: 'failure'
          },
          {
            id: '4',
            action: 'Agent created',
            user: 'developer@example.com',
            timestamp: '2026-04-05T08:30:00',
            ip: '192.168.1.2',
            status: 'success'
          },
          {
            id: '5',
            action: 'Access control updated',
            user: 'admin@example.com',
            timestamp: '2026-04-05T07:20:00',
            ip: '192.168.1.1',
            status: 'success'
          }
        ];

        setSecuritySettings(mockSecuritySettings);
        setComplianceChecks(mockComplianceChecks);
        setAccessControls(mockAccessControls);
        setAuditLogs(mockAuditLogs);
      } catch (error) {
        toast.error('Failed to fetch security data');
        console.error('Error fetching security data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleSetting = (settingId: string) => {
    setSecuritySettings(securitySettings.map(setting => 
      setting.id === settingId ? {
        ...setting,
        status: setting.status === 'enabled' ? 'disabled' : 'enabled',
        lastUpdated: new Date().toISOString().split('T')[0]
      } : setting
    ));
    toast.success('Security setting updated');
  };

  const handleExportReport = () => {
    toast.success('Security report exported successfully');
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'enabled' || status === 'compliant' || status === 'success') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    } else if (status === 'disabled' || status === 'failure') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    } else if (status === 'warning') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    } else if (status === 'non-compliant') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Non-Compliant
        </span>
      );
    }
    return null;
  };

  const filteredAuditLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <Link to="/analytics" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium">
                  Analytics
                </Link>
                <Link to="/security" className="text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 px-3 py-2 text-sm font-medium">
                  Security
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security & Compliance</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage security settings and ensure compliance with industry standards
            </p>
          </div>
          <button
            onClick={handleExportReport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              Security Settings
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'compliance' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              Compliance
            </button>
            <button
              onClick={() => setActiveTab('access')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'access' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              Access Control
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'audit' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              Audit Logs
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Security Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Security Status</h3>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">Secure</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">All critical security settings are enabled</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full p-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Compliance Status</h3>
                </div>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">Needs Attention</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">1 compliance issue detected</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Access Control</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">4 Roles</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">49 total users</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2">
                    <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Audit Logs</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">124</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Events in last 24 hours</p>
              </div>
            </div>

            {/* Recent Security Events */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Security Events</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {auditLogs.slice(0, 5).map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{log.user}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStatusBadge(log.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <Link to="#" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                  View all audit logs
                </Link>
              </div>
            </div>

            {/* Compliance Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Compliance Summary</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {complianceChecks.map((check) => (
                    <div key={check.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <h3 className="text-md font-medium text-gray-900 dark:text-white">{check.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{check.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Last checked: {check.lastChecked}</p>
                      </div>
                      <div className="flex items-center">
                        {renderStatusBadge(check.status)}
                        <span className={`ml-4 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${check.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : check.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                          {check.severity.charAt(0).toUpperCase() + check.severity.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  [...Array(5)].map((_, index) => (
                    <div key={index} className="px-6 py-4 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        </div>
                        <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  securitySettings.map((setting) => (
                    <div key={setting.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-md font-medium text-gray-900 dark:text-white">{setting.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{setting.description}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            Category: {setting.category} | Last updated: {setting.lastUpdated}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleSetting(setting.id)}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${setting.status === 'enabled' ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                          <span
                            className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${setting.status === 'enabled' ? 'translate-x-6' : 'translate-x-1'}`}
                          />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Security Setting</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="setting-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Setting Name
                  </label>
                  <input
                    type="text"
                    id="setting-name"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter setting name"
                  />
                </div>
                <div>
                  <label htmlFor="setting-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="setting-description"
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter setting description"
                  />
                </div>
                <div>
                  <label htmlFor="setting-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    id="setting-category"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="authentication">Authentication</option>
                    <option value="access_control">Access Control</option>
                    <option value="data_protection">Data Protection</option>
                    <option value="monitoring">Monitoring</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add Setting
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Compliance Checks</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {isLoading ? (
                    [...Array(4)].map((_, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    complianceChecks.map((check) => (
                      <div key={check.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white">{check.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{check.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Last checked: {check.lastChecked}</span>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${check.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : check.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                              {check.severity.charAt(0).toUpperCase() + check.severity.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {renderStatusBadge(check.status)}
                            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Run Compliance Check
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance Reports</h3>
              <div className="space-y-4">
                {[
                  { name: 'GDPR Compliance Report', date: '2026-03-31', status: 'compliant' },
                  { name: 'HIPAA Compliance Report', date: '2026-03-15', status: 'warning' },
                  { name: 'SOC 2 Compliance Report', date: '2026-02-28', status: 'compliant' }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Generated: {report.date}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {renderStatusBadge(report.status)}
                      <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                        <Download className="h-4 w-4 inline mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Access Control Tab */}
        {activeTab === 'access' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Role-Based Access Control</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Members
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Updated
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
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      accessControls.map((control) => (
                        <tr key={control.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{control.role}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {control.permissions.map((permission, index) => (
                                <div key={index} className="text-sm text-gray-500 dark:text-gray-400">{permission}</div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{control.members}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{control.lastUpdated}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3">
                              Edit
                            </button>
                            <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Role
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Access Requests</h3>
              <div className="space-y-4">
                {[
                  { id: '1', user: 'john.doe@example.com', role: 'Developer', status: 'pending', submitted: '2026-04-05' },
                  { id: '2', user: 'jane.smith@example.com', role: 'Team Manager', status: 'approved', submitted: '2026-04-04' },
                  { id: '3', user: 'bob.johnson@example.com', role: 'Viewer', status: 'rejected', submitted: '2026-04-03' }
                ].map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{request.user}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Requesting: {request.role} | Submitted: {request.submitted}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {renderStatusBadge(request.status)}
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button className="text-sm text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                            Approve
                          </button>
                          <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Logs</h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search audit logs..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoading ? (
                      [...Array(5)].map((_, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      filteredAuditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{log.user}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{log.ip}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(log.status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {filteredAuditLogs.length} of {auditLogs.length} results
                  </div>
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      Previous
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Log Retention Settings</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="retention-period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Retention Period
                  </label>
                  <select
                    id="retention-period"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                    <option value="730">2 years</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="log-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Log Format
                  </label>
                  <select
                    id="log-format"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="syslog">Syslog</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Save Settings
                  </button>
                </div>
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

export default SecurityCompliance;