import React from 'react';
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
  Layers
} from 'lucide-react';

const groupAResults = [
  { title: 'Không cam kết kết quả tuyệt đối', score: 5, comment: 'Không có cam kết kết quả tuyệt đối nào.' },
  { title: 'Không nhắm thuộc tính cá nhân', score: 5, comment: 'Không nhắm vào thuộc tính cá nhân cụ thể.' },
  { title: 'Không tuyên bố y tế / thành phần cấm', score: 5, comment: 'Không có tuyên bố y tế hoặc thành phần cấm.' },
  { title: "Không dùng từ 'nhất' & không so sánh đối thủ", score: 5, comment: "Không sử dụng từ 'nhất' hoặc so sánh đối thủ." },
  { title: 'Không mượn hình ảnh bác sĩ / nhân viên y tế (mỹ phẩm & TPCN)', score: 5, comment: 'Không sử dụng hình ảnh bác sĩ hoặc nhân viên y tế.' },
  { title: 'Đủ thông tin bắt buộc theo luật', score: 4, comment: 'Thiếu thông tin về giấy phép hoạt động.' },
  { title: 'Hình ảnh & before/after trung thực', score: 4, comment: 'Hình ảnh before/after có thể gây hiểu lầm.' },
  { title: 'Không hạ thấp / gây mặc cảm ngoại hình', score: 5, comment: 'Không có nội dung gây mặc cảm ngoại hình.' },
  { title: 'Chuẩn định dạng & ưu đãi minh bạch', score: 5, comment: 'Định dạng và ưu đãi rõ ràng, minh bạch.' },
];

const groupBResults = [
  { title: 'Tiêu đề / hook mở đầu mạnh', score: 4, comment: 'Tiêu đề khá hấp dẫn nhưng chưa thực sự nổi bật.' },
  { title: 'Đánh trúng insight & nỗi đau khách hàng', score: 5, comment: 'Đánh trúng nỗi đau về da khô ráp.' },
  { title: 'Tập trung 1 mục tiêu / 1 thông điệp', score: 5, comment: 'Tập trung vào thông điệp chính về dịch vụ cấp ẩm.' },
  { title: 'Văn phong tự nhiên, gần gũi, chạm cảm xúc', score: 5, comment: 'Văn phong tự nhiên và gần gũi.' },
  { title: 'Cảm giác chân thật / UGC', score: 4, comment: 'Cảm giác chân thật nhưng vẫn hơi dàn dựng.' },
  { title: 'Bằng chứng xã hội & độ tin cậy', score: 3, comment: 'Thiếu bằng chứng xã hội rõ ràng.' },
  { title: 'Ưu đãi, CTA & thông tin liên hệ', score: 5, comment: 'CTA rõ ràng và có thông tin liên hệ.' },
  { title: 'Điểm khác biệt (USP)', score: 4, comment: 'USP chưa thực sự nổi bật so với đối thủ.' },
  { title: 'Chuẩn sản xuất & hợp format nền tảng', score: 5, comment: 'Đúng chuẩn sản xuất và format nền tảng.' },
];

// Khung hình mặc định mô phỏng da mặt & chăm sóc da thẩm mỹ nếu người dùng tải ảnh hoặc chưa tải video
const defaultFrames = [
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1512290900672-1f88d1214b62?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80',
];

