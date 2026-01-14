/**
 * Lesson Plan Builder Service - API calls
 */
import { api } from "./authService";
import type {
  LessonBasicInfo,
  LessonDetail,
  LessonSearchResponse,
  GenerateLessonPlanRequest,
  GenerateLessonPlanResponse,
} from "@/types/lessonBuilder";

/**
 * Lấy danh sách chủ đề từ Neo4j theo loại sách và lớp
 */
export const getTopics = async (
  bookType: string,
  grade: string
): Promise<string[]> => {
  const { data } = await api.get<{ topics: string[] }>(
    "/lesson-builder/topics",
    { params: { book_type: bookType, grade: grade } }
  );
  return data.topics;
};

/**
 * Tìm kiếm bài học từ Neo4j
 */
export const searchLessons = async (
  bookType: string,
  grade: string,
  topic: string
): Promise<LessonSearchResponse> => {
  const { data } = await api.post<LessonSearchResponse>(
    "/lesson-builder/lessons/search",
    {
      book_type: bookType,
      grade: grade,
      topic: topic,
    }
  );
  return data;
};

/**
 * Lấy chi tiết bài học
 */
export const getLessonDetail = async (
  lessonId: string
): Promise<LessonDetail> => {
  const { data } = await api.get<LessonDetail>(
    `/lesson-builder/lessons/${lessonId}`
  );
  return data;
};

/**
 * Sinh kế hoạch bài dạy
 */
export const generateLessonPlan = async (
  request: GenerateLessonPlanRequest
): Promise<GenerateLessonPlanResponse> => {
  const { data } = await api.post<GenerateLessonPlanResponse>(
    "/lesson-builder/generate",
    request
  );
  return data;
};

/**
 * Cải thiện nội dung section với AI
 */
export interface RelatedAppendix {
  section_id: string;
  section_type: string;
  title: string;
  content: string;
}

export interface UpdatedAppendix {
  section_id: string;
  improved_content: string;
}

export interface ImproveResult {
  improved_content: string;
  updated_appendices?: UpdatedAppendix[];
}

export const improveWithAI = async (
  sectionType: string,
  sectionTitle: string,
  currentContent: string,
  userRequest: string,
  lessonInfo?: { book_type?: string; grade?: string; topic?: string; lesson_name?: string },
  relatedAppendices?: RelatedAppendix[]
): Promise<ImproveResult> => {
  const { data } = await api.post<{
    improved_content: string;
    updated_appendices?: UpdatedAppendix[];
  }>(
    "/lesson-builder/improve-section",
    {
      section_type: sectionType,
      section_title: sectionTitle,
      current_content: currentContent,
      user_request: userRequest,
      lesson_info: lessonInfo || {},
      related_appendices: relatedAppendices || null,
    }
  );
  return {
    improved_content: data.improved_content,
    updated_appendices: data.updated_appendices,
  };
};

/**
 * Export kế hoạch bài dạy sang PDF theo format Công văn 5512
 */
