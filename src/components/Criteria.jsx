import { useState } from 'react';
import {
  Sliders,
  Sparkles,
  ShieldCheck,
  Zap,
  Trash2,
  Plus,
  Check,
  ArrowLeft,
  Server,
  Eye,
  EyeOff,
  RefreshCw,
  Code,
  Save,
  FileCode
} from 'lucide-react';
import {
  getGwenConfig,
  saveGwenConfig,
  generateConfigFileCode
} from '../config/gwenConfig';
import { testGwenConnection } from '../services/aiEvaluator';

const aiModels = [
  { id: 'gwen', label: 'Gwen (Qwen AI)', sub: 'Cổng kết nối tự do' },
  { id: 'gemini', label: 'Gemini (Google)', sub: '' },
  { id: 'chatgpt', label: 'ChatGPT (OpenAI)', sub: '' },
  { id: 'claude', label: 'Claude (Anthropic)', sub: '' },
];

const baseUrlPresets = [
  { label: 'DashScope Global (Chuẩn)', url: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1' },
  { label: 'DashScope China', url: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  { label: 'OpenRouter', url: 'https://openrouter.ai/api/v1' },
  { label: 'Together AI', url: 'https://api.together.xyz/v1' },
  { label: 'Ollama Local', url: 'http://localhost:11434/v1' },
];

const modelPresets = [
  { id: 'qwen-plus', desc: '(Toàn diện & Cân bằng)' },
  { id: 'qwen-max', desc: '(Thông minh & Sâu sắc)' },
  { id: 'qwen-turbo', desc: '(Tốc độ cao)' },
  { id: 'qwen2.5-vl-72b-instruct', desc: '(Đọc ảnh & video)' },
  { id: 'qwen2.5-72b-instruct', desc: '(Bản 72B cực mạnh)' },
];

function CriteriaGroup({
  title,
  icon: Icon,
  iconBoxStyle,
  items,
  onUpdateItem,
  onRemoveItem,
  onAddItem
}) {
  return (
    <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconBoxStyle}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h2 className="text-sm md:text-base font-bold text-white">{title}</h2>
        </div>
        <span className="text-xs font-mono text-slate-400">{items?.length || 0} tiêu chí</span>
      </div>

      <div className="divide-y divide-slate-800/70">
        {(items || []).map((item, index) => (
          <div key={item.id} className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 text-xs font-mono text-slate-500 select-none shrink-0">
                {index + 1}.
              </span>
              <input
                type="text"
                value={item.title}
                onChange={(e) => onUpdateItem(item.id, 'title', e.target.value)}
                placeholder="Nhập tên tiêu chí..."
                className="flex-1 rounded-xl bg-[#07090e] border border-slate-800/90 focus:border-indigo-500/60 px-4 py-2.5 text-xs md:text-sm font-bold text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
              <button
                onClick={() => onRemoveItem(item.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-950/25 hover:bg-rose-950/50 border border-rose-500/25 text-rose-400 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            </div>

            <div className="pl-9">
              <textarea
                rows={3}
                value={item.desc}
                onChange={(e) => onUpdateItem(item.id, 'desc', e.target.value)}
                placeholder="Nhập hướng dẫn chi tiết (sub-title) để AI dựa vào chấm điểm..."
                className="w-full rounded-xl bg-[#07090e] border border-slate-800/90 focus:border-indigo-500/60 px-4 py-3 text-xs text-slate-200 leading-relaxed placeholder-slate-600 focus:outline-none resize-y transition-colors"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-t border-slate-800/80 bg-[#0b0e17]">
        <button
          onClick={onAddItem}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#131824] hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm tiêu chí</span>
        </button>
      </div>
    </div>
  );
}

export default function Criteria({
  onNavigate,
  groupA,
  setGroupA,
  groupB,
  setGroupB,
  selectedAI = 'gwen',
  setSelectedAI
}) {
  const [savedNotice, setSavedNotice] = useState(false);

  // State cho Cổng kết nối Gwen (Qwen AI)
  const [gwenCfg, setGwenCfg] = useState(() => getGwenConfig());
  const [showApiKey, setShowApiKey] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [gwenSavedMsg, setGwenSavedMsg] = useState(false);

  const handleSaveGwen = () => {
    const cleaned = saveGwenConfig(gwenCfg);
    setGwenCfg(cleaned);
    setGwenSavedMsg(true);
    setTimeout(() => setGwenSavedMsg(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);
    saveGwenConfig(gwenCfg);
    const res = await testGwenConnection(gwenCfg);
    setTestStatus(res);
    setIsTesting(false);
  };

  const updateGroupA = (id, field, value) => {
    setGroupA((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };
  const removeGroupA = (id) => {
    setGroupA((prev) => prev.filter((item) => item.id !== id));
  };
  const addGroupA = () => {
    setGroupA((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, title: 'Tiêu chí tuân thủ mới', desc: '' }
    ]);
  };

  const updateGroupB = (id, field, value) => {
    setGroupB((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };
  const removeGroupB = (id) => {
    setGroupB((prev) => prev.filter((item) => item.id !== id));
  };
  const addGroupB = () => {
    setGroupB((prev) => [
      ...prev,
      { id: `b-${Date.now()}`, title: 'Tiêu chí nội dung mới', desc: '' }
    ]);
  };

  const handleSave = () => {
    localStorage.setItem('cac_groupA', JSON.stringify(groupA));
    localStorage.setItem('cac_groupB', JSON.stringify(groupB));
    saveGwenConfig(gwenCfg);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Tiêu đề trang */}
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
          <Sliders className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Bộ tiêu chí chấm điểm</h1>
          <p className="text-xs md:text-sm text-slate-400">
            Chỉnh tên và hướng dẫn từng tiêu chí. Hướng dẫn là phần AI dựa vào để chấm.
          </p>
        </div>
      </div>

      {/* Khối chọn AI dùng để chấm điểm (4 nút: Gwen, Gemini, ChatGPT, Claude) */}
      <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-white">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>AI dùng để chấm điểm</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {aiModels.map((model) => {
            const isSelected = (selectedAI || 'gwen') === model.id;
            return (
              <button
                key={model.id}
                onClick={() => setSelectedAI && setSelectedAI(model.id)}
                className={`py-3 px-4 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-center ${
                  isSelected
                    ? 'bg-[#15192c] border-2 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.18)]'
                    : 'bg-[#121622] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs md:text-sm font-bold">{model.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                </div>
                {model.sub && (
                  <span className="text-[11px] text-cyan-400 font-medium mt-0.5">
                    {model.sub}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* KHỐI CỔNG KẾT NỐI VỚI GWEN (QWEN AI) */}
      <div className="rounded-2xl bg-[#0d111a] border border-indigo-500/30 p-6 space-y-6 shadow-[0_0_30px_rgba(99,102,241,0.06)]">
        {/* Header Cổng kết nối */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm md:text-base font-bold text-white">
                  Cổng kết nối với Gwen (Qwen AI)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                  OpenAI Compatible
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Nhập Base URL, API Key, Model — Sau khi bấm Lưu sẽ lưu trực tiếp trong code
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#090d16] border border-slate-800 text-cyan-400 text-xs font-mono">
            <FileCode className="w-3.5 h-3.5" />
            <span>src/config/gwenConfig.js</span>
          </div>
        </div>

        {/* 1. Base URL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-200">
              Base URL (Cổng kết nối máy chủ) <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              Chuẩn OpenAI / compatible-mode
            </span>
          </div>
          <input
            type="text"
            value={gwenCfg.baseUrl}
            onChange={(e) => setGwenCfg({ ...gwenCfg, baseUrl: e.target.value })}
            placeholder="https://api.xkiro.com/v1"
            className="w-full rounded-xl bg-[#07090e] border border-slate-800/90 focus:border-indigo-500/60 px-4 py-3 text-xs md:text-sm font-mono text-white placeholder-slate-600 focus:outline-none transition-colors"
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 mr-1">Gợi ý nhanh:</span>
            {baseUrlPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setGwenCfg({ ...gwenCfg, baseUrl: preset.url })}
                className="px-2.5 py-1 rounded-lg bg-[#121724] hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. API Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-200">
              API Key <span className="text-slate-400 font-normal">(Khóa xác thực bí mật)</span>
            </label>
            <span className="text-[11px] text-slate-500">
              Lưu trực tiếp vào file code & bộ nhớ
            </span>
          </div>
          <div className="relative flex items-center">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={gwenCfg.apiKey}
              onChange={(e) => setGwenCfg({ ...gwenCfg, apiKey: e.target.value })}
              placeholder="sk-........................................................"
              className="w-full rounded-xl bg-[#07090e] border border-slate-800/90 focus:border-indigo-500/60 pl-4 pr-10 py-3 text-xs md:text-sm font-mono text-white placeholder-slate-600 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            API key của bạn sẽ được lưu trực tiếp vào code{' '}
            <span className="text-cyan-400 font-mono">src/config/gwenConfig.js</span> khi bấm Lưu.
          </p>
        </div>

        {/* 3. Model */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-200">
              Model (Tên mô hình Gwen / Qwen) <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] font-mono text-slate-500">vd: qwen-plus, qwen-max</span>
          </div>
          <input
            type="text"
            value={gwenCfg.model}
            onChange={(e) => setGwenCfg({ ...gwenCfg, model: e.target.value })}
            placeholder="qwen/qwen3.8-omni-flash:free"
            className="w-full rounded-xl bg-[#07090e] border border-slate-800/90 focus:border-indigo-500/60 px-4 py-3 text-xs md:text-sm font-mono text-white placeholder-slate-600 focus:outline-none transition-colors"
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 mr-1">Mô hình phổ biến:</span>
            {modelPresets.map((m, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setGwenCfg({ ...gwenCfg, model: m.id })}
                className="px-2.5 py-1 rounded-lg bg-[#121724] hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors cursor-pointer"
              >
                <strong className="text-white font-mono">{m.id}</strong>{' '}
                <span className="text-slate-500">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Thông báo kết quả Kiểm tra kết nối */}
        {testStatus && (
          <div
            className={`rounded-xl p-3.5 text-xs border ${
              testStatus.ok
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
            }`}
          >
            {testStatus.message}
          </div>
        )}

        {/* Xem trước file code gwenConfig.js */}
        {showCodePreview && (
          <pre className="rounded-xl bg-[#07090e] border border-slate-800 p-4 text-xs font-mono text-cyan-300 overflow-x-auto">
            {generateConfigFileCode(gwenCfg)}
          </pre>
        )}

        {/* Footer 3 nút bấm */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121724] hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCodePreview(!showCodePreview)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121724] hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <Code className="w-3.5 h-3.5 text-slate-400" />
              <span>{showCodePreview ? 'Ẩn xem code' : 'Xem file code'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveGwen}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white font-bold text-xs md:text-sm shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-opacity cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{gwenSavedMsg ? 'Đã lưu cấu hình Gwen!' : 'Lưu cấu hình Gwen vào code'}</span>
          </button>
        </div>
      </div>

      {/* Nhóm A — Tuân thủ chính sách */}
      <CriteriaGroup
        title="Nhóm A — Tuân thủ chính sách"
        icon={ShieldCheck}
        iconBoxStyle="bg-indigo-500/10 border-indigo-500/25 text-indigo-400"
        items={groupA}
        onUpdateItem={updateGroupA}
        onRemoveItem={removeGroupA}
        onAddItem={addGroupA}
      />

      {/* Nhóm B — Chất lượng nội dung */}
      <CriteriaGroup
        title="Nhóm B — Chất lượng nội dung"
        icon={Zap}
        iconBoxStyle="bg-amber-500/10 border-amber-500/25 text-amber-400"
        items={groupB}
        onUpdateItem={updateGroupB}
        onRemoveItem={removeGroupB}
        onAddItem={addGroupB}
      />

      {/* Cụm nút Lưu ở đáy trang */}
      <div className="flex flex-wrap items-center gap-3.5 pt-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white font-bold text-xs md:text-sm shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-opacity cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>{savedNotice ? 'Đã lưu bộ tiêu chí!' : 'Lưu bộ tiêu chí'}</span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('overview')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0d111a] hover:bg-slate-800/80 text-slate-200 border border-slate-800 font-semibold text-xs md:text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Về trang chủ</span>
        </button>
      </div>
    </div>
  );
}
