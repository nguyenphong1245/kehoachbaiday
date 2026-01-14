/**
 * Hook để lấy phương pháp dạy học và kỹ thuật dạy học từ API categories
 */
import { useState, useEffect } from 'react';
import { getStoredAccessToken } from '@/utils/authStorage';

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Document {
  id: string;
  title: string;
  content: string | null;
  category_id: string;
}

export interface TeachingItem {
  value: string;
  label: string;
  content: string | null; // Nội dung cách tổ chức
}

export interface TeachingData {
  methods: TeachingItem[];
  techniques: TeachingItem[];
  loading: boolean;
  error: string | null;
  // Helper functions để lấy content theo tên
  getMethodContent: (name: string) => string | null;
  getTechniqueContent: (name: string) => string | null;
}

// Tên danh mục trong database - hỗ trợ cả 2 cách viết (ĩ và ỹ)
const METHODS_CATEGORY_NAMES = ["Phương pháp dạy học"];
const TECHNIQUES_CATEGORY_NAMES = ["Kỹ thuật dạy học", "Kĩ thuật dạy học"];

export function useTeachingData(): TeachingData {
  const [methods, setMethods] = useState<TeachingItem[]>([]);
  const [techniques, setTechniques] = useState<TeachingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function để lấy content của phương pháp theo tên
  const getMethodContent = (name: string): string | null => {
    const method = methods.find(m => m.value === name || m.label === name);
    return method?.content || null;
  };

  // Helper function để lấy content của kỹ thuật theo tên
  const getTechniqueContent = (name: string): string | null => {
    const technique = techniques.find(t => t.value === name || t.label === name);
    return technique?.content || null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getStoredAccessToken();
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };

        // Fetch categories và documents song song
        const [categoriesRes, documentsRes] = await Promise.all([
          fetch('http://localhost:8000/api/v1/categories', { headers }),
          fetch('http://localhost:8000/api/v1/documents', { headers }),
        ]);

        if (!categoriesRes.ok || !documentsRes.ok) {
          throw new Error('Không thể tải dữ liệu');
        }

        const categories: Category[] = await categoriesRes.json();
        const documents: Document[] = await documentsRes.json();

        // Tìm category "Phương pháp dạy học"
        const methodsCategory = categories.find(
          (c) => METHODS_CATEGORY_NAMES.some(name => c.name.toLowerCase() === name.toLowerCase())
        );

        // Tìm category "Kỹ thuật dạy học" hoặc "Kĩ thuật dạy học"
        const techniquesCategory = categories.find(
          (c) => TECHNIQUES_CATEGORY_NAMES.some(name => c.name.toLowerCase() === name.toLowerCase())
        );

        // Lấy documents thuộc category "Phương pháp dạy học"
        if (methodsCategory) {
          const methodDocs = documents.filter(
            (d) => d.category_id === methodsCategory.id
          );
          setMethods(
            methodDocs.map((d) => ({
              value: d.title,
              label: d.title,
              content: d.content, // Lưu nội dung cách tổ chức
            }))
          );
        }

        // Lấy documents thuộc category "Kỹ thuật dạy học"
        if (techniquesCategory) {
          const techniqueDocs = documents.filter(
            (d) => d.category_id === techniquesCategory.id
          );
          setTechniques(
            techniqueDocs.map((d) => ({
              value: d.title,
              label: d.title,
              content: d.content, // Lưu nội dung cách tổ chức
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching teaching data:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { methods, techniques, loading, error, getMethodContent, getTechniqueContent };
}
