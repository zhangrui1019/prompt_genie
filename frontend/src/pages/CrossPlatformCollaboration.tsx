import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, Users, Share2, Lock, Globe, Cloud, Activity, MessageSquare, Settings, Bell, User, Menu, X, Search, ChevronRight, ChevronDown, Plus, Play, Pause, Edit, Trash2, Save, Copy, Download, Upload, RefreshCw, Star, Heart, Check, X as XIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { collaborationService } from '@/lib/api';

interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  status: 'online' | 'offline' | 'syncing';
  lastSync: string;
  platform: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'online' | 'offline' | 'away';
  lastActive: string;
}

interface CollaborationSession {
  id: string;
  name: string;
  type: 'prompt' | 'agent' | 'workflow';
  participants: number;
  lastActivity: string;
  status: 'active' | 'paused' | 'completed';
}

interface SyncStatus {
  id: string;
  device: string;
  status: 'synced' | 'syncing' | 'error';
  lastSync: string;
  itemsSynced: number;
}

const CrossPlatformCollaboration = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [devices, setDevices] = useState<Device[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [collaborationSessions, setCollaborationSessions] = useState<CollaborationSession[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 调用API获取协作数据
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [devicesData, teamData, sessionsData, syncData] = await Promise.all([
          collaborationService.getDevices(),
          collaborationService.getTeamMembers(),
          collaborationService.getCollaborationSessions(),
          collaborationService.getSyncStatus()
        ]);
        
        setDevices(devicesData);
        setTeamMembers(teamData);
        setCollaborationSessions(sessionsData);
        setSyncStatus(syncData);
      } catch (error) {
        toast.error('Failed to fetch collaboration data');
        console.error('Error fetching collaboration data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSyncDevice = async (deviceId: string) => {
    try {
      await collaborationService.syncDevice(deviceId);
      setDevices(devices.map(device => 
        device.id === deviceId ? {
          ...device,
          status: 'syncing'
        } : device
      ));
      toast.success('Sync started');
      
      // 模拟同步完成
      setTimeout(() => {
        setDevices(devices.map(device => 
          device.id === deviceId ? {
            ...device,
            status: 'online',
            lastSync: new Date().toISOString()
          } : device
        ));
        toast.success('Sync completed');
      }, 2000);
    } catch (error) {
      toast.error('Failed to sync device');
      console.error('Error syncing device:', error);
    }
  };

  const handleInviteMember = async () => {
    try {
      await collaborationService.inviteTeamMember('user@example.com', 'member');
      toast.success('Invitation sent');
    } catch (error) {
      toast.error('Failed to send invitation');
      console.error('Error sending invitation:', error);
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      await collaborationService.joinCollaborationSession(sessionId);
      setCollaborationSessions(collaborationSessions.map(session => 
        session.id === sessionId ? {
          ...session,
          status: 'active'
        } : session
      ));
      toast.success('Session started');
    } catch (error) {
      toast.error('Failed to start session');
      console.error('Error starting session:', error);
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'online' || status === 'active' || status === 'synced') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    } else if (status === 'offline' || status === 'completed') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    } else if (status === 'away' || status === 'paused') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    } else if (status === 'syncing') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Syncing
        </span>
      );
    } else if (status === 'error') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Error
        </span>
      );
    }
    return null;
  };

  const renderRoleBadge = (role: string) => {
    if (role === 'owner') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          Owner
        </span>
      );
    } else if (role === 'admin') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Admin
        </span>
      );
    } else if (role === 'member') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Member
        </span>
      );
    } else if (role === 'viewer') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          Viewer
        </span>
      );
    }
    return null;
  };

  const renderDeviceIcon = (type: string) => {
    if (type === 'desktop') {
      return <Monitor className="h-5 w-5" />;
    } else if (type === 'mobile') {
      return <Smartphone className="h-5 w-5" />;
    } else if (type === 'tablet') {
      return <Tablet className="h-5 w-5" />;
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
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Collaboration</span>
          </div>
          <button 
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          <Link to="/v2/dashboard" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Activity className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link to="/v2/ai-assist" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <MessageSquare className="h-5 w-5 mr-3" />
            AI Assistant
          </Link>
          <Link to="/v2/collaboration" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20">
            <Users className="h-5 w-5 mr-3" />
            Collaboration
          </Link>
          <Link to="/prompts" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <MessageSquare className="h-5 w-5 mr-3" />
            Prompts
          </Link>
          <Link to="/agents" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Users className="h-5 w-5 mr-3" />
            Agents
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
                    placeholder="Search collaboration features..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

        {/* Collaboration Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cross-Platform Collaboration</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sync your work across devices and collaborate with team members in real-time
            </p>
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
                onClick={() => setActiveTab('devices')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'devices' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
              >
                Devices
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'team' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
              >
                Team
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'sessions' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
              >
                Sessions
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Connected Devices</h3>
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Monitor className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{devices.length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-1">
                    {devices.filter(d => d.status === 'online').length} online, {devices.filter(d => d.status === 'syncing').length} syncing, {devices.filter(d => d.status === 'offline').length} offline
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Members</h3>
                    <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamMembers.length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-1">
                    {teamMembers.filter(m => m.status === 'online').length} online, {teamMembers.filter(m => m.status === 'away').length} away, {teamMembers.filter(m => m.status === 'offline').length} offline
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Sessions</h3>
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{collaborationSessions.filter(s => s.status === 'active').length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-1">
                    {collaborationSessions.filter(s => s.status === 'paused').length} paused, {collaborationSessions.filter(s => s.status === 'completed').length} completed
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sync Status</h3>
                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Cloud className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {syncStatus.length > 0 ? Math.round((syncStatus.filter(s => s.status === 'synced').length / syncStatus.length) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-1">
                    {syncStatus.filter(s => s.status === 'synced').length} devices synced, {syncStatus.filter(s => s.status === 'error').length} error
                  </p>
                </div>
              </div>

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
                      <Cloud className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Sync completed on John's MacBook Pro</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">24 items synced</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Jane Smith joined Marketing Email Campaign session</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">3 participants now active</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                      <XIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Sync error on John's iPad</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Connection lost during sync</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">30 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <Share2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Start Collaboration</h3>
                  <p className="text-white/80 text-sm mb-4">Invite team members to collaborate on prompts and workflows</p>
                  <button className="inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Members
                  </button>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <Cloud className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Sync Devices</h3>
                  <p className="text-white/80 text-sm mb-4">Sync your work across all your devices automatically</p>
                  <button className="inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </button>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Cross-Platform Access</h3>
                  <p className="text-white/80 text-sm mb-4">Access your work from any device, anywhere</p>
                  <button className="inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                    <Monitor className="h-4 w-4 mr-2" />
                    View Devices
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Devices Tab */}
          {activeTab === 'devices' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connected Devices</h3>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Device
                  </button>
                </div>
                <div className="space-y-4">
                  {isLoading ? (
                    [...Array(4)].map((_, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mr-3"></div>
                            <div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-1"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                            </div>
                          </div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    devices.map((device) => (
                      <div key={device.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mr-3">
                              {renderDeviceIcon(device.type)}
                            </div>
                            <div>
                              <p className="text-md font-medium text-gray-900 dark:text-white">{device.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{device.platform}</p>
                            </div>
                          </div>
                          {renderStatusBadge(device.status)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Last synced: {new Date(device.lastSync).toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleSyncDevice(device.id)}
                            disabled={device.status === 'syncing'}
                            className={`inline-flex items-center px-3 py-1 border text-xs font-medium rounded-md ${device.status === 'syncing' ? 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800' : 'border-indigo-300 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20'}`}
                          >
                            {device.status === 'syncing' ? (
                              <>
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Sync Now
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {!isLoading && devices.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                      <Monitor className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No devices found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Add devices to sync your work across platforms
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
                  <button
                    onClick={handleInviteMember}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Member
                  </button>
                </div>
                <div className="space-y-4">
                  {isLoading ? (
                    [...Array(4)].map((_, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
                            <div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                            </div>
                          </div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    teamMembers.map((member) => (
                      <div key={member.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-full mr-3" />
                            <div>
                              <p className="text-md font-medium text-gray-900 dark:text-white">{member.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{member.status === 'online' ? 'Online' : member.status === 'away' ? 'Away' : 'Offline'}</p>
                            </div>
                          </div>
                          {renderRoleBadge(member.role)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Last active: {new Date(member.lastActive).toLocaleString()}
                          </span>
                          <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium">
                            Manage
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {!isLoading && teamMembers.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No team members found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Invite team members to collaborate on your projects
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Collaboration Sessions</h3>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Plus className="h-4 w-4 mr-2" />
                    New Session
                  </button>
                </div>
                <div className="space-y-4">
                  {isLoading ? (
                    [...Array(4)].map((_, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mr-3"></div>
                            <div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-1"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                            </div>
                          </div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    collaborationSessions.map((session) => (
                      <div key={session.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mr-3">
                              {session.type === 'prompt' && <MessageSquare className="h-5 w-5" />}
                              {session.type === 'agent' && <Users className="h-5 w-5" />}
                              {session.type === 'workflow' && <Activity className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="text-md font-medium text-gray-900 dark:text-white">{session.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{session.type.charAt(0).toUpperCase() + session.type.slice(1)} • {session.participants} participants</p>
                            </div>
                          </div>
                          {renderStatusBadge(session.status)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Last activity: {new Date(session.lastActivity).toLocaleString()}
                          </span>
                          {session.status !== 'active' && (
                            <button
                              onClick={() => handleStartSession(session.id)}
                              className="inline-flex items-center px-3 py-1 border border-green-300 text-xs font-medium rounded-md text-green-700 dark:border-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {!isLoading && collaborationSessions.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                      <Share2 className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No collaboration sessions found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Create a new session to start collaborating with your team
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CrossPlatformCollaboration;