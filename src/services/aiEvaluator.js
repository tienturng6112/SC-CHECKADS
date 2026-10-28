import { getGwenConfig } from '../config/gwenConfig';
import { calculateStandardScore } from './scoreCalculator';

/**
 * Kiểm tra kết nối tới Model AI thông qua cổng máy chủ Vite để tránh lỗi CORS
 */
export async function testGwenConnection(customConfig) {
  const cfg = customConfig || getGwenConfig();
  if (!cfg.baseUrl || !cfg.apiKey || !cfg.model) {
    return { ok: false, message: 'Vui lòng nhập đầy đủ Base URL, API Key và Model!' };
  }

  // 1. Thử qua backend endpoint của Vite server (tránh bị chặn CORS trên trình duyệt)
  try {
    const proxyRes = await fetch('/api/test-gwen-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    });

    const data = await proxyRes.json();
    if (proxyRes.ok && data.success) {
      return {
        ok: true,
        message: data.message || `Kết nối thành công tới model "${cfg.model}" qua cổng máy chủ!`,
      };
    } else if (proxyRes.status !== 404) {
      return {
        ok: false,
        message: data.error || `Lỗi kết nối từ máy chủ (HTTP ${proxyRes.status})`,
      };
    }
  } catch (err) {
    console.warn('Không gọi được /api/test-gwen-connection, thử kết nối trực tiếp:', err);
  }

  // 2. Thử fetch trực tiếp từ trình duyệt
  try {
    const endpoint = `${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [{ role: 'user', content: 'Trả lời ngắn gọn: OK' }],
        max_tokens: 15,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        ok: false,
        message: `Lỗi kết nối (${response.status}): ${errText.slice(0, 150)}`,
      };
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || 'OK';
    return {
      ok: true,
      message: `Kết nối thành công tới model "${cfg.model}"! Phản hồi: ${reply}`,
    };
  } catch (error) {
    return {
      ok: false,
      message: `Không thể kết nối tới máy chủ (${error.message}). Kiểm tra lại Base URL hoặc CORS.`,
    };
  }
}

/**
 * Hàm chính: Chấm điểm Quảng cáo (Gửi tới backend proxy /api/evaluate-ad để thẩm định bằng AI Vision thực tế)
 * TUYỆT ĐỐI KHÔNG Silent Fallback khi có lỗi. Nếu có lỗi, trả về error rõ ràng để người dùng xử lý.
 */
export async function evaluateAdWithCriteria({
  caption,
  adLink,
  frames,
  images,
  sampleFrames,
  hasVideo,
  channel,
  groupA,
  groupB,
  isDemo = false,
  isComparison = false,
  mode = 'my-ad',
  myAd = null,
  competitors = [],
}) {
  const gwenCfg = getGwenConfig();

  // 1. Nếu người dùng CHỦ ĐỘNG chọn chế độ Demo / Thử nghiệm và là chế độ đơn
  if (isDemo && !isComparison) {
    console.log('[evaluateAdWithCriteria] Người dùng chọn Chế độ Demo (Giả lập)');
    return generateCleanDemoEvaluation({ caption, adLink, channel, groupA, groupB });
  }

  // Kiểm tra API Key nếu không bật chế độ Demo
  if (!isDemo && (!gwenCfg.apiKey || !gwenCfg.apiKey.trim())) {
    return {
      success: false,
      error: 'Chưa cấu hình API Key. Vui lòng vào menu "Bộ tiêu chí" để nhập API Key cho AI (Qwen/Gwen hoặc OpenAI Compatible), hoặc bật "Chế độ Demo" để xem thử giao diện.',
    };
  }

  // 2. Gửi request thẩm định xuống backend proxy /api/evaluate-ad của Vite dev server
  try {
    let payload = {};

    if (isComparison) {
      console.log(`[evaluateAdWithCriteria] Gửi yêu cầu so sánh đa video (${mode}): myAd + ${competitors.length} competitors`);
      payload = {
        config: gwenCfg,
        isComparison: true,
        mode,
        channel: channel || { label: 'Facebook', dotColor: 'bg-blue-500' },
        groupA: groupA || [],
        groupB: groupB || [],
        isDemo,
        myAd: myAd
          ? {
              name: myAd.name || 'Ad của tôi',
              caption: myAd.caption?.trim() || '',
              adLink: myAd.adLink?.trim() || '',
              frames: (myAd.frames || []).filter((f) => typeof f === 'string' && f.startsWith('data:image')).slice(0, 4),
            }
          : null,
        competitors: (competitors || []).map((c, i) => ({
          id: c.id || `comp_${i + 1}`,
          name: c.title || c.name || `Ad đối thủ #${i + 1}`,
          caption: c.caption?.trim() || '',
          adLink: c.adLink?.trim() || '',
          frames: (c.frames || []).filter((f) => typeof f === 'string' && f.startsWith('data:image')).slice(0, 4),
        })),
      };
    } else {
      const allFrames = frames || images || sampleFrames || [];
      const validFrames = (allFrames || [])
        .filter((f) => typeof f === 'string' && f.startsWith('data:image'))
        .slice(0, 4);

      console.log(`[evaluateAdWithCriteria] Gửi ${validFrames.length} khung hình base64 xuống backend /api/evaluate-ad`);

      payload = {
        config: gwenCfg,
        mode: mode || 'my-ad',
        isComparison: false,
        promptData: {
          caption: caption?.trim() || '',
          adLink: adLink?.trim() || '',
          channel: channel?.label || 'Facebook',
          frames: validFrames,
          images: validFrames,
          sampleFrames: validFrames,
          groupA: groupA || [],
          groupB: groupB || [],
        },
      };
    }

    console.log('[evaluateAdWithCriteria] Đang gửi yêu cầu thẩm định tới /api/evaluate-ad...');
    const response = await fetch('/api/evaluate-ad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      const errorMsg = data.error || `Lỗi từ máy chủ thẩm định AI (Mã HTTP: ${response.status})`;
      console.error('[evaluateAdWithCriteria] AI API trả về lỗi:', errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    // Nếu là chế độ so sánh đối đầu Đa Video
    if (data.isComparison) {
      // Chuẩn hóa điểm cho myAdResult
      if (data.myAdResult) {
        const scoreInfo = calculateStandardScore(data.myAdResult);
        data.myAdResult.totalScore = scoreInfo.finalScore;
        data.myAdResult.score = scoreInfo.finalScore;
        data.myAdResult.statusLabel = scoreInfo.statusLabel;
      }
      // Chuẩn hóa điểm cho từng competitor
      if (Array.isArray(data.competitorResults)) {
        data.competitorResults.forEach((cr) => {
          const scoreInfo = calculateStandardScore(cr);
          cr.totalScore = scoreInfo.finalScore;
          cr.score = scoreInfo.finalScore;
          cr.statusLabel = scoreInfo.statusLabel;
        });
      }
      return data;
    }

    // Kết quả trả về từ chế độ đơn - Chuẩn hóa điểm số
    const evaluation = data.evaluation;
    evaluation.isDemo = Boolean(isDemo);
    const scoreInfo = calculateStandardScore(evaluation);
    evaluation.totalScore = scoreInfo.finalScore;
    evaluation.score = scoreInfo.finalScore;
    evaluation.overallScore = scoreInfo.finalScore;
    evaluation.baseScore = scoreInfo.baseScore;
    evaluation.penalty = scoreInfo.penalty;
    evaluation.criticalCount = scoreInfo.criticalCount;
    evaluation.statusLabel = scoreInfo.statusLabel;
    evaluation.status = scoreInfo.statusLabel;
    return evaluation;
  } catch (err) {
    console.error('[evaluateAdWithCriteria] Lỗi kết nối tới máy chủ:', err);
    return {
      success: false,
      error: `Không thể kết nối tới máy chủ backend (/api/evaluate-ad): ${err.message}. Hãy đảm bảo máy chủ Vite dev server đang chạy ('npm run dev').`,
    };
  }
}

