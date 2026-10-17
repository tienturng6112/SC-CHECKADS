import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Trash2,
  Plus,
  Check,
  ArrowLeft
} from 'lucide-react';

const initialGroupA = [
  {
    id: 'a1',
    title: 'Không cam kết kết quả tuyệt đối',
    desc: "✗ Trừ nặng: 'trắng 100%', 'hết nám vĩnh viễn', 'cam kết/đảm bảo hiệu quả', 'hoàn tiền nếu không trắng', mốc thời gian phi thực tế ('trắng sau 3 ngày'). ✓ Vẫn được: 'giúp da sáng mịn hơn', 'nhiều khách cải thiện rõ'. Chỉ tránh sự CHẮC CHẮN tuyệt đối."
  },
  {
    id: 'a2',
    title: 'Không nhắm thuộc tính cá nhân',
    desc: "✗ Trừ: ngụ ý BIẾT tình trạng người xem — 'Da bạn đang bị nám?', 'Bạn béo?' (Meta gắn cờ kể cả gián tiếp). ✓ Vẫn được: nêu vấn đề chung hấp dẫn — 'Nám mảng khiến nhiều chị em mất tự tin'. Nói về VẤN ĐỀ, đừng chỉ vào người xem."
  },
  {
    id: 'a3',
    title: 'Không tuyên bố y tế / thành phần cấm',
    desc: "Luật VN cấm làm MỸ PHẨM/TPCN bị hiểu là thuốc (NĐ 342/2025 Đ.27-28). ✗ Trừ nặng khi ad MỸ PHẨM/TPCN dùng: 'đặc trị', 'chữa', 'điều trị tận gốc', nói như thuốc; hoặc thành phần cấm (corticoid, tẩy trắng mạnh — TikTok cấm). ✓ Vẫn được (RỦI RO THẤP — đừng trừ nặng): DỊCH VỤ THẨM MỸ/PHÒNG KHÁM có phép."
  },
  {
    id: 'a4',
    title: "Không dùng từ 'nhất' & không so sánh đối thủ",
    desc: "Luật Quảng cáo (Đ.8): cấm 'tốt nhất', 'số 1', 'số một', 'duy nhất', 'hàng đầu', 'tuyệt hảo', 'lựa chọn tối ưu'... nếu KHÔNG có tài liệu hợp pháp chứng minh; và cấm so sánh trực tiếp với sản phẩm/dịch vụ của bên khác ('tốt hơn X', 'hiệu quả gấp 5 lần Y'). ✗ Trừ khi ad xưng 'nhất'/danh hiệu/xếp hạng hoặc so sánh mà KHÔNG có chứng cứ."
  },
  {
    id: 'a5',
    title: 'Không mượn hình ảnh bác sĩ / nhân viên y tế (mỹ phẩm & TPCN)',
    desc: "NĐ 342/2025 (hiệu lực 15/2/2026) CẤM dùng hình ảnh, trang phục áo blouse, tên, thư, lời nói/chứng thực của bác sĩ, dược sĩ, nhân viên & cơ sở y tế để QC MỸ PHẨM và TPCN. ✗ Trừ nặng nếu ad mỹ phẩm/TPCN show bác sĩ/áo trắng/'chuyên gia da liễu khuyên dùng'. ✓ NGOẠI LỆ: dịch vụ thẩm mỹ Y TẾ có giấy phép."
  },
  {
    id: 'a6',
    title: 'Đủ thông tin bắt buộc theo luật',
    desc: "Nội dung QC phải có thông tin luật định. ✗ Trừ khi THIẾU: (mỹ phẩm — NĐ 342/2025 Đ.27-28) tên sản phẩm + công dụng + tên & địa chỉ tổ chức chịu trách nhiệm đưa ra thị trường; (TPCN — NĐ 15/2018) khuyến cáo 'Thực phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh' hiển thị rõ; (dịch vụ thẩm mỹ) thông tin cơ sở."
  },
  {
    id: 'a7',
    title: 'Hình ảnh & before/after trung thực',
    desc: "✗ Trừ: ảnh trước/sau hoặc ghép kết quả 'hoàn hảo' ngụ ý biến đổi phi thực tế, chỉnh sửa/filter quá tay (Meta & Google siết; TikTok cấm filter làm đẹp trong ad skincare). ✓ Vẫn được: ảnh sản phẩm/khách thật đẹp, demo cách dùng, kết cấu sản phẩm."
  },
  {
    id: 'a8',
    title: 'Không hạ thấp / gây mặc cảm ngoại hình',
    desc: "✗ Trừ: 'xấu thì ế', 'da sần là kém sang', 'phải đẹp mới được yêu' (TikTok siết nội dung gây lo âu hình thể). ✓ Vẫn được — và NÊN: truyền cảm hứng tự tin, tích cực, tôn vẻ đẹp tự nhiên."
  },
  {
    id: 'a9',
    title: 'Chuẩn định dạng & ưu đãi minh bạch',
    desc: "✗ Trừ: chữ trên ảnh > 20% diện tích (quy định Facebook), khan hiếm GIẢ/clickbait lừa, ưu đãi/giá không đúng chương trình thật (QC sai sự thật bị phạt theo NĐ 38/2021). ✓ Vẫn được: ưu đãi/giảm giá/deadline CÓ THẬT, đúng chương trình đã duyệt. (Thông tin luật định bắt buộc chấm ở tiêu chí 'Đủ thông tin bắt buộc theo luật')."
  }
];

