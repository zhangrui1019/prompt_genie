import { useState, useEffect } from 'react';
import { Search, Filter, Download, Star, StarHalf, ExternalLink, Heart, Share2, Settings, ChevronRight, ChevronDown, Plus, X, Menu, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface Plugin {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  rating: number;
  downloads: number;
  category: string;
  price: string;
  image: string;
  isInstalled: boolean;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  author: string;
  rating: number;
  category: string;
  price: string;
  image: string;
  isFeatured: boolean;
}

const AgentEcosystem = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeTab, setActiveTab] = useState('plugins');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟API调用获取插件和智能体数据
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟插件数据
        const mockPlugins: Plugin[] = [
          {
            id: '1',
            name: 'Weather API Integration',
            description: 'Get real-time weather data for any location',
            author: 'OpenWeather',
            version: '1.2.0',
            rating: 4.8,
            downloads: 1245,
            category: 'utilities',
            price: 'Free',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=weather%20forecast%20api%20integration%20icon&image_size=square',
            isInstalled: false
          },
          {
            id: '2',
            name: 'GitHub Repository Analyzer',
            description: 'Analyze GitHub repositories and provide insights',
            author: 'GitHub',
            version: '2.0.1',
            rating: 4.6,
            downloads: 892,
            category: 'development',
            price: '$9.99',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=github%20repository%20analyzer%20icon&image_size=square',
            isInstalled: true
          },
          {
            id: '3',
            name: 'Stock Market Data',
            description: 'Get real-time stock market data and trends',
            author: 'FinanceAPI',
            version: '1.5.0',
            rating: 4.7,
            downloads: 1567,
            category: 'finance',
            price: 'Free',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=stock%20market%20data%20icon&image_size=square',
            isInstalled: false
          },
          {
            id: '4',
            name: 'Image Generator',
            description: 'Generate high-quality images from text prompts',
            author: 'AI Images',
            version: '3.0.0',
            rating: 4.9,
            downloads: 2341,
            category: 'creativity',
            price: '$19.99',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=image%20generator%20ai%20icon&image_size=square',
            isInstalled: false
          },
          {
            id: '5',
            name: 'PDF Converter',
            description: 'Convert files to and from PDF format',
            author: 'Document Tools',
            version: '1.8.2',
            rating: 4.5,
            downloads: 987,
            category: 'utilities',
            price: 'Free',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pdf%20converter%20tool%20icon&image_size=square',
            isInstalled: true
          },
          {
            id: '6',
            name: 'Translation Service',
            description: 'Translate text between multiple languages',
            author: 'TranslateAPI',
            version: '2.1.0',
            rating: 4.6,
            downloads: 1876,
            category: 'utilities',
            price: 'Free',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=translation%20service%20icon&image_size=square',
            isInstalled: false
          }
        ];

        // 模拟智能体数据
        const mockAgents: Agent[] = [
          {
            id: '1',
            name: 'Customer Support Agent',
            description: 'Handle customer inquiries and provide support',
            author: 'SupportAI',
            rating: 4.8,
            category: 'business',
            price: '$49.99',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=customer%20support%20agent%20avatar&image_size=square',
            isFeatured: true
          },
          {
            id: '2',
            name: 'Content Creator',
            description: 'Generate high-quality content for blogs and social media',
            author: 'ContentAI',
            rating: 4.7,
            category: 'creativity',
            price: '$39.99',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=content%20creator%20agent%20avatar&image_size=square',
            isFeatured: true
          },
          {
            id: '3',
            name: 'Code Assistant',
            description: 'Help with coding tasks and debugging',
            author: 'CodeAI',
            rating: 4.9,
            category: 'development',
            price: '$59.99',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=code%20assistant%20agent%20avatar&image_size=square',
            isFeatured: false
          },
          {
            id: '4',
            name: 'Financial Advisor',
            description: 'Provide financial advice and investment strategies',
            author: 'FinanceAI',
            rating: 4.6,
            category: 'finance',
            price: '$69.99',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=financial%20advisor%20agent%20avatar&image_size=square',
            isFeatured: false
          },
          {
            id: '5',
            name: 'Health Coach',
            description: 'Provide health and wellness advice',
            author: 'HealthAI',
            rating: 4.5,
            category: 'health',
            price: '$39.99',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=health%20coach%20agent%20avatar&image_size=square',
            isFeatured: true
          },
          {
            id: '6',
            name: 'Travel Planner',
            description: 'Help plan trips and find the best deals',
            author: 'TravelAI',
            rating: 4.7,
            category: 'travel',
            price: '$29.99',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=travel%20planner%20agent%20avatar&image_size=square',
            isFeatured: false
          }
        ];

        setPlugins(mockPlugins);
        setAgents(mockAgents);
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInstallPlugin = (pluginId: string) => {
    setPlugins(plugins.map(plugin => 
      plugin.id === pluginId ? { ...plugin, isInstalled: true } : plugin
    ));
    toast.success('Plugin installed successfully');
  };

  const handleUninstallPlugin = (pluginId: string) => {
    setPlugins(plugins.map(plugin => 
      plugin.id === pluginId ? { ...plugin, isInstalled: false } : plugin
    ));
    toast.success('Plugin uninstalled successfully');
  };

  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-1 text-sm font-medium text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || plugin.category === category;
    return matchesSearch && matchesCategory;
  });

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || agent.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'development', label: 'Development' },
    { value: 'finance', label: 'Finance' },
    { value: 'creativity', label: 'Creativity' },
    { value: 'business', label: 'Business' },
    { value: 'health', label: 'Health' },
    { value: 'travel', label: 'Travel' }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' },
    { value: 'price', label: 'Price: Low to High' }
  ];

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
                <Link to="/marketplace" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium">
                  Marketplace
                </Link>
                <Link to="/agent-ecosystem" className="text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 px-3 py-2 text-sm font-medium">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agent Ecosystem</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Explore and manage plugins and agents to enhance your workflow
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('plugins')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'plugins' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              Plugins
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'agents' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              Agents
            </button>
            <button
              onClick={() => setActiveTab('my-plugins')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'my-plugins' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
              My Plugins
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search plugins or agents..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-4">
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Featured Section (for Agents) */}
        {activeTab === 'agents' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Featured Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.filter(agent => agent.isFeatured).map((agent) => (
                <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <img src={agent.image} alt={agent.name} className="h-12 w-12 rounded-full object-cover" />
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">by {agent.author}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{agent.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {renderRating(agent.rating)}
                      </div>
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{agent.price}</span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Get Agent
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="ml-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mt-2"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'plugins' && filteredPlugins.map((plugin) => (
              <div key={plugin.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img src={plugin.image} alt={plugin.name} className="h-12 w-12 rounded-full object-cover" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{plugin.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">by {plugin.author}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{plugin.description}</p>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {renderRating(plugin.rating)}
                    </div>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{plugin.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span>v{plugin.version}</span>
                    <span>{plugin.downloads} downloads</span>
                  </div>
                  <div className="flex space-x-2">
                    {plugin.isInstalled ? (
                      <button
                        onClick={() => handleUninstallPlugin(plugin.id)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Uninstall
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInstallPlugin(plugin.id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Install
                      </button>
                    )}
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {activeTab === 'agents' && filteredAgents.map((agent) => (
              <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img src={agent.image} alt={agent.name} className="h-12 w-12 rounded-full object-cover" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">by {agent.author}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{agent.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {renderRating(agent.rating)}
                    </div>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{agent.price}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      Get Agent
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {activeTab === 'my-plugins' && plugins.filter(plugin => plugin.isInstalled).map((plugin) => (
              <div key={plugin.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img src={plugin.image} alt={plugin.name} className="h-12 w-12 rounded-full object-cover" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{plugin.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">v{plugin.version}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{plugin.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {renderRating(plugin.rating)}
                    </div>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Installed</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUninstallPlugin(plugin.id)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Uninstall
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && ((activeTab === 'plugins' && filteredPlugins.length === 0) || 
                         (activeTab === 'agents' && filteredAgents.length === 0) ||
                         (activeTab === 'my-plugins' && plugins.filter(p => p.isInstalled).length === 0)) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === 'my-plugins' ? 'You haven\'t installed any plugins yet.' : 'Try adjusting your search or filters.'}
            </p>
            {activeTab === 'my-plugins' && (
              <button
                onClick={() => setActiveTab('plugins')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Browse Plugins
              </button>
            )}
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

export default AgentEcosystem;