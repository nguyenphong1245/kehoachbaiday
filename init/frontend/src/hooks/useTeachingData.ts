/**
 * Hook để lấy phương pháp dạy học và kỹ thuật dạy học từ Neo4j qua lesson-builder API
 */
import { useState, useEffect } from 'react';

interface TeachingMethodFromAPI {
  value: string;
  label: string;
  cach_tien_hanh: string | null;
  uu_diem: string | null;
  nhuoc_diem: string | null;
}

interface TeachingTechniqueFromAPI {
  value: string;
  label: string;
  cach_tien_hanh: string | null;
  uu_diem: string | null;
  nhuoc_diem: string | null;
  bo_sung: string | null;
}

interface StaticDataResponse {
  book_types: { value: string; label: string }[];
  grades: { value: string; label: string }[];
  methods: TeachingMethodFromAPI[];
  techniques: TeachingTechniqueFromAPI[];
}

export interface TeachingItem {
  value: string;
  label: string;
  content: string | null; // Nội dung cách tổ chức (kết hợp từ các trường)
  cach_tien_hanh?: string | null;
  uu_diem?: string | null;
  nhuoc_diem?: string | null;
  bo_sung?: string | null;
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

// Helper function để tạo content từ các trường
function buildContent(item: TeachingMethodFromAPI | TeachingTechniqueFromAPI): string {
  const parts: string[] = [];
  
  if (item.cach_tien_hanh) {
    parts.push(`**Cách tiến hành:**\n${item.cach_tien_hanh}`);
  }
  if (item.uu_diem) {
    parts.push(`**Ưu điểm:**\n${item.uu_diem}`);
  }
  if (item.nhuoc_diem) {
    parts.push(`**Nhược điểm:**\n${item.nhuoc_diem}`);
  }
  if ('bo_sung' in item && item.bo_sung) {
    parts.push(`**Bổ sung:**\n${item.bo_sung}`);
  }
  
  return parts.join('\n\n');
}

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
        
        // Fetch từ Neo4j qua lesson-builder/static-data endpoint
        const baseUrl = import.meta.env.VITE_API_URL ?? '/api/v1';
        const response = await fetch(`${baseUrl}/lesson-builder/static-data`, {
          credentials: 'include', // Send httpOnly cookies
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu phương pháp và kỹ thuật dạy học');
        }

        const data: StaticDataResponse = await response.json();

        // Chuyển đổi methods từ API sang TeachingItem
        setMethods(
          data.methods.map((m) => ({
            value: m.value,
            label: m.label,
            content: buildContent(m),
            cach_tien_hanh: m.cach_tien_hanh,
            uu_diem: m.uu_diem,
            nhuoc_diem: m.nhuoc_diem,
          }))
        );

        // Chuyển đổi techniques từ API sang TeachingItem
        setTechniques(
          data.techniques.map((t) => ({
            value: t.value,
            label: t.label,
            content: buildContent(t),
            cach_tien_hanh: t.cach_tien_hanh,
            uu_diem: t.uu_diem,
            nhuoc_diem: t.nhuoc_diem,
            bo_sung: t.bo_sung,
          }))
        );
      } catch (err) {
        console.error('Error fetching teaching data from Neo4j:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { methods, techniques, loading, error, getMethodContent, getTechniqueContent };
}
