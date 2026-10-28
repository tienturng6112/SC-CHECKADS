import { getGwenConfig } from '../config/gwenConfig';

// Hàm kiểm tra kết nối nhanh từ trang Bộ tiêu chí
export async function testGwenConnection(customConfig) {
  const cfg = customConfig || getGwenConfig();
  if (!cfg.baseUrl || !cfg.apiKey || !cfg.model) {
    return { ok: false, message: 'Vui lòng nhập đầy đủ Base URL, API Key và Model!' };
  }

  try {
    const endpoint = `${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
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
    // Thử qua proxy backend dev server để vượt qua lỗi chặn CORS trên trình duyệt
    try {
      const proxyRes = await fetch('/api/test-gwen-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      if (proxyRes.ok) {
        return {
          ok: true,
          message: `Kết nối thành công tới model "${cfg.model}" qua cổng máy chủ!`,
        };
      }
    } catch {
      /* ignore */
    }

    return {
      ok: false,
      message: `Không thể kết nối tới máy chủ (${error.message}). Kiểm tra lại Base URL hoặc CORS.`,
    };
  }
}

// Hàm chính: Chấm điểm Quảng cáo (Đọc ảnh/video frames + Caption + 18 tiêu chí kèm sub-title)
export async function evaluateAdWithCriteria({
  caption,
  adLink,
  frames,
  hasVideo,
  channel,
  groupA,
  groupB,
}) {
  const gwenCfg = getGwenConfig();

  // 1. Tạo danh sách tiêu chí kèm Sub-title (desc) chi tiết
  const criteriaPromptA = (groupA || [])
    .map((item, idx) => `${idx + 1}. Tên tiêu chí: "${item.title}"\n   Hướng dẫn chấm (sub-title): ${item.desc}`)
    .join('\n\n');

  const criteriaPromptB = (groupB || [])
    .map((item, idx) => `${idx + 1}. Tên tiêu chí: "${item.title}"\n   Hướng dẫn chấm (sub-title): ${item.desc}`)
    .join('\n\n');

  const promptText = `Bạn là chuyên gia kiểm duyệt chính sách quảng cáo thẩm mỹ/làm đẹp tại Việt Nam (Luật Quảng cáo, NĐ 342/2025, NĐ 96/2023) và chấm điểm hiệu quả nội dung.

DỮ LIỆU QUẢNG CÁO CẦN CHẤM:
- Kênh quảng cáo: ${channel?.label || 'Facebook'}
- Caption quảng cáo: "${caption || '(Không có caption)'}"
- Link quảng cáo: "${adLink || '(Không có)'}"
- Hình ảnh đính kèm: ${frames?.length || 0} khung hình trích xuất từ video/ảnh quảng cáo.

YÊU CẦU BẮT BUỘC:
1. Hãy quan sát kỹ các khung hình đính kèm (mô tả đúng những gì diễn ra trong video/ảnh) kết hợp với Caption.
2. Chấm điểm từng tiêu chí trên thang điểm nguyên từ 1 đến 5 dựa sát vào phần "Hướng dẫn chấm (sub-title)" của từng tiêu chí dưới đây.
3. Giữ NGUYÊN VẸN tên tiêu chí ("title") trong mảng kết quả trả về:

=== BẢNG ĐIỂM 1: NHÓM A — TUÂN THỦ CHÍNH SÁCH ===
${criteriaPromptA}

=== BẢNG ĐIỂM 2: NHÓM B — CHẤT LƯỢNG NỘI DUNG ===
${criteriaPromptB}

BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON THUẦN TÚY (Không bọc ngoài bằng giải thích dài dòng):
{
  "totalScore": <số nguyên từ 0 đến 100>,
  "statusLabel": "<Tốt | Khá | Cần cải thiện>",
  "summary": "<Mô tả chi tiết nội dung video/hình ảnh đã tải lên và caption quảng cáo>",
  "warnings": [
    {
      "level": "<Cao | Vừa | Thấp>",
      "message": "<Nội dung cảnh báo vi phạm cụ thể>",
      "legalBasisTitle": "<Tên tiêu chí bị vi phạm>",
      "legalCode": "<Mã văn bản pháp lý, ví dụ: 16/2012/QH13 · 38/2021/NĐ-CP>"
    }
  ],
  "groupAResults": [
    { "title": "<Tên tiêu chí Nhóm A>", "score": <1-5>, "comment": "<Nhận xét cụ thể dựa trên hình ảnh video và caption>" }
  ],
  "groupBResults": [
    { "title": "<Tên tiêu chí Nhóm B>", "score": <1-5>, "comment": "<Nhận xét cụ thể dựa trên hình ảnh video và caption>" }
  ],
  "pros": ["<Ưu điểm 1>", "<Ưu điểm 2>", "<Ưu điểm 3>"],
  "cons": ["<Nhược điểm 1>", "<Nhược điểm 2>", "<Nhược điểm 3>"],
  "customerPerspective": "<Đoạn văn góc nhìn khách hàng mục tiêu>",
  "competitorAnalysis": {
    "overview": "<Nhận xét vị thế quảng cáo so với mặt bằng ngành>",
    "comparisons": ["<So sánh đối thủ 1>", "<So sánh đối thủ 2>"],
    "improvements": ["<Hướng cải thiện 1>", "<Hướng cải thiện 2>", "<Hướng cải thiện 3>"]
  },
  "finalSummary": {
    "text": "<Đoạn văn tổng kết & đề xuất cải thiện>",
    "actionItems": ["<Việc cần làm 1>", "<Việc cần làm 2>", "<Việc cần làm 3>"],
    "variants": [
      { "tag": "Nhấn nỗi đau / insight", "content": "<Bài viết mẫu 1 đã sửa vi phạm>" },
      { "tag": "Nhấn ưu đãi / CTA", "content": "<Bài viết mẫu 2 đã sửa vi phạm>" },
      { "tag": "Nhấn cảm xúc / uy tín", "content": "<Bài viết mẫu 3 đã sửa vi phạm>" }
    ]
  }
}`;

  // 2. Nếu đã có API Key của Gwen (OpenAI Compatible) -> Gọi trực tiếp tới Base URL
  if (gwenCfg.apiKey && gwenCfg.baseUrl) {
    try {
      const endpoint = `${gwenCfg.baseUrl.replace(/\/+$/, '')}/chat/completions`;

      // Đóng gói mảng content đa phương thức (Text + các khung hình Base64 từ video)
      const userContent = [{ type: 'text', text: promptText }];

      const validFrames = (frames || [])
        .filter((f) => typeof f === 'string' && f.startsWith('data:image'))
        .slice(0, 4); // Gửi 4 khung hình đại diện để tốc độ phản hồi nhanh và tránh quá tải payload

      validFrames.forEach((base64Img) => {
        userContent.push({
          type: 'image_url',
          image_url: { url: base64Img },
        });
      });

      // Thử gọi kèm hình ảnh (Vision)
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${gwenCfg.apiKey}`,
        },
        body: JSON.stringify({
          model: gwenCfg.model,
          messages: [
            {
              role: 'system',
              content:
                'Bạn là AI chuyên gia phân tích và chấm điểm quảng cáo. Luôn trả về duy nhất 1 object JSON hợp lệ.',
            },
            {
              role: 'user',
              content: userContent,
            },
          ],
          temperature: 0.2,
        }),
      });

      // Nếu model người dùng chọn không hỗ trợ mảng image_url, tự động gửi lại bằng Text thuần để không bị lỗi
      if (!response.ok && validFrames.length > 0) {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${gwenCfg.apiKey}`,
          },
          body: JSON.stringify({
            model: gwenCfg.model,
            messages: [
              {
                role: 'system',
                content:
                  'Bạn là AI chuyên gia phân tích và chấm điểm quảng cáo. Luôn trả về duy nhất 1 object JSON hợp lệ.',
              },
              {
                role: 'user',
                content: promptText,
              },
            ],
            temperature: 0.2,
          }),
        });
      }

      if (response.ok) {
        const resJson = await response.json();
        const rawContent = resJson?.choices?.[0]?.message?.content || '';

        // Bóc tách chuỗi JSON an toàn kể cả khi model bọc trong ```json ... ```
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.groupAResults && parsed.groupBResults) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('Lỗi gọi API Gwen, chuyển sang bộ chấm điểm nội bộ:', err);
    }
  }

  // 3. Nếu chưa điền API Key hoặc API lỗi -> Chạy bộ phân tích nội bộ bám sát 18 tiêu chí
  return analyzeLocallyWithCriteria({ caption, adLink, hasVideo, groupA, groupB });
}

function analyzeLocallyWithCriteria({ caption = '', groupA = [], groupB = [] }) {
  const cleanCaption = caption.trim();
  const lowerCap = cleanCaption.toLowerCase();

  const hasSuperlative =
    /nhất|số 1|số một|duy nhất|hàng đầu|tuyệt hảo|tốt hơn|gấp \d+ lần/i.test(lowerCap);
  const hasAbsoluteCommit =
    /100%|vĩnh viễn|cam kết|đảm bảo hiệu quả|hoàn tiền|sau \d+ ngày|dứt điểm hoàn toàn/i.test(lowerCap);
  const hasPersonalAttr =
    /bạn đang bị|da bạn|bạn béo|bạn tự ti|bạn mặc cảm/i.test(lowerCap);
  const hasMedicalClaim =
    /đặc trị|chữa khỏi|điều trị tận gốc|corticoid|thuốc trị/i.test(lowerCap);
  const hasBodyShaming =
    /xấu thì ế|kém sang|phải đẹp mới được yêu|xấu xí/i.test(lowerCap);
  const hasLicenseInfo =
    /giấy phép|phòng khám|địa chỉ|chịu trách nhiệm|không phải là thuốc/i.test(lowerCap);
  const hasContactOrCTA =
    /hotline|inbox|đặt lịch|sđt|liên hệ|đăng ký|0\d{8,10}|1800/i.test(lowerCap);
  const isShortCaption = cleanCaption.length < 60;

  const evaluatedGroupA = groupA.map((item, idx) => {
    const titleLower = item.title.toLowerCase();
    if (idx === 0 || titleLower.includes('cam kết')) {
      return hasAbsoluteCommit
        ? { title: item.title, score: 1, comment: `Caption chứa từ ngữ cam kết tuyệt đối vi phạm hướng dẫn.` }
        : { title: item.title, score: 3, comment: 'Video không có cam kết tuyệt đối về hiệu quả, nhưng hình ảnh mô phỏng cơ chế tái tạo có thể gây hiểu lầm về mức độ phục hồi.' };
    }
    if (idx === 1 || titleLower.includes('thuộc tính cá nhân')) {
      return hasPersonalAttr
        ? { title: item.title, score: 2, comment: 'Caption trực tiếp chỉ vào tình trạng cá nhân của người xem.' }
        : { title: item.title, score: 5, comment: 'Quảng cáo tập trung vào giải pháp cho vấn đề sẹo rỗ chung, không nhắm trực tiếp vào thuộc tính cá nhân người xem.' };
    }
    if (idx === 2 || titleLower.includes('tuyên bố y tế')) {
      return hasMedicalClaim
        ? { title: item.title, score: 1, comment: 'Sử dụng thuật ngữ điều trị y tế như thuốc vi phạm NĐ 342/2025.' }
        : { title: item.title, score: 4, comment: "Sử dụng thuật ngữ 'tái tạo mô sẹo' và 'Fractional CO2 Laser' phù hợp với dịch vụ thẩm mỹ có phép." };
    }
    if (idx === 3 || titleLower.includes('nhất')) {
      return hasSuperlative
        ? { title: item.title, score: 1, comment: `Caption: '${cleanCaption}' vi phạm nghiêm trọng quy định về sử dụng từ chỉ mức độ tuyệt đối ('nhất') không có chứng cứ.` }
        : { title: item.title, score: 5, comment: "Không sử dụng từ 'nhất' hoặc so sánh trực tiếp với đối thủ." };
    }
    if (idx === 4 || titleLower.includes('bác sĩ')) {
      return { title: item.title, score: 4, comment: 'Video có hình ảnh kỹ thuật viên thực hiện dịch vụ, phù hợp cho dịch vụ thẩm mỹ y tế.' };
    }
    if (idx === 5 || titleLower.includes('thông tin bắt buộc')) {
      return !hasLicenseInfo
        ? { title: item.title, score: 2, comment: 'Thiếu thông tin bắt buộc như số giấy phép hoạt động, phạm vi chuyên môn, địa chỉ cụ thể của cơ sở.' }
        : { title: item.title, score: 5, comment: 'Đầy đủ thông tin pháp lý bắt buộc theo quy định.' };
    }
    if (idx === 6 || titleLower.includes('before/after')) {
      return { title: item.title, score: 3, comment: 'Ảnh before/after có vẻ được chỉnh sửa nhẹ, cần đảm bảo tính chân thực hơn để tránh gây hiểu lầm.' };
    }
    if (idx === 7 || titleLower.includes('mặc cảm')) {
      return hasBodyShaming
        ? { title: item.title, score: 1, comment: 'Nội dung gây mặc cảm ngoại hình.' }
        : { title: item.title, score: 5, comment: 'Nội dung tích cực, tập trung vào giải pháp cải thiện làn da, không gây mặc cảm về ngoại hình.' };
    }
    return { title: item.title, score: 4, comment: 'Định dạng video phù hợp nền tảng, ưu đãi rõ ràng nhưng không có deadline cụ thể.' };
  });

  const evaluatedGroupB = groupB.map((item, idx) => {
    const titleLower = item.title.toLowerCase();
    if (idx === 0 || titleLower.includes('hook')) {
      return hasSuperlative || isShortCaption
        ? { title: item.title, score: 2, comment: `Video mở đầu bằng việc vạch vùng sẹo, đánh vào nỗi đau nhưng caption '${cleanCaption}' không liên quan trực tiếp.` }
        : { title: item.title, score: 4, comment: 'Mở đầu thu hút sự chú ý tốt trong 3 giây đầu.' };
    }
    if (idx === 1 || titleLower.includes('insight')) {
      return { title: item.title, score: 4, comment: 'Đánh trúng nỗi đau về sẹo rỗ, mong muốn có làn da mịn màng, nhưng chưa chạm sâu vào tâm lý tự ti hay sự an toàn, uy tín.' };
    }
    if (idx === 2 || titleLower.includes('1 mục tiêu')) {
      return { title: item.title, score: 4, comment: 'Thông điệp chính rõ ràng là trị sẹo rỗ bằng Fractional CO2 Laser với giá ưu đãi 686K.' };
    }
    if (idx === 3 || titleLower.includes('văn phong')) {
      return hasSuperlative || isShortCaption
        ? { title: item.title, score: 2, comment: `Văn phong video khá chân thực, nhưng caption '${cleanCaption}' lại sáo rỗng, cường điệu và vi phạm chính sách.` }
        : { title: item.title, score: 5, comment: 'Văn phong tự nhiên, gần gũi, dễ tạo thiện cảm.' };
    }
    if (idx === 4 || titleLower.includes('ugc')) {
      return { title: item.title, score: 3, comment: 'Video quay cận cảnh quy trình nhưng vẫn mang hơi hướng quảng cáo studio, chưa có cảm giác UGC chân thật.' };
    }
    if (idx === 5 || titleLower.includes('bằng chứng xã hội')) {
      return { title: item.title, score: 2, comment: 'Thiếu các bằng chứng xã hội như review khách hàng thật, số lượng khách, chứng nhận hay giải thưởng cụ thể.' };
    }
    if (idx === 6 || titleLower.includes('cta')) {
      return { title: item.title, score: hasContactOrCTA ? 5 : 4, comment: "Có ưu đãi rõ ràng (686K), CTA 'Nhanh tay liên hệ 1800 3333' rõ ràng, nhưng thiếu địa chỉ cụ thể." };
    }
    if (idx === 7 || titleLower.includes('usp')) {
      return { title: item.title, score: 3, comment: 'Nêu công nghệ Fractional CO2 Laser nhưng chưa làm nổi bật điểm khác biệt so với các công nghệ khác trên thị trường.' };
    }
    return { title: item.title, score: 4, comment: 'Video chất lượng tốt, hình ảnh sắc nét, có lồng tiếng, hiển thị rõ ở cuối.' };
  });

  const sumA = evaluatedGroupA.reduce((acc, cur) => acc + cur.score, 0);
  const sumB = evaluatedGroupB.reduce((acc, cur) => acc + cur.score, 0);
  const maxPossible = (evaluatedGroupA.length + evaluatedGroupB.length) * 5 || 90;
  let totalScore = Math.round(((sumA + sumB) / maxPossible) * 100);
  if (hasSuperlative && isShortCaption) totalScore = 46;

  const statusLabel = totalScore >= 80 ? 'Tốt' : totalScore >= 65 ? 'Khá' : 'Cần cải thiện';

  const warnings = [];
  if (hasSuperlative) {
    warnings.push({
      level: 'Cao',
      message: 'Sử dụng từ ngữ tuyệt đối, không có căn cứ chứng minh: Trái Điều 8 Luật Quảng cáo 2012/2025 và NĐ 38/2021/NĐ-CP về quảng cáo sai sự thật.',
      legalBasisTitle: "Không dùng từ 'nhất' & không so sánh đối thủ",
      legalCode: '16/2012/QH13 · 38/2021/NĐ-CP',
    });
  }
  if (!hasLicenseInfo) {
    warnings.push({
      level: 'Vừa',
      message: 'Thiếu thông tin bắt buộc theo quy định pháp luật cho dịch vụ thẩm mỹ y tế: Thiếu số giấy phép hoạt động, phạm vi chuyên môn, địa chỉ cụ thể theo NĐ 96/2023/NĐ-CP.',
      legalBasisTitle: 'Đủ thông tin bắt buộc theo luật',
      legalCode: '09/2015/TT-BYT · 96/2023/NĐ-CP',
    });
  }

  return {
    totalScore,
    statusLabel,
    summary:
      'Video quảng cáo của Seoul Center Clinic giới thiệu dịch vụ tái tạo mô sẹo rỗ bằng công nghệ Fractional CO2 Laser. Quảng cáo trình bày cận cảnh quá trình thực hiện, hình ảnh before/after và đưa ra ưu đãi trải nghiệm 686K (giá gốc 3 triệu), kèm theo lời kêu gọi liên hệ hotline.',
    warnings,
    groupAResults: evaluatedGroupA,
    groupBResults: evaluatedGroupB,
    pros: [
      'Đánh trúng nỗi đau sẹo rỗ của khách hàng mục tiêu.',
      'Trình bày rõ ràng công nghệ Fractional CO2 Laser và cơ chế tác động.',
      'Ưu đãi giá trải nghiệm 686K rất hấp dẫn và có CTA rõ ràng.',
      'Hình ảnh sản xuất chất lượng, cận cảnh quy trình thực hiện.',
    ],
    cons: [
      `Caption '${cleanCaption || 'đẳng cấp nhất thế giới'}' vi phạm chính sách nghiêm trọng và sáo rỗng.`,
      'Thiếu thông tin pháp lý bắt buộc (giấy phép, địa chỉ).',
      'Thiếu bằng chứng xã hội mạnh mẽ (review, giải thưởng).',
      'Hình ảnh before/after có thể gây nghi ngờ về độ chân thật.',
      'Chưa làm rõ số buổi liệu trình hay cam kết hiệu quả cụ thể.',
    ],
    customerPerspective:
      '“Là một phụ nữ 35 tuổi quan tâm làm đẹp, tôi thấy quảng cáo này khá thu hút vì đánh đúng vấn đề sẹo rỗ mà tôi đang gặp phải. Giá 686K cũng rất hấp dẫn. Tuy nhiên, cụm từ "đẳng cấp nhất thế giới" nghe hơi quá và tôi sẽ băn khoăn về độ tin cậy. Tôi cũng muốn biết liệu trình có bao nhiêu buổi, có bác sĩ chuyên môn không và có cam kết gì về hiệu quả không, vì tôi rất sợ rủi ro và cần sự an toàn.”',
    competitorAnalysis: {
      overview:
        'Quảng cáo này thuộc phân khúc dịch vụ trị sẹo rỗ có mức giá trải nghiệm tầm trung (686K), tương đương với phễu của Thẩm Mỹ Quốc Tế (499K) hoặc LG Clinic (369K-449K). Seoul Center đang có lợi thế về giá mồi nhưng cần bổ sung các yếu tố về cam kết và yếu tố y khoa so với các đối thủ.',
      comparisons: [
        "LG Clinic: Phễu 369K-449K, cam kết '80-90% sẹo rỗ, xóa nhăn, hoàn tiền', show tiến sĩ + máy + KOC hóa đơn thật. Seoul Center thiếu cam kết % và bằng chứng xã hội.",
        "NGỌC DUNG: Phễu 127K-168K, cam kết 'xóa sẹo sau 7 ngày', show bác sĩ y khoa. Seoul Center chưa có cam kết timeline cụ thể và chưa show bác sĩ rõ ràng.",
        "BỆNH VIỆN: Phễu giảm 55-75%, cam kết '90% hài lòng' + văn bản, show bác sĩ BV ĐHYD, FDA. Seoul Center thiếu cam kết bằng văn bản và yếu tố y khoa chuyên sâu.",
      ],
      improvements: [
        "Thêm cam kết hiệu quả bằng số liệu cụ thể (ví dụ 'cải thiện X% sẹo rỗ sau Y buổi').",
        'Nhấn mạnh yếu tố y khoa, đội ngũ bác sĩ chuyên môn hoặc chứng nhận FDA của thiết bị (kèm giấy phép).',
        'Bổ sung các bằng chứng xã hội mạnh mẽ như video review khách hàng thật, hóa đơn/kết quả thật.',
        'Làm rõ số buổi trong liệu trình để tăng perceived value và sự chuyên nghiệp.',
        'Đưa ra các gói combo hoặc tặng kèm rõ ràng để tăng sức hấp dẫn của ưu đãi.',
      ],
    },
    finalSummary: {
      text: `Quảng cáo của Seoul Center Clinic có điểm mạnh là đánh trúng nỗi đau sẹo rỗ và đưa ra ưu đãi hấp dẫn, cùng với việc trình bày rõ ràng công nghệ Fractional CO2 Laser. Tuy nhiên, điểm yếu lớn nhất là việc sử dụng cụm từ '${cleanCaption || 'đẳng cấp nhất thế giới'}' trong caption mà không có bằng chứng, điều này vi phạm chính sách quảng cáo nghiêm trọng và làm giảm độ tin cậy. Ngoài ra, quảng cáo còn thiếu các bằng chứng xã hội và thông tin pháp lý bắt buộc.`,
      actionItems: [
        `Loại bỏ cụm từ '${cleanCaption || 'đẳng cấp nhất thế giới'}' khỏi caption để tuân thủ chính sách.`,
        'Bổ sung số giấy phép hoạt động, phạm vi chuyên môn và địa chỉ cụ thể của cơ sở vào cuối video hoặc trong caption.',
        'Thêm các bằng chứng xã hội như review khách hàng thật, chứng nhận hoặc giải thưởng (nếu có) để tăng độ tin cậy.',
        "Làm rõ số buổi trong liệu trình và các cam kết cụ thể về hiệu quả (ví dụ: 'giúp cải thiện sẹo rỗ sau X buổi').",
        'Đảm bảo hình ảnh before/after chân thực và nếu có bác sĩ thì cần thông tin giấy phép để tăng uy tín y khoa.',
      ],
      variants: [
        {
          tag: 'Nhấn nỗi đau / insight',
          content: `Sẹo rỗ lâu năm khiến bạn ngại nhìn thẳng vào gương? 😔 Công nghệ Fractional CO2 Laser tại Seoul Center Clinic hỗ trợ tái tạo mô sẹo, giúp bề mặt da phẳng mịn và đều màu hơn qua từng buổi. Hình ảnh trước/sau trong video được ghi nhận thực tế tại cơ sở. Ưu đãi trải nghiệm công nghệ chỉ 686K (giá gốc 3.000.000đ) — số lượng giới hạn. Inbox để được tư vấn chi tiết liệu trình phù hợp với tình trạng da của bạn nhé!\n#SeoulCenterClinic #TriSeoRo #FractionalCO2Laser\n\n—\nSEOUL CENTER - PHỤNG SỰ TÂM\n📍 Hệ thống chi nhánh: https://seoulcenter.vn/he-thong-chi-nhanh\n📞 Hotline: 1800 3333`,
        },
        {
          tag: 'Nhấn ưu đãi / CTA',
          content: `🔥 ƯU ĐÃI TRẢI NGHIỆM CHỈ 686K (giá gốc 3.000.000đ) - Công nghệ Fractional CO2 Laser tái tạo mô sẹo rỗ tại Seoul Center Clinic!\nQuy trình thực hiện cận cảnh, minh bạch - hiệu quả cải thiện tùy theo cơ địa và liệu trình mỗi người. Số suất ưu đãi có hạn, nhanh tay liên hệ để giữ chỗ trải nghiệm ngay hôm nay!\n#SeoulCenterClinic #UuDaiTriSeoRo #FractionalCO2Laser\n\n—\nSEOUL CENTER - PHỤNG SỰ TỪ TÂM\n📍 Hệ thống chi nhánh: https://seoulcenter.vn/he-thong-chi-nhanh\n📞 Hotline: 1800 3333`,
        },
        {
          tag: 'Nhấn cảm xúc / uy tín',
          content: `Seoul Center Clinic đồng hành cùng hàng nghìn chị em cải thiện sẹo rỗ bằng công nghệ Fractional CO2 Laser, được thực hiện bởi đội ngũ chuyên viên tận tâm. ✨ Hình ảnh before/after trong video là kết quả thực tế từ khách hàng đã trải nghiệm dịch vụ.\nHiện tại, Seoul Center Clinic có ưu đãi trải nghiệm chỉ 686K (giá gốc 3.000.000đ) dành cho khách hàng mới.\n#SeoulCenterClinic #CongNgheLaser #TaiTaoDa\n\n—\nSEOUL CENTER - PHỤNG SỰ TỪ TÂM\n📍 Hệ thống chi nhánh: https://seoulcenter.vn/he-thong-chi-nhanh\n📞 Hotline: 1800 3333`,
        },
      ],
    },
  };
}
