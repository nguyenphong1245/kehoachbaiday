import { useState, useEffect } from 'react';
import { getStoredAccessToken } from '@/utils/authStorage';
import ReactMarkdown from 'react-markdown';

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  title: string;
  content: string | null;
  category_id: string;
  created_at: string;
}

interface LessonContent {
  id: number;
  neo4j_lesson_id: string;
  lesson_name: string;
  content: string | null;
}

const SGK_CATEGORY_ID = '__sgk__';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [lessonContents, setLessonContents] = useState<LessonContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const [editingLesson, setEditingLesson] = useState<LessonContent | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
    loadDocuments();
    loadLessonContents();
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
    } finally {
      setLoading(false);
    }
  };

  const loadLessonContents = async () => {
    try {
      const token = getStoredAccessToken();
      const response = await fetch('http://localhost:8000/api/v1/lesson-contents?limit=300', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLessonContents(data);
      }
    } catch (error) {
      console.error('Lỗi khi tải nội dung SGK:', error);
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
    }
  };

  const getDocumentsByCategory = (categoryId: string) => {
    return documents.filter(doc => doc.category_id === categoryId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tránh double click
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const token = getStoredAccessToken();
    
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên danh mục!');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const url = editingId 
        ? `http://localhost:8000/api/v1/categories/${editingId}`
        : 'http://localhost:8000/api/v1/categories';
      
      console.log('Submitting to:', url, formData);
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        setFormData({ name: '', description: '' });
        setShowForm(false);
        setEditingId(null);
        loadCategories();
        alert('Thêm danh mục thành công!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        alert(`Lỗi: ${errorData.detail || 'Không thể thêm danh mục'}`);
      }
    } catch (error) {
      console.error('Lỗi khi lưu danh mục:', error);
      alert('Lỗi kết nối server!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    
    const token = getStoredAccessToken();
    try {
      const response = await fetch(`http://localhost:8000/api/v1/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        loadCategories();
        if (selectedCategory?.id === id) setSelectedCategory(null);
      }
    } catch (error) {
      console.error('Lỗi khi xóa danh mục:', error);
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(selectedCategory?.id === category.id ? null : category);
    setSearchQuery('');
  };

  const loadLessonDetail = async (lesson: LessonContent) => {
    try {
      const token = getStoredAccessToken();
      const response = await fetch(`http://localhost:8000/api/v1/lesson-contents/${lesson.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEditingLesson(data);
        setEditContent(data.content || '');
        setEditingDocument(null);
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết bài học:', error);
    }
  };

  const loadDocumentDetail = (doc: Document) => {
    setEditingDocument(doc);
    setEditTitle(doc.title);
    setEditContent(doc.content || '');
    setEditingLesson(null);
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;
    setSaving(true);
    
    try {
      const token = getStoredAccessToken();
      const response = await fetch(`http://localhost:8000/api/v1/lesson-contents/${editingLesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editContent }),
      });
      
      if (response.ok) {
        alert('Đã lưu thành công!');
        loadLessonContents();
        closeModal();
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!editingDocument) return;
    setSaving(true);
    
    try {
      const token = getStoredAccessToken();
      const response = await fetch(`http://localhost:8000/api/v1/documents/${editingDocument.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      
      if (response.ok) {
        alert('Đã lưu thành công!');
        loadDocuments();
        closeModal();
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setEditingLesson(null);
    setEditingDocument(null);
    setEditContent('');
    setEditTitle('');
  };

  const sgkCategory: Category = {
    id: SGK_CATEGORY_ID,
    name: 'Sách giáo khoa',
    description: 'Nội dung bài học từ sách giáo khoa',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const allCategories = [...categories, sgkCategory];
  const isSGKSelected = selectedCategory?.id === SGK_CATEGORY_ID;
  const categoryDocs = selectedCategory && !isSGKSelected ? getDocumentsByCategory(selectedCategory.id) : [];
  
  const filteredLessons = lessonContents.filter(lesson => 
    lesson.lesson_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.neo4j_lesson_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isModalOpen = editingLesson || editingDocument;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Quản lý Danh mục</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', description: '' }); }}
          className="px-3 py-1.5 bg-sky-500 text-white rounded text-sm hover:bg-sky-600"
        >
          + Thêm danh mục
        </button>
      </div>

      {/* Form thêm/sửa */}
      {showForm && (
        <div className="mb-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Tên danh mục *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Mô tả</label>
              <input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`px-3 py-1.5 text-white rounded text-sm ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600'}`}
            >
              {isSubmitting ? 'Đang xử lý...' : (editingId ? 'Cập nhật' : 'Thêm')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              Hủy
            </button>
          </form>
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-4">
        {/* Cột Danh mục */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <div className="px-3 py-2 bg-sky-500 rounded-t">
              <span className="font-medium text-white text-sm">Danh mục ({allCategories.length})</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {allCategories.map((category) => (
                <div
                  key={category.id}
                  className={`px-3 py-2 border-b border-gray-100 dark:border-gray-700 cursor-pointer text-sm ${
                    selectedCategory?.id === category.id
                      ? 'bg-sky-50 dark:bg-sky-900/40'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="font-medium text-gray-800 dark:text-white">{category.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {category.id === SGK_CATEGORY_ID ? `${lessonContents.length} bài` : `${getDocumentsByCategory(category.id).length} tài liệu`}
                  </div>
                  {category.id !== SGK_CATEGORY_ID && selectedCategory?.id === category.id && (
                    <div className="flex gap-2 mt-1">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(category); }} className="text-xs text-sky-600 dark:text-sky-400 hover:underline">Sửa</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(category.id); }} className="text-xs text-red-600 dark:text-red-400 hover:underline">Xóa</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột Nội dung */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <div className="px-3 py-2 bg-sky-500 rounded-t">
              <span className="font-medium text-white text-sm">
                {isSGKSelected ? `Bài học (${filteredLessons.length}/${lessonContents.length})` 
                  : selectedCategory ? `${selectedCategory.name} (${categoryDocs.length})` 
                  : 'Chọn danh mục'}
              </span>
            </div>
            
            {isSGKSelected && (
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 px-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm bài học..."
                    className="flex-1 py-1.5 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none border-none"
                  />
                </div>
              </div>
            )}

            <div className="max-h-80 overflow-y-auto">
              {selectedCategory ? (
                isSGKSelected ? (
                  filteredLessons.length > 0 ? filteredLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-sky-50 dark:hover:bg-sky-900/30 text-sm"
                      onClick={() => loadLessonDetail(lesson)}
                    >
                      <div className="font-medium text-gray-800 dark:text-white">{lesson.lesson_name}</div>
                      <code className="text-xs text-gray-500 dark:text-gray-400">{lesson.neo4j_lesson_id}</code>
                    </div>
                  )) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                      {searchQuery ? 'Không tìm thấy' : 'Chưa có bài học'}
                    </div>
                  )
                ) : categoryDocs.length > 0 ? (
                  categoryDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-sky-50 dark:hover:bg-sky-900/30 text-sm"
                      onClick={() => loadDocumentDetail(doc)}
                    >
                      <div className="font-medium text-gray-800 dark:text-white">{doc.title}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">Chưa có tài liệu</div>
                )
              ) : (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                  Chọn danh mục để xem
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal chỉnh sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl flex flex-col" style={{ height: '500px' }}>
            {/* Header */}
            <div className="px-4 py-2 bg-sky-500 rounded-t-lg flex items-center justify-between flex-shrink-0">
              <div className="text-white min-w-0 flex-1">
                <h3 className="font-medium text-sm truncate">{editingLesson ? editingLesson.lesson_name : editingDocument?.title}</h3>
                {editingLesson && <code className="text-xs opacity-80">{editingLesson.neo4j_lesson_id}</code>}
              </div>
              <div className="flex items-center gap-2 ml-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-2 py-1 text-xs rounded ${showPreview ? 'bg-white text-sky-600' : 'bg-sky-400 text-white'}`}
                >
                  {showPreview ? 'Ẩn preview' : 'Preview'}
                </button>
                <button onClick={closeModal} className="text-white hover:bg-sky-400 w-5 h-5 rounded flex items-center justify-center text-sm">✕</button>
              </div>
            </div>

            {/* Title for documents */}
            {editingDocument && (
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-700">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Tiêu đề"
                />
              </div>
            )}

            {/* Editor */}
            <div className={`flex-1 grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} min-h-0 overflow-hidden`}>
              <div className="flex flex-col min-h-0 border-r border-gray-200 dark:border-gray-700">
                <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0">Markdown</div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm font-mono resize-none focus:outline-none overflow-y-auto"
                  style={{ backgroundColor: '#ffffff', color: '#000000' }}
                  placeholder="Nhập nội dung..."
                />
              </div>
              {showPreview && (
                <div className="flex flex-col min-h-0">
                  <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0">Xem trước</div>
                  <div className="flex-1 px-3 py-2 overflow-y-auto" style={{ backgroundColor: '#ffffff' }}>
                    <div className="prose prose-sm max-w-none" style={{ color: '#000000' }}>
                      <ReactMarkdown>{editContent || '*Chưa có nội dung*'}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex gap-2 flex-shrink-0 rounded-b-lg">
              <button
                onClick={editingLesson ? handleSaveLesson : handleSaveDocument}
                disabled={saving}
                className="px-3 py-1.5 bg-sky-500 text-white rounded text-sm hover:bg-sky-600 disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                onClick={closeModal}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
