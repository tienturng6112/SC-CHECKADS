import { getActiveGwenConfig } from './gwenService';

export const DEFAULT_CRITERIA_A = [
  { id: 'a1', title: 'Không cam kết kết quả tuyệt đối', desc: "✗ Trừ nặng: 'trắng 100%', 'hết nám vĩnh viễn', 'cam kết/đảm bảo hiệu quả', 'hoàn tiền nếu không trắng', mốc thời gian phi thực tế ('trắng sau 3 ngày'). ✓ Vẫn được: 'giúp da sáng mịn hơn', 'nhiều khách cải thiện rõ'. Chỉ tránh sự CHẮC CHẮN tuyệt đối." },
  { id: 'a2', title: 'Không nhắm thuộc tính cá nhân', desc: "✗ Trừ: ngụ ý BIẾT tình trạng người xem — 'Da bạn đang bị nám?', 'Bạn béo?' (Meta gắn cờ kể cả gián tiếp). ✓ Vẫn được: nêu vấn đề chung hấp dẫn — 'Nám mảng khiến nhiều chị em mất tự tin'. Nói về VẤN ĐỀ, đừng chỉ vào người xem." },
  { id: 'a3', title: 'Không tuyên bố y tế / thành phần cấm', desc: "Luật VN cấm làm MỸ PHẨM/TPCN bị hiểu là thuốc (NĐ 342/2025 Đ.27-28). ✗ Trừ nặng khi ad MỸ PHẨM/TPCN dùng: 'đặc trị', 'chữa', 'điều trị tận gốc', nói như thuốc; hoặc thành phần cấm (corticoid, tẩy trắng mạnh — TikTok cấm). ✓ Vẫn được: DỊCH VỤ THẨM MỸ/PHÒNG KHÁM có phép." },
  { id: 'a4', title: "Không dùng từ 'nhất' & không so sánh đối thủ", desc: "Luật Quảng cáo (Đ.8): cấm 'tốt nhất', 'số 1', 'số một', 'duy nhất', 'hàng đầu', 'tuyệt hảo', 'lựa chọn tối ưu'... nếu KHÔNG có tài liệu hợp pháp chứng minh; và cấm so sánh trực tiếp với bên khác ('tốt hơn X', 'hiệu quả gấp 5 lần Y')." },
  { id: 'a5', title: 'Không mượn hình ảnh bác sĩ / nhân viên y tế (mỹ phẩm & TPCN)', desc: "NĐ 342/2025 (hiệu lực 15/2/2026) CẤM dùng hình ảnh, trang phục áo blouse, tên, thư, lời nói/chứng thực của bác sĩ, dược sĩ, nhân viên & cơ sở y tế để QC MỸ PHẨM và TPCN. ✗ Trừ nặng nếu ad mỹ phẩm/TPCN show bác sĩ/áo trắng/'chuyên gia da liễu khuyên dùng'." },
  { id: 'a6', title: 'Đủ thông tin bắt buộc theo luật', desc: "Nội dung QC phải có thông tin luật định. ✗ Trừ khi THIẾU: (mỹ phẩm — NĐ 342/2025 Đ.27-28) tên sản phẩm + công dụng + tên & địa chỉ tổ chức chịu trách nhiệm đưa ra thị trường; (TPCN — NĐ 15/2018) khuyến cáo 'Thực phẩm này không phải là thuốc...'; (dịch vụ thẩm mỹ) thông tin cơ sở." },
  { id: 'a7', title: 'Hình ảnh & before/after trung thực', desc: "✗ Trừ: ảnh trước/sau hoặc ghép kết quả 'hoàn hảo' ngụ ý biến đổi phi thực tế, chỉnh sửa/filter quá tay (Meta & Google siết; TikTok cấm filter làm đẹp trong ad skincare). ✓ Vẫn được: ảnh sản phẩm/khách thật đẹp, demo cách dùng, kết cấu sản phẩm." },
  { id: 'a8', title: 'Không hạ thấp / gây mặc cảm ngoại hình', desc: "✗ Trừ: 'xấu thì ế', 'da sần là kém sang', 'phải đẹp mới được yêu' (TikTok siết nội dung gây lo âu hình thể). ✓ Vẫn được — và NÊN: truyền cảm hứng tự tin, tích cực, tôn vẻ đẹp tự nhiên." },
  { id: 'a9', title: 'Chuẩn định dạng & ưu đãi minh bạch', desc: "✗ Trừ: chữ trên ảnh > 20% diện tích (quy định Facebook), khan hiếm GIẢ/clickbait lừa, ưu đãi/giá không đúng chương trình thật (QC sai sự thật bị phạt theo NĐ 38/2021). ✓ Vẫn được: ưu đãi/giảm giá/deadline CÓ THẬT, đúng chương trình đã duyệt." }
];

