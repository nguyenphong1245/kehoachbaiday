import { useRef, useEffect, useCallback, useState } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw } from "lucide-react";

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

  useEffect(() => {
    if (!svgRef.current || !data.trim()) return;

    const { root } = transformer.transform(data);

    // Clear previous
    svgRef.current.innerHTML = "";

    markmapRef.current = Markmap.create(svgRef.current, {
      autoFit: true,
      paddingX: 16,
      duration: 500,
    }, root);

    return () => {
      if (markmapRef.current) {
        markmapRef.current.destroy();
        markmapRef.current = null;
      }
    };
  }, [data]);

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
    // Re-fit after fullscreen toggle
    setTimeout(() => markmapRef.current?.fit(), 100);
  }, []);

  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col"
    : `relative border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm ${className}`;

  return (
    <div className={containerClass}>
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
          Sơ đồ tư duy
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleFit}
            className="px-2 py-1 text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            title="Vừa với khung"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            title="Phóng to"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
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
        className="bg-white dark:bg-slate-900"
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