const initialGroupB = [
  {
    id: 'b1',
    title: 'Tiêu đề / hook mở đầu mạnh',
    desc: "Tiêu đề là 'vũ khí tối thượng' (góp ~80% hiệu quả). 2-3 DÒNG ĐẦU (phần trước 'Xem thêm' bị Facebook cắt) phải níu mắt ngay, bám điểm nổi bật/insight/ưu đãi. Video: 3 giây đầu phải dừng được lướt. Mở đầu nhạt, chậm → trừ."
  },
  {
    id: 'b2',
    title: 'Đánh trúng insight & nỗi đau khách hàng',
    desc: "Chạm đúng vấn đề thật (nám, mụn, lão hoá, da xỉn) và mong muốn ẩn (tự tin, trẻ trung). Liên tục bám vấn đề khách quan tâm, không lan man. Nói bằng ngôn ngữ của khách, không sáo rỗng."
  },
  {
    id: 'b3',
    title: 'Tập trung 1 mục tiêu / 1 thông điệp',
    desc: "Nhắm 1 và chỉ 1: một mục tiêu, một thông điệp chính, một insight. Đơn giản và tập trung; trong vài giây hiểu đang bán gì và lợi ích cốt lõi. Ôm đồm nhiều ý làm loãng → trừ."
  },
  {
    id: 'b4',
    title: 'Văn phong tự nhiên, gần gũi, chạm cảm xúc',
    desc: "Viết tự nhiên NHƯ NÓI, có cảm xúc, tạo hình ảnh trong đầu người đọc (dễ liên tưởng). Khách mua nhiều bằng cảm xúc — chạm tới điều đó. Tránh giọng quảng cáo cứng, 'nổ', sáo. Văn trôi chảy, có nhịp, thỉnh thoảng có điểm nhấn gây chú ý."
  },
  {
    id: 'b5',
    title: 'Cảm giác chân thật / UGC',
    desc: "Đặc điểm ad làm đẹp thắng 2026: bớt bóng bẩy, tăng tự nhiên như người thật chia sẻ (UGC, review thật, quay điện thoại, kể trải nghiệm, hậu trường). Quá 'studio'/cường điệu, giả tạo → trừ. Chân thật tạo niềm tin & chuyển đổi cao hơn."
  },
  {
    id: 'b6',
    title: 'Bằng chứng xã hội & độ tin cậy',
    desc: "Có yếu tố tin cậy THẬT: review/cảm nhận khách thật, số lượng khách/đánh giá, KOL/micro-influencer, chứng nhận, giấy phép cơ sở. Không có bằng chứng nào → trừ; review giả/cường điệu cũng không cộng. LƯU Ý PHÁP LÝ: với ad MỸ PHẨM/TPCN, không được lấy hình ảnh/lời bác sĩ, dược sĩ làm bằng chứng (NĐ 342/2025)."
  },
  {
    id: 'b7',
    title: 'Ưu đãi, CTA & thông tin liên hệ',
    desc: "Có lý do hành động NGAY: ưu đãi/quà/giá tốt + lời kêu gọi rõ (inbox, đặt lịch, để lại SĐT). Có chân bài/thông tin liên hệ (địa chỉ, hotline, website, danh hiệu) ở cuối. CTA rõ nhưng không 'nổ' lố. Thiếu CTA hoặc thiếu cách liên hệ → trừ."
  },
  {
    id: 'b8',
    title: 'Điểm khác biệt (USP)',
    desc: "Nêu được lý do chọn mình thay vì đối thủ: công nghệ, thành phần đặc trưng, quy trình, cam kết dịch vụ, định vị riêng. 'Sản phẩm tốt' chung chung ai cũng nói được → trừ."
  },
  {
    id: 'b9',
    title: 'Chuẩn sản xuất & hợp format nền tảng',
    desc: "Ảnh/video chất lượng, logo/thương hiệu rõ nét. Đúng tỉ lệ nền tảng: Facebook/TikTok 1:1 hoặc 9:16, YouTube 16:9 (1920×1080). Video nên 15-90s, có sub, có outro cuối, voice rõ không tạp âm. Hợp 'gu'/xu hướng nền tảng (TikTok/Reels native). Sai chuẩn/lạc format → trừ."
  }
];