export const DEFAULT_CRITERIA_B = [
  { id: 'b1', title: 'Tiêu đề / hook mở đầu mạnh', desc: "Tiêu đề là 'vũ khí tối thượng' (góp ~80% hiệu quả). 2-3 DÒNG ĐẦU (phần trước 'Xem thêm' bị Facebook cắt) phải níu mắt ngay, bám điểm nổi bật/insight/ưu đãi. Video: 3 giây đầu phải dừng được lướt. Mở đầu nhạt, chậm → trừ." },
  { id: 'b2', title: 'Đánh trúng insight & nỗi đau khách hàng', desc: "Chạm đúng vấn đề thật (nám, mụn, lão hoá, da xỉn) và mong muốn ẩn (tự tin, trẻ trung). Liên tục bám vấn đề khách quan tâm, không lan man. Nói bằng ngôn ngữ của khách, không sáo rỗng." },
  { id: 'b3', title: 'Tập trung 1 mục tiêu / 1 thông điệp', desc: "Nhắm 1 và chỉ 1: một mục tiêu, một thông điệp chính, một insight. Đơn giản và tập trung; trong vài giây hiểu đang bán gì và lợi ích cốt lõi. Ôm đồm nhiều ý làm loãng → trừ." },
  { id: 'b4', title: 'Văn phong tự nhiên, gần gũi, chạm cảm xúc', desc: "Viết tự nhiên NHƯ NÓI, có cảm xúc, tạo hình ảnh trong đầu người đọc (dễ liên tưởng). Khách mua nhiều bằng cảm xúc — chạm tới điều đó. Tránh giọng quảng cáo cứng, 'nổ', sáo. Văn trôi chảy, có nhịp, thỉnh thoảng có điểm nhấn gây chú ý." },
  { id: 'b5', title: 'Cảm giác chân thật / UGC', desc: "Đặc điểm ad làm đẹp thắng 2026: bớt bóng bẩy, tăng tự nhiên như người thật chia sẻ (UGC, review thật, quay điện thoại, kể trải nghiệm, hậu trường). Quá 'studio'/cường điệu, giả tạo → trừ. Chân thật tạo niềm tin & chuyển đổi cao hơn." },
  { id: 'b6', title: 'Bằng chứng xã hội & độ tin cậy', desc: "Có yếu tố tin cậy THẬT: review/cảm nhận khách thật, số lượng khách/đánh giá, KOL/micro-influencer, chứng nhận, giấy phép cơ sở. Không có bằng chứng nào → trừ; review giả/cường điệu cũng không cộng." },
  { id: 'b7', title: 'Ưu đãi, CTA & thông tin liên hệ', desc: "Có lý do hành động NGAY: ưu đãi/quà/giá tốt + lời kêu gọi rõ (inbox, đặt lịch, để lại SĐT). Có chân bài/thông tin liên hệ (địa chỉ, hotline, website, danh hiệu) ở cuối. CTA rõ nhưng không 'nổ' lố. Thiếu CTA hoặc thiếu cách liên hệ → trừ." },
  { id: 'b8', title: 'Điểm khác biệt (USP)', desc: "Nêu được lý do chọn mình thay vì đối thủ: công nghệ, thành phần đặc trưng, quy trình, cam kết dịch vụ, định vị riêng. 'Sản phẩm tốt' chung chung ai cũng nói được → trừ." },
  { id: 'b9', title: 'Chuẩn sản xuất & hợp format nền tảng', desc: "Ảnh/video chất lượng, logo/thương hiệu rõ nét. Đúng tỉ lệ nền tảng: Facebook/TikTok 1:1 hoặc 9:16, YouTube 16:9. Video nên 15-90s, có sub, có outro cuối, voice rõ không tạp âm. Hợp 'gu'/xu hướng nền tảng. Sai chuẩn/lạc format → trừ." }
];

