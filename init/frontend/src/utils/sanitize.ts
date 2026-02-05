import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Allows safe HTML tags used in the rich text editor while stripping
 * dangerous elements like scripts, event handlers, etc.
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    // Allow common formatting tags used in the editor
    ALLOWED_TAGS: [
      "p", "br", "b", "strong", "i", "em", "u", "s", "strike",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "colgroup", "col",
      "blockquote", "pre", "code",
      "a", "img",
      "span", "div", "sub", "sup",
      "hr",
      // SVG tags for inline mindmap rendering (markmap)
      "svg", "g", "path", "circle", "line", "rect", "ellipse",
      "text", "tspan", "defs", "clipPath", "use", "marker",
      "foreignObject", "style", "polyline", "polygon",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "src", "alt", "width", "height",
      "style", "class", "colspan", "rowspan",
      "contenteditable", "data-*",
      // SVG attributes for inline mindmap rendering
      "viewBox", "xmlns", "xmlns:xlink", "fill", "stroke", "stroke-width",
      "d", "transform", "cx", "cy", "r", "x", "y", "x1", "y1", "x2", "y2",
      "rx", "ry", "points", "marker-end", "marker-start", "text-anchor",
      "dominant-baseline", "font-size", "opacity", "stroke-dasharray",
      "stroke-linecap", "stroke-linejoin", "fill-opacity", "stroke-opacity",
      "clip-path", "preserveAspectRatio", "id",
    ],
    // Strip all event handler attributes (onclick, onerror, etc.)
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
    // Allow data URIs for embedded images
    ALLOW_DATA_ATTR: true,
  });
}

/**
 * Sanitize HTML for PDF/DOCX export - more permissive since it's not rendered in browser.
 * Still strips scripts and event handlers.
 */
export function sanitizeHTMLForExport(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    // Allow all safe tags for export rendering
    ADD_TAGS: ["style"],
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
  });
}
