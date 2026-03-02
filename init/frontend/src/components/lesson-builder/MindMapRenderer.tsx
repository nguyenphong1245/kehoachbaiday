import { useRef, useEffect, useCallback, useState } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Palette } from "lucide-react";

// ─── Theme definitions ───────────────────────────────────────────────
interface MindmapTheme {
  label: string;
  colors: string[];
  css: string;
  lineWidth: (depth: number) => number;
}

const THEMES: Record<string, MindmapTheme> = {
  default: {
    label: "Mặc định",
    colors: ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2"],
    css: "",
    lineWidth: (d) => Math.max(1, 4 - d * 0.8),
  },
  ocean: {
    label: "Đại dương",
    colors: ["#0c4a6e", "#0369a1", "#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc"],
    css: `
      .markmap-node > circle { stroke-width: 2.5; }
      .markmap-foreign { font-weight: 500; }
    `,
    lineWidth: (d) => Math.max(1.2, 4.5 - d * 0.8),
  },
  forest: {
    label: "Rừng xanh",
    colors: ["#14532d", "#166534", "#15803d", "#22c55e", "#4ade80", "#86efac"],
    css: `
      .markmap-node > circle { stroke-width: 2; }
    `,
    lineWidth: (d) => Math.max(1, 4 - d * 0.7),
  },
  sunset: {
    label: "Hoàng hôn",
    colors: ["#7c2d12", "#c2410c", "#ea580c", "#f97316", "#fb923c", "#fdba74"],
    css: `
      .markmap-node > circle { stroke-width: 2; }
      .markmap-foreign { font-weight: 500; }
    `,
    lineWidth: (d) => Math.max(1, 4.5 - d * 0.9),
  },
  pastel: {
    label: "Pastel",
    colors: ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#06b6d4"],
    css: `
      .markmap-node > circle { stroke-width: 2; fill: #fff; }
      .markmap-foreign { font-weight: 400; }
    `,
    lineWidth: (d) => Math.max(1.5, 5 - d),
  },
  rainbow: {
    label: "Cầu vồng",
    colors: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"],
    css: `
      .markmap-node > circle { stroke-width: 2.5; }
      .markmap-foreign { font-weight: 600; }
    `,
    lineWidth: (d) => Math.max(1.5, 5 - d * 0.8),
  },
};

const THEME_KEYS = Object.keys(THEMES);

// ─── Component ───────────────────────────────────────────────────────
interface MindMapRendererProps {
  data: string;
  height?: string;
  className?: string;
}

const transformer = new Transformer();

const MindMapRenderer = ({
  data,
  height = "500px",
  className = "",
}: MindMapRendererProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const markmapRef = useRef<Markmap | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [themeKey, setThemeKey] = useState("default");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowThemePicker(false);
      }
    };
    if (showThemePicker) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showThemePicker]);

  // Create / recreate markmap when data or theme changes
  useEffect(() => {
    if (!svgRef.current || !data.trim()) return;

    const { root } = transformer.transform(data);
    const theme = THEMES[themeKey] || THEMES.default;

    svgRef.current.innerHTML = "";

    markmapRef.current = Markmap.create(
      svgRef.current,
      {
        autoFit: true,
        paddingX: 16,
        duration: 500,
        color: (node: any) =>
          theme.colors[node.state.depth % theme.colors.length],
        lineWidth: (node: any) => theme.lineWidth(node.state.depth),
        style: () => theme.css,
        embedGlobalCSS: true,
      },
      root,
    );

    return () => {
      if (markmapRef.current) {
        markmapRef.current.destroy();
        markmapRef.current = null;
      }
    };
  }, [data, themeKey]);

  const handleFit = useCallback(() => {
    markmapRef.current?.fit();
  }, []);

  const handleZoomIn = useCallback(() => {
    markmapRef.current?.rescale(1.25);
  }, []);

  const handleZoomOut = useCallback(() => {
    markmapRef.current?.rescale(0.8);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => markmapRef.current?.fit(), 100);
  }, []);

  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-white dark:bg-stone-900 flex flex-col"
    : `relative border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden shadow-sm ${className}`;

  return (
    <div className={containerClass}>
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-emerald-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
        <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wide">
          Sơ đồ tư duy
        </span>
        <div className="flex items-center gap-1">
          {/* Theme picker */}
          <div className="relative" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setShowThemePicker((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 transition-colors"
              title="Đổi giao diện"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
            {showThemePicker && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg py-1 min-w-[150px]">
                {THEME_KEYS.map((key) => {
                  const t = THEMES[key];
                  const active = key === themeKey;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setThemeKey(key);
                        setShowThemePicker(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
                        active
                          ? "bg-emerald-50 dark:bg-stone-700 text-emerald-700 dark:text-emerald-400 font-semibold"
                          : "hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      {/* Color dots preview */}
                      <span className="flex gap-0.5">
                        {t.colors.slice(0, 4).map((c, i) => (
                          <span
                            key={i}
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-stone-300 dark:bg-stone-600 mx-0.5" />

          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleFit}
            className="px-2 py-1 text-xs rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 transition-colors"
            title="Vừa với khung"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 transition-colors"
            title="Phóng to"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-stone-300 dark:bg-stone-600 mx-1" />
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 transition-colors"
            title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
      {/* SVG canvas */}
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: isFullscreen ? "calc(100vh - 44px)" : height,
        }}
        className="bg-white dark:bg-stone-900"
      />
    </div>
  );
};

/**
 * Convert mind map SVG element to PNG data URL for export.
 */
export const mindmapSvgToPng = async (
  svgElement: SVGSVGElement,
  width = 1200,
  height = 700,
): Promise<string> => {
  const cloned = svgElement.cloneNode(true) as SVGSVGElement;
  cloned.setAttribute("width", String(width));
  cloned.setAttribute("height", String(height));

  const svgData = new XMLSerializer().serializeToString(cloned);
  const svgBlob = new Blob([svgData], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No canvas context"));
        return;
      }
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
};

export default MindMapRenderer;