/**
 * Sinh dữ liệu mẫu thử nghiệm (Demo) SẠCH SẼ, KHÁCH QUAN khi người dùng CHỦ ĐỘNG chọn chế độ Demo
 * TUYỆT ĐỐI KHÔNG chứa dữ liệu cứng của "Seoul Center", "Fractional CO2 Laser", "686K",
 * và KHÔNG nối chuỗi vụng về gây mâu thuẫn logic.
 */
export function generateCleanDemoEvaluation({ caption = '', adLink = '', channel, groupA = [], groupB = [] }) {
  const cleanCaption = (caption || '').trim();
  const lowerCap = cleanCaption.toLowerCase();

  // Kiểm tra sơ bộ các yếu tố văn bản trong caption thực tế
  const hasSuperlative = /nhất|số 1|số một|duy nhất|hàng đầu|tuyệt hảo|tốt hơn/i.test(lowerCap);
  const hasAbsoluteCommit = /100%|vĩnh viễn|cam kết|đảm bảo|hoàn tiền|dứt điểm/i.test(lowerCap);
  const hasPersonalAttr = /bạn đang bị|da bạn|bạn béo|bạn tự ti|bạn mặc cảm/i.test(lowerCap);
  const hasMedicalClaim = /đặc trị|chữa khỏi|điều trị tận gốc|corticoid/i.test(lowerCap);
  const hasLicenseInfo = /giấy phép|phòng khám|địa chỉ|chịu trách nhiệm|không phải là thuốc/i.test(lowerCap);
  const hasCTA = /hotline|inbox|đặt lịch|sđt|liên hệ|đăng ký/i.test(lowerCap);

  const evaluatedGroupA = (groupA || []).map((item, idx) => {
    const tLower = item.title.toLowerCase();
    if (idx === 0 || tLower.includes('cam kết')) {
      return hasAbsoluteCommit
        ? { title: item.title, score: 2, comment: 'Caption chứa từ ngữ cam kết kết quả chắc chắn hoặc bảo đảm, cần chuyển sang từ ngữ giảm nhẹ.' }
        : { title: item.title, score: 5, comment: 'Nội dung không dùng từ ngữ cam kết tuyệt đối, phù hợp với quy định về quảng cáo dịch vụ/mỹ phẩm.' };
    }
    if (idx === 1 || tLower.includes('thuộc tính cá nhân')) {
      return hasPersonalAttr
        ? { title: item.title, score: 2, comment: 'Ngữ điệu ngụ ý nhắm trực diện vào khuyết điểm của người xem, có nguy cơ bị Meta gắn cờ Personal Attributes.' }
        : { title: item.title, score: 4, comment: 'Thông điệp nêu vấn đề chung và giải pháp khách quan, không chỉ trỏ vào người xem.' };
    }
    if (idx === 2 || tLower.includes('tuyên bố y tế')) {
      return hasMedicalClaim
        ? { title: item.title, score: 1, comment: 'Có dấu hiệu sử dụng thuật ngữ điều trị như thuốc chữa bệnh, vi phạm NĐ 342/2025.' }
        : { title: item.title, score: 4, comment: 'Thuật ngữ mô tả công dụng phù hợp với quy chuẩn mỹ phẩm và chăm sóc sắc đẹp.' };
    }
    if (idx === 3 || tLower.includes('nhất')) {
      return hasSuperlative
        ? { title: item.title, score: 2, comment: 'Sử dụng từ ngữ chỉ mức độ tuyệt đối ("nhất", "số 1") mà không có tài liệu kiểm chứng hợp pháp theo Điều 8 Luật QC.' }
        : { title: item.title, score: 5, comment: 'Không sử dụng từ ngữ so sánh tuyệt đối hoặc nhắc tới đối thủ cạnh tranh.' };
    }
    if (idx === 4 || tLower.includes('bác sĩ')) {
      return { title: item.title, score: 4, comment: 'Không lạm dụng hình ảnh áo blouse hay nhân viên y tế để chứng thực sản phẩm mỹ phẩm/TPCN theo NĐ 342/2025.' };
    }
    if (idx === 5 || tLower.includes('thông tin bắt buộc')) {
      return !hasLicenseInfo
        ? { title: item.title, score: 3, comment: 'Cần bổ sung thêm thông tin đơn vị chịu trách nhiệm đưa sản phẩm ra thị trường hoặc địa chỉ cơ sở.' }
        : { title: item.title, score: 5, comment: 'Đầy đủ thông tin pháp lý bắt buộc theo quy định hiện hành.' };
    }
    if (idx === 6 || tLower.includes('before/after')) {
      return { title: item.title, score: 4, comment: 'Hình ảnh trình bày tự nhiên, không sử dụng hiệu ứng chỉnh sửa quá mức gây hiểu nhầm.' };
    }
    if (idx === 7 || tLower.includes('mặc cảm')) {
      return { title: item.title, score: 5, comment: 'Thông điệp hướng tới tinh thần tự tin và tích cực, không gây mặc cảm hay lo âu ngoại hình.' };
    }
    return { title: item.title, score: 4, comment: 'Định dạng hình ảnh và video rõ nét, dung lượng text trên ảnh ở mức an toàn (<20%).' };
  });

  const evaluatedGroupB = (groupB || []).map((item, idx) => {
    const tLower = item.title.toLowerCase();
    if (idx === 0 || tLower.includes('hook')) {
      return { title: item.title, score: cleanCaption.length > 20 ? 4 : 3, comment: 'Phần mở đầu có yếu tố gợi mở vấn đề, nên tạo điểm nhấn dứt khoát hơn trong 2 dòng đầu.' };
    }
    if (idx === 1 || tLower.includes('insight')) {
      return { title: item.title, score: 4, comment: 'Chạm đúng nhu cầu chăm sóc sắc đẹp và giải quyết vấn đề thực tế của khách hàng mục tiêu.' };
    }
    if (idx === 2 || tLower.includes('1 mục tiêu')) {
      return { title: item.title, score: 4, comment: 'Thông điệp chính tập trung vào một sản phẩm/dịch vụ cốt lõi, không bị phân tán.' };
    }
    if (idx === 3 || tLower.includes('văn phong')) {
      return { title: item.title, score: 4, comment: 'Văn phong gần gũi, tự nhiên như lời chia sẻ trải nghiệm.' };
    }
    if (idx === 4 || tLower.includes('ugc')) {
      return { title: item.title, score: 3, comment: 'Nên bổ sung thêm các phân đoạn quay thực tế bằng điện thoại hoặc trải nghiệm người dùng để tăng tính chân thật.' };
    }
    if (idx === 5 || tLower.includes('bằng chứng xã hội')) {
      return { title: item.title, score: 3, comment: 'Nên bổ sung phản hồi (feedback) từ khách hàng thực tế hoặc chứng nhận uy tín để củng cố niềm tin.' };
    }
    if (idx === 6 || tLower.includes('cta')) {
      return { title: item.title, score: hasCTA ? 5 : 3, comment: hasCTA ? 'Lời kêu gọi hành động rõ ràng kèm thông tin liên hệ.' : 'Cần bổ sung lời kêu gọi hành động (CTA) dứt khoát ở cuối nội dung.' };
    }
    if (idx === 7 || tLower.includes('usp')) {
      return { title: item.title, score: 4, comment: 'Có nêu bật lợi ích chính của sản phẩm/dịch vụ, nên làm rõ hơn điểm khác biệt so với thị trường.' };
    }
    return { title: item.title, score: 4, comment: 'Tỷ lệ khung hình và độ phân giải hình ảnh chuẩn chỉnh, phù hợp với nền tảng.' };
  });

  const warnings = [];
  if (hasSuperlative) {
    warnings.push({
      level: 'Cao',
      message: 'Nội dung chứa từ ngữ so sánh tuyệt đối ("nhất", "số 1") chưa có tài liệu hợp pháp chứng minh theo Điều 8 Luật Quảng cáo.',
      legalBasisTitle: "Không dùng từ 'nhất' & không so sánh đối thủ",
      legalCode: 'Điều 8 Luật Quảng cáo 2012 · NĐ 38/2021/NĐ-CP',
    });
  }
  if (hasAbsoluteCommit) {
    warnings.push({
      level: 'Cao',
      message: 'Cam kết hiệu quả chắc chắn (100%, dứt điểm, hoàn tiền) có nguy cơ bị phạt do quảng cáo sai sự thật.',
      legalBasisTitle: 'Không cam kết kết quả tuyệt đối',
      legalCode: 'Nghị định 38/2021/NĐ-CP · Luật Bảo vệ người tiêu dùng',
    });
  }
  if (hasMedicalClaim) {
    warnings.push({
      level: 'Cao',
      message: 'Sử dụng từ ngữ điều trị y tế đối với mỹ phẩm/TPCN là hành vi bị nghiêm cấm theo NĐ 342/2025/NĐ-CP.',
      legalBasisTitle: 'Không tuyên bố y tế / thành phần cấm',
      legalCode: 'Nghị định 342/2025/NĐ-CP Điều 27-28',
    });
  }

  const scoreInfo = calculateStandardScore({
    groupAResults: evaluatedGroupA,
    groupBResults: evaluatedGroupB,
  });
  const totalScore = scoreInfo.finalScore;
  const statusLabel = scoreInfo.statusLabel;

  return {
    isDemo: true,
    totalScore,
    statusLabel,
    summary: cleanCaption
      ? `Nội dung quảng cáo cho sản phẩm/dịch vụ làm đẹp. Thông điệp tập trung vào giải pháp: "${cleanCaption.slice(0, 100)}${cleanCaption.length > 100 ? '...' : ''}".`
      : 'Quảng cáo về sản phẩm/dịch vụ chăm sóc sắc đẹp. Nội dung tập trung giới thiệu giải pháp chăm sóc và nâng cao trải nghiệm khách hàng.',
    warnings,
    groupAResults: evaluatedGroupA,
    groupBResults: evaluatedGroupB,
    pros: [
      'Thông điệp tập trung vào một sản phẩm/dịch vụ chính, dễ tiếp cận người xem.',
      'Văn phong thân thiện, truyền tải tinh thần tự tin và chăm sóc bản thân tích cực.',
      'Định dạng hình ảnh và tỷ lệ khung hình chuẩn chỉnh cho chiến dịch quảng cáo số.',
    ],
    cons: [
      hasSuperlative || hasAbsoluteCommit ? 'Có từ ngữ cam kết hoặc so sánh tuyệt đối cần được làm dịu lại.' : 'Cần bổ sung thêm bằng chứng xã hội (feedback, hình ảnh trải nghiệm thực tế).',
      'Phần mở đầu (Hook 3 giây đầu) cần tạo điểm nhấn gây tò mò mạnh hơn để giữ chân khách hàng.',
    ],
    customerPerspective:
      '“Khi xem quảng cáo này, tôi quan tâm trước hết tới việc liệu giải pháp có thực sự phù hợp với tình trạng của mình và có an toàn không. Những chia sẻ khách quan và minh bạch về thông tin sản phẩm cùng trải nghiệm của những người dùng trước đó sẽ giúp tôi yên tâm hơn rất nhiều trước khi quyết định nhắn tin tư vấn.”',
    competitorAnalysis: {
      overview:
        'Quảng cáo có thông điệp rõ ràng nhưng trên thị trường làm đẹp hiện nay, các đối thủ đang chuyển dịch mạnh mẽ sang hình thức video review thực tế của người dùng (UGC) và minh bạch nguồn gốc sản phẩm.',
      comparisons: [
        'So với các bên cùng ngành: Các đối thủ hàng đầu thường đầu tư vào chuỗi video ngắn chia sẻ quy trình hoặc trải nghiệm khách hàng thật.',
        'Về tính pháp lý: Các thương hiệu lớn kiểm soát rất chặt chẽ từ ngữ, hoàn toàn tránh các từ cấm như "đặc trị", "100%" để tài khoản quảng cáo luôn đạt điểm chất lượng cao.',
      ],
      improvements: [
        'Tăng cường nội dung dạng chia sẻ trải nghiệm thực tế (UGC) bằng điện thoại để tăng độ tin cậy tự nhiên.',
        'Minh bạch thông tin nguồn gốc, số công bố sản phẩm hoặc giấy phép cơ sở ở chân bài quảng cáo.',
      ],
    },
    finalSummary: {
      text: 'Nội dung có tiềm năng tiếp cận tốt. Để tối ưu chuyển đổi và bảo vệ an toàn cho tài khoản quảng cáo năm 2026, nên tinh chỉnh câu từ mở đầu, tránh hoàn toàn các từ ngữ cam kết tuyệt đối và bổ sung lời kêu gọi hành động rõ ràng.',
      actionItems: [
        'Kiểm tra lại câu chữ ở 2 dòng đầu, không dùng câu hỏi trực diện vào khuyết điểm người xem.',
        'Bổ sung feedback khách hàng thật và thông tin liên hệ minh bạch.',
        'Thử nghiệm A/B testing giữa định dạng video chia sẻ trải nghiệm và hình ảnh demo sản phẩm.',
      ],
      variants: [
        {
          tag: 'Góc nhìn Insight & Storytelling',
          content: `Hành trình tìm lại làn da rạng rỡ và sự tự tin không hề khó khi chúng ta thấu hiểu đúng nhu cầu của làn da.\n\nChia sẻ cùng chị em giải pháp chăm sóc dịu nhẹ, an toàn được nhiều khách hàng tin tưởng lựa chọn trong thời gian qua.\n\nNhắn tin ngay để nhận tư vấn liệu trình phù hợp và ưu đãi đặc quyền tuần này!`,
        },
        {
          tag: 'Góc nhìn Ưu đãi & Hành động ngay (CTA)',
          content: `Cơ hội trải nghiệm giải pháp chăm sóc sắc đẹp cao cấp với ưu đãi đặc biệt trong tháng!\n\nƯu đãi giới hạn cho 50 khách hàng đầu tiên đăng ký tư vấn sớm nhất.\n\nĐể lại thông tin hoặc nhắn tin trực tiếp để giữ chỗ ngay hôm nay.`,
        },
        {
          tag: 'Góc nhìn Trải nghiệm & Bằng chứng thực tế (Social Proof)',
          content: `Lắng nghe cảm nhận thực tế từ những khách hàng đã trải nghiệm và đồng hành cùng chúng tôi.\n\nSự hài lòng và tin yêu của quý khách chính là thước đo chất lượng lớn nhất.\n\nLiên hệ hotline hoặc ghé trực tiếp cơ sở để được thăm khám và tư vấn chi tiết!`,
        },
      ],
    },
  };
}

export default {
  testGwenConnection,
  evaluateAdWithCriteria,
  generateCleanDemoEvaluation,
};
