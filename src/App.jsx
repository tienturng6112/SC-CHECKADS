import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Evaluate from './components/Evaluate';
import Criteria from './components/Criteria';
import { defaultGroupA, defaultGroupB } from './data/criteriaData';

const tabTitles = {
  overview: 'Tổng quan',
  evaluate: 'Đánh giá',
  competitor: 'Tìm ad đối thủ',
  ideas: 'Ý tưởng ads',
  'video-projects': 'Dự án video ads',
  history: 'Lịch sử',
  policy: 'Thư viện luật',
  criteria: 'Bộ tiêu chí',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('evaluate');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isShowingEvalResult, setIsShowingEvalResult] = useState(false);

  // Lưu trữ danh sách tiêu chí Nhóm A & Nhóm B kèm Sub-title ở cấp App để cả Criteria và Evaluate cùng sử dụng
  const [groupA, setGroupA] = useState(() => {
    try {
      const saved = localStorage.getItem('cac_groupA');
      return saved ? JSON.parse(saved) : defaultGroupA;
    } catch {
      return defaultGroupA;
    }
  });

  const [groupB, setGroupB] = useState(() => {
    try {
      const saved = localStorage.getItem('cac_groupB');
      return saved ? JSON.parse(saved) : defaultGroupB;
    } catch {
      return defaultGroupB;
    }
  });

  const [selectedAI, setSelectedAI] = useState('gemini');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'evaluate') {
      setIsShowingEvalResult(false);
    }
  };

  const headerTitle =
    activeTab === 'evaluate' && isShowingEvalResult
      ? 'Kết quả'
      : tabTitles[activeTab];

  return (
    <div className="flex h-screen bg-[#07090e] text-slate-100 font-sans overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={headerTitle} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'overview' && <Dashboard onNavigate={handleTabChange} />}
          {activeTab === 'evaluate' && (
            <Evaluate
              onNavigate={handleTabChange}
              onResultModeChange={setIsShowingEvalResult}
              groupA={groupA}
              groupB={groupB}
            />
          )}
          {activeTab === 'criteria' && (
            <Criteria
              onNavigate={handleTabChange}
              groupA={groupA}
              setGroupA={setGroupA}
              groupB={groupB}
              setGroupB={setGroupB}
              selectedAI={selectedAI}
              setSelectedAI={setSelectedAI}
            />
          )}
          {activeTab !== 'overview' && activeTab !== 'evaluate' && activeTab !== 'criteria' && (
            <div className="max-w-6xl mx-auto rounded-2xl bg-[#0d111a] border border-slate-800/80 p-12 text-center">
              <p className="text-slate-400 text-sm">
                Giao diện mục <strong className="text-white">{tabTitles[activeTab]}</strong> đang chờ dữ liệu từ anh để clone tiếp...
              </p>
            </div>
          )}
        </main>

        <footer className="h-9 border-t border-slate-800/80 bg-[#07090e] flex items-center justify-center text-[11px] font-mono text-slate-500 shrink-0">
          Creative Ads Check · by HiepNguyen
        </footer>
      </div>
    </div>
  );
}
