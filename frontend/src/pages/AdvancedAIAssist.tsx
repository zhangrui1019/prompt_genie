import { useState, useEffect, useRef } from 'react';
import { Brain, Sparkles, Wand2, Lightbulb, Bot, Code, MessageSquare, Settings, Bell, User, Menu, X, Search, ChevronRight, ChevronDown, Plus, Play, Pause, Edit, Trash2, Save, Copy, Download, Upload, RefreshCw, Star, Heart, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  used: number;
}

interface AIHistory {
  id: string;
  prompt: string;
  suggestion: string;
  timestamp: string;
  applied: boolean;
}

interface AISetting {
  id: string;
  name: string;
  description: string;
  type: 'toggle' | 'slider' | 'select';
  value: boolean | number | string;
  options?: string[];
}

const AdvancedAIAssist = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('assistant');
  const [prompt, setPrompt] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiHistory, setAiHistory] = useState<AIHistory[]>([]);
  const [aiSettings, setAiSettings] = useState<AISetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 模拟API调用获取AI设置
    const fetchSettings = async () => {
      try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟AI设置数据
        const mockSettings: AISetting[] = [
          {
            id: '1',
            name: 'AI Suggestions',
            description: 'Enable AI-powered suggestions',
            type: 'toggle',
            value: true
          },
          {
            id: '2',
            name: 'Suggestion Frequency',
            description: 'How often to show suggestions',
            type: 'slider',
            value: 75
          },
          {
            id: '3',
            name: 'AI Model',
            description: 'Select AI model for suggestions',
            type: 'select',
            value: 'gpt-4',
            options: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']
          },
          {
            id: '4',
            name: 'Auto-Complete',
            description: 'Enable auto-complete suggestions',
            type: 'toggle',
            value: true
          },
          {
            id: '5',
            name: 'Confidence Threshold',
            description: 'Minimum confidence for suggestions',
            type: 'slider',
            value: 60
          }
        ];

        setAiSettings(mockSettings);
      } catch (error) {
        toast.error('Failed to fetch AI settings');
        console.error('Error fetching AI settings:', error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    // 模拟API调用获取AI历史记录
    const fetchHistory = async () => {
      try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟AI历史数据
        const mockHistory: AIHistory[] = [
          {
            id: '1',
            prompt: 'Write a marketing email for a new product launch',
            suggestion: 'Start with a catchy subject line, introduce the product benefits, and include a clear call-to-action',
            timestamp: '2026-04-05T10:30:00',
            applied: true
          },
          {
            id: '2',
            prompt: 'Create a code snippet for a React component',
            suggestion: 'Use functional components with hooks, include proper props typing, and add error handling',
            timestamp: '2026-04-05T09:15:00',
            applied: false
          },
          {
            id: '3',
            prompt: 'Write a social media post about a new feature',
            suggestion: 'Highlight the key benefits, use engaging visuals, and include relevant hashtags',
            timestamp: '2026-04-04T16:45:00',
            applied: true
          }
        ];

        setAiHistory(mockHistory);
      } catch (error) {
        toast.error('Failed to fetch AI history');
        console.error('Error fetching AI history:', error);
      }
    };

    fetchHistory();
  }, []);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    
    // 模拟AI分析并生成建议
    if (newPrompt.length > 10) {
      generateAISuggestions(newPrompt);
    } else {
      setAiSuggestions([]);
    }
  };

  const generateAISuggestions = async (input: string) => {
    setIsLoading(true);
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 模拟AI建议数据
      const mockSuggestions: AISuggestion[] = [
        {
          id: '1',
          title: 'Improve Clarity',
          description: 'Make your prompt more specific and clear',
          category: 'Structure',
          confidence: 92,
          used: 156
        },
        {
          id: '2',
          title: 'Add Context',
          description: 'Include more background information for better results',
          category: 'Content',
          confidence: 88,
          used: 124
        },
        {
          id: '3',
          title: 'Specify Format',
          description: 'Clearly state the desired output format',
          category: 'Format',
          confidence: 85,
          used: 98
        },
        {
          id: '4',
          title: 'Set Tone',
          description: 'Define the tone and style for the response',
          category: 'Style',
          confidence: 80,
          used: 87
        }
      ];

      setAiSuggestions(mockSuggestions);
    } catch (error) {
      toast.error('Failed to generate AI suggestions');
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (suggestionId: string) => {
    const suggestion = aiSuggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      setSelectedSuggestion(suggestionId);
      // 模拟应用建议
      toast.success('Suggestion applied');
      
      // 更新历史记录
      const newHistory: AIHistory = {
        id: `${aiHistory.length + 1}`,
        prompt: prompt,
        suggestion: suggestion.description,
        timestamp: new Date().toISOString(),
        applied: true
      };
      setAiHistory([newHistory, ...aiHistory]);
    }
  };

  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    setIsGenerating(true);
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟生成的内容
      const generatedContent = `# AI-Generated Content\n\nBased on your prompt: "${prompt}"\n\nThis is a sample of AI-generated content. In a real application, this would be the actual content generated by the AI model based on your prompt and any applied suggestions.\n\nThe content would be tailored to your specific needs and follow the structure, style, and format you requested.`;
      
      // 模拟复制到剪贴板
      await navigator.clipboard.writeText(generatedContent);
      toast.success('Content generated and copied to clipboard');
    } catch (error) {
      toast.error('Failed to generate content');
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSettingChange = (settingId: string, value: any) => {
    setAiSettings(aiSettings.map(setting => 
      setting.id === settingId ? { ...setting, value } : setting
    ));
    toast.success('Setting updated');
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
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">AI Assistant</span>
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
            <MessageSquare className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link to="/v2/ai-assist" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20">
            <Brain className="h-5 w-5 mr-3" />
            AI Assistant
          </Link>
          <Link to="/prompts" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <MessageSquare className="h-5 w-5 mr-3" />
            Prompts
          </Link>
          <Link to="/agents" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Bot className="h-5 w-5 mr-3" />
            Agents
          </Link>
          <Link to="/workflows" className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <RefreshCw className="h-5 w-5 mr-3" />
            Workflows
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
                    placeholder="Search AI features..."
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

        {/* AI Assistant Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Assistant</h1>
            <p className="text-gray-600 dark:text-gray-400">Enhance your prompts with intelligent AI suggestions and assistance</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('assistant')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'assistant' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
              >
                Assistant
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Assistant Tab */}
          {activeTab === 'assistant' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Prompt Input */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Write Your Prompt</h3>
                      <div className="flex space-x-2">
                        <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <Upload className="h-5 w-5" />
                        </button>
                        <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={handlePromptChange}
                        placeholder="Enter your prompt here...\n\nExamples:\n- Write a marketing email for a new product\n- Create a code snippet for a React component\n- Generate a social media post about a new feature"
                        className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      />
                    </div>
                    <div className="flex justify-between">
                      <div className="flex space-x-2">
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </button>
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </button>
                      </div>
                      <button
                        onClick={handleGenerateContent}
                        disabled={isGenerating || !prompt.trim()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Content
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Suggestions */}
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Suggestions</h3>
                      <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                        Refresh
                      </button>
                    </div>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[...Array(4)].map((_, index) => (
                          <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          </div>
                        ))}
                      </div>
                    ) : aiSuggestions.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                          <Lightbulb className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No suggestions yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Start typing your prompt to get AI suggestions
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {aiSuggestions.map((suggestion) => (
                          <div 
                            key={suggestion.id} 
                            className={`p-4 border rounded-lg ${selectedSuggestion === suggestion.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-md font-medium text-gray-900 dark:text-white">{suggestion.title}</h4>
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {suggestion.confidence}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{suggestion.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {suggestion.category} • {suggestion.used} times used
                              </span>
                              <button
                                onClick={() => handleApplySuggestion(suggestion.id)}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                    <Wand2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Smart Completion</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Get real-time suggestions as you type to complete your prompts faster and more effectively.
                  </p>
                  <button className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium">
                    Learn more
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Context Analysis</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    AI analyzes your prompt context to provide more relevant and accurate suggestions.
                  </p>
                  <button className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium">
                    Learn more
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <Code className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Code Assistance</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Get intelligent code suggestions and completions for various programming languages.
                  </p>
                  <button className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium">
                    Learn more
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Interaction History</h3>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </button>
                </div>
                <div className="space-y-4">
                  {aiHistory.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                        <MessageSquare className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No history yet</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Your AI interactions will appear here
                      </p>
                    </div>
                  ) : (
                    aiHistory.map((history) => (
                      <div key={history.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(history.timestamp).toLocaleString()}
                          </span>
                          {history.applied && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Applied
                            </span>
                          )}
                        </div>
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Prompt:</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{history.prompt}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">AI Suggestion:</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{history.suggestion}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant Settings</h3>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </button>
                </div>
                <div className="space-y-6">
                  {aiSettings.map((setting) => (
                    <div key={setting.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                      <div className="mb-3">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-1">{setting.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                      </div>
                      {setting.type === 'toggle' && (
                        <div className="flex items-center">
                          <button
                            onClick={() => handleSettingChange(setting.id, !setting.value)}
                            className={`inline-flex items-center h-6 rounded-full w-11 transition-colors ${setting.value ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.value ? 'translate-x-5' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      )}
                      {setting.type === 'slider' && (
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={setting.value as number}
                            onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>0%</span>
                            <span>{setting.value}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      )}
                      {setting.type === 'select' && (
                        <select
                          value={setting.value as string}
                          onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {setting.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdvancedAIAssist;