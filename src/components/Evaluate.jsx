import { useState, useEffect } from 'react';
import {
  Clock,
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
  X,
  Sliders,
  AlertCircle
} from 'lucide-react';
import EvaluationResult from './EvaluationResult';
import { evaluateAdWithCriteria } from '../services/aiEvaluator';
import { getGwenConfig } from '../config/gwenConfig';

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
    desc: 'Chấm và xếp hạng nhiều video quảng cáo của đối thủ.',
    icon: Search,
    isPending: true,
    badge: 'Pending / Sắp ra mắt',
  },
  {
    id: 'check-script',
    title: 'Check kịch bản',
    desc: 'Dán kịch bản/brief chưa quay → bắt vi phạm pháp lý sớm để sửa trước.',
    icon: ShieldCheck,
  },
];

const channels = [
  { id: 'facebook', label: 'Facebook / Instagram', dotColor: 'bg-blue-500' },
  { id: 'tiktok', label: 'TikTok', dotColor: 'bg-rose-500' },
  { id: 'google', label: 'Google / YouTube', dotColor: 'bg-emerald-500' },
];

const loadingSteps = [
  'Đang kết nối cổng AI Vision (OpenAI / Qwen / Omni)...',
  'Đang phân tích text overlay, chữ chèn trên video và biển hiệu...',
  'Đang quét 9 tiêu chí Tuân thủ chính sách quảng cáo 2026...',
  'Đang chấm 9 tiêu chí Chất lượng sáng tạo & Chuyển đổi...',
  'Đang đối chiếu trực diện điểm số từng tiêu chí và tổng hợp báo cáo...',
];

// Nén ảnh tĩnh chuẩn 480px, JPEG 0.6 chống quá tải proxy
const compressImageFile = (file, maxWidth = 480, quality = 0.6) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.naturalWidth || img.width || 480;
      let h = img.naturalHeight || img.height || 360;
      if (w > maxWidth) {
        h = Math.round((h / w) * maxWidth);
        w = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', quality);
      URL.revokeObjectURL(url);
      resolve(base64);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('');
    };
    img.src = url;
  });
};

// Cắt 4 frames đại diện từ video với maxWidth 480px và JPEG 0.6
const extractFramesFromVideo = (videoFile, count = 4) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(videoFile);
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      const duration = video.duration || 6;
      const originalWidth = video.videoWidth || 640;
      const originalHeight = video.videoHeight || 360;

      // Giới hạn chiều rộng tối đa 480px
      const maxWidth = 480;
      let targetWidth = originalWidth;
      let targetHeight = originalHeight;
      if (originalWidth > maxWidth) {
        targetWidth = maxWidth;
        targetHeight = Math.round((originalHeight / originalWidth) * maxWidth);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      const frames = [];

      for (let i = 0; i < count; i++) {
        const time = Math.min((duration / (count + 1)) * (i + 1), Math.max(duration - 0.1, 0));
        await new Promise((r) => {
          video.currentTime = time;
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Nén JPEG 0.6 tối ưu dung lượng
            frames.push(canvas.toDataURL('image/jpeg', 0.6));
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
  errorMsg,
}) {
  const isMyAd = type === 'my-ad';
  const hasMedia = Boolean(file || previewUrl || (adLink && adLink.trim()));

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
          <div className="relative rounded-xl bg-black border border-slate-800 h-60 overflow-hidden flex items-center justify-center">
            {file?.type?.startsWith('video') ? (
              <video src={previewUrl} controls className="max-h-full max-w-full object-contain" />
            ) : (
              <img src={previewUrl} alt="Ad preview" className="max-h-full max-w-full object-contain" />
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
          <label className="group border border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-xl bg-[#0a0d14]/60 hover:bg-[#111622] h-60 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all">
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept="image/jpeg,image/png,video/mp4"
            />
            <div className="w-10 h-10 rounded-xl bg-[#161b26] border border-slate-800 group-hover:border-slate-700 flex items-center justify-center mb-3 text-slate-400 group-hover:text-indigo-400 transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs md:text-sm font-bold text-slate-200 mb-1">Kéo-thả video hoặc ảnh</p>
            <p className="text-[11px] text-slate-500">JPG, PNG, MP4 · ảnh ≤10MB, video ≤500MB</p>
          </label>
        )}

        {/* Khu vực nhập Caption (KHÔNG BẮT BUỘC NẾU ĐÃ CÓ VIDEO/ẢNH) */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs">
            {hasMedia ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className="text-slate-300">
              Caption{' '}
              {hasMedia ? (
                <span className="text-slate-400 font-normal">(Tùy chọn nếu đã tải video/ảnh)</span>
              ) : (
                <>
                  <strong className="text-amber-500 font-semibold">bắt buộc</strong>{' '}
                  <span className="text-slate-500">(nếu chưa tải video hoặc link)</span>
                </>
              )}
            </span>
          </div>
          <textarea
            rows={3}
            value={caption}
            onChange={(e) => setCaption && setCaption(e.target.value)}
            placeholder={
              hasMedia
                ? 'Nhập caption hoặc ghi chú thông điệp (tùy chọn)...'
                : 'Nhập caption quảng cáo... (bắt buộc nếu không có video/ảnh)'
            }
            className="w-full rounded-xl bg-[#07090e] border border-slate-800/90 focus:border-indigo-500/60 p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none transition-colors"
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
            placeholder="Dán link bài viết/video quảng cáo..."
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
      </div>
    </div>
  );
}

export default function Evaluate({ onNavigate, onResultModeChange, groupA, groupB }) {
  const [selectedMode, setSelectedMode] = useState('my-ad');
  const [selectedChannel, setSelectedChannel] = useState('facebook');

  // Ad của tôi
  const [myAdFile, setMyAdFile] = useState(null);
  const [myAdPreview, setMyAdPreview] = useState('');
  const [extractedFrames, setExtractedFrames] = useState([]);
  const [myCaption, setMyCaption] = useState('');
  const [myAdLink, setMyAdLink] = useState('');

  // Danh sách Ad đối thủ (hỗ trợ 1 đến 4 đối thủ với dữ liệu file, frames độc lập)
  const [competitors, setCompetitors] = useState([
    { id: 'comp_1', title: 'Ad đối thủ #1', file: null, previewUrl: '', frames: [], caption: '', adLink: '' },
  ]);

  // Kịch bản cho chế độ check-script
  const [scriptContent, setScriptContent] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [aiError, setAiError] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [evaluationData, setEvaluationData] = useState(null);

  const currentChannelInfo = channels.find((c) => c.id === selectedChannel) || channels[0];
  const gwenConfig = getGwenConfig();
  const hasApiKey = Boolean(gwenConfig.apiKey && gwenConfig.apiKey.trim());

  // Hiệu ứng chuyển chữ trong Popup Loading
  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % loadingSteps.length);
    }, 650);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Xử lý khi chọn file cho "Ad của tôi" (Cắt 4 frames đại diện)
  const handleSelectMyFile = async (file) => {
    setMyAdFile(file);
    const url = URL.createObjectURL(file);
    setMyAdPreview(url);
    setAiError('');

    if (file.type.startsWith('video')) {
      const frames = await extractFramesFromVideo(file, 4);
      setExtractedFrames(frames);
    } else {
      const base64 = await compressImageFile(file, 480, 0.6);
      const safeB64 = base64 || '';
      setExtractedFrames([safeB64, safeB64, safeB64, safeB64]);
    }
  };

  const handleClearMyFile = () => {
    setMyAdFile(null);
    setMyAdPreview('');
    setExtractedFrames([]);
  };

  // Xử lý khi chọn file cho Ad đối thủ (Cắt 4 frames độc lập)
  const handleSelectCompetitorFile = async (index, file) => {
    const url = URL.createObjectURL(file);
    let frames = [];
    if (file.type.startsWith('video')) {
      frames = await extractFramesFromVideo(file, 4);
    } else {
      const base64 = await compressImageFile(file, 480, 0.6);
      frames = [base64, base64, base64, base64];
    }
    setCompetitors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], file, previewUrl: url, frames };
      return next;
    });
  };

  const handleClearCompetitorFile = (index) => {
    setCompetitors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], file: null, previewUrl: '', frames: [] };
      return next;
    });
  };

  const handleUpdateCompetitor = (index, field, value) => {
    setCompetitors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddCompetitor = () => {
    if (competitors.length >= 4) return; // Tối đa 4 đối thủ
    setCompetitors((prev) => [
      ...prev,
      {
        id: `comp_${Date.now()}_${prev.length + 1}`,
        title: `Ad đối thủ #${prev.length + 1}`,
        file: null,
        previewUrl: '',
        frames: [],
        caption: '',
        adLink: '',
      },
    ]);
  };

  const handleRemoveCompetitor = (index) => {
    setCompetitors((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Xử lý Chấm điểm toàn diện cho mọi chế độ
  const handleStartAnalyze = async () => {
    setErrorMsg('');
    setAiError('');

    // Kiểm tra điều kiện nhập liệu theo từng chế độ
    if (selectedMode === 'my-ad') {
      const hasContent = Boolean(myAdFile || myCaption.trim() || myAdLink.trim());
      if (!hasContent) {
        setErrorMsg('Vui lòng tải video/ảnh, nhập caption hoặc dán link quảng cáo.');
        return;
      }
    } else if (selectedMode === 'vs-competitor') {
      const myHasContent = Boolean(myAdFile || myCaption.trim() || myAdLink.trim());
      const compHasContent = competitors.some((c) => Boolean(c.file || c.caption?.trim() || c.adLink?.trim()));
      if (!myHasContent || !compHasContent) {
        setErrorMsg('Vui lòng cung cấp nội dung (video/ảnh hoặc caption) cho cả "Ad của tôi" và ít nhất 1 "Ad đối thủ".');
        return;
      }
    } else if (selectedMode === 'analyze-competitor') {
      const validComps = competitors.filter((c) => Boolean(c.file || c.caption?.trim() || c.adLink?.trim()));
      if (validComps.length < 2) {
        setErrorMsg('Chế độ Phân tích đối thủ cần tối thiểu 2 video/quảng cáo của đối thủ để so sánh.');
        return;
      }
    } else if (selectedMode === 'check-script') {
      if (!scriptContent.trim()) {
        setErrorMsg('Vui lòng dán nội dung kịch bản hoặc brief quảng cáo cần kiểm tra.');
        return;
      }
    }

    if (!isDemoMode && !hasApiKey) {
      setAiError(
        'Bạn chưa cấu hình API Key cho AI. Hãy chuyển sang menu "Bộ tiêu chí" để nhập API Key hoặc bật công tắc "Chế độ Demo thử nghiệm" ở bên dưới.'
      );
      return;
    }

    setLoadingStepIdx(0);
    setIsAnalyzing(true);

    try {
      // Đảm bảo frames của myAd đã sẵn sàng
      let myFramesToSend = extractedFrames;
      if ((!myFramesToSend || myFramesToSend.length === 0) && myAdFile) {
        if (myAdFile.type.startsWith('video')) {
          myFramesToSend = await extractFramesFromVideo(myAdFile, 4);
        } else {
          const b64 = await compressImageFile(myAdFile, 480, 0.6);
          myFramesToSend = [b64, b64, b64, b64];
        }
        setExtractedFrames(myFramesToSend);
      }

      // Đảm bảo frames của từng competitor đã sẵn sàng
      const preparedCompetitors = await Promise.all(
        competitors.map(async (c) => {
          let cFrames = c.frames;
          if ((!cFrames || cFrames.length === 0) && c.file) {
            if (c.file.type.startsWith('video')) {
              cFrames = await extractFramesFromVideo(c.file, 4);
            } else {
              const b64 = await compressImageFile(c.file, 480, 0.6);
              cFrames = [b64, b64, b64, b64];
            }
          }
          return {
            ...c,
            frames: cFrames || [],
          };
        })
      );

      const isComparison = selectedMode === 'vs-competitor' || selectedMode === 'analyze-competitor';
      const minDelay = new Promise((r) => setTimeout(r, 2000));

      let evalPromise;
      if (isComparison) {
        evalPromise = evaluateAdWithCriteria({
          isComparison: true,
          mode: selectedMode,
          channel: currentChannelInfo,
          groupA,
          groupB,
          isDemo: isDemoMode,
          myAd: selectedMode === 'vs-competitor'
            ? {
                name: 'Ad của tôi',
                caption: myCaption,
                adLink: myAdLink,
                frames: myFramesToSend,
              }
            : null,
          competitors: preparedCompetitors,
        });
      } else if (selectedMode === 'check-script') {
        evalPromise = evaluateAdWithCriteria({
          caption: scriptContent,
          channel: currentChannelInfo,
          groupA,
          groupB,
          isDemo: isDemoMode,
          mode: 'check-script',
        });
      } else {
        evalPromise = evaluateAdWithCriteria({
          caption: myCaption,
          adLink: myAdLink,
          frames: myFramesToSend,
          images: myFramesToSend,
          hasVideo: Boolean(myAdFile?.type?.startsWith('video')),
          channel: currentChannelInfo,
          groupA,
          groupB,
          isDemo: isDemoMode,
          mode: 'my-ad',
        });
      }

      const [result] = await Promise.all([evalPromise, minDelay]);

      if (result.success === false || result.error) {
        setAiError(result.error || 'Có lỗi xảy ra trong quá trình thẩm định AI.');
        setIsAnalyzing(false);
        return;
      }

      setEvaluationData(result);

      // Tự động lưu vào /api/history
      try {
        const thumb = myFramesToSend?.[0] || preparedCompetitors?.[0]?.frames?.[0] || '';
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: selectedMode,
            channel: currentChannelInfo,
            caption: myCaption || scriptContent || preparedCompetitors?.[0]?.caption || '',
            adLink: myAdLink || preparedCompetitors?.[0]?.adLink || '',
            frames: myFramesToSend || preparedCompetitors?.[0]?.frames || [],
            thumbnail: thumb,
            result,
          }),
        });
        console.log('[Evaluate] Đã tự động lưu kết quả vào lịch sử thẩm định.');
      } catch (saveErr) {
        console.warn('[Evaluate] Không thể lưu vào lịch sử:', saveErr);
      }

      setIsAnalyzing(false);
      if (onResultModeChange) onResultModeChange(true);
    } catch (err) {
      console.error('Lỗi khi chấm điểm:', err);
      setAiError(err.message || 'Lỗi kết nối tới hệ thống AI.');
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setEvaluationData(null);
    setAiError('');
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
      {/* POPUP MODAL ĐANG CHẤM ĐIỂM */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-[#05070b]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0d111a] border border-slate-800 p-8 text-center space-y-6 shadow-2xl animate-scaleUp">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Hệ thống đang thẩm định...</h3>
              <p className="text-xs text-indigo-400 font-medium h-8 flex items-center justify-center transition-all">
                {loadingSteps[loadingStepIdx]}
              </p>
            </div>

            <div className="w-full bg-[#161c28] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${((loadingStepIdx + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">Áp dụng bộ 18 tiêu chí quảng cáo Việt Nam 2026</p>
          </div>
        </div>
      )}

      {/* Tiêu đề trang */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Thẩm định quảng cáo</h1>
          <p className="text-xs md:text-sm text-slate-400">
            Chấm điểm 18 tiêu chí · bắt vi phạm pháp lý 2026 · so sánh đối thủ & gợi ý viết lại
          </p>
        </div>
      </div>

      {/* HỘP BÁO LỖI CHI TIẾT TỪ AI NẾU CÓ */}
      {aiError && (
        <div className="rounded-2xl bg-rose-950/40 border border-rose-500/50 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-bold text-rose-200">Không thể thực hiện thẩm định AI</h4>
              <p className="text-xs text-rose-300/90 leading-relaxed">{aiError}</p>
            </div>
          </div>
          <div className="pl-8 flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => onNavigate && onNavigate('criteria')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-semibold text-rose-200 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Đến trang Bộ tiêu chí để nhập API Key</span>
            </button>
            <button
              onClick={() => {
                setIsDemoMode(true);
                setAiError('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-semibold text-amber-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bật Chế độ Demo (Giả lập để xem giao diện)</span>
            </button>
          </div>
        </div>
      )}

      {/* Lưới 4 Chế độ Đánh giá */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {evaluationModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <div
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`relative rounded-2xl p-5 flex items-start gap-3.5 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#121626] border-2 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.18)]'
                  : 'bg-[#0d111a] border border-slate-800/90 hover:border-slate-700'
              } ${mode.isPending ? 'opacity-90' : ''}`}
            >
              {mode.badge && (
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {mode.badge}
                </span>
              )}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-[#151a26] border border-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0 pr-6">
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

      {/* Bộ chọn Kênh quảng cáo & Chế độ Demo */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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

        {/* Công tắc Chế độ Demo */}
        <label className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0d111a] border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={isDemoMode}
            onChange={(e) => {
              setIsDemoMode(e.target.checked);
              setAiError('');
            }}
            className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-200">Chế độ Demo (Giả lập)</span>
            <span className="text-slate-500 ml-1.5">· xem trước không cần API Key</span>
          </div>
        </label>
      </div>

      {/* 1. CHẾ ĐỘ: CHỈ AD CỦA TÔI */}
      {selectedMode === 'my-ad' && (
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
      )}

      {/* 2. CHẾ ĐỘ: AD CỦA TÔI VS ĐỐI THỦ (Hỗ trợ 1-4 đối thủ) */}
      {selectedMode === 'vs-competitor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cột 1: Ad của tôi */}
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

            {/* Các Cột Đối thủ */}
            {competitors.map((comp, index) => (
              <AdUploadCard
                key={comp.id}
                title={comp.title}
                type="competitor"
                channelInfo={currentChannelInfo}
                canRemove={competitors.length > 1}
                file={comp.file}
                previewUrl={comp.previewUrl}
                onFileSelect={(f) => handleSelectCompetitorFile(index, f)}
                onClearFile={() => handleClearCompetitorFile(index)}
                caption={comp.caption}
                setCaption={(val) => handleUpdateCompetitor(index, 'caption', val)}
                adLink={comp.adLink}
                setAdLink={(val) => handleUpdateCompetitor(index, 'adLink', val)}
                onRemove={() => handleRemoveCompetitor(index)}
              />
            ))}
          </div>

          {competitors.length < 4 && (
            <button
              onClick={handleAddCompetitor}
              className="w-full py-3.5 rounded-xl border border-dashed border-slate-800 hover:border-indigo-500/60 bg-[#0d111a]/40 hover:bg-[#0d111a] text-xs font-semibold text-slate-400 hover:text-indigo-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>+ Thêm Ad đối thủ #{competitors.length + 1} (Tối đa 4 đối thủ)</span>
            </button>
          )}
        </div>
      )}

      {/* 3. CHẾ ĐỘ: PHÂN TÍCH ĐỐI THỦ (PENDING / SẮP RA MẮT) */}
      {selectedMode === 'analyze-competitor' && (
        <div className="rounded-2xl bg-gradient-to-br from-[#1c1811] via-[#14141d] to-[#0d111a] border border-amber-500/40 p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
              <span>Đang phát triển (Pending / Sắp ra mắt)</span>
            </div>
            <h3 className="text-base font-bold text-white">Tính năng Phân tích & Xếp hạng hàng loạt đối thủ</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tính năng phân tích và xếp hạng hàng loạt nhiều video đối thủ hiện đang trong trạng thái Pending (Đang phát triển). Vui lòng sử dụng chế độ <strong className="text-indigo-300">"Ad của tôi vs đối thủ"</strong> hoặc <strong className="text-cyan-300">"Check kịch bản"</strong> để thẩm định quảng cáo.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setSelectedMode('vs-competitor')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Chuyển sang "Ad của tôi vs đối thủ"</span>
            </button>
            <button
              onClick={() => setSelectedMode('check-script')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141b2b] hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Chuyển sang "Check kịch bản"</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. CHẾ ĐỘ: CHECK KỊCH BẢN / BRIEF */}
      {selectedMode === 'check-script' && (
        <div className="max-w-3xl rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Kịch bản / Lời thoại / Brief quảng cáo</h3>
                <p className="text-xs text-slate-400">Rà soát trước khi quay phim để tránh bị cấm sóng và phạt tiền</p>
              </div>
            </div>

            {/* 2 Nút Mẫu Kịch Bản Nhanh */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setScriptContent(`[0-3s] Bạn có đang tự ti vì mặt đầy mụn bọc, mụn viêm thâm xì nhìn phát ghê không?\n[3-10s] Đừng lo, đến ngay Thẩm mỹ viện ABC, Bác sĩ Minh cam kết khỏi dứt điểm 100% vĩnh viễn không bao giờ tái phát!\n[10-20s] Sử dụng siêu công nghệ Laser Nano số 1 Châu Á, đào thải độc tố tận gốc tế bào chỉ sau 1 buổi duy nhất.\n[20-30s] Giảm ngay 90% chỉ còn 199k cho 50 người đăng ký đầu tiên. Nhắn tin nhận ưu đãi ngay hôm nay!`);
                  setErrorMsg('');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-semibold transition-colors cursor-pointer"
                title="Tải kịch bản có nhiều lỗi chính sách để test AI bắt lỗi"
              >
                Mẫu 1: Trị mụn (nhiều lỗi test)
              </button>
              <button
                type="button"
                onClick={() => {
                  setScriptContent(`[0-3s] Bí quyết cải thiện làn da dầu mụn từ trải nghiệm thực tế của người dùng.\n[3-10s] Serum phục hồi da SkinCare với chiết xuất tràm trà và B5 thiên nhiên, hỗ trợ cấp ẩm và làm dịu nốt mụn sưng đỏ.\n[10-20s] Hướng dẫn sử dụng: Dùng 2-3 giọt mỗi tối sau bước làm sạch. Hiệu quả cảm nhận sau 2-4 tuần chăm sóc đều đặn (kết quả phụ thuộc cơ địa từng người).\n[20-30s] Sản phẩm được kiểm nghiệm da liễu an toàn. Tham khảo chi tiết và đặt mua tại link bên dưới!`);
                  setErrorMsg('');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-colors cursor-pointer"
                title="Tải kịch bản mỹ phẩm chuẩn mực tuân thủ NĐ 342/2025"
              >
                Mẫu 2: Mỹ phẩm chuẩn NĐ 342/2025
              </button>
            </div>
          </div>

          <textarea
            rows={9}
            value={scriptContent}
            onChange={(e) => setScriptContent(e.target.value)}
            placeholder="Dán nội dung kịch bản, lời thoại video hoặc brief quảng cáo vào đây để AI rà soát vi phạm chính sách sớm..."
            className="w-full rounded-xl bg-[#07090e] border border-slate-800/90 focus:border-indigo-500/60 p-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-y transition-colors leading-relaxed"
          />
          {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
        </div>
      )}

      {/* THANH BAR CHUNG DƯỚI CÙNG: HIỂN THỊ NÚT CHẤM ĐIỂM CHO TẤT CẢ CÁC CHẾ ĐỘ */}
      <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {isDemoMode ? (
              <span className="text-amber-400 font-semibold">Chế độ Demo: Giả lập kết quả nhanh (0 lượt AI)</span>
            ) : selectedMode === 'vs-competitor' ? (
              <span>Chấm độc lập từng video + tổng hợp so sánh đối đầu 18 tiêu chí</span>
            ) : selectedMode === 'analyze-competitor' ? (
              <span>Chấm và xếp hạng danh sách video đối thủ theo thang điểm 2026</span>
            ) : (
              <span>Chấm điểm chuyên sâu theo 18 tiêu chí quảng cáo Việt Nam 2026</span>
            )}
          </span>
        </div>

        <button
          onClick={handleStartAnalyze}
          disabled={isAnalyzing || selectedMode === "analyze-competitor"}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs md:text-sm shadow-lg hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer ${
            isDemoMode
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25'
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white shadow-indigo-500/25'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>
            {isDemoMode
              ? 'Chấm điểm (Chế độ Demo)'
              : selectedMode === 'vs-competitor'
              ? 'Bắt đầu So sánh Đối đầu (VS)'
              : selectedMode === 'analyze-competitor'
              ? 'Bắt đầu Phân tích Đối thủ'
              : 'Chấm điểm bằng AI Vision'}
          </span>
        </button>
      </div>
    </div>
  );
}
