import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'premium';
  createdAt: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalPrompts: number;
  totalAgents: number;
  totalChains: number;
  totalTemplates: number;
  revenue: number;
  apiCalls: number;
}

interface RecentActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPrompts: 0,
    totalAgents: 0,
    totalChains: 0,
    totalTemplates: 0,
    revenue: 0,
    apiCalls: 0
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    // 检查用户是否是管理员
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }
    
    fetchAdminData();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // 这里应该调用获取管理端数据的API
      // 暂时使用模拟数据
      
      // 模拟用户数据
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: '2',
          username: 'user1',
          email: 'user1@example.com',
          role: 'premium',
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: '3',
          username: 'user2',
          email: 'user2@example.com',
          role: 'user',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: '4',
          username: 'user3',
          email: 'user3@example.com',
          role: 'user',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'inactive'
        },
        {
          id: '5',
          username: 'user4',
          email: 'user4@example.com',
          role: 'premium',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'suspended'
        }
      ];
      
      // 模拟系统统计数据
      const mockStats: SystemStats = {
        totalUsers: 150,
        activeUsers: 120,
        totalPrompts: 1200,
        totalAgents: 350,
        totalChains: 250,
        totalTemplates: 450,
        revenue: 12500,
        apiCalls: 50000
      };
      
      // 模拟最近活动
      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          userId: '2',
          userName: 'user1',
          action: 'created',
          resource: 'prompt',
          resourceId: 'prompt1',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          userId: '3',
          userName: 'user2',
          action: 'updated',
          resource: 'agent',
          resourceId: 'agent1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          userId: '5',
          userName: 'user4',
          action: 'purchased',
          resource: 'prompt',
          resourceId: 'prompt2',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          userId: '2',
          userName: 'user1',
          action: 'created',
          resource: 'chain',
          resourceId: 'chain1',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          userId: '3',
          userName: 'user2',
          action: 'deleted',
          resource: 'prompt',
          resourceId: 'prompt3',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setUsers(mockUsers);
      setStats(mockStats);
      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = (userId: string, action: 'activate' | 'deactivate' | 'suspend' | 'promote' | 'demote') => {
    // 这里应该调用相应的API
    toast.success(`User action ${action} performed`);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>;
      case 'suspended':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Suspended</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Admin</span>;
      case 'premium':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Premium</span>;
      case 'user':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">User</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background SVG lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.15)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.15)" />
            </linearGradient>
          </defs>
          <line 
            x1="50" y1="150" x2="950" y2="150" 
            stroke="url(#lineGradient)" 
            strokeWidth="1" 
            strokeDasharray="30,15" 
            className="animate-draw-line"
          />
          <line 
            x1="50" y1="350" x2="950" y2="350" 
            stroke="url(#lineGradient)" 
            strokeWidth="1" 
            strokeDasharray="20,20" 
            className="animate-draw-line animation-delay-200"
          />
          <line 
            x1="50" y1="550" x2="950" y2="550" 
            stroke="url(#lineGradient)" 
            strokeWidth="1" 
            strokeDasharray="15,25" 
            className="animate-draw-line animation-delay-400"
          />
          <line 
            x1="50" y1="750" x2="950" y2="750" 
            stroke="url(#lineGradient)" 
            strokeWidth="1" 
            strokeDasharray="25,10" 
            className="animate-draw-line animation-delay-600"
          />
        </svg>
      </div>
      
      <div className="w-full max-w-[1600px] mx-auto p-6 relative z-10">
        <BackButton to="/dashboard" label="Back to Dashboard" />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mt-4 text-white">Admin Dashboard</h1>
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 font-medium"
          >
            + Add User
          </button>
        </div>
        
        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/60 rounded-xl shadow-lg border border-gray-700 p-6">
            <div className="text-2xl font-bold text-white mb-1">{stats.totalUsers}</div>
            <div className="text-sm text-gray-400">Total Users</div>
          </div>
          <div className="bg-gray-800/60 rounded-xl shadow-lg border border-gray-700 p-6">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.activeUsers}</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div className="bg-gray-800/60 rounded-xl shadow-lg border border-gray-700 p-6">
            <div className="text-2xl font-bold text-blue-400 mb-1">${stats.revenue.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Revenue</div>
          </div>
          <div className="bg-gray-800/60 rounded-xl shadow-lg border border-gray-700 p-6">
            <div className="text-2xl font-bold text-purple-400 mb-1">{stats.apiCalls.toLocaleString()}</div>
            <div className="text-sm text-gray-400">API Calls</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Management */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">User Management</h2>
            <div className="bg-gray-800/60 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800/40 divide-y divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-700/30 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{user.username}</div>
                              <div className="text-sm text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(user.lastLogin).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-400 hover:text-blue-300 mr-3"
                          >
                            View
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleUserAction(user.id, 'suspend')}
                              className="text-red-400 hover:text-red-300 mr-3"
                            >
                              Suspend
                            </button>
                          ) : user.status === 'suspended' ? (
                            <button
                              onClick={() => handleUserAction(user.id, 'activate')}
                              className="text-green-400 hover:text-green-300 mr-3"
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user.id, 'activate')}
                              className="text-green-400 hover:text-green-300 mr-3"
                            >
                              Activate
                            </button>
                          )}
                          {user.role !== 'admin' && user.role !== 'premium' ? (
                            <button
                              onClick={() => handleUserAction(user.id, 'promote')}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              Promote
                            </button>
                          ) : user.role !== 'admin' ? (
                            <button
                              onClick={() => handleUserAction(user.id, 'demote')}
                              className="text-gray-400 hover:text-gray-300"
                            >
                              Demote
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Recent Activity</h2>
            <div className="bg-gray-800/60 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-700">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-700/30 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center">
                        <span className="text-gray-300">{activity.userName.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{activity.userName}</span>
                          <span className="text-sm text-gray-400">{activity.action} {activity.resource}</span>
                        </div>
                        <div className="text-sm text-gray-400 mb-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {activity.resource} ID: {activity.resourceId}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* System Resources */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-white">System Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/60 rounded-xl shadow-lg border border-gray-700 p-6">
              <div className="text-2xl font-bold text-white mb-1">{stats.totalPrompts}</div>
              <div className="text-sm text-gray-400">Total Prompts</div>
            </div>
            <div className="bg-gray-800/60 rounded-xl shadow-lg border border-gray-700 p-6">
              <div className="text-2xl font-bold text-white mb-1">{stats.totalAgents}</div>
              <div className="text-sm text-gray-400">Total Agents</div>
            </div>
            <div className="bg-gray-800/60 rounded-xl shadow-lg border border-gray-700 p-6">
              <div className="text-2xl font-bold text-white mb-1">{stats.totalChains}</div>
              <div className="text-sm text-gray-400">Total Chains</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/80 rounded-xl shadow-lg max-w-md w-full border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">User Details: {selectedUser.username}</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Email</div>
                  <div className="font-medium text-white">{selectedUser.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Role</div>
                  {getRoleBadge(selectedUser.role)}
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  {getStatusBadge(selectedUser.status)}
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Created At</div>
                  <div className="text-white">{new Date(selectedUser.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Last Login</div>
                  <div className="text-white">{new Date(selectedUser.lastLogin).toLocaleString()}</div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}