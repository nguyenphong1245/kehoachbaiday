import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Share2, 
  Trash2, 
  Eye, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  getMySharedWorksheets,
  getWorksheetResponses,
  deleteSharedWorksheet,
  toggleWorksheetActive,
  type SharedWorksheet,
  type WorksheetResponseItem,
} from "@/services/worksheetService";

const WorksheetManagementPage: React.FC = () => {
  const [worksheets, setWorksheets] = useState<SharedWorksheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Response viewing
  const [expandedWorksheet, setExpandedWorksheet] = useState<number | null>(null);
  const [responses, setResponses] = useState<Record<number, WorksheetResponseItem[]>>({});
  const [loadingResponses, setLoadingResponses] = useState<number | null>(null);
  
  // Copy state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Action states
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadWorksheets = async () => {
    try {
      setIsLoading(true);
      const { worksheets: data } = await getMySharedWorksheets();
      setWorksheets(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Lỗi khi tải danh sách");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorksheets();
  }, []);

  const handleCopyLink = async (worksheet: SharedWorksheet) => {
    await navigator.clipboard.writeText(worksheet.share_url);
    setCopiedCode(worksheet.share_code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleViewResponses = async (worksheetId: number) => {
    if (expandedWorksheet === worksheetId) {
      setExpandedWorksheet(null);
      return;
    }
    
    setExpandedWorksheet(worksheetId);
    
    if (!responses[worksheetId]) {
      setLoadingResponses(worksheetId);
      try {
        const data = await getWorksheetResponses(worksheetId);
        setResponses(prev => ({
          ...prev,
          [worksheetId]: data.responses
        }));
      } catch (err) {
        console.error("Failed to load responses:", err);
      } finally {
        setLoadingResponses(null);
      }
    }
  };

  const handleDelete = async (worksheetId: number) => {
    if (!confirm("Bạn có chắc muốn xóa phiếu học tập này? Tất cả câu trả lời của học sinh cũng sẽ bị xóa.")) {
      return;
    }
    
    setDeletingId(worksheetId);
    try {
      await deleteSharedWorksheet(worksheetId);
      setWorksheets(prev => prev.filter(w => w.id !== worksheetId));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Lỗi khi xóa");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (worksheetId: number) => {
    setTogglingId(worksheetId);
    try {
      const { is_active } = await toggleWorksheetActive(worksheetId);
      setWorksheets(prev => prev.map(w => 
        w.id === worksheetId ? { ...w, is_active } : w
      ));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Lỗi khi thay đổi trạng thái");
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-sky-500 mx-auto" />
          <p className="mt-3 text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              Phiếu học tập đã chia sẻ
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Quản lý và xem câu trả lời của học sinh
            </p>
          </div>
          
          <button
            onClick={loadWorksheets}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Làm mới"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {worksheets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Chưa có phiếu học tập nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tạo KHBD và chia sẻ phiếu học tập để bắt đầu
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {worksheets.map((worksheet) => (
              <div
                key={worksheet.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              >
                {/* Main row */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side - Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {worksheet.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            worksheet.is_active
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {worksheet.is_active ? "Đang mở" : "Đã tắt"}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(worksheet.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {worksheet.response_count} bài nộp
                        </span>
                        {worksheet.expires_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Hết hạn: {formatDate(worksheet.expires_at)}
                          </span>
                        )}
                      </div>
                      
                      {/* Share link */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-400">Link:</span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                          {worksheet.share_code}
                        </code>
                        <button
                          onClick={() => handleCopyLink(worksheet)}
                          className="p-1 text-gray-400 hover:text-sky-500 transition-colors"
                          title="Sao chép link"
                        >
                          {copiedCode === worksheet.share_code ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={worksheet.share_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-sky-500 transition-colors"
                          title="Mở trang"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    
                    {/* Right side - Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(worksheet.id)}
                        disabled={togglingId === worksheet.id}
                        className={`p-2 rounded-lg transition-colors ${
                          worksheet.is_active
                            ? "text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30"
                            : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        title={worksheet.is_active ? "Tắt chia sẻ" : "Mở chia sẻ"}
                      >
                        {togglingId === worksheet.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : worksheet.is_active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleViewResponses(worksheet.id)}
                        className="p-2 text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                        title="Xem bài nộp"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(worksheet.id)}
                        disabled={deletingId === worksheet.id}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        {deletingId === worksheet.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded responses section */}
                {expandedWorksheet === worksheet.id && (
                  <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="p-5">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-sky-500" />
                        Bài làm của học sinh ({worksheet.response_count})
                      </h4>
                      
                      {loadingResponses === worksheet.id ? (
                        <div className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-sky-500 mx-auto" />
                          <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
                        </div>
                      ) : responses[worksheet.id]?.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Chưa có học sinh nào nộp bài</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {responses[worksheet.id]?.map((response) => (
                            <div
                              key={response.id}
                              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900/40 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">
                                      {response.student_name}
                                    </p>
                                    {response.student_class && (
                                      <p className="text-xs text-gray-500">
                                        Lớp: {response.student_class}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatDate(response.submitted_at)}
                                </span>
                              </div>
                              
                              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-3">
                                {Object.entries(response.answers).map(([key, value]) => (
                                  <div key={key}>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      {key === 'general_answer' ? 'Bài làm:' : `Câu ${key.replace('q_', '').replace('q', '')}:`}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                      {value || <span className="italic text-gray-400">(Chưa trả lời)</span>}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorksheetManagementPage;
