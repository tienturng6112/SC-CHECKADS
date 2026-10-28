import { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Search,
  Filter,
  Trash2,
  Eye,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Gauge,
  TrendingUp,
  RefreshCw,
  Layers,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import EvaluationResult from './EvaluationResult';
import { calculateStandardScore } from '../services/scoreCalculator';

export default function History({ onNavigate }) {
  // 1. Khởi tạo State an toàn (Luôn là mảng, không bao giờ null)
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  // 2. Tải danh sách lịch sử từ API backend với Safe Error Handling
  const fetchHistory = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/history');
      if (!res.ok) {
        throw new Error(`Máy chủ phản hồi mã trạng thái HTTP ${res.status}`);
      }
      const json = await res.json().catch(() => null);
      if (json && json.success && Array.isArray(json.data)) {
        setHistoryList(json.data);
      } else {
        setHistoryList([]);
        if (json?.error) {
          setFetchError(json.error);
        }
      }
    } catch (err) {
      console.error('[History] Lỗi khi tải lịch sử thẩm định:', err);
      setHistoryList([]);
      setFetchError('Không thể tải lịch sử thẩm định từ máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Xóa 1 bản ghi an toàn
  const handleDeleteRecord = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/history?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHistoryList((prev) => (Array.isArray(prev) ? prev.filter((item) => item?.id !== id) : []));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error('[History] Lỗi khi xóa bản ghi lịch sử:', err);
    }
  };

  // Xóa toàn bộ lịch sử an toàn
  const handleClearAll = async () => {
    try {
      const res = await fetch('/api/history?clearAll=true', {
        method: 'DELETE',
      });
      if (res.ok) {
        setHistoryList([]);
        setShowClearAllModal(false);
      }
    } catch (err) {
      console.error('[History] Lỗi khi xóa toàn bộ lịch sử:', err);
    }
  };

  // 3. Tính toán số liệu thống kê an toàn (Không bao giờ crash khi dữ liệu thiếu trường)
  const stats = useMemo(() => {
    const list = Array.isArray(historyList) ? historyList : [];
    const total = list.length;
    if (total === 0) return { total: 0, avgScore: 0, passCount: 0, warnCount: 0 };

    let sumScore = 0;
    let passCount = 0;
    let warnCount = 0;

    list.forEach((item) => {
      if (!item) return;
      try {
        const scoreInfo = calculateStandardScore(item?.result);
        const rawScore = Number(scoreInfo?.finalScore ?? item?.result?.totalScore ?? item?.result?.score ?? 0);
        const score = isNaN(rawScore) ? 0 : Math.max(0, Math.min(100, Math.round(rawScore)));
        sumScore += score;
        if (score >= 75) passCount++;
        const warnings = item?.result?.warnings;
        if (Array.isArray(warnings) && warnings.length > 0) {
          warnCount += warnings.length;
        }
      } catch (e) {
        console.warn('[History] Lỗi tính điểm cho thống kê:', e);
      }
    });

    const avgScore = total > 0 ? Math.round(sumScore / total) : 0;
    return { total, avgScore, passCount, warnCount };
  }, [historyList]);

  // 4. Bộ lọc tìm kiếm an toàn (Optional Chaining toàn diện)
  const filteredList = useMemo(() => {
    const list = Array.isArray(historyList) ? historyList : [];
    return list.filter((item) => {
      if (!item) return false;

      // 1. Tìm theo từ khóa
      const kw = searchKeyword.trim().toLowerCase();
      if (kw) {
        const cap = (item?.caption || '').toLowerCase();
        const sum = (item?.result?.summary || '').toLowerCase();
        if (!cap.includes(kw) && !sum.includes(kw)) {
          return false;
        }
      }

      // 2. Lọc theo nền tảng
      if (selectedPlatform !== 'all') {
        const chId = item?.channel?.id || (typeof item?.channel === 'string' ? item.channel.toLowerCase() : '');
        if (!chId.includes(selectedPlatform.toLowerCase())) {
          return false;
        }
      }

      // 3. Lọc theo trạng thái điểm chuẩn hóa
      const scoreInfo = calculateStandardScore(item?.result);
      const rawScore = Number(scoreInfo?.finalScore ?? item?.result?.totalScore ?? item?.result?.score ?? 0);
      const itemScore = isNaN(rawScore) ? 0 : rawScore;

      if (selectedStatus === 'pass') {
        if (itemScore < 75) return false;
      } else if (selectedStatus === 'warning') {
        if (itemScore >= 75) return false;
      }

      return true;
    });
  }, [historyList, searchKeyword, selectedPlatform, selectedStatus]);

  // 5. NẾU ĐANG CHỌN XEM CHI TIẾT 1 BẢN GHI
  if (selectedRecord) {
    const framesToDisplay =
      Array.isArray(selectedRecord?.frames) && selectedRecord.frames.length > 0
        ? selectedRecord.frames
        : selectedRecord?.thumbnail
        ? [selectedRecord.thumbnail]
        : [];

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        {/* Thanh điều hướng quay lại */}
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => setSelectedRecord(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#131826] hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/80 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Quay lại danh sách lịch sử</span>
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161f30] border border-slate-700/60 text-white font-medium">
              <span className={`w-2 h-2 rounded-full ${selectedRecord?.channel?.dotColor || 'bg-blue-500'}`} />
              <span>{selectedRecord?.channel?.label || 'Facebook'}</span>
            </span>
            <span className="font-mono text-slate-500">{selectedRecord?.createdAtFormatted || 'Vừa xong'}</span>
          </div>
        </div>

        {/* Hiển thị chi tiết bằng EvaluationResult component an toàn */}
        <EvaluationResult
          result={selectedRecord?.result || {}}
          channel={selectedRecord?.channel}
          frames={framesToDisplay}
          onReset={() => setSelectedRecord(null)}
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-16">
      {/* Tiêu đề trang & Nút hành động */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Lịch sử thẩm định</h1>
              <p className="text-xs md:text-sm text-slate-400">
                Xem lại toàn bộ các phiên chấm điểm, cảnh báo vi phạm và đề xuất cải thiện.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchHistory}
            title="Làm mới danh sách"
            className="p-2.5 rounded-xl bg-[#0d111a] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {Array.isArray(historyList) && historyList.length > 0 && (
            <button
              onClick={() => setShowClearAllModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-950/25 hover:bg-rose-950/50 border border-rose-500/25 text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa tất cả</span>
            </button>
          )}

          <button
            onClick={() => onNavigate && onNavigate('evaluate')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-opacity cursor-pointer"
          >
            <Gauge className="w-4 h-4" />
            <span>Đánh giá ad mới</span>
          </button>
        </div>
      </div>

      {/* Thông báo lỗi nhẹ nhàng nếu không fetch được */}
      {fetchError && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs text-amber-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={fetchHistory}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold cursor-pointer shrink-0"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 4 Thẻ Thống Kê Nhanh */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Thẻ 1: Tổng số */}
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Tổng lượt chấm</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">{stats.total}</p>
          <p className="text-[11px] text-slate-500">Lưu trữ tối đa 100 phiên gần nhất</p>
        </div>

        {/* Thẻ 2: Điểm trung bình */}
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Điểm trung bình</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-extrabold font-mono ${
                stats.avgScore >= 75 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {stats.avgScore}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500">Trên toàn bộ chiến dịch</p>
        </div>

        {/* Thẻ 3: Đạt chuẩn */}
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Đạt chuẩn an toàn</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-cyan-400 font-mono">
            {stats.passCount}{' '}
            <span className="text-xs text-slate-500 font-normal">
              ({stats.total > 0 ? Math.round((stats.passCount / stats.total) * 100) : 0}%)
            </span>
          </p>
          <p className="text-[11px] text-slate-500">Điểm tổng quan ≥ 75</p>
        </div>

        {/* Thẻ 4: Cảnh báo vi phạm */}
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Tổng cảnh báo luật</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-400 font-mono">{stats.warnCount}</p>
          <p className="text-[11px] text-slate-500">Vấn đề chính sách được AI bắt</p>
        </div>
      </div>

      {/* Thanh Tìm Kiếm & Bộ Lọc */}
      <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo từ khóa caption, nội dung tóm tắt, sản phẩm..."
              className="w-full rounded-xl bg-[#07090e] border border-slate-800/90 focus:border-indigo-500/60 pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Nhóm bộ lọc */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Lọc nền tảng */}
            <div className="inline-flex items-center p-1 rounded-xl bg-[#07090e] border border-slate-800/90 text-xs">
              {[
                { id: 'all', label: 'Tất cả kênh' },
                { id: 'facebook', label: 'Facebook' },
                { id: 'tiktok', label: 'TikTok' },
                { id: 'google', label: 'Google' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedPlatform === p.id
                      ? 'bg-[#151c2e] text-white border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Lọc kết quả */}
            <div className="inline-flex items-center p-1 rounded-xl bg-[#07090e] border border-slate-800/90 text-xs">
              {[
                { id: 'all', label: 'Tất cả điểm' },
                { id: 'pass', label: 'An toàn (≥75)' },
                { id: 'warning', label: 'Cần sửa (<75)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStatus(s.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedStatus === s.id
                      ? 'bg-[#151c2e] text-white border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hiển thị số kết quả lọc */}
        {(searchKeyword || selectedPlatform !== 'all' || selectedStatus !== 'all') && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span>
              Tìm thấy <strong className="text-white font-mono">{filteredList.length}</strong> kết quả phù hợp
            </span>
            <button
              onClick={() => {
                setSearchKeyword('');
                setSelectedPlatform('all');
                setSelectedStatus('all');
              }}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* DANH SÁCH BẢN GHI LỊCH SỬ (Safe Rendering & Fallback) */}
      {isLoading ? (
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-12 text-center space-y-3">
          <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Đang tải lịch sử thẩm định...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#141824] border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Chưa có bản ghi lịch sử nào</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchKeyword || selectedPlatform !== 'all' || selectedStatus !== 'all'
                ? 'Không có kết quả phù hợp với bộ lọc hiện tại. Thử thay đổi từ khóa hoặc bộ lọc.'
                : 'Mỗi khi bạn thực hiện thẩm định quảng cáo, kết quả và báo cáo 18 tiêu chí sẽ tự động được lưu lại tại đây.'}
            </p>
          </div>
          {!searchKeyword && selectedPlatform === 'all' && selectedStatus === 'all' && (
            <button
              onClick={() => onNavigate && onNavigate('evaluate')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:opacity-95 transition-opacity cursor-pointer"
            >
              <Gauge className="w-4 h-4" />
              <span>Thẩm định quảng cáo đầu tiên</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredList.map((item, index) => {
            if (!item) return null;
            const isComparison = item?.mode === 'vs-competitor' || item?.result?.isComparison || Boolean(item?.result?.myAdResult);
            const myAdRes = item?.result?.myAdResult;
            const compResults = item?.result?.competitorResults || [];
            const comp0 = compResults[0];

            const targetForScore = myAdRes || item?.result;
            const scoreInfo = calculateStandardScore(targetForScore);
            const rawScore = Number(myAdRes?.totalScore ?? scoreInfo?.finalScore ?? item?.result?.totalScore ?? item?.result?.score ?? 0);
            const score = isNaN(rawScore) ? 0 : Math.max(0, Math.min(100, Math.round(rawScore)));
            const isGood = score >= 75;
            const isPoor = score < 50;

            const compScore = comp0 ? Number(comp0.totalScore ?? 0) : null;
            const scoreDiff = compScore !== null ? score - compScore : 0;

            const statusLabel =
              scoreInfo?.statusLabel ||
              myAdRes?.statusLabel ||
              item?.result?.statusLabel ||
              (score >= 80 ? 'Tốt' : score >= 65 ? 'Khá' : 'Cần cải thiện');

            const scoreBadgeColor =
              scoreInfo?.badgeClass ||
              (isGood
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : isPoor
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400');

            const circleColor =
              scoreInfo?.svgColor ||
              (isGood ? '#22c55e' : isPoor ? '#ef4444' : '#f59e0b');

            const warningsCount = Array.isArray(myAdRes?.warnings)
              ? myAdRes.warnings.length
              : Array.isArray(item?.result?.warnings)
              ? item.result.warnings.length
              : 0;

            const recordId = item?.id || `history_item_${index}`;
            const thumbnailSrc = myAdRes?.frames?.[0] || item?.thumbnail || item?.frames?.[0] || '';
            const channelLabel = item?.channel?.label || 'Ad';
            const channelDotColor = item?.channel?.dotColor || 'bg-blue-500';

            const captionText = isComparison
              ? (myAdRes?.caption ? `"${myAdRes.caption}"` : `So sánh: Ad của tôi vs ${comp0?.name || 'Đối thủ #1'}`)
              : (item?.caption ? `"${item.caption}"` : item?.result?.summary || 'Không có caption');

            const summaryText = isComparison && item?.result?.comparisonSummary?.winningStrategy
              ? item.result.comparisonSummary.winningStrategy
              : (myAdRes?.summary || item?.result?.summary || 'Đã phân tích 18 tiêu chí chính sách và sáng tạo');

            const formattedDate = item?.createdAtFormatted || 'Mới đây';

            return (
              <div
                key={recordId}
                className="rounded-2xl bg-[#0d111a] border border-slate-800/90 hover:border-slate-700/90 p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
              >
                {/* 1. Thumbnail ảnh đại diện */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-black border border-slate-800 shrink-0 flex items-center justify-center">
                    {thumbnailSrc ? (
                      <img
                        src={thumbnailSrc}
                        alt="Thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-slate-600" />
                    )}
                    {/* Badge kênh trên ảnh */}
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-semibold text-slate-300 border border-slate-700/60">
                      {channelLabel}
                    </span>
                  </div>

                  {/* 2. Thông tin tóm tắt */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="font-mono text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formattedDate}</span>
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-cyan-400 font-medium">
                        {item?.mode === 'my-ad'
                          ? 'Chỉ ad của tôi'
                          : item?.mode === 'vs-competitor'
                          ? 'So sánh đối thủ'
                          : item?.mode === 'check-script'
                          ? 'Check kịch bản'
                          : 'Phân tích đối thủ'}
                      </span>
                      {item?.result?.isDemo && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                          DEMO
                        </span>
                      )}
                    </div>

                    {/* Caption trích dẫn */}
                    <p className="text-xs md:text-sm font-semibold text-white line-clamp-1">
                      {captionText}
                    </p>

                    {/* AI Summary ngắn gọn */}
                    <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xl">
                      {summaryText}
                    </p>

                    {/* Cảnh báo vi phạm nếu có */}
                    {warningsCount > 0 ? (
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-400 pt-0.5">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{warningsCount} cảnh báo chính sách cần sửa</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 pt-0.5">
                        <ShieldCheck className="w-3 h-3 shrink-0" />
                        <span>Chính sách an toàn</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Cụm Điểm Số & Nút bấm thao tác */}
                <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                  {/* Khối Điểm số */}
                  <div className="text-right">
                    {isComparison ? (
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-baseline justify-end gap-1">
                          <span
                            className={`text-2xl font-extrabold font-mono ${
                              isPoor ? 'text-rose-400' : isGood ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {isNaN(score) ? 0 : score}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">/100</span>
                          <span className="text-[11px] text-slate-400 font-medium ml-1">(Ad của bạn)</span>
                        </div>
                        {compScore !== null && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <span>vs</span>
                            <span className="font-mono font-bold text-slate-200">{compScore}đ</span>
                            <span className="text-slate-500 truncate max-w-[120px]">({comp0?.name || 'Đối thủ #1'})</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${scoreBadgeColor}`}
                          >
                            {statusLabel}
                          </span>
                          {scoreDiff > 0 ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              Thắng (+{scoreDiff}đ)
                            </span>
                          ) : scoreDiff < 0 ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400">
                              Thua ({scoreDiff}đ)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                              Hòa
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-end gap-1">
                          <span
                            className={`text-2xl font-extrabold font-mono ${
                              isPoor
                                ? 'text-rose-400'
                                : isGood
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {isNaN(score) ? 0 : score}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">/100</span>
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${scoreBadgeColor}`}
                        >
                          {statusLabel}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Nút Xem chi tiết */}
                  <button
                    onClick={() => setSelectedRecord(item)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141b2b] hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem chi tiết</span>
                  </button>

                  {/* Nút Xóa bản ghi */}
                  <button
                    onClick={() => setDeleteConfirmId(item?.id)}
                    title="Xóa bản ghi này"
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA 1 BẢN GHI */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-[#05070b]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0d111a] border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Xác nhận xóa bản ghi?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bản ghi thẩm định này sẽ bị xóa vĩnh viễn khỏi danh sách lịch sử.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[#121624] hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteRecord(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA TẤT CẢ */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 bg-[#05070b]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0d111a] border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Xác nhận xóa toàn bộ lịch sử?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tất cả {Array.isArray(historyList) ? historyList.length : 0} bản ghi thẩm định quảng cáo sẽ bị xóa hoàn toàn khỏi file lưu trữ.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2 rounded-xl bg-[#121624] hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