/**
 * Xây dựng System Prompt chuyên sâu để Model AI chấm điểm quảng cáo theo thang 1-5
 */
export function buildAdEvaluationPrompt({ caption, adLink, channel, criteriaA, criteriaB, hasFrames }) {
  const getStoredList = (key, defaultList) => {
    try {
      const saved = typeof window !== 'undefined' && localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultList;
    } catch {
      return defaultList;
    }
  };

  const listA = criteriaA || getStoredList('criteria_group_a', DEFAULT_CRITERIA_A);
  const listB = criteriaB || getStoredList('criteria_group_b', DEFAULT_CRITERIA_B);

  const formattedCriteriaA = listA
    .map((item, idx) => `${idx + 1}. ${item.title}: ${item.desc}`)
    .join('\n');

  const formattedCriteriaB = listB
    .map((item, idx) => `${idx + 1}. ${item.title}: ${item.desc}`)
    .join('\n');

  const systemPrompt = `Bạn là Chuyên gia hàng đầu về Đánh giá và Thẩm định Quảng cáo (Ad Creative & Policy Auditor) với am hiểu sâu sắc về:
1. Luật Quảng cáo Việt Nam 2012, Nghị định 342/2025 (hiệu lực 15/2/2026 về mỹ phẩm & TPCN), Nghị định 15/2018/NĐ-CP, Nghị định 38/2021/NĐ-CP xử phạt VPHC.
2. Chính sách quảng cáo của các nền tảng Meta (Facebook), TikTok Ads, Google Ads năm 2026.
3. Kỹ thuật viết quảng cáo chuyển đổi cao (Direct Response Copywriting, UGC, Hook 3s đầu, USP, Pain-point insight).

NHIỆM VỤ:
Bạn nhận được nội dung quảng cáo (Caption, Link, Kênh và dữ liệu hình ảnh/video). Hãy đọc và phân tích kỹ lưỡng, sau đó chấm điểm từ 1 đến 5 điểm cho TẤT CẢ các tiêu chí thuộc 2 nhóm:

BẢNG 1: NHÓM A — TUÂN THỦ CHÍNH SÁCH (Mỗi tiêu chí cho điểm từ 1 đến 5):
${formattedCriteriaA}

BẢNG 2: NHÓM B — CHẤT LƯỢNG NỘI DUNG (Mỗi tiêu chí cho điểm từ 1 đến 5):
${formattedCriteriaB}

QUY TẮC THANG ĐIỂM (1 - 5):
- 5/5: Xuất sắc, hoàn toàn tuân thủ hoặc thực hiện rất xuất sắc, không có khuyết điểm.
- 4/5: Tốt, có thể tinh chỉnh nhẹ để hoàn hảo hơn.
- 3/5: Trung bình/Cảnh báo, có dấu hiệu chưa đạt hoặc có nguy cơ bị bóp tương tác / từ chối quảng cáo.
- 2/5: Kém, vi phạm rõ hoặc chất lượng nội dung yếu.
- 1/5: Rất kém / Vi phạm nghiêm trọng luật hoặc chính sách nền tảng.

ĐIỂM TỔNG QUAN (0 - 100):
- Tính trung bình có trọng số: Nếu Nhóm A có vi phạm nặng (điểm 1 hoặc 2), điểm tổng quan bị trừ mạnh (thường < 70).
- Điểm tổng quan > 80: Tốt/An toàn; 70-79: Cần chỉnh sửa; < 70: Nguy cơ cấm/vi phạm cao.

ĐỊNH DẠNG ĐẦU RA BẮT BUỘC:
Trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm bất kỳ văn bản chào hỏi nào ngoài JSON), tuân thủ cấu trúc sau:
{
  "overallScore": 82,
  "status": "Tốt",
  "summary": "Tóm tắt ngắn gọn 1-2 câu về nội dung quảng cáo và góc tiếp cận",
  "policyAlerts": [
    {
      "level": "Cao" hoặc "Vừa" hoặc "Thấp",
      "title": "Tên vấn đề chính sách (vd: Cần bổ sung giấy phép hoạt động)",
      "description": "Chi tiết vấn đề vi phạm hoặc rủi ro pháp lý theo luật",
      "lawReference": "Căn cứ pháp lý (ví dụ: NĐ 342/2025/NĐ-CP · Luật QC Đ.8)"
    }
  ],
  "groupA": [
    {
      "title": "Không cam kết kết quả tuyệt đối",
      "score": 5,
      "comment": "Nhận xét cụ thể lý do cho điểm dựa vào nội dung ad..."
    }
  ],
  "groupB": [
    {
      "title": "Tiêu đề / hook mở đầu mạnh",
      "score": 4,
      "comment": "Nhận xét cụ thể câu mở đầu, hook..."
    }
  ],
  "strengths": [
    "Ưu điểm cụ thể 1",
    "Ưu điểm cụ thể 2",
    "Ưu điểm cụ thể 3"
  ],
  "weaknesses": [
    "Nhược điểm hoặc thiếu sót 1",
    "Nhược điểm hoặc thiếu sót 2",
    "Nhược điểm hoặc thiếu sót 3"
  ],
  "targetAudiencePerspective": {
    "persona": "Mô tả chân dung khách hàng mục tiêu",
    "feedback": "Cảm nhận chân thực của khách hàng khi xem quảng cáo này"
  },
  "competitorPerspective": {
    "industryAnalysis": "Đánh giá vị thế nội dung so với các đối thủ trong ngành",
    "comparison": [
      "So sánh chi tiết 1",
      "So sánh chi tiết 2"
    ],
    "improvements": [
      "Đề xuất 1 để thắng đối thủ",
      "Đề xuất 2 để thắng đối thủ"
    ]
  },
  "actionableRecommendations": [
    "Đề xuất hành động khắc phục 1",
    "Đề xuất hành động khắc phục 2",
    "Đề xuất hành động khắc phục 3"
  ]
}
Lưu ý: Mảng 'groupA' phải đủ 9 mục tương ứng với 9 tiêu chí Nhóm A. Mảng 'groupB' phải đủ 9 mục tương ứng với 9 tiêu chí Nhóm B.`;

  const userContent = `NỘI DUNG QUẢNG CÁO CẦN CHẤM ĐIỂM:
- Kênh quảng cáo: ${channel || 'Facebook'}
- Link bài viết/video: ${adLink ? adLink : 'Không cung cấp link trực tiếp'}
- Dữ liệu hình ảnh/video đính kèm: ${hasFrames ? 'Đã tải lên tệp video/hình ảnh thực tế và trích xuất khung hình' : 'Chưa tải file video, chỉ có văn bản/link'}
- Nội dung Caption / Kịch bản:
"""
${caption || '(Không có caption, hãy phân tích dựa trên thông tin link hoặc hình ảnh)'}
"""

Hãy chấm điểm công tâm, bám sát các tiêu chí và trả về JSON theo đúng định dạng được yêu cầu.`;

  return { systemPrompt, userContent };
}

