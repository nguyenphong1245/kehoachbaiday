/**
 * Cấu hình các prompt gợi ý AI cho từng loại hoạt động
 */

export interface AIPromptConfig {
  title: string;
  suggestions: string[];
}

export const AI_PROMPTS: Record<string, AIPromptConfig> = {
  khoi_dong: {
    title: "Cải thiện hoạt động Khởi động",
    suggestions: [
      "Thêm trò chơi khởi động hấp dẫn hơn",
      "Tạo câu hỏi gợi mở tư duy",
      "Kết nối với kiến thức thực tế",
      "Thêm hoạt động nhóm ngắn",
    ]
  },
  hinh_thanh_kien_thuc: {
    title: "Cải thiện hoạt động Hình thành kiến thức",
    suggestions: [
      "Chi tiết hóa các bước thực hiện",
      "Thêm ví dụ minh họa cụ thể",
      "Bổ sung câu hỏi dẫn dắt",
      "Thêm hoạt động tương tác nhóm",
    ]
  },
  luyen_tap: {
    title: "Cải thiện hoạt động Luyện tập",
    suggestions: [
      "Thêm bài tập thực hành đa dạng",
      "Tạo bài tập theo mức độ khó tăng dần",
      "Thêm bài tập nhóm",
      "Bổ sung rubric đánh giá",
    ]
  },
  van_dung: {
    title: "Cải thiện hoạt động Vận dụng",
    suggestions: [
      "Kết nối với tình huống thực tế",
      "Thêm dự án nhỏ về nhà",
      "Tạo bài tập sáng tạo",
      "Gợi ý mở rộng kiến thức",
    ]
  },
  muc_tieu: {
    title: "Cải thiện Mục tiêu bài học",
    suggestions: [
      "Cụ thể hóa mục tiêu theo Bloom",
      "Thêm tiêu chí đánh giá đạt mục tiêu",
      "Bổ sung năng lực cần đạt",
    ]
  },
  thiet_bi: {
    title: "Cải thiện Thiết bị dạy học",
    suggestions: [
      "Thêm học liệu số",
      "Gợi ý công cụ trực tuyến",
      "Bổ sung phương án thay thế",
    ]
  },
};
