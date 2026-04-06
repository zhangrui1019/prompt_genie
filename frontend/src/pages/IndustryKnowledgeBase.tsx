import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';

interface KnowledgeBase {
  id: string;
  name: string;
  industry: string;
  description: string;
  size: number;
  lastUpdated: string;
  status: 'active' | 'draft' | 'archived';
  documentCount: number;
}

interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'scraper';
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  syncFrequency: string;
}

interface EtlJob {
  id: string;
  name: string;
  sourceId: string;
  targetId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  lastRun: string;
  nextRun: string;
  executionTime: number;
}

interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'docx' | 'txt' | 'html';
  size: number;
  uploadedAt: string;
  status: 'processing' | 'processed' | 'failed';
  tags: string[];
}

export default function IndustryKnowledgeBase() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [etlJobs, setEtlJobs] = useState<EtlJob[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'knowledgebases' | 'datasources' | 'etl' | 'documents'>('knowledgebases');

  useEffect(() => {
    fetchIndustryKnowledgeData();
  }, []);

  const fetchIndustryKnowledgeData = async () => {
    try {
      setLoading(true);
      // 这里应该调用获取行业知识库数据的API
      // 暂时使用模拟数据
      
      // 模拟知识库数据
      const mockKnowledgeBases: KnowledgeBase[] = [
        {
          id: '1',
          name: 'Financial Services Knowledge Base',
          industry: 'Finance',
          description: 'Comprehensive knowledge base for financial services industry',
          size: 1500000,
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          documentCount: 125
        },
        {
          id: '2',
          name: 'Healthcare Industry Knowledge Base',
          industry: 'Healthcare',
          description: 'Medical and healthcare industry knowledge base',
          size: 2800000,
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          documentCount: 210
        },
        {
          id: '3',
          name: 'Retail Industry Knowledge Base',
          industry: 'Retail',
          description: 'Retail industry best practices and guidelines',
          size: 850000,
          lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'draft',
          documentCount: 75
        }
      ];
      
      // 模拟数据源数据
      const mockDataSources: DataSource[] = [
        {
          id: '1',
          name: 'Financial Database',
          type: 'database',
          connectionStatus: 'connected',
          lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          syncFrequency: 'Every 1 hour'
        },
        {
          id: '2',
          name: 'Healthcare API',
          type: 'api',
          connectionStatus: 'connected',
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          syncFrequency: 'Every 2 hours'
        },
        {
          id: '3',
          name: 'Retail CSV Files',
          type: 'file',
          connectionStatus: 'disconnected',
          lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          syncFrequency: 'Manual'
        },
        {
          id: '4',
          name: 'Industry News Scraper',
          type: 'scraper',
          connectionStatus: 'error',
          lastSync: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          syncFrequency: 'Every 6 hours'
        }
      ];
      
      // 模拟ETL作业数据
      const mockEtlJobs: EtlJob[] = [
        {
          id: '1',
          name: 'Financial Data Import',
          sourceId: '1',
          targetId: '1',
          status: 'completed',
          lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          nextRun: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
          executionTime: 45
        },
        {
          id: '2',
          name: 'Healthcare Data Sync',
          sourceId: '2',
          targetId: '2',
          status: 'running',
          lastRun: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          executionTime: 60
        },
        {
          id: '3',
          name: 'Retail Data Transformation',
          sourceId: '3',
          targetId: '3',
          status: 'failed',
          lastRun: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          executionTime: 30
        }
      ];
      
      // 模拟文档数据
      const mockDocuments: Document[] = [
        {
          id: '1',
          title: 'Financial Regulations 2024',
          type: 'pdf',
          size: 1500000,
          uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'processed',
          tags: ['Finance', 'Regulations', '2024']
        },
        {
          id: '2',
          title: 'Healthcare Best Practices',
          type: 'docx',
          size: 850000,
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'processed',
          tags: ['Healthcare', 'Best Practices']
        },
        {
          id: '3',
          title: 'Retail Industry Trends',
          type: 'pdf',
          size: 2100000,
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'processing',
          tags: ['Retail', 'Trends', '2024']
        },
        {
          id: '4',
          title: 'Financial Market Analysis',
          type: 'txt',
          size: 350000,
          uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'failed',
          tags: ['Finance', 'Market Analysis']
        }
      ];
      
      setKnowledgeBases(mockKnowledgeBases);
      setDataSources(mockDataSources);
      setEtlJobs(mockEtlJobs);
      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Failed to fetch industry knowledge data', error);
      toast.error('Failed to load industry knowledge data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKnowledgeBase = () => {
    // 这里应该打开创建知识库的模态框
    toast.success('Create knowledge base functionality will be implemented');
  };

  const handleCreateDataSource = () => {
    // 这里应该打开创建数据源的模态框
    toast.success('Create data source functionality will be implemented');
  };

  const handleCreateEtlJob = () => {
    // 这里应该打开创建ETL作业的模态框
    toast.success('Create ETL job functionality will be implemented');
  };

  const handleUploadDocument = () => {
    // 这里应该打开上传文档的模态框
    toast.success('Upload document functionality will be implemented');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'completed':
      case 'processed':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      case 'draft':
      case 'disconnected':
      case 'pending':
      case 'processing':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      case 'archived':
      case 'error':
      case 'failed':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      case 'running':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'database':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Database</span>;
      case 'api':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">API</span>;
      case 'file':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">File</span>;
      case 'scraper':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Scraper</span>;
      case 'pdf':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">PDF</span>;
      case 'docx':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">DOCX</span>;
      case 'txt':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">TXT</span>;
      case 'html':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">HTML</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{type}</span>;
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <BackButton to="/dashboard" label="Back to Dashboard" />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mt-4">Industry Knowledge Base</h1>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 mb-0">
          <div className="flex">
            <button
              onClick={() => setActiveTab('knowledgebases')}
              className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'knowledgebases' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Knowledge Bases
            </button>
            <button
              onClick={() => setActiveTab('datasources')}
              className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'datasources' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Data Sources
            </button>
            <button
              onClick={() => setActiveTab('etl')}
              className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'etl' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              ETL Jobs
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Documents
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 p-6">
          {activeTab === 'knowledgebases' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Knowledge Bases</h2>
                <button
                  onClick={handleCreateKnowledgeBase}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  + Create Knowledge Base
                </button>
              </div>
              
              <div className="space-y-4">
                {knowledgeBases.map((kb) => (
                  <div key={kb.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{kb.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-500">Industry: {kb.industry}</span>
                          {getStatusBadge(kb.status)}
                        </div>
                        <p className="text-gray-600 mb-3">{kb.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Size: {Math.round(kb.size / 1000000)} MB</span>
                          <span>Documents: {kb.documentCount}</span>
                          <span>Last Updated: {new Date(kb.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'datasources' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Data Sources</h2>
                <button
                  onClick={handleCreateDataSource}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  + Add Data Source
                </button>
              </div>
              
              <div className="space-y-4">
                {dataSources.map((source) => (
                  <div key={source.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{source.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeBadge(source.type)}
                          {getStatusBadge(source.connectionStatus)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Last Sync: {new Date(source.lastSync).toLocaleString()}</span>
                          <span>Sync Frequency: {source.syncFrequency}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                          Test Connection
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'etl' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">ETL Jobs</h2>
                <button
                  onClick={handleCreateEtlJob}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  + Create ETL Job
                </button>
              </div>
              
              <div className="space-y-4">
                {etlJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{job.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(job.status)}
                          <span className="text-sm text-gray-500">Execution Time: {job.executionTime}s</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Last Run: {new Date(job.lastRun).toLocaleString()}</span>
                          <span>Next Run: {new Date(job.nextRun).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                          Run Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'documents' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Documents</h2>
                <button
                  onClick={handleUploadDocument}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  + Upload Document
                </button>
              </div>
              
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{doc.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeBadge(doc.type)}
                          {getStatusBadge(doc.status)}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {doc.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Size: {Math.round(doc.size / 1000)} KB</span>
                          <span>Uploaded: {new Date(doc.uploadedAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}