import { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import EvaluationResult from './EvaluationResult';
import { evaluateAdWithCriteria } from '../services/aiEvaluator';

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

const loadingSteps = [
  'Đang đọc nội dung quảng cáo...',
  'Đối chiếu chính sách 2026...',
  'Chấm sức hút & hiệu quả thị trường...',
  'Soát cảnh báo & rủi ro vi phạm...',
  'Tổng hợp điểm và gợi ý cải thiện...'
];

// Hàm cắt 6 khung hình thật từ file Video
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
      canvas.width = 360;
      canvas.height = 270;
      const ctx = canvas.getContext('2d');
      const frames = [];

      for (let i = 0; i < count; i++) {
        const time = Math.min((duration / (count + 1)) * (i + 1), Math.max(duration - 0.1, 0));
        await new Promise((r) => {
          video.currentTime = time;
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL('image/jpeg', 0.85));
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

function AdUploadCard({
  title,
  type,
  channelInfo,
  onRemove,
  canRemove,
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

        {/* Khu vực hiển thị Video/Ảnh đã chọn hoặc Kéo-thả */}
        {previewUrl ? (
          <div className="relative rounded-xl bg-black border border-slate-800 h-64 overflow-hidden flex items-center justify-center">
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
              title="Xoá file"
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-900/90 hover:bg-rose-600 text-slate-200 hover:text-white border border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
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

        {/* Đường kẻ phân cách */}
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-slate-800/80"></div>
          <span className="flex-shrink mx-3 text-[10px] font-mono uppercase tracking-widest text-slate-500">
            HOẶC DÁN LINK
          </span>
          <div className="flex-grow border-t border-slate-800/80"></div>
        </div>

        {/* Ô nhập Link */}
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

      {/* Footer hiển thị Kênh */}
      <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
        <span>Kênh:</span>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161f30] border border-slate-700/60 text-white font-medium text-xs">
          <span className={`w-2 h-2 rounded-full ${channelInfo.dotColor}`} />
          <span>{channelInfo.label}</span>
        </div>
        <span>· chọn ở trên cho cả 2 bên</span>
      </div>
    </div>
  );
}

export default function Evaluate({ onNavigate, onResultModeChange, groupA, groupB }) {
  const [selectedMode, setSelectedMode] = useState('my-ad');
  const [selectedChannel, setSelectedChannel] = useState('facebook');
  const [competitors, setCompetitors] = useState([1]);

  const [myAdFile, setMyAdFile] = useState(null);
  const [myAdPreview, setMyAdPreview] = useState('');
  const [extractedFrames, setExtractedFrames] = useState([]);
  const [myCaption, setMyCaption] = useState('');
  const [myAdLink, setMyAdLink] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [evaluationData, setEvaluationData] = useState(null);

  const currentChannelInfo = channels.find((c) => c.id === selectedChannel) || channels[0];

  // Hiệu ứng chuyển đổi câu chữ trong Popup Loading giống trong video
  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % loadingSteps.length);
    }, 650);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

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

  const handleStartAnalyze = async () => {
    if (!myCaption.trim() && !myAdLink.trim() && !myAdFile) {
      setErrorMsg('Vui lòng nhập Caption quảng cáo, dán link hoặc chọn file video/ảnh trước khi bấm Chấm điểm.');
      return;
    }
    setErrorMsg('');
    setLoadingStepIdx(0);
    setIsAnalyzing(true);

    // Chờ chạy hiệu ứng các bước đọc video & đối chiếu bộ tiêu chí
    const minDelay = new Promise((r) => setTimeout(r, 3000));
    const evalPromise = evaluateAdWithCriteria({
      caption: myCaption,
      adLink: myAdLink,
      frames: extractedFrames,
      hasVideo: Boolean(myAdFile?.type?.startsWith('video')),
      channel: currentChannelInfo,
      groupA,
      groupB
    });

    const [result] = await Promise.all([evalPromise, minDelay]);

    setEvaluationData(result);
    setIsAnalyzing(false);
    if (onResultModeChange) onResultModeChange(true);
  };

  const handleReset = () => {
    setEvaluationData(null);
    if (onResultModeChange) onResultModeChange(false);
  };

  if (evaluationData) {
    return (
      <EvaluationResult
        result={evaluationData}
        channel={currentChannelInfo}
        frames={extractedFrames}
        onReset={handleReset}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-16 relative">
      {/* POPUP MODAL ĐANG CHẤM ĐIỂM GIỐNG HỆT VIDEO */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-[#05070b]/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0d111a] border border-slate-800 p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] animate-pulse">
              <Gauge className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Đang chấm điểm</h3>
              <p className="text-xs text-indigo-300 font-medium h-4 transition-all">
                {loadingSteps[loadingStepIdx]}
              </p>
            </div>

            {/* Thanh tiến trình chạy mượt */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${((loadingStepIdx + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              AI đang phân tích — thường mất 10–40 giây tùy nội dung.
            </p>
          </div>
        </div>
      )}

      {/* Tiêu đề trang */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Đánh giá quảng cáo</h1>
        <p className="text-sm text-slate-400">
          Chọn chế độ, đưa quảng cáo vào, AI sẽ chấm điểm và so sánh.
        </p>
      </div>

      {/* Khung thông báo AI */}
      <div className="rounded-xl bg-[#111322] border border-indigo-500/25 p-4 space-y-2 text-xs leading-relaxed">
        <div className="flex items-start sm:items-center gap-2 text-slate-200">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            <strong className="font-semibold text-white">Đang chấm bằng AI Động cơ 2026</strong> — Đọc ảnh, video và câu chữ đối chiếu chính sách và chất lượng nội dung.
          </p>
        </div>

        <div className="flex items-start sm:items-center gap-2 text-amber-400/90">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            Video: xem NGUYÊN clip và NGHE lời thoại/nhạc để chấm sâu (hook, lời thoại, diễn biến). Cần tài khoản còn credit.
          </p>
        </div>

        <div className="pl-6 text-slate-400">
          Đổi AI & cổng kết nối ở trang{' '}
          <button
            onClick={() => onNavigate && onNavigate('criteria')}
            className="text-slate-200 font-semibold underline hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Bộ tiêu chí
          </button>
          .
        </div>
      </div>

      {/* Lưới chế độ đánh giá */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="space-y-6">
          <div className="max-w-2xl">
            <AdUploadCard
              title="Ad của tôi"
              type="my-ad"
              channelInfo={currentChannelInfo}
              canRemove={false}
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
          </div>

          {/* Thanh Bar dưới cùng chứa nút Chấm điểm giống hệt trong Video */}
          <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Mỗi ad tốn <strong className="text-slate-200">1 lượt AI</strong> · tổng:{' '}
                <strong className="text-white">1 lượt</strong>
              </span>
            </div>

            <button
              onClick={handleStartAnalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white font-bold text-xs md:text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Gauge className="w-4 h-4" />
              <span>Chấm điểm</span>
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
                onRemove={() =>
                  setCompetitors((prev) => prev.filter((_, idx) => idx !== index))
                }
              />
            ))}
          </div>

          <button
            onClick={() => setCompetitors((prev) => [...prev, prev.length + 1])}
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
                onRemove={() =>
                  setCompetitors((prev) => prev.filter((_, idx) => idx !== index))
                }
              />
            ))}
          </div>
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
