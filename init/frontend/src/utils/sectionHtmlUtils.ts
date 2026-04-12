/**
 * Utility: Quản lý section boundaries trong HTML editor
 * - Wrap từng section với <div data-section-id="...">
 * - Chèn media HTML vào cuối section cụ thể
 */

const SECTION_ATTR = "data-section-id";
const SECTION_TYPE_ATTR = "data-section-type";

const ACTIVITY_SECTION_TYPES = new Set([
  "khoi_dong",
  "hinh_thanh_kien_thuc",
  "luyen_tap",
  "van_dung",
]);

/**
 * Wrap 1 section HTML trong <div data-section-id="xxx">
 */
export function wrapSectionHtml(
  sectionHtml: string,
  sectionId: string,
  sectionType: string,
): string {
  return `<div ${SECTION_ATTR}="${sectionId}" ${SECTION_TYPE_ATTR}="${sectionType}">${sectionHtml}</div>`;
}

/**
 * Chèn media HTML vào cuối 1 section trong full HTML string.
 * Dùng DOM parsing để đảm bảo chính xác.
 * Returns null nếu không tìm thấy section.
 */
export function insertHtmlAtSectionEnd(
  fullHtml: string,
  sectionId: string,
  htmlToInsert: string,
): string | null {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = fullHtml;

  const sectionDiv = tempDiv.querySelector(`[${SECTION_ATTR}="${sectionId}"]`);
  if (!sectionDiv) return null;

  const mediaWrapper = document.createElement("div");
  mediaWrapper.className = "inserted-media";
  mediaWrapper.setAttribute("contenteditable", "false");
  mediaWrapper.innerHTML = htmlToInsert;

  sectionDiv.appendChild(mediaWrapper);
  return tempDiv.innerHTML;
}

/**
 * Build HTML cho ảnh/video để chèn vào editor.
 */
export function buildMediaInsertHtml(media: {
  media_type: string;
  url: string;
  title?: string;
  youtube_id?: string;
}): string {
  if (media.media_type === "image" && media.url) {
    const alt = media.title || "Ảnh minh họa";
    return `<div style="margin:12px 0;text-align:center"><img src="${media.url}" alt="${alt}" style="max-width:80%;border-radius:8px" />${media.title ? `<p style="font-size:0.85em;color:#666;margin-top:4px"><em>${media.title}</em></p>` : ""}</div>`;
  }

  if (media.media_type === "video" && media.youtube_id) {
    const title = media.title || "Video minh họa";
    return `<div style="margin:12px 0;text-align:center"><p><strong>&#9654; Video:</strong> <a href="https://www.youtube.com/watch?v=${media.youtube_id}" target="_blank" rel="noopener noreferrer">${title}</a></p></div>`;
  }

  return "";
}

export function isActivitySection(sectionType: string): boolean {
  return ACTIVITY_SECTION_TYPES.has(sectionType);
}