// Component Thanh Điểm 5 Vạch
function SegmentedScoreItem({ title, score, comment }) {
  const isWarning = score <= 3;
  const activeBarColor = isWarning ? 'bg-amber-500' : 'bg-emerald-500';
  const scoreTextColor = isWarning ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-xs md:text-[13px] font-bold text-white leading-snug">{title}</h4>
        <div className="text-xs font-mono shrink-0">
          <span className={`font-bold ${scoreTextColor}`}>{score}</span>
          <span className="text-slate-500">/5</span>
        </div>
      </div>

      {/* 5 vạch tiến trình */}
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

export default function EvaluationResult({ data, onReset, onNavigate }) {
  const score = 82;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const framesToDisplay =
    data?.frames && data.frames.length > 0 ? data.frames : defaultFrames;

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
      <div className="relative rounded-2xl bg-gradient-to-br from-[#0d111a] via-[#0d141c] to-[#0c2622] border border-slate-800/90 p-6 md:p-8 space-y-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Vòng tròn điểm 82/100 */}
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="#182232"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="#22c55e"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-emerald-400 leading-none">
                {score}
              </span>
              <span className="text-[11px] font-mono text-slate-400 mt-1">/ 100</span>
            </div>
          </div>

          {/* Thông tin tóm tắt Ad */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                Tốt
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium px-1">
                <span className={`w-2 h-2 rounded-full ${data?.channel?.dotColor || 'bg-blue-500'}`} />
                <span>{data?.channel?.label || 'Facebook'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono">
                <Layers className="w-3 h-3" />
                <span>manual</span>
              </span>
            </div>

            <h2 className="text-base font-bold text-white">Ad của tôi</h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl">
              {data?.summary ||
                'Quảng cáo giới thiệu dịch vụ cấp ẩm không kim Infusion tại Seoul Center, giúp da mềm mại và mịn màng hơn.'}
            </p>
          </div>
        </div>

        {/* Đường kẻ ngăn cách */}
        <div className="border-t border-slate-800/80 pt-5 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Film className="w-3.5 h-3.5" />
            <span>Dải khung hình</span>
          </div>

          {/* 6 ảnh khung hình */}
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

          {/* Thanh scrollbar giả lập bên dưới dải khung hình */}
          <div className="w-full h-1.5 rounded-full bg-[#151c28] overflow-hidden flex items-center px-1">
            <div className="w-3/4 h-1 rounded-full bg-slate-600/60" />
          </div>
        </div>
      </div>

      {/* 2. Khối Cảnh báo chính sách */}
      <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Cảnh báo chính sách</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="w-5 h-5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              1
            </span>
            <span className="w-5 h-5 rounded bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center font-bold">
              1
            </span>
          </div>
        </div>

        {/* Cảnh báo 1: Mức Vừa */}
        <div className="space-y-2">
          <div className="rounded-xl bg-[#141418] border border-amber-500/30 p-4 flex items-start gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold shrink-0">
              <AlertTriangle className="w-3 h-3" />
              <span>Vừa</span>
            </span>
            <p className="text-xs md:text-[13px] font-semibold text-slate-200 leading-relaxed">
              Thiếu thông tin về giấy phép hoạt động: Thiếu thông tin về giấy phép hoạt động theo NĐ 96/2023.
            </p>
          </div>
          <div className="flex items-center gap-1.5 pl-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Căn cứ pháp lý (Đủ thông tin bắt buộc theo luật):</span>
            <strong className="text-slate-200 font-mono">96/2023/NĐ-CP</strong>
          </div>
        </div>

        {/* Cảnh báo 2: Mức Thấp */}
        <div className="space-y-2 pt-1">
          <div className="rounded-xl bg-[#111520] border border-slate-800 p-4 flex items-start gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400 text-[11px] font-bold shrink-0">
              <AlertTriangle className="w-3 h-3" />
              <span>Thấp</span>
            </span>
            <p className="text-xs md:text-[13px] font-semibold text-slate-200 leading-relaxed">
              Hình ảnh before/after có thể gây hiểu lầm: Hình ảnh before/after có thể gây hiểu lầm về kết quả.
            </p>
          </div>
          <div className="flex items-center gap-1.5 pl-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Căn cứ pháp lý (Hình ảnh & before/after trung thực):</span>
            <strong className="text-slate-200 font-mono">91/2015/QH13 · 09/2015/TT-BYT</strong>
          </div>
        </div>
      </div>

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
            {groupAResults.map((item, index) => (
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
            {groupBResults.map((item, index) => (
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
        {/* Ưu điểm */}
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Ưu điểm</span>
          </div>
          <ul className="space-y-2.5 text-xs md:text-[13px] text-slate-200">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Đánh trúng nỗi đau về da khô ráp.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Văn phong tự nhiên và gần gũi.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>CTA rõ ràng và có thông tin liên hệ.</span>
            </li>
          </ul>
        </div>

        {/* Nhược điểm */}
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Nhược điểm</span>
          </div>
          <ul className="space-y-2.5 text-xs md:text-[13px] text-slate-200">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>Thiếu thông tin về giấy phép hoạt động.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>Hình ảnh before/after có thể gây hiểu lầm.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>Thiếu bằng chứng xã hội rõ ràng.</span>
            </li>
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
          “Quảng cáo này khiến tôi cảm thấy dịch vụ có thể giải quyết vấn đề da khô ráp của mình. Tuy nhiên, tôi cần thêm thông tin về độ tin cậy và giấy phép hoạt động để yên tâm hơn.”
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
          Quảng cáo thuộc phễu dịch vụ cấp ẩm không kim với mức giá trung bình. So với đối thủ như DIVA hay Ngọc Dung, quảng cáo chưa nổi bật về công nghệ và cam kết kết quả.
        </p>

        {/* So với đối thủ cùng phễu */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
            <Search className="w-3.5 h-3.5" />
            <span>So với đối thủ cùng phễu:</span>
          </div>
          <div className="space-y-2">
            <div className="rounded-xl bg-[#0a0e17]/90 border border-slate-800 px-4 py-3 text-xs text-slate-200">
              DIVA 99K-999K, CN Pico/CO2/Meso CB — ad bạn không nêu công nghệ cụ thể.
            </div>
            <div className="rounded-xl bg-[#0a0e17]/90 border border-slate-800 px-4 py-3 text-xs text-slate-200">
              Ngọc Dung 127K-168K, 'Laser Helios 785nm' — ad bạn không có cam kết rõ ràng.
            </div>
          </div>
        </div>

        {/* Hướng cải thiện để vượt đối thủ */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>Hướng cải thiện để vượt đối thủ:</span>
          </div>
          <ul className="space-y-2 text-xs md:text-[13px] text-slate-200">
            <li className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Bổ sung cam kết kết quả cụ thể như Ngọc Dung.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Nêu rõ công nghệ sử dụng để tăng giá trị cảm nhận.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Thêm review khách hàng thực tế để tăng độ tin cậy.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 7. Tóm tắt & đề xuất cải thiện */}
      <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-5">
        <div className="flex items-center gap-2.5 text-sm font-bold text-white">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Tóm tắt & đề xuất cải thiện</span>
        </div>

        <p className="text-xs md:text-[13px] text-slate-200 leading-relaxed">
          Quảng cáo của Seoul Center tập trung vào dịch vụ cấp ẩm không kim Infusion, đánh trúng nỗi đau về da khô ráp. Tuy nhiên, thiếu thông tin về giấy phép hoạt động và hình ảnh before/after có thể gây hiểu lầm. So với đối thủ, quảng cáo chưa nổi bật về USP và thiếu bằng chứng xã hội. Nên bổ sung thông tin giấy phép và cải thiện hình ảnh để tăng độ tin cậy.
        </p>

        <div className="border-t border-slate-800/80 pt-4 space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs md:text-[13px] text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Bổ sung thông tin giấy phép hoạt động.</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs md:text-[13px] text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cải thiện hình ảnh before/after để tránh hiểu lầm.</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs md:text-[13px] text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Thêm bằng chứng xã hội từ khách hàng thực tế.</span>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-4 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            3 biến thể (3 góc tiếp cận khác nhau) sửa các vi phạm đã liệt kê, giữ đúng sản phẩm/ưu đãi, KHÔNG bịa thông tin, tự gắn chữ ký chuẩn Seoul Center. Sinh 1 lần rồi lưu cố định.
          </p>

          {/* Khung cảnh báo lỗi LLM */}
          <div className="rounded-xl bg-rose-950/20 border border-rose-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-2.5 text-xs text-rose-300 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p>
                Mọi nhà cung cấp LLM đều lỗi — claude: Tài khoản Claude hết hạn mức (429). Chuyển sang nhà cung cấp dự phòng. | claude-fallback: Token Claude OAuth không hợp lệ hoặc đã hết hạn — tạo lại bằng `claude setup-token`. | gemini: Tài khoản Gemini hết credit/quota. Thử lại sau hoặc dùng tài khoản khác.
              </p>
            </div>
            <button className="px-3.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-200 text-xs font-semibold shrink-0 transition-colors cursor-pointer">
              Thử lại
            </button>
          </div>

          {/* Nút lấy ad làm đề bài ý tưởng mới */}
          <div className="pt-1">
            <button
              onClick={() => onNavigate && onNavigate('ideas')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <span>Lấy ad này làm đề bài ý tưởng mới</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
