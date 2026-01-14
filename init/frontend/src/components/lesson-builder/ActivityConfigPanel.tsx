/**
 * ActivityConfigPanel - Cấu hình phương pháp/kỹ thuật cho từng hoạt động
 * Phong cách hành chính - Gọn gàng, dễ sử dụng
 */
import React, { useState, useCallback, useRef } from "react";
import {
  Lightbulb,
  BookOpen,
  PenTool,
  Rocket,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  X,
  Loader2,
  RotateCcw,
} from "lucide-react";
import {
  TEACHING_METHODS,
  TEACHING_TECHNIQUES,
  type LessonDetail,
  type ActivityConfig,
  type ChiMucInfo,
} from "@/types/lessonBuilder";
import { useTeachingData } from "@/hooks/useTeachingData";

interface ActivityConfigPanelProps {
  lessonDetail: LessonDetail;
  activities: ActivityConfig[];
  onActivitiesChange: (activities: ActivityConfig[]) => void;
}

// Icon mapping for activity types
const ACTIVITY_ICONS = {
  khoi_dong: Lightbulb,
  hinh_thanh_kien_thuc: BookOpen,
  luyen_tap: PenTool,
  van_dung: Rocket,
};

// Simplified colors - hành chính style
const ACTIVITY_COLORS = {
  khoi_dong: "bg-slate-600",
  hinh_thanh_kien_thuc: "bg-slate-600",
  luyen_tap: "bg-slate-600",
  van_dung: "bg-slate-600",
};

const ACTIVITY_BORDER = {
  khoi_dong: "border-l-amber-500",
  hinh_thanh_kien_thuc: "border-l-blue-500",
  luyen_tap: "border-l-emerald-500",
  van_dung: "border-l-purple-500",
};

// ============ Drag and Drop Components ============

