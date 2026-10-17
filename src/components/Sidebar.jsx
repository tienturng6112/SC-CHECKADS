import React from 'react';
import {
  TrendingUp,
  Gauge,
  Search,
  Sparkles,
  Film,
  Clock,
  ShieldCheck,
  Sliders,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { id: 'overview', label: 'Tổng quan', icon: TrendingUp },
  { id: 'evaluate', label: 'Đánh giá', icon: Gauge },
  { id: 'competitor', label: 'Tìm ad đối thủ', icon: Search },
  { id: 'ideas', label: 'Ý tưởng ads', icon: Sparkles },
  { id: 'video-projects', label: 'Dự án video ads', icon: Film },
  { id: 'history', label: 'Lịch sử', icon: Clock },
  { id: 'policy', label: 'Thư viện luật', icon: ShieldCheck },
  { id: 'criteria', label: 'Bộ tiêu chí', icon: Sliders },
];

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-[#0d111a] border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 select-none shrink-0`}
    >
      <div>
        {/* Khu vực Logo */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight overflow-hidden">
              <h1 className="font-bold text-white text-sm tracking-wide truncate">Creative Ads</h1>
              <p className="text-[10px] font-mono font-semibold text-cyan-400 tracking-widest uppercase">CHECK</p>
              <p className="text-[11px] text-slate-500 truncate">by HiepNguyen</p>
            </div>
          )}
        </div>

        {/* Danh sách Menu */}
        <nav className="p-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-[#171e2e] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {/* Thanh chỉ báo màu xanh bên trái khi Active */}
                {isActive && (
                  <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-indigo-500 rounded-r-full" />
                )}
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Nút Thu gọn ở đáy Sidebar */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