/**
 * Trình bóc tách JSON an toàn phòng trường hợp LLM bọc markdown code fences
 */
export function extractJsonFromResponse(rawText) {
  if (!rawText) return null;

  try {
    // 1. Thử parse trực tiếp
    return JSON.parse(rawText);
  } catch {
    // 2. Tìm khối ```json ... ```
    const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (err2) {
        console.warn('Lỗi parse JSON trong khối markdown code fence:', err2);
      }
    }

    // 3. Tìm vùng bắt đầu bằng { và kết thúc bằng }
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sub = rawText.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(sub);
      } catch (err3) {
        console.warn('Lỗi parse JSON substring:', err3);
      }
    }
  }

  return null;
}

/**
 * Sinh đánh giá thông minh giả lập khi chưa có API Key hoặc bị lỗi mạng/quota
 */
export function generateIntelligentFallbackEvaluation({ caption, channel, criteriaA, criteriaB }) {
  const cap = (caption || '').toLowerCase();
  
  const getStoredList = (key, defaultList) => {
    try {
      const saved = typeof window !== 'undefined' && localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultList;
    } catch {
      return defaultList;
    }
  };

  const actualListA = criteriaA || getStoredList('criteria_group_a', DEFAULT_CRITERIA_A);
  const actualListB = criteriaB || getStoredList('criteria_group_b', DEFAULT_CRITERIA_B);
  
  // Phát hiện một số rủi ro thường gặp
  const hasAbsoluteClaim = /cam kết|100%|chắc chắn|vĩnh viễn|hoàn tiền|khỏi hẳn|sau \d+ ngày/.test(cap);
  const hasDoctorClaim = /bác sĩ|dược sĩ|áo blouse|chuyên gia da liễu/.test(cap);
  const hasBestClaim = /số 1|tốt nhất|hàng đầu|duy nhất|độc quyền/.test(cap);
  const hasMedicalClaim = /điều trị|đặc trị|chữa khỏi|thuốc/.test(cap);
  const hasGoodHook = cap.length > 30;

  const scoreA1 = hasAbsoluteClaim ? 2 : 5;
  const scoreA3 = hasMedicalClaim ? 2 : 4;
  const scoreA4 = hasBestClaim ? 2 : 5;
  const scoreA5 = hasDoctorClaim ? 2 : 5;

  const groupAResults = actualListA.map((item, idx) => {
    let score = 5;
    let comment = 'Tuân thủ tốt tiêu chí, không phát hiện dấu hiệu vi phạm.';
    if (idx === 0) {
      score = scoreA1;
      comment = hasAbsoluteClaim ? "Có từ ngữ mang tính cam kết kết quả ('cam kết', '100%') — Meta và TikTok siết chặt." : "Không dùng từ ngữ cam kết tuyệt đối phi thực tế.";
    } else if (idx === 2) {
      score = scoreA3;
      comment = hasMedicalClaim ? "Dùng từ ngữ y tế ('đặc trị', 'chữa') dễ bị cơ quan chức năng phạt theo NĐ 342/2025." : "Không có tuyên bố y tế quá đà hoặc chất cấm.";
    } else if (idx === 3) {
      score = scoreA4;
      comment = hasBestClaim ? "Sử dụng từ xưng tụng 'nhất' hoặc 'số 1' mà thiếu căn cứ chứng minh theo Luật QC Đ.8." : "Không xưng 'nhất' hay so sánh dìm đối thủ.";
    } else if (idx === 4) {
      score = scoreA5;
      comment = hasDoctorClaim ? "Lưu ý NĐ 342/2025 cấm mượn hình ảnh bác sĩ/dược sĩ cho mỹ phẩm & TPCN." : "Không lạm dụng hình ảnh y tế / bác sĩ sai quy định.";
    } else if (idx === 5) {
      score = 4;
      comment = "Nên bổ sung đầy đủ thông tin cơ sở/giấy phép để tăng độ tin cậy và chuẩn luật.";
    }
    return { title: item.title, score, comment };
  });

  const groupBResults = actualListB.map((item, idx) => {
    let score = 4;
    let comment = 'Nội dung thể hiện khá tốt, có thể tối ưu thêm để nâng cao chuyển đổi.';
    if (idx === 0) {
      score = hasGoodHook ? 4 : 3;
      comment = hasGoodHook ? "Tiêu đề mở đầu thu hút, khơi gợi được sự tò mò của người xem." : "Mở đầu chưa đủ gay cấn để giữ chân người xem trong 3 giây đầu.";
    } else if (idx === 1) {
      score = 5;
      comment = "Đánh trúng nỗi đau và mong muốn làm đẹp của tệp khách hàng tiềm năng.";
    } else if (idx === 2) {
      score = 5;
      comment = "Thông điệp rõ ràng, tập trung vào giải pháp cho làn da.";
    } else if (idx === 6) {
      score = 4;
      comment = "CTA rõ ràng, nên kích thích thêm bằng ưu đãi giới hạn thời gian thực tế.";
    }
    return { title: item.title, score, comment };
  });

  const avgA = groupAResults.reduce((sum, item) => sum + item.score, 0) / (groupAResults.length * 5);
  const avgB = groupBResults.reduce((sum, item) => sum + item.score, 0) / (groupBResults.length * 5);
  const totalScore = Math.round((avgA * 0.5 + avgB * 0.5) * 100);

  return {
    overallScore: totalScore || 82,
    status: totalScore >= 80 ? 'Tốt' : totalScore >= 70 ? 'Cần cải thiện' : 'Rủi ro vi phạm',
    summary: `Quảng cáo trên ${channel?.label || 'Facebook'} tập trung vào giải pháp làm đẹp, thông điệp trực diện và văn phong gần gũi.`,
    policyAlerts: [
      {
        level: hasAbsoluteClaim || hasMedicalClaim ? 'Cao' : 'Vừa',
        title: hasAbsoluteClaim ? 'Cam kết kết quả tuyệt đối' : 'Thông tin pháp lý cơ sở',
        description: hasAbsoluteClaim ? 'Cần rà soát các cụm từ cam kết hiệu quả để tránh bị Meta vô hiệu hóa tài khoản.' : 'Nên hiển thị rõ thông tin đăng ký cơ sở và chứng nhận dịch vụ.',
        lawReference: 'NĐ 342/2025/NĐ-CP · Luật Quảng cáo'
      }
    ],
    groupA: groupAResults,
    groupB: groupBResults,
    strengths: [
      'Đánh trúng nỗi đau và nhu cầu làm đẹp của khách hàng.',
      'Văn phong tự nhiên, dễ liên tưởng và giàu cảm xúc.',
      'Lời kêu gọi hành động (CTA) rõ ràng, hướng khách inbox hoặc liên hệ.'
    ],
    weaknesses: [
      'Cần bổ sung chứng nhận/giấy phép minh bạch hơn.',
      'Thiếu thêm feedback bằng chứng xã hội (UGC) thực tế.',
      'Chưa làm bật được yếu tố độc quyền khác biệt (USP).'
    ],
    targetAudiencePerspective: {
      persona: 'Nữ 22-45 tuổi, nhân viên văn phòng & kinh doanh, quan tâm chăm sóc sắc đẹp và nhạy bén về chất lượng.',
      feedback: 'Quảng cáo đánh trúng vấn đề da của tôi, nếu có thêm video trải nghiệm thực tế từ khách hàng thì tôi sẽ tin tưởng và đặt lịch ngay.'
    },
    competitorPerspective: {
      industryAnalysis: 'Mặt bằng chung ngành thẩm mỹ đang chuyển dịch mạnh sang video chân thực UGC thay vì hình ảnh studio quá hoàn hảo.',
      comparison: [
        'Đối thủ đang tập trung vào video quy trình thực tế kèm bác sĩ tư vấn chuyên môn.',
        'Mức giá và ưu đãi của bạn cạnh tranh nhưng cần nhấn mạnh công nghệ độc quyền.'
      ],
      improvements: [
        'Bổ sung video ngắn 15s quay cận cảnh kết cấu và trải nghiệm khách thật.',
        'Làm rõ công nghệ sử dụng để tăng giá trị cảm nhận.'
      ]
    },
    actionableRecommendations: [
      'Rà soát và loại bỏ ngay các từ mang tính cam kết tuyệt đối (nếu có).',
      'Đưa thêm địa chỉ, hotline và giấy phép ở chân bài quảng cáo.',
      'Bổ sung feedback chân thực hoặc video ngắn để tăng chuyển đổi.'
    ],
    isFallback: true
  };
}

