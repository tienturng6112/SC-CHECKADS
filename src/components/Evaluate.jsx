import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Gauge,
  Layers,
  Search,
  ShieldCheck,
  Check,
  Upload,
  Link as LinkIcon,
  Plus,
  Trash2,
  FileText,
  Loader2,
  X
} from 'lucide-react';
import EvaluationResult from './EvaluationResult';

const evaluationModes = [
  {
    id: 'my-ad',
    title: 'Chỉ ad của tôi',
    desc: 'Chấm riêng ad của bạn + nhận gợi ý cải thiện cụ thể.',
    icon: Gauge,
  },
  {
    id: 'vs-competitor',
    title: 'Ad của tôi vs đối thủ',
    desc: 'So sánh ad của bạn cạnh ad đối thủ, xem thắng/thua từng tiêu chí.',
    icon: Layers,
  },
  {
    id: 'analyze-competitor',
    title: 'Phân tích đối thủ',
    desc: 'Chấm và xếp hạng nhiều quảng cáo của đối thủ.',
    icon: Search,
  },
  {
    id: 'check-script',
    title: 'Check kịch bản',
    desc: 'Dán kịch bản/brief chưa quay → bắt vi phạm pháp lý sớm để sửa trước.',
    icon: ShieldCheck,
  },
];

const channels = [
  { id: 'facebook', label: 'Facebook', dotColor: 'bg-blue-500' },
  { id: 'tiktok', label: 'TikTok', dotColor: 'bg-cyan-400' },
  { id: 'google', label: 'Google', dotColor: 'bg-amber-500' },
];

// Hàm tự động cắt 6 khung hình từ file Video người dùng tải lên
const extractFramesFromVideo = (videoFile, count = 6) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(videoFile);
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      const duration = video.duration || 6;
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      const frames = [];

      for (let i = 0; i < count; i++) {
        const time = Math.min((duration / (count + 1)) * (i + 1), duration - 0.1);
        await new Promise((r) => {
          video.currentTime = time;
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL('image/jpeg', 0.8));
            r();
          };
        });
      }
      URL.revokeObjectURL(url);
      resolve(frames);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve([]);
    };
  });
};

// Component Thẻ Upload Quảng Cáo
function AdUploadCard({
  title,
  type,
  channelInfo,
  onRemove,
  canRemove,
  isSingleMode,
  file,
  previewUrl,
  onFileSelect,
  onClearFile,
  caption,
  setCaption,
  adLink,
  setAdLink,
  errorMsg
}) {
  const isMyAd = type === 'my-ad';

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected && onFileSelect) {
      onFileSelect(selected);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 flex flex-col justify-between space-y-5">
      <div className="space-y-5">
        {/* Header của Card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isMyAd
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
              }`}
            >
              {isMyAd ? <Sparkles className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
          </div>

          {canRemove && (
            <button
              onClick={onRemove}
              title="Xoá đối thủ này"
              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Khu vực Kéo - Thả file hoặc Xem trước Video/Ảnh đã tải */}
        {previewUrl ? (
          <div className="relative rounded-xl bg-[#07090e] border border-indigo-500/50 h-64 overflow-hidden flex items-center justify-center">
            {file?.type?.startsWith('video') ? (
              <video
                src={previewUrl}
                controls
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Ad preview"
                className="max-h-full max-w-full object-contain"
              />
            )}
            <button
              onClick={onClearFile}
              title="Đổi file khác"
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/90 hover:bg-rose-600 text-slate-200 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/85 border border-slate-700 text-[11px] text-slate-300 truncate max-w-[80%]">
              {file?.name}
            </div>
          </div>
        ) : (
          <label className="group border border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-xl bg-[#0a0d14]/60 hover:bg-[#111622] h-64 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all">
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept="image/jpeg,image/png,video/mp4"
            />
            <div className="w-11 h-11 rounded-xl bg-[#161b26] border border-slate-800 group-hover:border-slate-700 flex items-center justify-center mb-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-200 mb-1">Kéo-thả ảnh hoặc video</p>
            <p className="text-xs text-slate-500">
              hoặc bấm để chọn · JPG, PNG, MP4 · ảnh ≤10MB, video ≤500MB
            </p>
          </label>
        )}

        {/* Khu vực nhập Caption */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-slate-300">
              Caption <strong className="text-amber-500 font-semibold">bắt buộc</strong>{' '}
              <span className="text-slate-500">(hoặc dán link bên dưới)</span>
            </span>
          </div>
          <textarea
            rows={3}
            value={caption}
            onChange={(e) => setCaption && setCaption(e.target.value)}
            placeholder="Caption quảng cáo... (bắt buộc)"
            className="w-full rounded-xl bg-[#07090e] border border-slate-800/90 focus:border-indigo-500/60 p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none transition-colors"
          />
          {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
        </div>

        {/* Đường kẻ phân cách HOẶC DÁN LINK */}
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-slate-800/80"></div>
          <span className="flex-shrink mx-3 text-[10px] font-mono uppercase tracking-widest text-slate-500">
            HOẶC DÁN LINK
          </span>
          <div className="flex-grow border-t border-slate-800/80"></div>
        </div>

        {/* Ô nhập Link quảng cáo */}
        <div className="relative flex items-center">
          <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={adLink}
            onChange={(e) => setAdLink && setAdLink(e.target.value)}
            placeholder="Dán link quảng cáo (FB/TikTok) — tự đọc nội dung"
            className="w-full rounded-xl bg-[#07090e] border border-slate-800/90 focus:border-indigo-500/60 pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Footer hiển thị Kênh đang chọn */}
      <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
        <span>Kênh:</span>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161f30] border border-slate-700/60 text-white font-medium text-xs">
          <span className={`w-2 h-2 rounded-full ${channelInfo.dotColor}`} />
          <span>{channelInfo.label}</span>
        </div>
        {!isSingleMode && <span>· chọn ở trên cho cả 2 bên</span>}
      </div>
    </div>
  );
}

