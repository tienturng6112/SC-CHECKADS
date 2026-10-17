import React from 'react';
import { Gauge, Search, Clock, Sliders, Sparkles, ArrowRight } from 'lucide-react';

const featureCards = [
  {
    id: 'evaluate',
    title: 'Đánh giá ad mới',
    desc: 'Chấm điểm tuân thủ chính sách 2026 và chất lượng nội dung.',
    icon: Gauge,
    iconBg: 'bg-indigo-500/10 border-indigo-500/20',
    iconColor: 'text-indigo-400',
    linkColor: 'text-indigo-400 hover:text-indigo-300'
  },
  {
    id: 'competitor',
    title: 'Tìm ad đối thủ',
    desc: 'Khai thác thư viện quảng cáo Facebook để nghiên cứu đối thủ.',
    icon: Search,
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    iconColor: 'text-cyan-400',
    linkColor: 'text-cyan-400 hover:text-cyan-300'
  },
  {
    id: 'history',
    title: 'Lịch sử',
    desc: 'Xem lại tất cả lần đánh giá, điểm trung bình và báo cáo chi tiết.',
    icon: Clock,
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-400',
    linkColor: 'text-emerald-400 hover:text-emerald-300'
  },
  {
    id: 'criteria',
    title: 'Bộ tiêu chí',
    desc: 'Tuỳ chỉnh các tiêu chí chấm điểm cho phù hợp với ngành của bạn.',
    icon: Sliders,
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-400',
    linkColor: 'text-amber-400 hover:text-amber-300'
  }
];

export default function Dashboard({ onNavigate }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Khối Hero Banner có kẻ lưới chìm */}
      <div 
        className="relative rounded-2xl bg-[#0d111a] border border-slate-800/90 p-8 md:p-12 overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(30, 41, 59, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 41, 59, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px'
        }}
      >
        {/* Hiệu ứng ánh sáng mờ ở góc */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI CHẤM ĐIỂM QUẢNG CÁO</span>
          </div>

          {/* Tiêu đề chính với hiệu ứng Gradient */}
          <h1 className="text-3xl md:text-[40px] font-extrabold text-white leading-[1.2] tracking-tight">
            Chấm điểm & so sánh quảng cáo{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              trước khi đối thủ làm điều đó
            </span>
            .
          </h1>

          {/* Mô tả phụ */}
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            AI đối chiếu chính sách 2026 và chất lượng nội dung, rồi xếp hạng cạnh ad đối thủ — chuyên cho ngành làm đẹp.
          </p>

          {/* Cụm nút bấm CTA */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={() => onNavigate('evaluate')}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-opacity cursor-pointer"
            >
              <Gauge className="w-4 h-4" />
              <span>Đánh giá ad mới</span>
            </button>

            <button
              onClick={() => onNavigate('competitor')}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#131824] hover:bg-slate-800/80 text-slate-200 border border-slate-700/80 font-medium text-sm transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Tìm ad đối thủ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lưới 4 thẻ tính năng bên dưới */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featureCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="group rounded-2xl bg-[#0d111a] border border-slate-800/90 hover:border-slate-700 p-6 flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="space-y-4">
                <div className={`w-11 h-11 rounded-xl border ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">{card.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              </div>

              <div className="pt-6">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${card.linkColor} group-hover:gap-2 transition-all`}>
                  <span>Mở</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
