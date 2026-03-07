import { useEffect } from "react";

const BASE_TITLE = "Trợ lý hỗ trợ soạn kế hoạch bài dạy thông minh";

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    return () => { document.title = BASE_TITLE; };
  }, [title]);
}
