import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Prompt, PromptVersion } from '@/types';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';

interface TemplateWithStats extends Prompt {
  usageCount: number;
  likesCount: number;
  forksCount: number;
  conversionRate: number;
  revenue?: number;
}

export default function TemplateManagement() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<TemplateWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithStats | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, [search, status]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // 这里应该调用专门的模板管理API，暂时使用现有API模拟
      const data = await promptService.getAll(search);
      // 添加模拟的统计数据
      const templatesWithStats = data.map((prompt) => ({
        ...prompt,
        usageCount: Math.floor(Math.random() * 1000),
        likesCount: Math.floor(Math.random() * 200),
        forksCount: Math.floor(Math.random() * 100),
        conversionRate: Math.random() * 100,
        revenue: Math.random() * 1000
      }));
      setTemplates(templatesWithStats);
    } catch (err) {
      console.error('Failed to fetch templates', err);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async (promptId: string) => {
    try {
      const data = await promptService.getVersions(promptId);
      setVersions(data);
    } catch (err) {
      console.error('Failed to fetch versions', err);
    }
  };

  const handleStatusChange = async (templateId: string, newStatus: string) => {
    try {
      // 这里应该调用状态更新API
      setTemplates(prev => prev.map(template => 
        template.id === templateId ? { ...template, status: newStatus } : template
      ));
      toast.success('Status updated');
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update status');
    }
  };

  const handleFeaturedToggle = async (templateId: string, featured: boolean) => {
    try {
      // 这里应该调用推荐位更新API
      setTemplates(prev => prev.map(template => 
        template.id === templateId ? { ...template, isFeatured: !featured } : template
      ));
      toast.success(featured ? 'Removed from featured' : 'Added to featured');
    } catch (err) {
      console.error('Failed to update featured status', err);
      toast.error('Failed to update featured status');
    }
  };

  const handleViewVersions = (template: TemplateWithStats) => {
    setSelectedTemplate(template);
    fetchVersions(template.id);
    setShowVersionModal(true);
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!selectedTemplate) return;
    try {
      await promptService.restoreVersion(selectedTemplate.id, versionId);
      toast.success('Version restored');
      setShowVersionModal(false);
      fetchTemplates();
    } catch (err) {
      console.error('Failed to restore version', err);
      toast.error('Failed to restore version');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <BackButton to="/dashboard" label="Back to Dashboard" />
        
        <h1 className="text-3xl font-bold mt-4 mb-6">Template Management</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full border rounded px-4 py-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full border rounded px-4 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending Review</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">{template.title.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{template.title}</div>
                          <div className="text-sm text-gray-500">{template.userId}</div>
                        </div>
                        {template.isFeatured && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="border rounded px-3 py-1 text-sm"
                        value={template.status || 'draft'}
                        onChange={(e) => handleStatusChange(template.id, e.target.value)}
                      >
                        <option value="draft">Draft</option>
                        <option value="pending">Pending Review</option>
                        <option value="published">Published</option>
                        <option value="rejected">Rejected</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Uses: {template.usageCount}</div>
                        <div>Likes: {template.likesCount}</div>
                        <div>Forks: {template.forksCount}</div>
                        <div>Conversion: {template.conversionRate.toFixed(2)}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${template.revenue?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/prompts/${template.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewVersions(template)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Versions
                        </button>
                        <button
                          onClick={() => handleFeaturedToggle(template.id, template.isFeatured || false)}
                          className={`${template.isFeatured ? 'text-yellow-600 hover:text-yellow-900' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                          {template.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Template Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
            <div className="text-sm text-gray-500">Total Templates</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-green-600">
              {templates.filter(t => t.status === 'published').length}
            </div>
            <div className="text-sm text-gray-500">Published</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-blue-600">
              {templates.reduce((sum, t) => sum + (t.usageCount || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">Total Uses</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-purple-600">
              ${templates.reduce((sum, t) => sum + (t.revenue || 0), 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">Total Revenue</div>
          </div>
        </div>
      </div>
      
      {/* Version Modal */}
      {showVersionModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Versions for {selectedTemplate.title}</h2>
                <button
                  onClick={() => setShowVersionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="p-6">
              {versions.length === 0 ? (
                <div className="text-center py-8">
                  No versions found
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.map((version) => (
                    <div key={version.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-gray-900">Version {version.versionNumber}</div>
                          <div className="text-sm text-gray-500">{new Date(version.createdAt).toLocaleString()}</div>
                          {version.changeNote && (
                            <div className="text-sm text-gray-600 mt-1">{version.changeNote}</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRestoreVersion(version.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}