const aiModels = [
  { id: 'claude', label: 'Claude (Anthropic)' },
  { id: 'chatgpt', label: 'ChatGPT (OpenAI)' },
  { id: 'gemini', label: 'Gemini (Google)' },
];

// Component hiển thị 1 Nhóm tiêu chí (Nhóm A hoặc Nhóm B)
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
      {/* Header của Nhóm */}
      <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconBoxStyle}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h2 className="text-sm md:text-base font-bold text-white">{title}</h2>
        </div>
        <span className="text-xs font-mono text-slate-400">{items.length} tiêu chí</span>
      </div>

      {/* Danh sách các tiêu chí */}
      <div className="divide-y divide-slate-800/70">
        {items.map((item, index) => (
          <div key={item.id} className="p-6 space-y-3">
            {/* Dòng 1: Số thứ tự + Input Tiêu đề + Nút Xóa */}
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

            {/* Dòng 2: Textarea Hướng dẫn chấm điểm */}
            <div className="pl-9">
              <textarea
                rows={2}
                value={item.desc}
                onChange={(e) => onUpdateItem(item.id, 'desc', e.target.value)}
                placeholder="Nhập hướng dẫn chi tiết để AI dựa vào chấm điểm..."
                className="w-full rounded-xl bg-[#07090e] border border-slate-800/90 focus:border-indigo-500/60 px-4 py-3 text-xs text-slate-200 leading-relaxed placeholder-slate-600 focus:outline-none resize-y transition-colors"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer của Nhóm: Nút Thêm tiêu chí */}
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

export default function Criteria({ onNavigate }) {
  const [selectedAI, setSelectedAI] = useState('gemini');
  const [groupA, setGroupA] = useState(initialGroupA);
  const [groupB, setGroupB] = useState(initialGroupB);
  const [savedNotice, setSavedNotice] = useState(false);

  // Các hàm cập nhật Nhóm A
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

  // Các hàm cập nhật Nhóm B
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

      {/* Khối chọn AI dùng để chấm điểm */}
      <div className="rounded-2xl bg-[#0d111a] border border-slate-800/90 p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-white">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>AI dùng để chấm điểm</span>
        </div>

        {/* 3 Nút chọn AI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {aiModels.map((model) => {
            const isSelected = selectedAI === model.id;
            return (
              <button
                key={model.id}
                onClick={() => setSelectedAI(model.id)}
                className={`py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#15192c] border-2 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.18)]'
                    : 'bg-[#121622] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {model.label}
              </button>
            );
          })}
        </div>

        {/* Hộp mô tả chi tiết AI */}
        <div className="rounded-xl bg-[#0a0d15] border border-slate-800/90 p-4 space-y-2 text-xs leading-relaxed">
          <div className="flex items-start sm:items-center gap-2 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5 sm:mt-0" />
            <p>Đọc ảnh và video. Của Google — xem được nguyên video kèm âm thanh.</p>
          </div>
          <div className="flex items-start sm:items-center gap-2 text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
            <p>
              Video: xem NGUYÊN clip và NGHE lời thoại/nhạc để chấm sâu (hook, lời thoại, diễn biến). Cần tài khoản còn credit.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          Cần API key tương ứng trong .env.local. Bấm “Lưu” để áp dụng.
        </p>
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

      {/* Cụm nút Lưu & Về trang chủ ở cuối trang */}
      <div className="flex flex-wrap items-center gap-3.5 pt-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white font-bold text-xs md:text-sm shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-opacity cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>{savedNotice ? 'Đã lưu thành công!' : 'Lưu bộ tiêu chí'}</span>
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