export const exportToPDF = async (
  content: string,
  fileName: string,
  lessonInfo?: { book_type?: string; grade?: string; topic?: string; lesson_name?: string }
): Promise<Blob> => {
  // Convert Markdown sang HTML theo chuẩn Công văn 5512
  const markdownToHtml = (md: string): string => {
    let html = md;
    
    // Xử lý bảng Markdown
    const tableRegex = /(\|.+\|[\r\n]+)+/g;
    html = html.replace(tableRegex, (tableBlock) => {
      const rows = tableBlock.trim().split('\n').filter(r => r.trim());
      let tableHtml = '<table>';
      let isFirstDataRow = true;
      
      rows.forEach((row, idx) => {
        // Bỏ qua separator row (|---|---|)
        if (/^\|[\s:-]+\|$/.test(row.replace(/[\s:-]/g, '|').replace(/\|+/g, '|'))) {
          return;
        }
        
        const cells = row.split('|').slice(1, -1); // Bỏ empty strings ở đầu cuối
        
        if (cells.length === 0) return;
        
        // Hàng đầu tiên là header
        if (idx === 0) {
          tableHtml += '<thead><tr>';
          cells.forEach(cell => {
            tableHtml += `<th>${cell.trim().replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</th>`;
          });
          tableHtml += '</tr></thead><tbody>';
        } else if (!/^[-:\s|]+$/.test(row)) {
          tableHtml += '<tr>';
          cells.forEach(cell => {
            tableHtml += `<td>${cell.trim().replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</td>`;
          });
          tableHtml += '</tr>';
        }
      });
      
      tableHtml += '</tbody></table>';
      return tableHtml;
    });
    
    // Headers
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="section-header">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // Bold và italic (sau khi đã xử lý trong bảng)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    
    // Lists - xử lý đúng cách
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>\n?)+/gs, '<ul>$&</ul>');
    
    // Horizontal rule
    html = html.replace(/^---+$/gm, '<hr class="section-divider">');
    
    // Line breaks thành paragraphs cho các dòng văn bản thường
    const lines = html.split('\n');
    html = lines.map(line => {
      const trimmed = line.trim();
      // Không wrap nếu đã là HTML tag hoặc rỗng
      if (!trimmed || trimmed.startsWith('<') || trimmed.endsWith('>')) {
        return line;
      }
      return `<p>${trimmed}</p>`;
    }).join('\n');
    
    // Clean up
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/\n{3,}/g, '\n\n');
    
    return html;
  };
  
  const htmlContent = markdownToHtml(content);
  
  // Tạo HTML đầy đủ cho in
  const printHtml = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${fileName}</title>
      <style>
        @page {
          size: A4;
          margin: 2cm 2cm 2cm 3cm;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 13pt;
          line-height: 1.5;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 20px;
        }
        
        /* Header theo công văn 5512 */
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          border-bottom: none;
        }
        
        .header-left {
          text-align: center;
          width: 45%;
        }
        
        .header-right {
          text-align: center;
          width: 45%;
        }
        
        .header-left p, .header-right p {
          margin: 2px 0;
          font-size: 12pt;
        }
        
        .header-left .school-name {
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .header-right .doc-type {
          font-weight: bold;
        }
        
        .underline-text {
          text-decoration: underline;
        }
        
        /* Tiêu đề chính */
        .main-title {
          text-align: center;
          margin: 30px 0 20px 0;
        }
        
        .main-title h1 {
          font-size: 14pt;
          font-weight: bold;
          text-transform: uppercase;
          margin: 0;
        }
        
        .main-title .lesson-name {
          font-size: 13pt;
          font-weight: bold;
          margin-top: 10px;
        }
        
        .main-title .lesson-info {
          font-size: 12pt;
          font-style: italic;
          margin-top: 5px;
        }
        
        /* Bảng thông tin */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 13pt;
        }
        
        table, th, td {
          border: 1px solid #000;
        }
        
        th {
          background-color: #f0f0f0;
          font-weight: bold;
          padding: 8px;
          text-align: center;
        }
        
        td {
          padding: 8px;
          vertical-align: top;
        }
        
        /* Các mục chính */
        .section {
          margin: 20px 0;
        }
        
        .section-title {
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        
        .section-title-roman {
          font-weight: bold;
        }
        
        /* Hoạt động */
        .activity {
          margin: 15px 0;
          padding-left: 0;
        }
        
        .activity-title {
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .activity-item {
          margin: 5px 0 5px 20px;
        }
        
        .activity-item strong {
          font-weight: bold;
        }
        
        /* Danh sách */
        ul, ol {
          margin: 5px 0 5px 20px;
          padding-left: 20px;
        }
        
        li {
          margin: 3px 0;
        }
        
        /* Bước thực hiện */
        .step {
          margin: 5px 0 5px 40px;
        }
        
        /* Footer */
        .footer {
          margin-top: 30px;
          display: flex;
          justify-content: flex-end;
        }
        
        .signature {
          text-align: center;
          width: 250px;
        }
        
        .signature .date {
          font-style: italic;
          margin-bottom: 10px;
        }
        
        .signature .title {
          font-weight: bold;
          margin-bottom: 60px;
        }
        
        /* In ấn */
        @media print {
          body {
            padding: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          .page-break {
            page-break-before: always;
          }
        }
        
        /* Markdown content styling */
        h1 { font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 20px 0 10px 0; }
        h2 { font-size: 13pt; font-weight: bold; margin: 15px 0 10px 0; }
        h3 { font-size: 13pt; font-weight: bold; margin: 10px 0 8px 0; }
        h4 { font-size: 13pt; font-weight: bold; margin: 8px 0 5px 0; }
        p { margin: 5px 0; text-align: justify; }
        strong { font-weight: bold; }
        em { font-style: italic; }
      </style>
    </head>
    <body>
      <!-- Header theo công văn -->
      <div class="header">
        <div class="header-left">
          <p>TRƯỜNG THPT ................................</p>
          <p class="school-name">TỔ: TIN HỌC</p>
          <p>─────────────</p>
        </div>
        <div class="header-right">
          <p class="doc-type">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p class="underline-text"><strong>Độc lập - Tự do - Hạnh phúc</strong></p>
          <p>─────────────────────</p>
        </div>
      </div>
      
      <!-- Tiêu đề -->
      <div class="main-title">
        <h1>KẾ HOẠCH BÀI DẠY</h1>
        ${lessonInfo ? `
        <p class="lesson-name">${lessonInfo.lesson_name || ''}</p>
        <p class="lesson-info">Môn: Tin học ${lessonInfo.grade ? `- Lớp ${lessonInfo.grade}` : ''}</p>
        <p class="lesson-info">${lessonInfo.book_type || ''}</p>
        ` : ''}
      </div>
      
      <!-- Nội dung -->
      <div class="content">
        ${htmlContent}
      </div>
      
      <!-- Footer ký tên -->
      <div class="footer">
        <div class="signature">
          <p class="date">........, ngày ..... tháng ..... năm 20.....</p>
          <p class="title">GIÁO VIÊN</p>
          <p><em>(Ký và ghi rõ họ tên)</em></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Sử dụng iframe ẩn để in mà không mở tab mới
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = 'none';
  printFrame.style.visibility = 'hidden';
  
  document.body.appendChild(printFrame);
  
  const frameDoc = printFrame.contentWindow?.document;
  if (frameDoc) {
    frameDoc.open();
    frameDoc.write(printHtml);
    frameDoc.close();
    
    // Đợi iframe load xong rồi in
    printFrame.onload = () => {
      setTimeout(() => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        
        // Xóa iframe sau khi in xong
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 250);
    };
  }
  
  return new Blob([content], { type: "text/html" });
};

// ============== SAVED LESSON PLANS API ==============

import type {
  SaveLessonPlanRequest,
  SaveLessonPlanResponse,
  SavedLessonPlanListResponse,
  SavedLessonPlan,
} from "@/types/lessonBuilder";

/**
 * Lưu giáo án vào MongoDB
 */
export const saveLessonPlan = async (
  request: SaveLessonPlanRequest
): Promise<SaveLessonPlanResponse> => {
  const { data } = await api.post<SaveLessonPlanResponse>(
    "/lesson-builder/saved",
    request
  );
  return data;
};

/**
 * Lấy danh sách giáo án đã lưu
 */
export const getSavedLessonPlans = async (
  page: number = 1,
  pageSize: number = 10,
  search?: string
): Promise<SavedLessonPlanListResponse> => {
  const { data } = await api.get<SavedLessonPlanListResponse>(
    "/lesson-builder/saved",
    {
      params: {
        page,
        page_size: pageSize,
        ...(search && { search }),
      },
    }
  );
  return data;
};

/**
 * Lấy chi tiết một giáo án đã lưu
 */
export const getSavedLessonPlan = async (
  lessonPlanId: string
): Promise<SavedLessonPlan> => {
  const { data } = await api.get<SavedLessonPlan>(
    `/lesson-builder/saved/${lessonPlanId}`
  );
  return data;
};

/**
 * Xóa một giáo án đã lưu
 */
export const deleteSavedLessonPlan = async (
  lessonPlanId: string
): Promise<void> => {
  await api.delete(`/lesson-builder/saved/${lessonPlanId}`);
};
