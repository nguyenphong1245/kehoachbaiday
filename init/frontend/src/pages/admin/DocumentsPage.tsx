import { useState, useEffect } from 'react';
import { getStoredAccessToken } from '@/utils/authStorage';

interface Category {
  id: string;
  name: string;
}

interface Document {
  id: string;
  title: string | null;
  content: string | null;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', category_id: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDocuments();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const token = getStoredAccessToken();
      const response = await fetch('http://localhost:8000/api/v1/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const token = getStoredAccessToken();
      const response = await fetch('http://localhost:8000/api/v1/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Lỗi khi tải tài liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStoredAccessToken();
    
    try {
      const url = editingId 
        ? `http://localhost:8000/api/v1/documents/${editingId}`
        : 'http://localhost:8000/api/v1/documents';
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ title: '', content: '', category_id: '' });
        setShowForm(false);
        setEditingId(null);
        loadDocuments();
      }
    } catch (error) {
      console.error('Lỗi khi lưu tài liệu:', error);
    }
  };

  const handleEdit = (doc: Document) => {
    setFormData({ 
      title: doc.title || '', 
      content: doc.content || '', 
      category_id: doc.category_id || '' 
    });
    setEditingId(doc.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    
    const token = getStoredAccessToken();
    try {
      const response = await fetch(`http://localhost:8000/api/v1/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        loadDocuments();
      }
    } catch (error) {
      console.error('Lỗi khi xóa tài liệu:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      alert('Vui lòng chọn ít nhất 1 tài liệu để xóa');
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.size} tài liệu đã chọn?`)) return;
    
    const token = getStoredAccessToken();
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`http://localhost:8000/api/v1/documents/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setSelectedIds(new Set());
      loadDocuments();
    } catch (error) {
      console.error('Lỗi khi xóa tài liệu:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === documents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(documents.map(d => d.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '—';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '—';
  };

  if (loading) {
    return <div className="p-6 text-gray-900 dark:text-gray-100">Đang tải...</div>;
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Quản Lý Tài Liệu</h1>
        <div className="flex flex-wrap gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded hover:bg-red-700"
            >
              Xóa ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: '', content: '', category_id: '' });
            }}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-sky-500 text-white rounded hover:bg-sky-600"
          >
            {showForm ? 'Hủy' : 'Tạo mới'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tiêu đề</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm sm:text-base border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Danh mục</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 text-sm sm:text-base border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nội dung</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 text-sm sm:text-base border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              rows={6}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {editingId ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </form>
      )}

      {/* Mobile: Card view */}
      <div className="block sm:hidden space-y-3">
        <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
          <input
            type="checkbox"
            checked={documents.length > 0 && selectedIds.size === documents.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Chọn tất cả</span>
        </div>
        {documents.map((doc) => (
          <div key={doc.id} className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${selectedIds.has(doc.id) ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedIds.has(doc.id)}
                onChange={() => toggleSelect(doc.id)}
                className="w-4 h-4 mt-1 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{doc.title}</h3>
                <p className="text-xs text-sky-500 dark:text-sky-400 mt-1">{getCategoryName(doc.category_id)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {doc.content ? doc.content.substring(0, 80) + '...' : '—'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => handleEdit(doc)} className="text-sm text-sky-500 dark:text-sky-400">Sửa</button>
              <button onClick={() => handleDelete(doc.id)} className="text-sm text-red-600 dark:text-red-400">Xóa</button>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Chưa có tài liệu nào</div>
        )}
      </div>

      {/* Desktop: Table view */}
      <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={documents.length > 0 && selectedIds.size === documents.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tiêu đề</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nội dung</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày tạo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map((doc) => (
                <tr key={doc.id} className={selectedIds.has(doc.id) ? 'bg-blue-50 dark:bg-blue-900/30' : ''}>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(doc.id)}
                      onChange={() => toggleSelect(doc.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{doc.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{getCategoryName(doc.category_id)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {doc.content ? doc.content.substring(0, 100) + '...' : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleEdit(doc)}
                      className="text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 mr-4"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {documents.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Chưa có tài liệu nào</div>
        )}
      </div>
    </div>
  );
}
