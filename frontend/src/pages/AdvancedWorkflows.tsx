import { useState, useEffect } from 'react';
import { Workflow, Play, Pause, Square, Edit, Trash2, Copy, Plus, Filter, Search, Download, Upload, Clock, Calendar, Zap, Settings, ChevronRight, ChevronDown, X, Menu, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  lastRun: string;
  nextRun: string;
  triggers: string[];
  steps: number;
  author: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  popularity: number;
  author: string;
  image: string;
}

interface ExecutionHistory {
  id: string;
  workflowName: string;
  status: 'success' | 'failed' | 'running';
  startTime: string;
  endTime: string;
  duration: string;
  trigger: string;
}

const AdvancedWorkflows = () => {
  const [activeTab, setActiveTab] = useState('workflows');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  useEffect(() => {
    // 模拟API调用获取工作流数据
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟工作流数据
        const mockWorkflows: Workflow[] = [
          {
            id: '1',
            name: 'Daily Report Generation',
            description: 'Generate and send daily performance reports',
            status: 'active',
            lastRun: '2026-04-05T08:00:00',
            nextRun: '2026-04-06T08:00:00',
            triggers: ['Scheduled'],
            steps: 5,
            author: 'admin@example.com'
          },
          {
            id: '2',
            name: 'Customer Support Ticket Processing',
            description: 'Process and route support tickets',
            status: 'active',
            lastRun: '2026-04-05T10:30:00',
            nextRun: '2026-04-05T11:00:00',
            triggers: ['Webhook', 'Email'],
            steps: 8,
            author: 'support@example.com'
          },
          {
            id: '3',
            name: 'Content Creation Pipeline',
            description: 'Generate and publish content',
            status: 'inactive',
            lastRun: '2026-04-04T14:00:00',
            nextRun: 'N/A',
            triggers: ['Manual'],
            steps: 12,
            author: 'content@example.com'
          },
          {
            id: '4',
            name: 'Data Backup Automation',
            description: 'Backup critical data to cloud storage',
            status: 'active',
            lastRun: '2026-04-05T00:00:00',
            nextRun: '2026-04-06T00:00:00',
            triggers: ['Scheduled'],
            steps: 4,
            author: 'admin@example.com'
          },
          {
            id: '5',
            name: 'Social Media Posting',
            description: 'Schedule and publish social media posts',
            status: 'draft',
            lastRun: 'N/A',
            nextRun: 'N/A',
            triggers: ['Scheduled', 'API'],
            steps: 6,
            author: 'marketing@example.com'
          }
        ];

        // 模拟工作流模板数据
        const mockTemplates: WorkflowTemplate[] = [
          {
            id: '1',
            name: 'Email Marketing Campaign',
            description: 'Automate email marketing campaigns with analytics',
            category: 'Marketing',
            popularity: 124,
            author: 'Marketing Team',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=email%20marketing%20campaign%20workflow%20template&image_size=square'
          },
          {
            id: '2',
            name: 'Data Processing Pipeline',
            description: 'Process and analyze data from multiple sources',
            category: 'Data',
            popularity: 98,
            author: 'Data Team',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=data%20processing%20pipeline%20workflow&image_size=square'
          },
          {
            id: '3',
            name: 'Customer Onboarding',
            description: 'Automate customer onboarding process',
            category: 'Customer Success',
            popularity: 156,
            author: 'Customer Success Team',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=customer%20onboarding%20workflow&image_size=square'
          },
          {
            id: '4',
            name: 'Content Creation Workflow',
            description: 'Generate, review, and publish content',
            category: 'Content',
            popularity: 87,
            author: 'Content Team',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=content%20creation%20workflow&image_size=square'
          },
          {
            id: '5',
            name: 'DevOps Pipeline',
            description: 'Automate development and deployment processes',
            category: 'Development',
            popularity: 112,
            author: 'DevOps Team',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=devops%20pipeline%20workflow&image_size=square'
          },
          {
            id: '6',
            name: 'Security Monitoring',
            description: 'Monitor and respond to security events',
            category: 'Security',
            popularity: 76,
            author: 'Security Team',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=security%20monitoring%20workflow&image_size=square'
          }
        ];

        // 模拟执行历史数据
        const mockExecutionHistory: ExecutionHistory[] = [
          {
            id: '1',
            workflowName: 'Daily Report Generation',
            status: 'success',
            startTime: '2026-04-05T08:00:00',
            endTime: '2026-04-05T08:05:30',
            duration: '5m 30s',
            trigger: 'Scheduled'
          },
          {
            id: '2',
            workflowName: 'Customer Support Ticket Processing',
            status: 'success',
            startTime: '2026-04-05T10:30:00',
            endTime: '2026-04-05T10:32:15',
            duration: '2m 15s',
            trigger: 'Webhook'
          },
          {
            id: '3',
            workflowName: 'Data Backup Automation',
            status: 'success',
            startTime: '2026-04-05T00:00:00',
            endTime: '2026-04-05T00:15:45',
            duration: '15m 45s',
            trigger: 'Scheduled'
          },
          {
            id: '4',
            workflowName: 'Content Creation Pipeline',
            status: 'failed',
            startTime: '2026-04-04T14:00:00',
            endTime: '2026-04-04T14:08:20',
            duration: '8m 20s',
            trigger: 'Manual'
          },
          {
            id: '5',
            workflowName: 'Daily Report Generation',
            status: 'success',
            startTime: '2026-04-04T08:00:00',
            endTime: '2026-04-04T08:06:10',
            duration: '6m 10s',
            trigger: 'Scheduled'
          }
        ];

        setWorkflows(mockWorkflows);
        setTemplates(mockTemplates);
        setExecutionHistory(mockExecutionHistory);
      } catch (error) {
        toast.error('Failed to fetch workflow data');
        console.error('Error fetching workflow data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleWorkflow = (workflowId: string) => {
    setWorkflows(workflows.map(workflow => 
      workflow.id === workflowId ? {
        ...workflow,
        status: workflow.status === 'active' ? 'inactive' : 'active'
      } : workflow
    ));
    toast.success('Workflow status updated');
  };

  const handleRunWorkflow = (workflowId: string) => {
    toast.success('Workflow started successfully');
    // 模拟工作流运行
    setTimeout(() => {
      const newExecution: ExecutionHistory = {
        id: `${executionHistory.length + 1}`,
        workflowName: workflows.find(w => w.id === workflowId)?.name || 'Unknown Workflow',
        status: 'success',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 300000).toISOString(), // 5 minutes later
        duration: '5m 0s',
        trigger: 'Manual'
      };
      setExecutionHistory([newExecution, ...executionHistory]);
      toast.success('Workflow completed successfully');
    }, 2000);
  };

  const handleCreateWorkflow = () => {
    toast.success('New workflow created');
    // 模拟创建新工作流
    const newWorkflow: Workflow = {
      id: `${workflows.length + 1}`,
      name: `New Workflow ${workflows.length + 1}`,
      description: 'New workflow description',
      status: 'draft',
      lastRun: 'N/A',
      nextRun: 'N/A',
      triggers: ['Manual'],
      steps: 0,
      author: 'admin@example.com'
    };
    setWorkflows([newWorkflow, ...workflows]);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    setWorkflows(workflows.filter(workflow => workflow.id !== workflowId));
    toast.success('Workflow deleted');
  };

  const handleUseTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newWorkflow: Workflow = {
        id: `${workflows.length + 1}`,
        name: template.name,
        description: template.description,
        status: 'draft',
        lastRun: 'N/A',
        nextRun: 'N/A',
        triggers: ['Manual'],
        steps: 5,
        author: 'admin@example.com'
      };
      setWorkflows([newWorkflow, ...workflows]);
      toast.success('Workflow created from template');
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'active' || status === 'success') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    } else if (status === 'inactive' || status === 'failed') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    } else if (status === 'draft') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Draft
        </span>
      );
    } else if (status === 'running') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Running
        </span>
      );
    }
    return null;
  };

  const filteredWorkflows = workflows.filter(workflow => 
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExecutionHistory = executionHistory.filter(execution => 
    execution.workflowName.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Link to="/workflows" className="text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 px-3 py-2 text-sm font-medium">
                  Workflows
                </Link>
                <Link to="/analytics" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium">
                  Analytics
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced Workflows</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create and manage automated workflows for your business processes
            </p>
          </div>
          <button
            onClick={handleCreateWorkflow}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('workflows')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'workflows' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              Workflows
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'templates' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              Execution History
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'editor' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              Workflow Editor
            </button>
          </nav>
        </div>

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Workflows</h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search workflows..."
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
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Run
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Next Run
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Steps
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
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
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      filteredWorkflows.map((workflow) => (
                        <tr key={workflow.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{workflow.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {workflow.triggers.join(', ')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{workflow.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(workflow.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {workflow.lastRun !== 'N/A' ? new Date(workflow.lastRun).toLocaleString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {workflow.nextRun !== 'N/A' ? new Date(workflow.nextRun).toLocaleString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{workflow.steps}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleRunWorkflow(workflow.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-3"
                            >
                              <Play className="h-4 w-4 inline mr-1" />
                              Run
                            </button>
                            <button
                              onClick={() => handleToggleWorkflow(workflow.id)}
                              className={`${workflow.status === 'active' ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300' : 'text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300'} mr-3`}
                            >
                              {workflow.status === 'active' ? (
                                <Pause className="h-4 w-4 inline mr-1" />
                              ) : (
                                <Play className="h-4 w-4 inline mr-1" />
                              )}
                              {workflow.status === 'active' ? 'Pause' : 'Activate'}
                            </button>
                            <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3">
                              <Edit className="h-4 w-4 inline mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteWorkflow(workflow.id)}
                              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                            >
                              <Trash2 className="h-4 w-4 inline mr-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {!isLoading && filteredWorkflows.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <Workflow className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No workflows found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Create your first workflow or use a template
                  </p>
                  <button
                    onClick={handleCreateWorkflow}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workflow Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  [...Array(6)].map((_, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  templates.map((template) => (
                    <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <img src={template.image} alt={template.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-4">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-1">{template.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{template.description}</p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {template.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {template.popularity} uses
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            By {template.author}
                          </span>
                          <button
                            onClick={() => handleUseTemplate(template.id)}
                            className="inline-flex items-center px-3 py-1 border border-indigo-300 dark:border-indigo-700 text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Use Template
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Execution History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Execution History</h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search executions..."
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
                        Workflow
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        End Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Duration
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Trigger
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
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
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      filteredExecutionHistory.map((execution) => (
                        <tr key={execution.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{execution.workflowName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(execution.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(execution.startTime).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(execution.endTime).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{execution.duration}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{execution.trigger}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3">
                              View Details
                            </button>
                            <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                              <Download className="h-4 w-4 inline mr-1" />
                              Export
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {!isLoading && filteredExecutionHistory.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No execution history found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Run a workflow to see execution history
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workflow Editor Tab */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workflow Editor</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Drag and drop components to create your workflow
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Play className="h-4 w-4 mr-2" />
                    Test Run
                  </button>
                </div>
              </div>

              {/* Workflow Editor Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Toolbar */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Components</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Triggers</h5>
                        <div className="space-y-2">
                          <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 cursor-move">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                              <span className="text-sm text-gray-900 dark:text-white">Scheduled</span>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 cursor-move">
                            <div className="flex items-center">
                              <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                              <span className="text-sm text-gray-900 dark:text-white">Webhook</span>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 cursor-move">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                              <span className="text-sm text-gray-900 dark:text-white">Manual</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Actions</h5>
                        <div className="space-y-2">
                          <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 cursor-move">
                            <div className="flex items-center">
                              <Email className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                              <span className="text-sm text-gray-900 dark:text-white">Send Email</span>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 cursor-move">
                            <div className="flex items-center">
                              <Database className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                              <span className="text-sm text-gray-900 dark:text-white">Database Query</span>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 cursor-move">
                            <div className="flex items-center">
                              <Code className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                              <span className="text-sm text-gray-900 dark:text-white">Run Code</span>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 cursor-move">
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                              <span className="text-sm text-gray-900 dark:text-white">Send Message</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Logic</h5>
                        <div className="space-y-2">
                          <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 cursor-move">
                            <div className="flex items-center">
                              <GitMerge className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                              <span className="text-sm text-gray-900 dark:text-white">If/Else</span>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 cursor-move">
                            <div className="flex items-center">
                              <Repeat className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                              <span className="text-sm text-gray-900 dark:text-white">Loop</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Canvas */}
                <div className="lg:col-span-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 h-[600px] flex items-center justify-center">
                    <div className="text-center">
                      <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Workflow Canvas</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Drag components from the toolbar to create your workflow
                      </p>
                      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                        <div className="bg-white dark:bg-gray-700 p-4 rounded border border-gray-200 dark:border-gray-600 text-center">
                          <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">Triggers</h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Start your workflow</p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-4 rounded border border-gray-200 dark:border-gray-600 text-center">
                          <Play className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">Actions</h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Perform tasks</p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-4 rounded border border-gray-200 dark:border-gray-600 text-center">
                          <GitMerge className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">Logic</h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Control flow</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow Settings */}
              <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Workflow Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="workflow-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Workflow Name
                    </label>
                    <input
                      type="text"
                      id="workflow-name"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter workflow name"
                    />
                  </div>
                  <div>
                    <label htmlFor="workflow-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      id="workflow-description"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter workflow description"
                    />
                  </div>
                  <div>
                    <label htmlFor="workflow-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      id="workflow-status"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="workflow-trigger" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Trigger Type
                    </label>
                    <select
                      id="workflow-trigger"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="manual">Manual</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="webhook">Webhook</option>
                      <option value="api">API</option>
                    </select>
                  </div>
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

// Missing imports
const Save = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const Email = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const Database = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const Code = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const MessageSquare = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const GitMerge = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" />
    <line x1="6" y1="9" x2="6" y2="21" />
  </svg>
);

const Repeat = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

export default AdvancedWorkflows;