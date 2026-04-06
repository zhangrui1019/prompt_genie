import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Prompt } from '@/types';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';

interface MarketplacePrompt extends Prompt {
  price: number;
  sellerId: string;
  sellerName: string;
  isPurchased?: boolean;
  salesCount: number;
  rating: number;
}

export default function Marketplace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [prompts, setPrompts] = useState<MarketplacePrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [sort, setSort] = useState<'popular' | 'newest' | 'price_low' | 'price_high'>('popular');
  const [categories, setCategories] = useState<string[]>([]);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketplacePrompts();
    fetchCategories();
  }, [search, category, sort]);

  const fetchMarketplacePrompts = async () => {
    try {
      setLoading(true);
      // 这里应该调用获取市场Prompt的API
      // 暂时使用模拟数据
      const mockPrompts: MarketplacePrompt[] = [
        {
          id: '1',
          userId: '1',
          title: 'Marketing Campaign Generator',
          content: 'Create a comprehensive marketing campaign for {{product}} targeting {{audience}}',
          variables: { product: 'string', audience: 'string' },
          tags: [{ name: 'Marketing', id: '1' }, { name: 'Campaign', id: '2' }],
          isPublic: true,
          category: 'Marketing',
          price: 19.99,
          sellerId: 'seller1',
          sellerName: 'Marketing Expert',
          salesCount: 156,
          rating: 4.8,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          userId: '2',
          title: 'SEO Content Optimizer',
          content: 'Optimize the following content for SEO: {{content}}',
          variables: { content: 'string' },
          tags: [{ name: 'SEO', id: '3' }, { name: 'Content', id: '4' }],
          isPublic: true,
          category: 'SEO',
          price: 14.99,
          sellerId: 'seller2',
          sellerName: 'SEO Specialist',
          salesCount: 203,
          rating: 4.9,
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          userId: '3',
          title: 'Product Description Writer',
          content: 'Write a compelling product description for {{product}} with features: {{features}}',
          variables: { product: 'string', features: 'string' },
          tags: [{ name: 'Product', id: '5' }, { name: 'Description', id: '6' }],
          isPublic: true,
          category: 'E-Commerce',
          price: 9.99,
          sellerId: 'seller3',
          sellerName: 'Copywriter Pro',
          salesCount: 128,
          rating: 4.7,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setPrompts(mockPrompts);
    } catch (error) {
      console.error('Failed to fetch marketplace prompts', error);
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // 这里应该调用获取分类的API
      // 暂时使用模拟数据
      const mockCategories = ['All', 'Marketing', 'SEO', 'E-Commerce', 'Content', 'Social Media', 'Email', 'Sales'];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const handlePurchase = async (promptId: string) => {
    if (!user?.id) {
      toast.error('Please login to purchase');
      return;
    }
    try {
      setPurchasingId(promptId);
      // 这里应该调用购买Prompt的API
      setTimeout(() => {
        setPrompts(prev => prev.map(prompt => 
          prompt.id === promptId ? { ...prompt, isPurchased: true } : prompt
        ));
        toast.success('Purchase successful!');
        setPurchasingId(null);
      }, 1000);
    } catch (error) {
      console.error('Failed to purchase prompt', error);
      toast.error('Failed to purchase');
      setPurchasingId(null);
    }
  };

  const handleViewSeller = (sellerId: string) => {
    navigate(`/u/${sellerId}`);
  };

  const handleSellPrompt = () => {
    navigate('/prompts/new?marketplace=true');
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <BackButton to="/dashboard" label="Back to Dashboard" />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mt-4">Prompt Marketplace</h1>
          <button
            onClick={handleSellPrompt}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
          >
            + Sell Your Prompt
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search prompts..."
              className="w-full border rounded px-4 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full border rounded px-4 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full border rounded px-4 py-2"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
            >
              <option value="popular">Popular</option>
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>
        
        {prompts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No prompts found</h3>
            <p className="text-gray-500 mb-6">Check back later for new prompts</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{prompt.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {prompt.tags.map(tag => (
                          <span key={tag.id} className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-500">By</span>
                        <button
                          onClick={() => handleViewSeller(prompt.sellerId)}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {prompt.sellerName}
                        </button>
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm font-medium">{prompt.rating}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {prompt.salesCount} sales
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">${prompt.price.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm font-mono bg-gray-50 p-3 rounded line-clamp-3">
                      {prompt.content}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    {prompt.isPurchased ? (
                      <button
                        onClick={() => navigate(`/prompts/${prompt.id}`)}
                        className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
                      >
                        View Prompt
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(prompt.id)}
                        disabled={purchasingId === prompt.id}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
                      >
                        {purchasingId === prompt.id ? 'Purchasing...' : 'Buy Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}