export default function Evaluate({ onNavigate, onResultModeChange }) {
  const [selectedMode, setSelectedMode] = useState('my-ad');
  const [selectedChannel, setSelectedChannel] = useState('facebook');
  const [competitors, setCompetitors] = useState([1]);

  // State cho file upload và caption của "Ad của tôi"
  const [myAdFile, setMyAdFile] = useState(null);
  const [myAdPreview, setMyAdPreview] = useState('');
  const [extractedFrames, setExtractedFrames] = useState([]);
  const [myCaption, setMyCaption] = useState('');
  const [myAdLink, setMyAdLink] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // State xử lý phân tích AI & hiển thị kết quả
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const currentChannelInfo = channels.find((c) => c.id === selectedChannel) || channels[0];

  const handleSelectMyFile = async (file) => {
    setMyAdFile(file);
    const url = URL.createObjectURL(file);
    setMyAdPreview(url);

    if (file.type.startsWith('video')) {
      const frames = await extractFramesFromVideo(file, 6);
      setExtractedFrames(frames);
    } else {
      setExtractedFrames([url, url, url, url, url, url]);
    }
  };

  const handleClearMyFile = () => {
    setMyAdFile(null);
    setMyAdPreview('');
    setExtractedFrames([]);
  };

  const handleStartAnalyze = () => {
    if (!myCaption.trim() && !myAdLink.trim()) {
      setErrorMsg('Vui lòng nhập Caption quảng cáo hoặc dán link trước khi chấm điểm.');
      return;
    }
    setErrorMsg('');
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
      if (onResultModeChange) onResultModeChange(true);
    }, 1200);
  };

  const handleReset = () => {
    setShowResult(false);
    if (onResultModeChange) onResultModeChange(false);
  };

  const handleAddCompetitor = () => {
    setCompetitors((prev) => [...prev, prev.length + 1]);
  };

  const handleRemoveCompetitor = (indexToRemove) => {
    setCompetitors((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Nếu đã phân tích xong -> Hiển thị giao diện Kết quả
  if (showResult) {
    return (
      <EvaluationResult
        data={{
          channel: currentChannelInfo,
          frames: extractedFrames,
          summary:
            'Quảng cáo giới thiệu dịch vụ cấp ẩm không kim Infusion tại Seoul Center, giúp da mềm mại và mịn màng hơn.'
        }}
        onReset={handleReset}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-10">
      {/* Tiêu đề trang */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Đánh giá quảng cáo</h1>
        <p className="text-sm text-slate-400">
          Chọn chế độ, đưa quảng cáo vào, AI sẽ chấm điểm và so sánh.
        </p>
      </div>

      {/* Khung thông báo AI Gemini */}
      <div className="rounded-xl bg-[#111322] border border-indigo-500/25 p-4 space-y-2 text-xs leading-relaxed">
        <div className="flex items-start sm:items-center gap-2 text-slate-200">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            <strong className="font-semibold text-white">Đang chấm bằng Gemini (Google)</strong> — Đọc ảnh và video. Của Google — xem được nguyên video kèm âm thanh.
          </p>
        </div>

        <div className="flex items-start sm:items-center gap-2 text-amber-400/90">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            Video: xem NGUYÊN clip và NGHE lời thoại/nhạc để chấm sâu (hook, lời thoại, diễn biến). Cần tài khoản còn credit.
          </p>
        </div>

        <div className="pl-6 text-slate-400">
          Đổi AI ở trang{' '}
          <button
            onClick={() => onNavigate && onNavigate('criteria')}
            className="text-slate-200 font-semibold underline hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Bộ tiêu chí
          </button>
          .
        </div>
      </div>

      {/* Lưới 4 chế độ đánh giá trên cùng 1 hàng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {evaluationModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <div
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`rounded-2xl p-5 flex items-start gap-3.5 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#121626] border-2 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.18)]'
                  : 'bg-[#0d111a] border border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-[#151a26] border border-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white truncate">{mode.title}</h3>
                  {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{mode.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bộ chọn Kênh quảng cáo */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">Kênh quảng cáo:</span>
          <div className="inline-flex items-center p-1 rounded-xl bg-[#0d111a] border border-slate-800/90">
            {channels.map((ch) => {
              const isActive = selectedChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#192236] text-white border border-slate-700/80 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${ch.dotColor}`} />
                  <span>{ch.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Cả 2 bên so sánh trên cùng 1 kênh để công bằng. Đổi kênh ở đây áp cho tất cả ad.</span>
        </div>
      </div>

      {/* 1. Chế độ: Chỉ ad của tôi */}
      {selectedMode === 'my-ad' && (
        <div className="max-w-2xl space-y-5">
          <AdUploadCard
            title="Ad của tôi"
            type="my-ad"
            channelInfo={currentChannelInfo}
            canRemove={false}
            isSingleMode={true}
            file={myAdFile}
            previewUrl={myAdPreview}
            onFileSelect={handleSelectMyFile}
            onClearFile={handleClearMyFile}
            caption={myCaption}
            setCaption={setMyCaption}
            adLink={myAdLink}
            setAdLink={setMyAdLink}
            errorMsg={errorMsg}
          />

          {/* Nút bấm Phân tích & Chấm điểm AI */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartAnalyze}
              disabled={isAnalyzing}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-95 disabled:opacity-60 transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI đang phân tích video & chấm điểm...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Chấm điểm quảng cáo</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (!myCaption) {
                  setMyCaption(
                    'Cấp ẩm không kim Infusion tại Seoul Center — Cứu tinh cho làn da khô ráp, sần sùi! Giúp da căng bóng, mềm mại ngay từ buổi đầu tiên.'
                  );
                }
                setErrorMsg('');
                setIsAnalyzing(true);
                setTimeout(() => {
                  setIsAnalyzing(false);
                  setShowResult(true);
                  if (onResultModeChange) onResultModeChange(true);
                }, 800);
              }}
              className="px-4 py-3.5 rounded-xl bg-[#131824] hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold transition-colors cursor-pointer"
            >
              Xem nhanh kết quả mẫu (82/100)
            </button>
          </div>
        </div>
      )}

      {/* 2. Chế độ: Ad của tôi vs đối thủ */}
      {selectedMode === 'vs-competitor' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdUploadCard
              title="Ad của tôi"
              type="my-ad"
              channelInfo={currentChannelInfo}
              canRemove={false}
              isSingleMode={false}
              file={myAdFile}
              previewUrl={myAdPreview}
              onFileSelect={handleSelectMyFile}
              onClearFile={handleClearMyFile}
              caption={myCaption}
              setCaption={setMyCaption}
              adLink={myAdLink}
              setAdLink={setMyAdLink}
              errorMsg={errorMsg}
            />

            {competitors.map((_, index) => (
              <AdUploadCard
                key={index}
                title={`Ad đối thủ #${index + 1}`}
                type="competitor"
                channelInfo={currentChannelInfo}
                canRemove={competitors.length > 1}
                onRemove={() => handleRemoveCompetitor(index)}
                isSingleMode={false}
              />
            ))}
          </div>

          <button
            onClick={handleAddCompetitor}
            className="w-full py-3.5 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 bg-[#0d111a]/40 hover:bg-[#0d111a] text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm ad đối thủ</span>
          </button>
        </>
      )}

      {/* 3. Chế độ: Phân tích đối thủ */}
      {selectedMode === 'analyze-competitor' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {competitors.map((_, index) => (
              <AdUploadCard
                key={index}
                title={`Ad đối thủ #${index + 1}`}
                type="competitor"
                channelInfo={currentChannelInfo}
                canRemove={competitors.length > 1}
                onRemove={() => handleRemoveCompetitor(index)}
                isSingleMode={false}
              />
            ))}
          </div>

          <button
            onClick={handleAddCompetitor}
            className="w-full py-3.5 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 bg-[#0d111a]/40 hover:bg-[#0d111a] text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm ad đối thủ</span>
          </button>
        </>
      )}

      {/* 4. Chế độ: Check kịch bản */}
      {selectedMode === 'check-script' && (
        <div className="max-w-3xl rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Kịch bản / Brief quảng cáo</h3>
          </div>
          <textarea
            rows={7}
            placeholder="Dán nội dung kịch bản, lời thoại video hoặc brief quảng cáo vào đây để AI rà soát vi phạm chính sách sớm..."
            className="w-full rounded-xl bg-[#07090e] border border-slate-800/90 focus:border-indigo-500/60 p-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-y transition-colors"
          />
        </div>
      )}
    </div>
  );
}