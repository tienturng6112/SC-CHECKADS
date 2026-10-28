import { useState, useMemo } from 'react';
import { calculateStandardScore } from '../services/scoreCalculator';
import {
  FileText,
  Plus,
  Film,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Check,
  Search,
  Trophy,
  Sparkles,
  Layers,
  Copy,
  ArrowRight,
  TrendingUp,
  Crown,
  Eye,
  CheckCircle2,
  XCircle,
  Minus
} from 'lucide-react';

const defaultFrames = [
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1512290900672-1f88d1214b62?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
];

// Component Thanh Điểm 5 Vạch
function SegmentedScoreItem({ title, score, comment }) {
  let activeBarColor = 'bg-emerald-500';
  let scoreTextColor = 'text-emerald-400';

  if (score <= 2) {
    activeBarColor = 'bg-rose-500';
    scoreTextColor = 'text-rose-400';
  } else if (score === 3) {
    activeBarColor = 'bg-amber-500';
    scoreTextColor = 'text-amber-400';
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-xs md:text-[13px] font-bold text-white leading-snug">{title}</h4>
        <div className="text-xs font-mono shrink-0">
          <span className={`font-bold ${scoreTextColor}`}>{score}</span>
          <span className="text-slate-500">/5</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`h-2 rounded-full transition-all ${
              step <= score ? activeBarColor : 'bg-[#1a2234]'
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">{comment}</p>
    </div>
  );
}

// ========================================================
// 1. GIAO DIỆN BÁO CÁO CHI TIẾT 1 AD (SINGLE AD VIEW)
// ========================================================
function SingleAdEvaluationView({ result, channel, frames, onReset, isSubView = false }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const scoreData = useMemo(() => calculateStandardScore(result), [result]);
  const score = scoreData.finalScore;
  const statusLabel = scoreData.statusLabel;
  const svgColor = scoreData.svgColor;
  const textColor = scoreData.textColor;
  const badgeClass = scoreData.badgeClass;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const framesToDisplay =
    Array.isArray(frames) && frames.length > 0
      ? frames
      : Array.isArray(result?.frames) && result.frames.length > 0
      ? result.frames
      : defaultFrames;

  const handleCopyVariant = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Khối Điểm tổng quan & Dải khung hình */}
      <div
        className={`relative rounded-2xl border border-slate-800/90 p-6 md:p-8 space-y-6 overflow-hidden ${
          scoreData.level === 'good'
            ? 'bg-gradient-to-br from-[#0d111a] via-[#0d141c] to-[#0c2622]'
            : scoreData.level === 'fair'
            ? 'bg-gradient-to-br from-[#0d111a] via-[#0e1626] to-[#0d1e30]'
            : scoreData.level === 'warning'
            ? 'bg-gradient-to-br from-[#191516] via-[#12131c] to-[#0d111a]'
            : 'bg-gradient-to-br from-[#241113] via-[#161218] to-[#0d111a]'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Vòng tròn điểm SVG */}
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r={radius} stroke="#1c2230" strokeWidth="10" fill="transparent" />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={svgColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ filter: `drop-shadow(0 0 10px ${svgColor}66)` }}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-extrabold leading-none ${textColor}`}>{score}</span>
              <span className="text-[11px] font-mono text-slate-400 mt-1">/ 100</span>
            </div>
          </div>

          {/* Thông tin tóm tắt Ad */}
          <div className="space-y-2.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badgeClass}`}>
                {statusLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium px-1">
                <span className={`w-2 h-2 rounded-full ${channel?.dotColor || 'bg-blue-500'}`} />
                <span>{channel?.label || 'Facebook'}</span>
              </span>
              {result?.isDemo ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  <span>DEMO GIẢ LẬP</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Vision Thẩm Định 2026</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>Nhóm A (Luật): <strong className="text-emerald-400">{scoreData.sumA}/45</strong></span>
              <span>·</span>
              <span>Nhóm B (Sáng tạo): <strong className="text-cyan-400">{scoreData.sumB}/45</strong></span>
              {scoreData.penalty > 0 && (
                <>
                  <span>·</span>
                  <span className="text-rose-400 font-semibold">Phạt lỗi nghiêm trọng 1/5: -{scoreData.penalty}đ</span>
                </>
              )}
            </div>

            <h2 className="text-base font-bold text-white">{result?.name || 'Chi tiết nội dung quảng cáo'}</h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {result?.summary || 'Đã phân tích 18 tiêu chí chính sách và hiệu quả sáng tạo.'}
            </p>
          </div>
        </div>

        {/* Dải khung hình trích xuất HOẶC Kịch bản gốc đã kiểm duyệt */}
        {result?.mode === 'check-script' || result?.isScript ? (
          <div className="border-t border-slate-800/80 pt-5 space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nội dung kịch bản gốc đã kiểm duyệt tiền sản xuất</span>
            </div>
            <div className="rounded-xl bg-[#07090e] border border-slate-800 p-4">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {result?.caption || result?.summary || 'Nội dung kịch bản quảng cáo đã được kiểm duyệt an toàn.'}
              </pre>
            </div>
          </div>
        ) : (
          <div className="border-t border-slate-800/80 pt-5 space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Film className="w-3.5 h-3.5" />
              <span>Khung hình video đã trích xuất ({framesToDisplay.length} frames)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {framesToDisplay.map((src, idx) => (
                <div key={idx} className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 bg-[#07090e] relative group">
                  <img src={src} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Khối Cảnh báo chính sách */}
      {result?.warnings && result.warnings.length > 0 && (
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Cảnh báo chính sách & pháp lý ({result.warnings.length})</h3>
            </div>
          </div>
          {(result?.warnings || []).map((warn, idx) => {
            const isHigh = warn.level === 'Cao';
            return (
              <div key={idx} className={`rounded-xl p-4 flex items-start gap-3 border ${isHigh ? 'bg-[#191219] border-rose-500/30' : 'bg-[#141418] border-amber-500/30'}`}>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{warn.legalBasisTitle || 'Quy chuẩn quảng cáo 2026'}</span>
                    {warn.legalCode && <span className="font-mono text-slate-400 text-[11px]">({warn.legalCode})</span>}
                  </div>
                  <p className="text-slate-300 leading-relaxed">{warn.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Bảng 18 Tiêu chí chi tiết */}
      <div className="space-y-6">
        {/* Bảng Nhóm A */}
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Bảng A: Tuân thủ chính sách & pháp luật 2026</h3>
                <p className="text-xs text-slate-400">9 tiêu chí bảo vệ tài khoản, tránh bị Meta/TikTok/Google khóa</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-emerald-400 font-mono">{scoreData.sumA}</span>
              <span className="text-xs text-slate-500 font-mono">/45</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {(result?.groupAResults || []).map((item, index) => (
              <SegmentedScoreItem key={index} title={`A${index + 1}. ${item.title}`} score={item.score} comment={item.comment} />
            ))}
          </div>
        </div>

        {/* Bảng Nhóm B */}
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Bảng B: Chất lượng sáng tạo & Chuyển đổi</h3>
                <p className="text-xs text-slate-400">9 tiêu chí tối ưu tỷ lệ giữ chân (Retention) và ra đơn</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-cyan-400 font-mono">{scoreData.sumB}</span>
              <span className="text-xs text-slate-500 font-mono">/45</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {(result?.groupBResults || []).map((item, index) => (
              <SegmentedScoreItem key={index} title={`B${index + 1}. ${item.title}`} score={item.score} comment={item.comment} />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Hai cột Ưu điểm & Nhược điểm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Ưu điểm nổi bật</span>
          </div>
          <ul className="space-y-2.5 text-xs md:text-[13px] text-slate-200">
            {(result?.pros || []).map((p, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Nhược điểm cần khắc phục</span>
          </div>
          <ul className="space-y-2.5 text-xs md:text-[13px] text-slate-200">
            {(result?.cons || []).map((c, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. Gợi ý 3 Kịch bản viết lại */}
      {result?.finalSummary?.variants && result.finalSummary.variants.length > 0 && (
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              {result?.mode === 'check-script' || result?.isScript
                ? '3 Kịch bản phân cảnh viết lại (Storyboard sản xuất chuẩn NĐ 342/2025)'
                : '3 Kịch bản viết lại tối ưu (Đã sửa sạch vi phạm)'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {result?.mode === 'check-script' || result?.isScript
                ? 'Được phân chia 4 giai đoạn [0-3s Hook, 3-15s Vấn đề & Giải pháp, 15-25s Trải nghiệm & Bằng chứng, 25-30s CTA] cho ekip bấm máy an toàn.'
                : 'Giữ nguyên sản phẩm/ưu đãi thực tế, chuyển câu mở đầu sang storytelling khách quan.'}
            </p>
          </div>
          <div className="space-y-3.5">
            {(result?.finalSummary?.variants || []).map((v, idx) => (
              <div key={idx} className="rounded-xl bg-[#080b12] border border-slate-800/90 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold">
                    {v.tag}
                  </span>
                  <button
                    onClick={() => handleCopyVariant(v.content, idx)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121723] hover:bg-slate-800 text-slate-300 border border-slate-700/70 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedIndex === idx ? 'Đã copy' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {v.content}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================================
// 2. GIAO DIỆN SO SÁNH ĐỐI ĐẦU ĐA VIDEO (COMPARISON OVERVIEW)
// ========================================================
function ComparisonOverviewView({ result, channel, onReset }) {
  const [selectedCompIdx, setSelectedCompIdx] = useState(0);
  const [copiedVariantIdx, setCopiedVariantIdx] = useState(null);

  const myAdResult = result?.myAdResult;
  const competitorResults = result?.competitorResults || [];
  const summary = result?.comparisonSummary || {};
  const leaderboard = summary.leaderboard || [];
  const winner = summary.winner || leaderboard[0] || {};
  const scoreDiff = summary.scoreDiff || 0;
  const activeCompetitor = competitorResults[selectedCompIdx] || competitorResults[0];

  const handleCopyVariant = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedVariantIdx(idx);
    setTimeout(() => setCopiedVariantIdx(null), 2000);
  };

  return (
    <div className="space-y-7">
      {/* 1. HEADER ĐỐI ĐẦU & BẢNG XẾP HẠNG (LEADERBOARD) */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0d111a] via-[#121626] to-[#090d16] border border-slate-800/90 p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
                HEAD-TO-HEAD AUDIT
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {myAdResult ? 'Ad của tôi vs Đối thủ' : 'Phân tích & Xếp hạng đối thủ'}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Chấm độc lập từng video theo 18 tiêu chí 2026 · Xếp hạng leaderboard & đối chiếu trực diện
            </p>
          </div>

          {/* Banner kết quả so sánh */}
          {myAdResult && (
            <div
              className={`px-4 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-2 ${
                scoreDiff > 0
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : scoreDiff < 0
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              }`}
            >
              <Trophy className="w-4 h-4 shrink-0" />
              <span>
                {scoreDiff > 0
                  ? `BẠN ĐANG DẪN TRƯỚC ĐỐI THỦ: +${scoreDiff} ĐIỂM`
                  : scoreDiff < 0
                  ? `ĐANG KÉM ĐỐI THỦ: ${scoreDiff} ĐIỂM`
                  : 'HAI BÊN ĐANG CÂN BẰNG ĐIỂM SỐ'}
              </span>
            </div>
          )}
        </div>

        {/* Lưới các thẻ video đối đầu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Thẻ Ad của tôi (nếu có) */}
          {myAdResult && (
            <div
              className={`rounded-2xl p-5 border relative overflow-hidden transition-all ${
                winner.isMyAd
                  ? 'bg-[#0e1726] border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                  : 'bg-[#0d111a] border-slate-800'
              }`}
            >
              {winner.isMyAd && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  <span>CHIẾN THẮNG</span>
                </div>
              )}
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">AD CỦA BẠN</span>
              <h3 className="text-base font-bold text-white mt-1 mb-3">{myAdResult.name || 'Ad của tôi'}</h3>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                  {myAdResult.totalScore}
                </span>
                <span className="text-xs text-slate-500 font-mono">/100</span>
                <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  {myAdResult.statusLabel || 'Tốt'}
                </span>
              </div>

              {/* Dải 4 frames của Ad của tôi */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/80">
                {(myAdResult.frames || defaultFrames).slice(0, 4).map((f, i) => (
                  <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-black border border-slate-800">
                    <img src={f} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Các thẻ Ad đối thủ */}
          {competitorResults.map((comp, idx) => {
            const isCompWinner = winner.name === comp.name || winner.id === comp.id;
            return (
              <div
                key={idx}
                className={`rounded-2xl p-5 border relative overflow-hidden transition-all ${
                  isCompWinner
                    ? 'bg-[#151224] border-indigo-500/50 shadow-[0_0_25px_rgba(99,102,241,0.15)]'
                    : 'bg-[#0d111a] border-slate-800'
                }`}
              >
                {isCompWinner && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 text-[10px] font-extrabold flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>CHIẾN THẮNG</span>
                  </div>
                )}
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">ĐỐI THỦ #{idx + 1}</span>
                <h3 className="text-base font-bold text-white mt-1 mb-3">{comp.name}</h3>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-extrabold text-white font-mono">{comp.totalScore}</span>
                  <span className="text-xs text-slate-500 font-mono">/100</span>
                  <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                    {comp.statusLabel || 'Cần cải thiện'}
                  </span>
                </div>

                {/* Dải 4 frames của đối thủ */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/80">
                  {(comp.frames || defaultFrames).slice(0, 4).map((f, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-black border border-slate-800">
                      <img src={f} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. BẢNG ĐẤU 18 TIÊU CHÍ SONG SONG (SIDE-BY-SIDE MATRIX) */}
      {myAdResult && summary.criteriaComparison && summary.criteriaComparison.length > 0 && (
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Bảng đối chiếu 18 tiêu chí song song</h3>
              <p className="text-xs text-slate-400">
                So sánh điểm từng tiêu chí giữa Ad của tôi vs Đối thủ cao điểm nhất
              </p>
            </div>

            {competitorResults.length > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Đối chiếu với:</span>
                <div className="inline-flex rounded-xl bg-[#07090e] p-1 border border-slate-800">
                  {competitorResults.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedCompIdx(i)}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        selectedCompIdx === i
                          ? 'bg-[#151c2e] text-white border border-slate-700'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bảng so sánh trực diện */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 w-1/4">Ad của tôi</th>
                  <th className="py-3 px-4 text-center w-1/5">Kết quả</th>
                  <th className="py-3 px-4 text-center w-1/3">Tiêu chí đánh giá</th>
                  <th className="py-3 px-4 text-right w-1/4">
                    {activeCompetitor?.name || 'Đối thủ'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {summary.criteriaComparison.map((c, idx) => {
                  const isWin = c.status === 'win';
                  const isLose = c.status === 'lose';

                  return (
                    <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                      {/* Cột Điểm của tôi */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              c.myScore >= 4
                                ? 'text-emerald-400'
                                : c.myScore === 3
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {c.myScore}/5
                          </span>
                          <div className="hidden sm:flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <div
                                key={s}
                                className={`w-2 h-1.5 rounded-full ${
                                  s <= c.myScore ? 'bg-emerald-500' : 'bg-slate-800'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Cột Huy hiệu Thắng/Thua */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isWin
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : isLose
                              ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {isWin ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Thắng (+{c.diff})</span>
                            </>
                          ) : isLose ? (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Thua ({c.diff})</span>
                            </>
                          ) : (
                            <>
                              <Minus className="w-3 h-3" />
                              <span>Hòa</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Cột Tên tiêu chí */}
                      <td className="py-3.5 px-4 text-center font-medium text-slate-200">
                        <span className="font-mono text-cyan-400 mr-1.5 font-bold">{c.code}</span>
                        <span>{c.title}</span>
                      </td>

                      {/* Cột Điểm của Đối thủ */}
                      <td className="py-3.5 px-4 font-mono text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="hidden sm:flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <div
                                key={s}
                                className={`w-2 h-1.5 rounded-full ${
                                  s <= c.compScore ? 'bg-indigo-400' : 'bg-slate-800'
                                }`}
                              />
                            ))}
                          </div>
                          <span
                            className={`font-bold text-sm ${
                              c.compScore >= 4
                                ? 'text-indigo-400'
                                : c.compScore === 3
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {c.compScore}/5
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. BÁO CÁO PHÂN TÍCH CẠNH TRANH (COMPETITIVE INTELLIGENCE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Khung 1: Điểm mạnh đối thủ cần học hỏi */}
        <div className="rounded-2xl bg-[#0d111a] border border-cyan-500/30 p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <Zap className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">Thứ đối thủ đang làm tốt hơn bạn</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Các tiêu chí đối thủ đạt điểm cao hơn — điểm bạn nên học hỏi để nâng tỷ lệ chuyển đổi.
          </p>

          <div className="space-y-3 pt-1">
            {(summary.competitorStrengths || []).length > 0 ? (
              summary.competitorStrengths.map((s, idx) => (
                <div key={idx} className="rounded-xl bg-[#090e17] border border-slate-800 p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      <span className="font-mono text-cyan-400 mr-1">{s.code}.</span>
                      {s.title}
                    </span>
                    <span className="font-mono text-indigo-400 font-bold">
                      {s.compScore}/5 <span className="text-slate-500">(bạn: {s.myScore}/5)</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{s.reason}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-emerald-400 italic">
                Tuyệt vời! Quảng cáo của bạn đang ngang bằng hoặc vượt trội đối thủ ở hầu hết các tiêu chí.
              </p>
            )}
          </div>
        </div>

        {/* Khung 2: Rủi ro pháp lý của đối thủ */}
        <div className="rounded-2xl bg-[#0d111a] border border-rose-500/30 p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">Rủi ro pháp lý đối thủ đang dính</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Các tiêu chí Nhóm A đối thủ bị điểm liệt/cảnh báo — TUYỆT ĐỐI KHÔNG bắt chước lỗi này.
          </p>

          <div className="space-y-3 pt-1">
            {(summary.competitorWeaknesses || []).length > 0 ? (
              summary.competitorWeaknesses.map((w, idx) => (
                <div key={idx} className="rounded-xl bg-[#191114] border border-rose-500/25 p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-300">{w.title}</span>
                    <span className="font-mono text-rose-400 font-bold">{w.score}/5</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{w.issue}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">
                Đối thủ kiểm soát pháp lý tương đối tốt, không có lỗi nghiêm trọng ở Nhóm A.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Khung 3: Chiến lược vượt mặt & 3 Kịch bản viết lại */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0d111a] via-[#111425] to-[#161226] border border-indigo-500/30 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Chiến lược lật ngược thế cờ & Vượt mặt đối thủ</h3>
            <p className="text-xs text-slate-400">Kết hợp điểm mạnh của mình + khai thác điểm yếu của đối thủ</p>
          </div>
        </div>

        <p className="text-xs md:text-sm text-slate-200 leading-relaxed bg-[#080b12]/80 p-4 rounded-xl border border-slate-800">
          {summary.winningStrategy ||
            'Tập trung tối ưu Hook 3 giây đầu và đẩy mạnh bằng chứng thực tế khách quan để giành lại ưu thế chuyển đổi.'}
        </p>

        {summary.actionItems && summary.actionItems.length > 0 && (
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-cyan-400">Hành động cần làm ngay:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {summary.actionItems.map((act, i) => (
                <div key={i} className="rounded-xl bg-[#080b12] border border-slate-800 p-3.5 text-xs text-slate-200 flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3 Kịch bản mẫu viết lại */}
        {summary.variants && summary.variants.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-indigo-400">3 Kịch bản viết lại tối ưu để vượt đối thủ:</h4>
            <div className="space-y-3">
              {summary.variants.map((v, idx) => (
                <div key={idx} className="rounded-xl bg-[#080b12] border border-slate-800 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold">
                      {v.tag}
                    </span>
                    <button
                      onClick={() => handleCopyVariant(v.content, idx)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121723] hover:bg-slate-800 text-slate-300 border border-slate-700/70 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedVariantIdx === idx ? 'Đã copy' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                    {v.content}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================================
// 3. COMPONENT ĐIỀU HƯỚNG TỔNG THỂ (MAIN EXPORT)
// ========================================================
export default function EvaluationResult({ result, channel, frames, onReset, onNavigate }) {
  const isComparison = Boolean(result?.isComparison);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'my-ad' | 'comp-0' | 'comp-1'...

  // NẾU LÀ KẾT QUẢ SO SÁNH ĐA VIDEO
  if (isComparison) {
    const myAdResult = result?.myAdResult;
    const competitorResults = result?.competitorResults || [];

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        {/* Header trang Kết quả */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Kết quả Thẩm định & So sánh</h1>
            <p className="text-xs text-slate-400">
              Đối chiếu trực diện các quảng cáo theo bộ 18 tiêu chí Việt Nam 2026
            </p>
          </div>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d111a] hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thẩm định mới</span>
          </button>
        </div>

        {/* Thanh Tab điều hướng góc nhìn */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#0d111a] border border-slate-800/90 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>⚔️ So sánh Đối đầu (VS Overview)</span>
          </button>

          {myAdResult && (
            <button
              onClick={() => setActiveTab('my-ad')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'my-ad'
                  ? 'bg-[#182236] text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Ad của tôi ({myAdResult.totalScore}đ)</span>
            </button>
          )}

          {competitorResults.map((comp, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(`comp-${idx}`)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === `comp-${idx}`
                  ? 'bg-[#182236] text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>{comp.name} ({comp.totalScore}đ)</span>
            </button>
          ))}
        </div>

        {/* Render nội dung theo Tab */}
        {activeTab === 'overview' && (
          <ComparisonOverviewView result={result} channel={channel} onReset={onReset} />
        )}

        {activeTab === 'my-ad' && myAdResult && (
          <SingleAdEvaluationView
            result={myAdResult}
            channel={channel}
            frames={myAdResult.frames}
            onReset={onReset}
            isSubView={true}
          />
        )}

        {activeTab.startsWith('comp-') && (
          (() => {
            const idx = parseInt(activeTab.replace('comp-', ''), 10);
            const compItem = competitorResults[idx];
            if (!compItem) return null;
            return (
              <SingleAdEvaluationView
                result={compItem}
                channel={channel}
                frames={compItem.frames}
                onReset={onReset}
                isSubView={true}
              />
            );
          })()
        )}
      </div>
    );
  }

  // NẾU LÀ KẾT QUẢ ĐƠN CHO 1 AD (my-ad hoặc check-script)
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-14">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Đánh giá ad của tôi</h1>
          <p className="text-xs text-slate-400">Chấm điểm 18 tiêu chí + gợi ý cải thiện</p>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d111a] hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Đánh giá mới</span>
        </button>
      </div>

      <SingleAdEvaluationView
        result={result}
        channel={channel}
        frames={frames}
        onReset={onReset}
      />
    </div>
  );
}
