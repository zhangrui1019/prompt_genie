import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  responseTime: number;
}

interface ApiCall {
  id: string;
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: string;
  userId: string;
  error?: string;
}

interface ErrorLog {
  id: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  timestamp: string;
  userId?: string;
  endpoint?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  threshold: number;
}

export default function Monitoring() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: '0d 0h 0m',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    activeConnections: 0,
    responseTime: 0
  });
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    fetchMonitoringData();
    // 模拟实时数据更新
    const interval = setInterval(fetchMonitoringData, 5000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      // 这里应该调用获取监控数据的API
      // 暂时使用模拟数据
      
      // 模拟系统健康状态
      const mockSystemHealth: SystemHealth = {
        status: 'healthy',
        uptime: '7d 12h 34m',
        cpuUsage: Math.floor(Math.random() * 50) + 10,
        memoryUsage: Math.floor(Math.random() * 60) + 20,
        diskUsage: Math.floor(Math.random() * 40) + 30,
        activeConnections: Math.floor(Math.random() * 100) + 50,
        responseTime: Math.floor(Math.random() * 200) + 50
      };
      
      // 模拟API调用数据
      const mockApiCalls: ApiCall[] = [
        {
          id: '1',
          endpoint: '/api/prompts',
          method: 'GET',
          status: 200,
          responseTime: 120,
          timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          userId: 'user1'
        },
        {
          id: '2',
          endpoint: '/api/agents',
          method: 'POST',
          status: 201,
          responseTime: 250,
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          userId: 'user2'
        },
        {
          id: '3',
          endpoint: '/api/models',
          method: 'GET',
          status: 500,
          responseTime: 800,
          timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
          userId: 'user3',
          error: 'Internal server error'
        },
        {
          id: '4',
          endpoint: '/api/prompts/1',
          method: 'PUT',
          status: 200,
          responseTime: 180,
          timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
          userId: 'user1'
        },
        {
          id: '5',
          endpoint: '/api/chains',
          method: 'GET',
          status: 401,
          responseTime: 50,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          userId: 'user4',
          error: 'Unauthorized'
        }
      ];
      
      // 模拟错误日志
      const mockErrorLogs: ErrorLog[] = [
        {
          id: '1',
          level: 'error',
          message: 'Failed to connect to database',
          stack: 'Error: Connection refused\n    at Database.connect (/app/database.js:123:15)',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          endpoint: '/api/models'
        },
        {
          id: '2',
          level: 'warning',
          message: 'High memory usage detected',
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          level: 'info',
          message: 'System backup completed',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          level: 'error',
          message: 'API rate limit exceeded',
          timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
          userId: 'user5',
          endpoint: '/api/generate'
        }
      ];
      
      // 模拟性能指标
      const mockPerformanceMetrics: PerformanceMetric[] = [
        {
          name: 'API Response Time',
          value: 150,
          unit: 'ms',
          trend: 'down',
          threshold: 300
        },
        {
          name: 'CPU Usage',
          value: 35,
          unit: '%',
          trend: 'stable',
          threshold: 80
        },
        {
          name: 'Memory Usage',
          value: 45,
          unit: '%',
          trend: 'up',
          threshold: 90
        },
        {
          name: 'Error Rate',
          value: 2.5,
          unit: '%',
          trend: 'down',
          threshold: 5
        }
      ];
      
      setSystemHealth(mockSystemHealth);
      setApiCalls(mockApiCalls);
      setErrorLogs(mockErrorLogs);
      setPerformanceMetrics(mockPerformanceMetrics);
    } catch (error) {
      console.error('Failed to fetch monitoring data', error);
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'warning':
        return 'Warning';
      case 'critical':
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  const getErrorLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const getApiStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <BackButton to="/dashboard" label="Back to Dashboard" />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mt-4">Monitoring Dashboard</h1>
          <div className="flex gap-3">
            <select
              className="border rounded px-3 py-2"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '1h' | '24h' | '7d' | '30d')}
            >
              <option value="1h">Last 1 Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              Export Data
            </button>
          </div>
        </div>
        
        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">System Health</h2>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(systemHealth.status)}`}></div>
              <span className="font-medium">{getStatusText(systemHealth.status)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-500 mb-1">Uptime</div>
              <div className="font-semibold">{systemHealth.uptime}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-500 mb-1">CPU Usage</div>
              <div className="font-semibold">{systemHealth.cpuUsage}%</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-500 mb-1">Memory Usage</div>
              <div className="font-semibold">{systemHealth.memoryUsage}%</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-500 mb-1">Disk Usage</div>
              <div className="font-semibold">{systemHealth.diskUsage}%</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-500 mb-1">Active Connections</div>
              <div className="font-semibold">{systemHealth.activeConnections}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-500 mb-1">Response Time</div>
              <div className="font-semibold">{systemHealth.responseTime}ms</div>
            </div>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            <div className="space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{metric.name}</span>
                    <span className="font-semibold">{metric.value} {metric.unit} {getTrendIcon(metric.trend)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${metric.value > metric.threshold ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>Threshold: {metric.threshold} {metric.unit}</span>
                    <span>Max</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent API Calls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Recent API Calls</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiCalls.map((call) => (
                    <tr key={call.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{call.endpoint}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${call.method === 'GET' ? 'bg-green-100 text-green-800' : call.method === 'POST' ? 'bg-blue-100 text-blue-800' : call.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {call.method}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span className={getApiStatusColor(call.status)}>{call.status}</span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{call.responseTime}ms</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {new Date(call.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Error Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Error Logs</h2>
          <div className="space-y-4">
            {errorLogs.map((log) => (
              <div key={log.id} className="border-l-4 border-red-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getErrorLevelColor(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  {log.userId && (
                    <span className="text-sm text-gray-500">User: {log.userId}</span>
                  )}
                  {log.endpoint && (
                    <span className="text-sm text-gray-500">Endpoint: {log.endpoint}</span>
                  )}
                </div>
                <div className="text-sm font-medium mb-1">{log.message}</div>
                {log.stack && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono">
                    {log.stack}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* System Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">System Events</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600">📊</span>
              </div>
              <div>
                <div className="font-medium">Daily API Usage Report</div>
                <div className="text-sm text-gray-500">Generated at {new Date().toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600">✅</span>
              </div>
              <div>
                <div className="font-medium">System Backup Completed</div>
                <div className="text-sm text-gray-500">Completed at {new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-600">⚠️</span>
              </div>
              <div>
                <div className="font-medium">High CPU Usage Alert</div>
                <div className="text-sm text-gray-500">Triggered at {new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}