/**
 * Hàm phân tích và chấm điểm quảng cáo chính
 */
export async function evaluateAdWithAI({ caption, adLink, frames, channel, criteriaA, criteriaB }) {
  const config = getActiveGwenConfig();
  const hasFrames = frames && frames.length > 0;

  // Xây dựng Prompts
  const { systemPrompt, userContent } = buildAdEvaluationPrompt({
    caption,
    adLink,
    channel: channel?.label,
    criteriaA,
    criteriaB,
    hasFrames
  });

  // 1. Thử gửi yêu cầu tới endpoint backend Vite /api/evaluate-ad
  try {
    const payload = {
      config,
      promptData: {
        systemPrompt,
        userContent,
        hasFrames,
        // Chỉ gửi tối đa 3 frames mẫu nhẹ để tránh quá tải payload nếu model hỗ trợ vision
        sampleFrames: hasFrames ? frames.slice(0, 3) : []
      }
    };

    const res = await fetch('/api/evaluate-ad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.evaluation) {
        return {
          ...data.evaluation,
          modelUsed: `Gwen (${config.model || 'qwen-plus'})`,
          isRealAI: true
        };
      } else if (data.error) {
        console.warn('Lỗi từ API Backend evaluate-ad:', data.error);
        return {
          ...generateIntelligentFallbackEvaluation({ caption, channel, criteriaA, criteriaB }),
          apiError: data.error,
          modelUsed: `Gwen (${config.model || 'qwen-plus'}) - Demo Mode`
        };
      }
    }
  } catch (err) {
    console.warn('Không thể kết nối tới /api/evaluate-ad, thử phương thức dự phòng:', err);
  }

  // 2. Thử gọi trực tiếp từ trình duyệt nếu có Base URL & API Key
  if (config.baseUrl && config.apiKey) {
    try {
      const cleanUrl = config.baseUrl.trim().replace(/\/+$/, '');
      const directRes = await fetch(`${cleanUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey.trim()}`
        },
        body: JSON.stringify({
          model: config.model || 'qwen-plus',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
          ],
          temperature: 0.3
        })
      });

      if (directRes.ok) {
        const resultJson = await directRes.json();
        const content = resultJson?.choices?.[0]?.message?.content;
        const parsed = extractJsonFromResponse(content);
        if (parsed) {
          return {
            ...parsed,
            modelUsed: `Gwen (${config.model || 'qwen-plus'})`,
            isRealAI: true
          };
        }
      }
    } catch (directErr) {
      console.warn('Lỗi gọi trực tiếp Gwen từ browser:', directErr);
    }
  }

  // 3. Fallback thông minh có cảnh báo rõ ràng cho người dùng
  const fallback = generateIntelligentFallbackEvaluation({ caption, channel, criteriaA, criteriaB });
  return {
    ...fallback,
    modelUsed: config.apiKey ? `Gwen (${config.model || 'qwen-plus'}) [Fallback]` : 'Mẫu thẩm định AI chuẩn (Cần nhập API Key ở Bộ tiêu chí để gọi model thực tế)'
  };
}