interface DraggableItemProps {
  value: string;
  label: string;
  isSelected: boolean;
  onDragStart: (e: React.DragEvent, value: string) => void;
  onClick: () => void;
  colorClass?: string;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  value,
  label,
  isSelected,
  onDragStart,
  onClick,
  colorClass = "bg-slate-50 dark:bg-slate-700",
}) => {
  return (
    <div
      draggable={!isSelected}
      onDragStart={(e) => onDragStart(e, value)}
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
        transition-all select-none border
        ${isSelected 
          ? "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-600 border-slate-200 dark:border-slate-500" 
          : `${colorClass} hover:bg-slate-100 dark:hover:bg-slate-600 border-slate-200 dark:border-slate-600`
        }
      `}
    >
      {!isSelected && (
        <GripVertical className="w-3 h-3 text-slate-400 flex-shrink-0" />
      )}
      <span className={`flex-1 ${isSelected ? "text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>
        {label}
      </span>
      {!isSelected && (
        <Plus className="w-3 h-3 text-slate-400" />
      )}
    </div>
  );
};

interface DropZoneProps {
  title: string;
  items: string[];
  onDrop: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder: string;
  type: "method" | "technique";
}

const DropZone: React.FC<DropZoneProps> = ({
  title,
  items,
  onDrop,
  onRemove,
  placeholder,
  type,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const value = e.dataTransfer.getData("text/plain");
    if (value && !items.includes(value)) {
      onDrop(value);
    }
  };

  const isMethod = type === "method";

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
        {title}
      </label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          min-h-[60px] p-2 border-2 border-dashed transition-all
          ${isDragOver 
            ? isMethod 
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" 
              : "border-purple-400 bg-purple-50 dark:bg-purple-900/20"
            : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50"
          }
        `}
      >
        {items.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-3">
            {placeholder}
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {items.map((item) => (
              <span
                key={item}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 text-xs font-medium
                  ${isMethod 
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                    : "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700"
                  }
                `}
              >
                <span>{item}</span>
                <button
                  onClick={() => onRemove(item)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface DragDropSelectorProps {
  methodsSelected: string[];
  techniquesSelected: string[];
  onMethodsChange: (methods: string[], methodsContent: { [key: string]: string }) => void;
  onTechniquesChange: (techniques: string[], techniquesContent: { [key: string]: string }) => void;
  availableMethods: { value: string; label: string; content?: string | null }[];
  availableTechniques: { value: string; label: string; content?: string | null }[];
  loadingData?: boolean;
  currentMethodsContent?: { [key: string]: string };
  currentTechniquesContent?: { [key: string]: string };
}

const DragDropSelector: React.FC<DragDropSelectorProps> = ({
  methodsSelected,
  techniquesSelected,
  onMethodsChange,
  onTechniquesChange,
  availableMethods,
  availableTechniques,
  loadingData = false,
  currentMethodsContent = {},
  currentTechniquesContent = {},
}) => {
  const handleDragStart = (e: React.DragEvent, value: string) => {
    e.dataTransfer.setData("text/plain", value);
    e.dataTransfer.effectAllowed = "copy";
  };

  const addMethod = (value: string) => {
    if (!methodsSelected.includes(value)) {
      const newMethods = [...methodsSelected, value];
      // Tìm content của method được chọn
      const method = availableMethods.find(m => m.value === value);
      const newContent = { ...currentMethodsContent };
      if (method?.content) {
        newContent[value] = method.content;
      }
      onMethodsChange(newMethods, newContent);
    }
  };

  const removeMethod = (value: string) => {
    const newMethods = methodsSelected.filter((m) => m !== value);
    const newContent = { ...currentMethodsContent };
    delete newContent[value];
    onMethodsChange(newMethods, newContent);
  };

  const addTechnique = (value: string) => {
    if (!techniquesSelected.includes(value)) {
      const newTechniques = [...techniquesSelected, value];
      // Tìm content của technique được chọn
      const technique = availableTechniques.find(t => t.value === value);
      const newContent = { ...currentTechniquesContent };
      if (technique?.content) {
        newContent[value] = technique.content;
      }
      onTechniquesChange(newTechniques, newContent);
    }
  };

  const removeTechnique = (value: string) => {
    const newTechniques = techniquesSelected.filter((t) => t !== value);
    const newContent = { ...currentTechniquesContent };
    delete newContent[value];
    onTechniquesChange(newTechniques, newContent);
  };

  // Dùng dữ liệu từ API nếu có, nếu không thì fallback về hardcode
  const methodsToShow = availableMethods.length > 0 ? availableMethods : TEACHING_METHODS;
  const techniquesToShow = availableTechniques.length > 0 ? availableTechniques : TEACHING_TECHNIQUES;

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
        <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left: Available items */}
      <div className="space-y-4">
        {/* Methods */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
            Phương pháp dạy học
          </label>
          <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1 border border-slate-200 dark:border-slate-600">
            {methodsToShow.length === 0 ? (
              <p className="text-xs text-slate-400 p-2">Chưa có phương pháp nào</p>
            ) : (
              methodsToShow.map((method) => (
                <DraggableItem
                  key={method.value}
                  value={method.value}
                  label={method.label}
                  isSelected={methodsSelected.includes(method.value)}
                  onDragStart={handleDragStart}
                  onClick={() => addMethod(method.value)}
                  colorClass="bg-white dark:bg-slate-700"
                />
              ))
            )}
          </div>
        </div>

        {/* Techniques */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
            Kỹ thuật dạy học
          </label>
          <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1 border border-slate-200 dark:border-slate-600">
            {techniquesToShow.length === 0 ? (
              <p className="text-xs text-slate-400 p-2">Chưa có kỹ thuật nào</p>
            ) : (
              techniquesToShow.map((technique) => (
                <DraggableItem
                  key={technique.value}
                  value={technique.value}
                  label={technique.label}
                  isSelected={techniquesSelected.includes(technique.value)}
                  onDragStart={handleDragStart}
                  onClick={() => addTechnique(technique.value)}
                  colorClass="bg-white dark:bg-slate-700"
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right: Drop zones */}
      <div className="space-y-4">
        <DropZone
          title="Phương pháp đã chọn"
          items={methodsSelected}
          onDrop={addMethod}
          onRemove={removeMethod}
          placeholder="Kéo thả hoặc click để thêm"
          type="method"
        />
        <DropZone
          title="Kỹ thuật đã chọn"
          items={techniquesSelected}
          onDrop={addTechnique}
          onRemove={removeTechnique}
          placeholder="Kéo thả hoặc click để thêm"
          type="technique"
        />
      </div>
    </div>
  );
};

interface ActivityCardProps {
  activity: ActivityConfig;
  index: number;
  chiMucOptions?: ChiMucInfo[];
  onUpdate: (activity: ActivityConfig) => void;
  isExpanded: boolean;
  onToggle: () => void;
  availableMethods: { value: string; label: string }[];
  availableTechniques: { value: string; label: string }[];
  loadingData?: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  index,
  chiMucOptions,
  onUpdate,
  isExpanded,
  onToggle,
  availableMethods,
  availableTechniques,
  loadingData,
}) => {
  const Icon = ACTIVITY_ICONS[activity.activity_type];
  const colorClass = ACTIVITY_COLORS[activity.activity_type];
  const borderClass = ACTIVITY_BORDER[activity.activity_type];

  return (
    <div className={`border border-slate-200 dark:border-slate-700 overflow-hidden border-l-4 ${borderClass} ${isExpanded ? "bg-slate-50 dark:bg-slate-800/50" : "bg-white dark:bg-slate-800"}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className={`p-1.5 ${colorClass}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="font-medium text-slate-800 dark:text-white text-sm">
            {activity.activity_name}
          </h4>
          {activity.chi_muc && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {activity.chi_muc}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-blue-600 dark:text-blue-400">
              {activity.selected_methods.length} PP
            </span>
            <span className="text-xs text-slate-300">|</span>
            <span className="text-xs text-purple-600 dark:text-purple-400">
              {activity.selected_techniques.length} KT
            </span>
          </div>
        </div>
        <div className="p-1">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          {/* Drag and Drop Selector for Methods & Techniques */}
          <DragDropSelector
            methodsSelected={activity.selected_methods}
            techniquesSelected={activity.selected_techniques}
            onMethodsChange={(methods, methodsContent) =>
              onUpdate({ 
                ...activity, 
                selected_methods: methods,
                methods_content: methodsContent
              })
            }
            onTechniquesChange={(techniques, techniquesContent) =>
              onUpdate({ 
                ...activity, 
                selected_techniques: techniques,
                techniques_content: techniquesContent
              })
            }
            availableMethods={availableMethods}
            availableTechniques={availableTechniques}
            loadingData={loadingData}
            currentMethodsContent={activity.methods_content || {}}
            currentTechniquesContent={activity.techniques_content || {}}
          />
        </div>
      )}
    </div>
  );
};

export const ActivityConfigPanel: React.FC<ActivityConfigPanelProps> = ({
  lessonDetail,
  activities,
  onActivitiesChange,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  
  // Lấy phương pháp và kỹ thuật từ API
  const { methods, techniques, loading: loadingTeachingData } = useTeachingData();

  // Build activities list including chi_muc sub-activities
  const buildActivitiesList = useCallback((): ActivityConfig[] => {
    const result: ActivityConfig[] = [];
    
    // Khởi động
    result.push({
      activity_name: "Hoạt động 1: Khởi động",
      activity_type: "khoi_dong",
      selected_methods: [],
      selected_techniques: [],
    });

    // Hình thành kiến thức - tạo theo từng chỉ mục
    if (lessonDetail.chi_muc_list && lessonDetail.chi_muc_list.length > 0) {
      lessonDetail.chi_muc_list.forEach((cm, idx) => {
        result.push({
          activity_name: `Hoạt động 2.${idx + 1}: Hình thành kiến thức`,
          activity_type: "hinh_thanh_kien_thuc",
          chi_muc: cm.content,
          selected_methods: [],
          selected_techniques: [],
        });
      });
    } else {
      result.push({
        activity_name: "Hoạt động 2: Hình thành kiến thức",
        activity_type: "hinh_thanh_kien_thuc",
        selected_methods: [],
        selected_techniques: [],
      });
    }

    // Luyện tập
    result.push({
      activity_name: "Hoạt động 3: Luyện tập",
      activity_type: "luyen_tap",
      selected_methods: [],
      selected_techniques: [],
    });

    // Vận dụng
    result.push({
      activity_name: "Hoạt động 4: Vận dụng",
      activity_type: "van_dung",
      selected_methods: [],
      selected_techniques: [],
    });

    return result;
  }, [lessonDetail]);

  // Initialize activities when lesson changes
  React.useEffect(() => {
    if (lessonDetail && activities.length === 0) {
      onActivitiesChange(buildActivitiesList());
    }
  }, [lessonDetail, activities.length, onActivitiesChange, buildActivitiesList]);

  const handleActivityUpdate = (index: number, updated: ActivityConfig) => {
    const newActivities = [...activities];
    newActivities[index] = updated;
    onActivitiesChange(newActivities);
  };

  const handleResetActivities = () => {
    onActivitiesChange(buildActivitiesList());
  };

  return (
    <div className="space-y-3">
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
            Danh sách hoạt động dạy học
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click vào từng hoạt động để chọn phương pháp và kỹ thuật
          </p>
        </div>
        <button
          onClick={handleResetActivities}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Đặt lại
        </button>
      </div>

      {/* Activities List */}
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <ActivityCard
            key={`${activity.activity_type}-${index}`}
            activity={activity}
            index={index}
            chiMucOptions={lessonDetail.chi_muc_list}
            onUpdate={(updated) => handleActivityUpdate(index, updated)}
            isExpanded={expandedIndex === index}
            onToggle={() =>
              setExpandedIndex(expandedIndex === index ? null : index)
            }
            availableMethods={methods}
            availableTechniques={techniques}
            loadingData={loadingTeachingData}
          />
        ))}
      </div>
    </div>
  );
};

export default ActivityConfigPanel;
