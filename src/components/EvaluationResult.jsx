import { useState } from 'react';
import {
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
  Copy
} from 'lucide-react';

const defaultFrames = [
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1512290900672-1f88d1214b62?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80',
];

// Component Thanh Điểm 5 Vạch (Đổi màu Đỏ / Cam / Xanh lá theo điểm 1-5)
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

export default function EvaluationResult({ result, channel, frames, onReset, onNavigate }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const score = result?.totalScore ?? 46;
  const statusLabel = result?.statusLabel || (score >= 80 ? 'Tốt' : 'Cần cải thiện');
  const isGood = score >= 75;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const framesToDisplay = frames && frames.length > 0 ? frames : defaultFrames;

  const handleCopyVariant = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-14">
      {/* Header trang Kết quả */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Đánh giá ad của tôi
          </h1>
          <p className="text-xs text-slate-400">Chấm điểm + gợi ý cải thiện</p>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d111a] hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Đánh giá</span>
        </button>
      </div>

      {/* 1. Khối Điểm tổng quan & Dải khung hình */}
      <div
        className={`relative rounded-2xl border border-slate-800/90 p-6 md:p-8 space-y-6 overflow-hidden ${
          isGood
            ? 'bg-gradient-to-br from-[#0d111a] via-[#0d141c] to-[#0c2622]'
            : 'bg-gradient-to-br from-[#191516] via-[#12131c] to-[#0d111a]'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Vòng tròn điểm */}
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="#1c2230"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={isGood ? '#22c55e' : '#f59e0b'}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className={
                  isGood
                    ? 'drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-700'
                    : 'drop-shadow-[0_0_10px_rgba(245,158,11,0.45)] transition-all duration-700'
                }
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-3xl font-extrabold leading-none ${
                  isGood ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {score}
              </span>
              <span className="text-[11px] font-mono text-slate-400 mt-1">/ 100</span>
            </div>
          </div>

          {/* Thông tin tóm tắt Ad */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                  isGood
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                }`}
              >
                {statusLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium px-1">
                <span className={`w-2 h-2 rounded-full ${channel?.dotColor || 'bg-blue-500'}`} />
                <span>{channel?.label || 'Facebook'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono">
                <Layers className="w-3 h-3" />
                <span>manual</span>
              </span>
            </div>

            <h2 className="text-base font-bold text-white">Ad của tôi</h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {result?.summary}
            </p>
          </div>
        </div>

        {/* Dải khung hình trích xuất từ video */}
        <div className="border-t border-slate-800/80 pt-5 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Film className="w-3.5 h-3.5" />
            <span>Dải khung hình</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {framesToDisplay.map((src, idx) => (
              <div
                key={idx}
                className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 bg-[#07090e] relative group"
              >
                <img
                  src={src}
                  alt={`Frame ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#151c28] overflow-hidden flex items-center px-1">
            <div className="w-3/4 h-1 rounded-full bg-slate-600/60" />
          </div>
        </div>
      </div>

      {/* 2. Khối Cảnh báo chính sách */}
      {result?.warnings && result.warnings.length > 0 && (
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Cảnh báo chính sách</h3>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              {result.warnings.map((w, i) => (
                <span
                  key={i}
                  className={`w-5 h-5 rounded flex items-center justify-center font-bold border ${
                    w.level === 'Cao'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  }`}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          </div>

          {result.warnings.map((warn, idx) => {
            const isHigh = warn.level === 'Cao';
            return (
              <div key={idx} className="space-y-2 pt-1">
                <div
                  className={`rounded-xl p-4 flex items-start gap-3 border ${
                    isHigh
                      ? 'bg-[#191219] border-rose-500/30'
                      : 'bg-[#141418] border-amber-500/30'
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 border ${
                      isHigh
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>{warn.level}</span>
                  </span>
                  <p className="text-xs md:text-[13px] font-semibold text-slate-200 leading-relaxed">
                    {warn.message}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 pl-1 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Căn cứ pháp lý ({warn.legalBasisTitle}):</span>
                  <strong className="text-slate-200 font-mono">{warn.legalCode}</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Hai cột điểm chi tiết: Nhóm A & Nhóm B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột A: Tuân thủ chính sách */}
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              <span className="text-slate-400 font-mono mr-1.5">A</span>
              Tuân thủ chính sách
            </h3>
          </div>

          <div className="space-y-5">
            {(result?.groupAResults || []).map((item, index) => (
              <SegmentedScoreItem
                key={index}
                title={item.title}
                score={item.score}
                comment={item.comment}
              />
            ))}
          </div>
        </div>

        {/* Cột B: Sức hút & hiệu quả */}
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              <span className="text-slate-400 font-mono mr-1.5">B</span>
              Sức hút & hiệu quả
            </h3>
          </div>

          <div className="space-y-5">
            {(result?.groupBResults || []).map((item, index) => (
              <SegmentedScoreItem
                key={index}
                title={item.title}
                score={item.score}
                comment={item.comment}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Hai cột Ưu điểm & Nhược điểm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Ưu điểm</span>
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
            <span>Nhược điểm</span>
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

      {/* 5. Góc nhìn khách hàng mục tiêu */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0d111a] via-[#101424] to-[#151830] border border-slate-800/90 p-6 space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Góc nhìn khách hàng mục tiêu</h3>
            <p className="text-[11px] text-slate-400">Nữ 25-50, đô thị, quan tâm làm đẹp · nhạy giá</p>
          </div>
        </div>

        <p className="text-xs md:text-[13px] italic text-slate-200 leading-relaxed">
          {result?.customerPerspective}
        </p>
      </div>

      {/* 6. Góc nhìn đối thủ ngành */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0d111a] via-[#0d1520] to-[#0c1f24] border border-slate-800/90 p-6 space-y-5">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Góc nhìn đối thủ ngành</h3>
            <p className="text-[11px] text-slate-400">So với mặt bằng quảng cáo ngành thẩm mỹ/làm đẹp</p>
          </div>
        </div>

        <p className="text-xs md:text-[13px] text-slate-200 leading-relaxed">
          {result?.competitorAnalysis?.overview}
        </p>

        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
            <Search className="w-3.5 h-3.5" />
            <span>So với đối thủ cùng phễu:</span>
          </div>
          <div className="space-y-2">
            {(result?.competitorAnalysis?.comparisons || []).map((cmp, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#0a0e17]/90 border border-slate-800 px-4 py-3 text-xs text-slate-200 leading-relaxed"
              >
                {cmp}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>Hướng cải thiện để vượt đối thủ:</span>
          </div>
          <ul className="space-y-2 text-xs md:text-[13px] text-slate-200">
            {(result?.competitorAnalysis?.improvements || []).map((imp, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 7. Tóm tắt & đề xuất cải thiện + 3 Biến thể viết lại */}
      <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-5">
        <div className="flex items-center gap-2.5 text-sm font-bold text-white">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Tóm tắt & đề xuất cải thiện</span>
        </div>

        <p className="text-xs md:text-[13px] text-slate-200 leading-relaxed">
          {result?.finalSummary?.text}
        </p>

        <div className="border-t border-slate-800/80 pt-4 space-y-2.5">
          {(result?.finalSummary?.actionItems || []).map((act, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs md:text-[13px] text-slate-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{act}</span>
            </div>
          ))}
        </div>

        {/* 3 Biến thể gợi ý viết lại kèm nút Copy giống hệt Video */}
        {result?.finalSummary?.variants && result.finalSummary.variants.length > 0 && (
          <div className="border-t border-slate-800/80 pt-4 space-y-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 leading-relaxed">
                3 biến thể (3 góc tiếp cận khác nhau) sửa các vi phạm đã liệt kê, giữ đúng sản phẩm/ưu đãi, KHÔNG bịa thông tin, tự gắn chữ ký chuẩn Seoul Center. Sinh 1 lần rồi lưu cố định.
              </p>
              <p className="text-[11px] font-semibold text-indigo-400">
                3 biến thể vi phạm đã sửa, giữ nguyên ưu đãi:
              </p>
            </div>

            <div className="space-y-3.5">
              {result.finalSummary.variants.map((v, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-[#080b12] border border-slate-800/90 p-4 space-y-3"
                >
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

            <div className="pt-2">
              <button
                onClick={() => onNavigate && onNavigate('ideas')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                <span>Lấy ad này làm đề bài ý tưởng mới</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
