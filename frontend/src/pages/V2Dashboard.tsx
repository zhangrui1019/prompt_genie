import { useState, useEffect } from 'react';
import { BarChart3, Zap, Users, Star, TrendingUp, MessageSquare, Settings, Bell, User, Menu, X, Search, ChevronRight, ChevronDown, Plus, Play, Pause, Edit, Trash2, Heart, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface Prompt {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: string;
  avatar: string;
  likes: number;
  views: number;
  lastUpdated: string;
  status: 'active' | 'draft' | 'archived';
}

interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastActive: string;
  tasks: number;
}

interface Workflow {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'completed';
  progress: number;
  lastRun: string;
}

const V2Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 模拟API调用获取数据
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟提示数据
        const mockPrompts: Prompt[] = [
          {
            id: '1',
            title: 'Marketing Email Generator',
            description: 'Generate engaging marketing emails for your campaigns',
            tags: ['marketing', 'email', 'sales'],
            author: 'Jane Doe',
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20woman&image_size=square',
            likes: 128,
            views: 542,
            lastUpdated: '2026-04-05T10:30:00',
            status: 'active'
          },
          {
            id: '2',
            title: 'Code Documentation Writer',
            description: 'Automatically generate documentation for your codebase',
            tags: ['development', 'documentation', 'code'],
            author: 'John Smith',
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20man&image_size=square',
            likes: 95,
            views: 321,
            lastUpdated: '2026-04-04T16:45:00',
            status: 'active'
          },
          {
            id: '3',
            title: 'Social Media Post Creator',
            description: 'Create engaging social media content for various platforms',
            tags: ['social', 'content', 'marketing'],
            author: 'Emily Johnson',
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20woman%202&image_size=square',
            likes: 156,
            views: 789,
            lastUpdated: '2026-04-05T09:15:00',
            status: 'active'
          },
          {
            id: '4',
            title: 'Customer Support Response',
            description: 'Generate professional customer support responses',
            tags: ['support', 'customer', 'service'],
            author: 'Michael Brown',
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20man%202&image_size=square',
            likes: 87,
            views: 256,
            lastUpdated: '2026-04-03T14:20:00',
            status: 'draft'
          }
        ];

        // 模拟智能体数据
        const mockAgents: Agent[] = [
          {
            id: '1',
            name: 'Marketing Assistant',
            description: 'Helps with marketing tasks and content creation',
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=marketing%20assistant%20avatar&image_size=square',
            status: 'online',
            lastActive: '2026-04-05T11:00:00',
            tasks: 3
          },
          {
            id: '2',
            name: 'Code Assistant',
            description: 'Helps with coding and development tasks',
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=code%20assistant%20avatar&image_size=square',
            status: 'online',
            lastActive: '2026-04-05T10:45:00',
            tasks: 2
          },
          {
            id: '3',
            name: 'Content Creator',
            description: 'Creates engaging content for various platforms',
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=content%20creator%20avatar&image_size=square',
            status: 'busy',
            lastActive: '2026-04-05T10:30:00',
            tasks: 5
          },
          {
            id: '4',
            name: 'Research Assistant',
            description: 'Helps with research and data analysis',
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=research%20assistant%20avatar&image_size=square',
            status: 'offline',
            lastActive: '2026-04-04T18:00:00',
            tasks: 0
          }
        ];

        // 模拟工作流数据
        const mockWorkflows: Workflow[] = [
          {
            id: '1',
            name: 'Daily Report Generation',
            status: 'running',
            progress: 75,
            lastRun: '2026-04-05T08:00:00'
          },
          {
            id: '2',
            name: 'Content Creation Pipeline',
            status: 'paused',
            progress: 45,
            lastRun: '2026-04-05T09:30:00'
          },
          {
            id: '3',
            name: 'Customer Support Processing',
            status: 'completed',
            progress: 100,
            lastRun: '2026-04-05T10:15:00'
          }
        ];

        setPrompts(mockPrompts);
        setAgents(mockAgents);
        setWorkflows(mockWorkflows);
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLikePrompt = (promptId: string) => {
    setPrompts(prompts.map(prompt => 
      prompt.id === promptId ? {
        ...prompt,
        likes: prompt.likes + 1
      } : prompt
    ));
    toast.success('Liked prompt');
  };

  const handleToggleWorkflow = (workflowId: string) => {
    setWorkflows(workflows.map(workflow => 
      workflow.id === workflowId ? {
        ...workflow,
        status: workflow.status === 'running' ? 'paused' : 'running'
      } : workflow
    ));
    toast.success('Workflow status updated');
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'active' || status === 'online') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    } else if (status === 'draft' || status === 'offline') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    } else if (status === 'archived') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Archived
        </span>
      );
    } else if (status === 'busy') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Busy
        </span>
      );
    } else if (status === 'running') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Running
        </span>
      );
    } else if (status === 'paused') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          Paused
        </span>
      );
    } else if (status === 'completed') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          Completed
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center mr-3">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Prompt Genie</span>
          </div>
          <button 
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          <Link to="/v2/dashboard" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20">
            <BarChart3 className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link to="/prompts" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <MessageSquare className="h-5 w-5 mr-3" />
            Prompts
          </Link>
          <Link to="/agents" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Users className="h-5 w-5 mr-3" />
            Agents
          </Link>
          <Link to="/workflows" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <TrendingUp className="h-5 w-5 mr-3" />
            Workflows
          </Link>
          <Link to="/integrations" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Star className="h-5 w-5 mr-3" />
            Integrations
          </Link>
          <Link to="/analytics" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <BarChart3 className="h-5 w-5 mr-3" />
            Analytics
          </Link>
          <Link to="/security" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Settings className="h-5 w-5 mr-3" />
            Security
          </Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mr-3">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">john.doe@example.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button 
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none mr-2"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search prompts, agents, workflows..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                </button>
                <div className="ml-3 relative">
                  <div>
                    <button className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" id="user-menu">
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back, John! Here's what's happening with your account today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Prompts</h3>
                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Agents</h3>
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3 new this week
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Running Workflows</h3>
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-1">
                2 paused
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Likes</h3>
                <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">456</p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +28% from last month
              </p>
            </div>
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
                onClick={() => setActiveTab('prompts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'prompts' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
              >
                Prompts
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'agents' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
              >
                Agents
              </button>
              <button
                onClick={() => setActiveTab('workflows')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'workflows' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
              >
                Workflows
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                  <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">You created a new prompt</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Marketing Email Generator</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Your agent completed a task</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Content Creator finished writing a blog post</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Workflow completed successfully</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Daily Report Generation finished</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Create Prompt</h3>
                  <p className="text-white/80 text-sm mb-4">Generate new prompts with AI assistance</p>
                  <button className="inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Get Started
                  </button>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Create Agent</h3>
                  <p className="text-white/80 text-sm mb-4">Build intelligent agents for specific tasks</p>
                  <button className="inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Get Started
                  </button>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Create Workflow</h3>
                  <p className="text-white/80 text-sm mb-4">Automate tasks with custom workflows</p>
                  <button className="inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Prompts Tab */}
          {activeTab === 'prompts' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Prompts</h3>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Plus className="h-4 w-4 mr-2" />
                    New Prompt
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    [...Array(6)].map((_, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-pulse">
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
                            <div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            </div>
                          </div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            </div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    prompts.map((prompt) => (
                      <div key={prompt.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <img src={prompt.avatar} alt={prompt.author} className="h-10 w-10 rounded-full mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{prompt.author}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(prompt.lastUpdated).toLocaleString()}</p>
                            </div>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{prompt.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{prompt.description}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {prompt.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button 
                                onClick={() => handleLikePrompt(prompt.id)}
                                className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                              >
                                <Heart className="h-4 w-4 mr-1" />
                                {prompt.likes}
                              </button>
                              <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {prompt.views}
                              </span>
                            </div>
                            {renderStatusBadge(prompt.status)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Agents Tab */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Agents</h3>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Plus className="h-4 w-4 mr-2" />
                    New Agent
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {isLoading ? (
                    [...Array(4)].map((_, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-pulse">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                          </div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    agents.map((agent) => (
                      <div key={agent.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <img src={agent.avatar} alt={agent.name} className="h-16 w-16 rounded-full" />
                            {renderStatusBadge(agent.status)}
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{agent.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{agent.description}</p>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Last active: {new Date(agent.lastActive).toLocaleString()}
                            </span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {agent.tasks} tasks
                            </span>
                          </div>
                          <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-indigo-300 dark:border-indigo-700 text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat with Agent
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Workflows Tab */}
          {activeTab === 'workflows' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Workflows</h3>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Plus className="h-4 w-4 mr-2" />
                    New Workflow
                  </button>
                </div>
                <div className="space-y-4">
                  {isLoading ? (
                    [...Array(3)].map((_, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full mb-2"></div>
                        <div className="flex items-center justify-between">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    workflows.map((workflow) => (
                      <div key={workflow.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-semibold text-gray-900 dark:text-white">{workflow.name}</h4>
                          {renderStatusBadge(workflow.status)}
                        </div>
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                            <span className="text-xs font-medium text-gray-900 dark:text-white">{workflow.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${workflow.status === 'running' ? 'bg-blue-500' : workflow.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'}`}
                              style={{ width: `${workflow.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Last run: {new Date(workflow.lastRun).toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleToggleWorkflow(workflow.id)}
                            className={`inline-flex items-center px-3 py-1 border text-xs font-medium rounded-md ${workflow.status === 'running' ? 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20' : 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20'}`}
                          >
                            {workflow.status === 'running' ? (
                              <>
                                <Pause className="h-3 w-3 mr-1" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3 mr-1" />
                                Run
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default V2Dashboard;