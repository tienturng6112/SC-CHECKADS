import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';


// Hàm chuẩn hóa công thức tính Tổng điểm (0-100) theo quy chuẩn No Double Penalty
function calculateStandardScore(evaluationData) {
  if (!evaluationData) {
    return { finalScore: 0, baseScore: 0, penalty: 0, criticalCount: 0, statusLabel: 'Chưa chấm điểm' };
  }

  // Hỗ trợ chế độ so sánh: trích xuất từ myAdResult nếu là object so sánh
  const target = evaluationData.myAdResult || evaluationData.competitorResults?.[0] || evaluationData;
  const rawListA = target.groupAResults || target.groupA || [];
  const rawListB = target.groupBResults || target.groupB || [];

  const extractScore = (item) => {
    if (typeof item === 'number') return Math.max(1, Math.min(5, Math.round(item)));
    if (!item) return 3;
    const s = Number(item.score ?? item.point ?? 3);
    return isNaN(s) ? 3 : Math.max(1, Math.min(5, Math.round(s)));
  };

  const hasSpecificScores = (Array.isArray(rawListA) && rawListA.length > 0) || (Array.isArray(rawListB) && rawListB.length > 0);
  if (!hasSpecificScores && typeof target.totalScore === 'number' && target.totalScore > 0) {
    const preservedScore = Math.max(0, Math.min(100, Math.round(target.totalScore)));
    let statusLabel = 'Tốt';
    if (preservedScore >= 80) statusLabel = 'Tốt';
    else if (preservedScore >= 65) statusLabel = 'Khá';
    else if (preservedScore >= 50) statusLabel = 'Cần cải thiện';
    else statusLabel = 'Rủi ro cao';
    return { finalScore: preservedScore, baseScore: preservedScore, penalty: 0, criticalCount: 0, statusLabel };
  }

  const groupAScores = Array.isArray(rawListA) && rawListA.length > 0 ? rawListA.map(extractScore) : [3, 3, 3, 3, 3, 3, 3, 3, 3];
  const groupBScores = Array.isArray(rawListB) && rawListB.length > 0 ? rawListB.map(extractScore) : [3, 3, 3, 3, 3, 3, 3, 3, 3];

  const sumA = groupAScores.reduce((acc, curr) => acc + curr, 0);
  const sumB = groupBScores.reduce((acc, curr) => acc + curr, 0);
  const totalCount = groupAScores.length + groupBScores.length;
  const maxPossible = totalCount > 0 ? totalCount * 5 : 90;

  const baseScore = Math.round(((sumA + sumB) / maxPossible) * 100);
  const criticalCount = groupAScores.filter((s) => s === 1).length;
  const penalty = criticalCount * 3; // Chỉ phạt 3 điểm cho mỗi vi phạm nhóm A mức 1/5
  const finalScore = Math.max(0, Math.min(100, baseScore - penalty));

  let statusLabel = 'Tốt';
  if (finalScore >= 80) statusLabel = 'Tốt';
  else if (finalScore >= 65) statusLabel = 'Khá';
  else if (finalScore >= 50) statusLabel = 'Cần cải thiện';
  else statusLabel = 'Rủi ro cao';

  return { finalScore, baseScore, penalty, sumA, sumB, criticalCount, statusLabel };
}

function gwenConfigPlugin() {
  return {
    name: 'vite-plugin-gwen-config',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 1. Cổng API lưu trực tiếp cấu hình Gwen vào file code src/config/gwenConfig.js
        if (req.url === '/api/save-gwen-config' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const configDir = path.resolve(process.cwd(), 'src/config');
              if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
              }
              const configPath = path.resolve(configDir, 'gwenConfig.js');

              const fileContent = `// File cấu hình kết nối Gwen (Qwen AI) - OpenAI Compatible
// Tự động lưu và cập nhật trực tiếp vào file này khi bấm nút "Lưu" ở menu Bộ tiêu chí
// Cập nhật lúc: ${new Date().toLocaleString('vi-VN')}

export const defaultGwenConfig = {
  baseUrl: ${JSON.stringify(data.baseUrl || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1')},
  apiKey: ${JSON.stringify(data.apiKey || '')},
  model: ${JSON.stringify(data.model || 'qwen-vl-max')},
  selectedAI: ${JSON.stringify(data.selectedAI || 'gwen')},
};

export const GWEN_CONFIG = defaultGwenConfig;

const STORAGE_KEY = 'cac_gwen_config';

export function getGwenConfig() {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      const parsed = JSON.parse(saved);
      let model = parsed.model || defaultGwenConfig.model;
      if (/^(qwen-plus|qwen-max|qwen-turbo|qwen-long)$/i.test(model.trim())) {
        model = 'qwen-vl-max';
      }
      return { ...defaultGwenConfig, ...parsed, model };
    }
  } catch (e) {
    console.error('Lỗi đọc cấu hình Gwen:', e);
  }
  return defaultGwenConfig;
}

export function saveGwenConfig(config) {
  const cleanConfig = {
    baseUrl: (config.baseUrl || defaultGwenConfig.baseUrl).trim().replace(/\\/+$/, ''),
    apiKey: (config.apiKey || '').trim(),
    model: (config.model || defaultGwenConfig.model).trim(),
    selectedAI: config.selectedAI || 'gwen',
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanConfig));
  }
  return cleanConfig;
}

export function generateConfigFileCode(config) {
  return \`// src/config/gwenConfig.js
export const gwenConfig = {
  baseUrl: "\${config.baseUrl}",
  apiKey: "\${config.apiKey ? config.apiKey.slice(0, 6) + '...' + config.apiKey.slice(-4) : ''}",
  model: "\${config.model}"
};\`;
}

export default defaultGwenConfig;
`;

              fs.writeFileSync(configPath, fileContent, 'utf-8');

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  message: 'Đã lưu cấu hình trực tiếp vào src/config/gwenConfig.js thành công!',
                  config: data,
                })
              );
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: false,
                  error: err.message,
                })
              );
            }
          });
          return;
        }

        // 2. Cổng API kiểm tra kết nối với Gwen (tránh lỗi CORS từ trình duyệt)
        if (req.url === '/api/test-gwen-connection' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { baseUrl, apiKey, model } = JSON.parse(body || '{}');
              if (!baseUrl) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Thiếu Base URL.' }));
                return;
              }

              const cleanBaseUrl = baseUrl.trim().replace(/\/+$/, '');
              const targetUrl = `${cleanBaseUrl}/chat/completions`;

              const headers = {
                'Content-Type': 'application/json',
              };
              if (apiKey && apiKey.trim()) {
                headers['Authorization'] = `Bearer ${apiKey.trim()}`;
              }

              const apiResp = await fetch(targetUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  model: model || 'qwen-vl-max',
                  messages: [{ role: 'user', content: 'Ping connection test. Reply with OK.' }],
                  max_tokens: 15,
                }),
              });

              const respData = await apiResp.json().catch(() => ({}));

              if (!apiResp.ok) {
                res.statusCode = apiResp.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    error: respData?.error?.message || `Lỗi phản hồi từ máy chủ AI (Mã HTTP: ${apiResp.status})`,
                  })
                );
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  message: `Kết nối thành công tới model "${model || 'AI'}"!`,
                  data: respData,
                })
              );
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: false,
                  error: `Không thể kết nối tới Base URL: ${err.message}`,
                })
              );
            }
          });
          return;
        }

        // 3. Cổng API phân tích và chấm điểm quảng cáo bằng Vision AI (Qwen-VL / OpenAI Compatible)
        if (req.url === '/api/evaluate-ad' && req.method === 'POST') {
          const chunks = [];
          let totalLength = 0;
          const MAX_BODY_SIZE = 50 * 1024 * 1024; // 50 MB

          req.on('data', (chunk) => {
            totalLength += chunk.length;
            if (totalLength > MAX_BODY_SIZE) {
              res.statusCode = 413;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Dung lượng payload vượt quá 50MB.' }));
              req.destroy();
              return;
            }
            chunks.push(chunk);
          });

          req.on('end', async () => {
            if (totalLength > MAX_BODY_SIZE) return;

            try {
              const bodyBuffer = Buffer.concat(chunks);
              const bodyStr = bodyBuffer.toString('utf-8');
              const body = JSON.parse(bodyStr || '{}');
              const { config, mode, isComparison, myAd, competitors, promptData, channel, groupA, groupB, isDemo } = body;
              const { baseUrl, apiKey, model } = config || {};

              // Kiểm tra API Key nếu không bật chế độ Demo
              if (!isDemo && (!apiKey || !apiKey.trim())) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    error: 'Chưa có API Key. Vui lòng vào menu "Bộ tiêu chí" để cấu hình API Key trước khi chấm điểm.',
                  })
                );
                return;
              }

              const cleanBaseUrl = (baseUrl || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1').trim().replace(/\/+$/, '');
              let targetModel = (model || 'qwen/qwen3.8-omni-flash:free').trim();

              // Chỉ ép đổi sang qwen-vl-max nếu dùng trực tiếp cổng Alibaba DashScope và chọn model text thuần cũ
              const isDirectAliyun = /dashscope|aliyuncs/i.test(cleanBaseUrl);
              const isOldAliTextOnly = /^(qwen-plus|qwen-max|qwen-turbo|qwen-long|qwen2\.5-72b-instruct|qwen-72b-chat)$/i.test(targetModel);
              if (isDirectAliyun && isOldAliTextOnly) {
                targetModel = 'qwen-vl-max';
              }

              const listA = groupA && groupA.length > 0 ? groupA : [];
              const listB = groupB && groupB.length > 0 ? groupB : [];

              const formattedA = listA
                .map((item, idx) => `Tiêu chí A${idx + 1}: "${item.title}"\n   Hướng dẫn chấm: ${item.desc}`)
                .join('\n\n');

              const formattedB = listB
                .map((item, idx) => `Tiêu chí B${idx + 1}: "${item.title}"\n   Hướng dẫn chấm: ${item.desc}`)
                .join('\n\n');

              // SYSTEM PROMPT CHUẨN HÓA 18 TIÊU CHÍ VIỆT NAM 2026
              const systemPrompt = `BẠN LÀ CHUYÊN GIA KIỂM DUYỆT CHÍNH SÁCH QUẢNG CÁO VÀ CHIẾN LƯỢC SÁNG TẠO NỘI DUNG (Ad Auditor & Creative Strategist) HÀNG ĐẦU TẠI VIỆT NAM (ÁP DỤNG QUY CHUẨN 2026).

NHIỆM VỤ CỦA BẠN:
1. ĐỌC HIỂU THỰC TẾ (FACT-BASED AUDITING):
- Quan sát tỉ mỉ các khung hình video/hình ảnh và đối chiếu với Caption. Đọc kỹ chữ xuất hiện trên màn hình, biển hiệu, giá tiền.
- Tuyệt đối không bịa thông tin nếu trong video/caption không có.
- Nếu không có khung hình video hoặc không có caption, hãy thẩm định kỹ lưỡng dựa trên dữ liệu thực tế được cung cấp.

2. CHẤM ĐIỂM TỪNG TIÊU CHÍ TRÊN THANG ĐIỂM NGUYÊN TỪ 1 ĐẾN 5:
BẢNG 1: NHÓM A — TUÂN THỦ CHÍNH SÁCH & PHÁP LUẬT VIỆT NAM 2026 (Mỗi tiêu chí cho điểm 1-5):
${formattedA}

BẢNG 2: NHÓM B — CHẤT LƯỢNG SÁNG TẠO & HIỆU QUẢ CHUYỂN ĐỔI (Mỗi tiêu chí cho điểm 1-5):
${formattedB}

3. RÀNG BUỘC LOGIC:
- Nhận xét và điểm số phải đồng nhất. Tiêu chí vi phạm thì điểm <= 2/5 và phải có trong warnings.
- Không khuyên vi phạm pháp luật (không xúi cam kết 100%, không xúi mặc áo blouse nếu là mỹ phẩm/TPCN).

ĐỊNH DẠNG ĐẦU RA BẮT BUỘC: DUY NHẤT 1 chuỗi JSON hợp lệ tuân thủ đúng cấu trúc:
{
  "totalScore": <số nguyên từ 0 đến 100>,
  "statusLabel": "<Tốt | Khá | Cần cải thiện>",
  "summary": "<Mô tả thực tế chính xác những gì video/ảnh và caption hiển thị>",
  "warnings": [
    {
      "level": "Cao" hoặc "Vừa",
      "message": "<Nội dung cảnh báo vi phạm cụ thể>",
      "legalBasisTitle": "<Tên tiêu chí bị vi phạm>",
      "legalCode": "<Căn cứ pháp lý>"
    }
  ],
  "groupAResults": [
    { "title": "<Tên tiêu chí Nhóm A>", "score": <số nguyên 1-5>, "comment": "<Nhận xét cụ thể>" }
  ],
  "groupBResults": [
    { "title": "<Tên tiêu chí Nhóm B>", "score": <số nguyên 1-5>, "comment": "<Nhận xét cụ thể>" }
  ],
  "pros": ["<Ưu điểm 1>", "<Ưu điểm 2>"],
  "cons": ["<Nhược điểm 1>", "<Nhược điểm 2>"],
  "customerPerspective": "<Góc nhìn cảm nhận khách hàng mục tiêu>",
  "competitorAnalysis": {
    "overview": "<Đánh giá vị thế nội dung so với đối thủ cùng ngành>",
    "comparisons": ["<So sánh 1>", "<So sánh 2>"],
    "improvements": ["<Hướng cải thiện 1>", "<Hướng cải thiện 2>"]
  },
  "finalSummary": {
    "text": "<Đoạn văn tổng kết và đề xuất cải thiện>",
    "actionItems": ["<Việc cần làm 1>", "<Việc cần làm 2>", "<Việc cần làm 3>"],
    "variants": [
      { "tag": "Góc nhìn Storytelling", "content": "<Bài viết mẫu 1>" },
      { "tag": "Góc nhìn Ưu đãi & CTA", "content": "<Bài viết mẫu 2>" },
      { "tag": "Góc nhìn Trải nghiệm thực tế", "content": "<Bài viết mẫu 3>" }
    ]
  }
}`;

              // Hàm helper đánh giá 1 video/ad độc lập (Multi-Ad Pipeline Helper)
              const evaluateOneAd = async (adItem) => {
                const caption = adItem?.caption || '';
                const adLink = adItem?.adLink || '';
                const validFrames = (adItem?.frames || [])
                  .filter((f) => typeof f === 'string' && f.startsWith('data:image'))
                  .slice(0, 4);

                // Chế độ DEMO giả lập
                if (isDemo) {
                  const evalA = listA.map((item, idx) => ({
                    title: item.title,
                    score: idx === 1 ? 2 : 4,
                    comment: idx === 1 ? 'Cần điều chỉnh câu mở đầu tránh ám chỉ khuyết điểm cá nhân.' : 'Tuân thủ tốt quy định chính sách.',
                  }));
                  const evalB = listB.map((item, idx) => ({
                    title: item.title,
                    score: idx === 0 ? 3 : 4,
                    comment: idx === 0 ? 'Phần Hook 3s đầu cần tạo điểm nhấn tò mò mạnh hơn.' : 'Hình ảnh và thông điệp truyền tải tốt.',
                  }));
                  const sInfo = calculateStandardScore({ groupAResults: evalA, groupBResults: evalB });
                  return {
                    isDemo: true,
                    totalScore: sInfo.finalScore,
                    score: sInfo.finalScore,
                    statusLabel: sInfo.statusLabel,
                    summary: caption ? `Quảng cáo: "${caption.slice(0, 80)}..."` : `Nội dung quảng cáo ${adItem?.name || 'video'}.`,
                    warnings: [
                      { level: 'Vừa', message: 'Lưu ý không dùng câu hỏi nhắm vào khuyết điểm cơ thể người xem.', legalBasisTitle: 'Không ám chỉ khuyết điểm cá nhân' }
                    ],
                    groupAResults: evalA,
                    groupBResults: evalB,
                    pros: ['Hình ảnh rõ nét, tỷ lệ khung hình phù hợp quảng cáo.', 'Truyền tải giải pháp rõ ràng.'],
                    cons: ['Cần làm mạnh hơn phần Hook 3 giây đầu.', 'Nên bổ sung feedback khách hàng thật.'],
                    customerPerspective: 'Khách hàng chú ý tới cam kết an toàn và tính minh bạch của ưu đãi.',
                    competitorAnalysis: { overview: 'Nội dung bám sát thông điệp sản phẩm nhưng cần bổ sung yếu tố video review chân thật.' },
                    finalSummary: {
                      text: 'Quảng cáo có thông điệp rõ ràng, cần tối ưu câu chữ mở đầu để tăng tỷ lệ giữ chân khách hàng.',
                      actionItems: ['Chuyển câu mở đầu sang chia sẻ trải nghiệm khách quan.', 'Minh bạch thông tin bảo hành/ưu đãi.', 'Thêm lời kêu gọi hành động dứt khoát.'],
                      variants: [
                        { tag: 'Góc nhìn Storytelling', content: 'Kể lại hành trình trải nghiệm giải pháp một cách chân thực và gần gũi.' },
                        { tag: 'Góc nhìn Ưu đãi & CTA', content: 'Ưu đãi đặc biệt dành cho khách hàng đăng ký trước cuối tuần này.' },
                        { tag: 'Góc nhìn Bằng chứng thực tế', content: 'Hơn 1.000 khách hàng đã trải nghiệm và phản hồi tích cực.' }
                      ]
                    }
                  };
                }

                // Gọi AI Vision thực tế qua Smart Retry 3 Lần
                const targetUrl = `${cleanBaseUrl}/chat/completions`;
                const userPromptText = `DỮ LIỆU QUẢNG CÁO (${adItem?.name || 'Quảng cáo'}):
- Kênh quảng cáo: ${channel?.label || 'Facebook'}
- Link bài viết/video: ${adLink ? adLink : 'Không cung cấp link trực tiếp'}
- Caption / Kịch bản:
"""
${caption || '(Không có caption văn bản)'}
"""
- Số lượng khung hình video/ảnh đính kèm: ${validFrames.length} khung hình.

HÃY QUAN SÁT TỈ MỈ NỘI DUNG, HÌNH ẢNH, VĂN BẢN CHỮ VÀ BẢNG GIÁ/DỊCH VỤ ĐỂ CHẤM ĐIỂM CHÍNH XÁC.`;

                let apiResp = null;
                let lastErrorText = '';

                // Lần 1: 4 frames chuẩn
                try {
                  const userContent1 = [
                    { type: 'text', text: userPromptText },
                    ...validFrames.map((base64Url) => ({
                      type: 'image_url',
                      image_url: { url: base64Url },
                    })),
                  ];

                  apiResp = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${apiKey.trim()}`,
                    },
                    body: JSON.stringify({
                      model: targetModel,
                      messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: validFrames.length > 0 ? userContent1 : userPromptText },
                      ],
                      temperature: 0.2,
                    }),
                  });

                  if (!apiResp.ok) {
                    lastErrorText = await apiResp.text();
                  }
                } catch (err1) {
                  lastErrorText = err1.message;
                }

                // Lần 2: 2 frames + gom system prompt vào user message
                if ((!apiResp || !apiResp.ok) && validFrames.length > 0) {
                  const frames2 = validFrames.length >= 2 ? [validFrames[0], validFrames[Math.floor(validFrames.length / 2)]] : [validFrames[0]];
                  try {
                    const combinedText = `${systemPrompt}\n\n====================\n${userPromptText}`;
                    apiResp = await fetch(targetUrl, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey.trim()}`,
                      },
                      body: JSON.stringify({
                        model: targetModel,
                        messages: [
                          {
                            role: 'user',
                            content: [
                              { type: 'text', text: combinedText },
                              ...frames2.map((b64) => ({ type: 'image_url', image_url: { url: b64 } })),
                            ],
                          },
                        ],
                        temperature: 0.2,
                      }),
                    });

                    if (!apiResp.ok) {
                      lastErrorText = await apiResp.text();
                    }
                  } catch (err2) {
                    lastErrorText = err2.message;
                  }
                }

                // Lần 3: Fallback Text-only
                if (!apiResp || !apiResp.ok) {
                  try {
                    const textOnlyPrompt = `DỮ LIỆU QUẢNG CÁO (${adItem?.name || 'Quảng cáo'}):\nKênh: ${channel?.label || 'Facebook'}\nCaption/Kịch bản:\n"""\n${caption || '(Không có caption văn bản)'}\n"""`;
                    apiResp = await fetch(targetUrl, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey.trim()}`,
                      },
                      body: JSON.stringify({
                        model: targetModel,
                        messages: [
                          { role: 'system', content: systemPrompt },
                          { role: 'user', content: textOnlyPrompt },
                        ],
                        temperature: 0.2,
                      }),
                    });
                    if (!apiResp.ok) {
                      lastErrorText = await apiResp.text();
                    }
                  } catch (err3) {
                    lastErrorText = err3.message;
                  }
                }

                if (!apiResp || !apiResp.ok) {
                  throw new Error(lastErrorText || `Lỗi từ AI server (${apiResp?.status || 500})`);
                }

                const respData = await apiResp.json().catch(() => ({}));
                const aiRawContent = respData?.choices?.[0]?.message?.content || '';

                let evaluation = null;
                try {
                  evaluation = JSON.parse(aiRawContent);
                } catch {
                  const match = aiRawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                  if (match && match[1]) {
                    try { evaluation = JSON.parse(match[1]); } catch { /* ignore */ }
                  }
                  if (!evaluation) {
                    const firstBrace = aiRawContent.indexOf('{');
                    const lastBrace = aiRawContent.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                      try { evaluation = JSON.parse(aiRawContent.substring(firstBrace, lastBrace + 1)); } catch { /* ignore */ }
                    }
                  }
                }

                if (!evaluation || !evaluation.groupAResults || !evaluation.groupBResults) {
                  throw new Error('Mô hình AI phản hồi không đúng cấu trúc JSON.');
                }

                const scoreInfo = calculateStandardScore(evaluation);
                evaluation.totalScore = scoreInfo.finalScore;
                evaluation.score = scoreInfo.finalScore;
                evaluation.baseScore = scoreInfo.baseScore;
                evaluation.penalty = scoreInfo.penalty;
                evaluation.criticalCount = scoreInfo.criticalCount;
                evaluation.statusLabel = scoreInfo.statusLabel;
                evaluation.status = scoreInfo.statusLabel;

                return evaluation;
              };

              // ========================================================
              // NHÁNH 1: SO SÁNH ĐA VIDEO (vs-competitor hoặc analyze-competitor)
              // ========================================================
              if (isComparison || mode === 'vs-competitor' || mode === 'analyze-competitor') {
                console.log(`[API /api/evaluate-ad] Bắt đầu Multi-Ad Pipeline (${mode})...`);

                let myAdResult = null;
                if (myAd && (mode === 'vs-competitor' || mode === 'my-ad')) {
                  console.log(`[API /api/evaluate-ad] Chấm điểm "Ad của tôi"...`);
                  myAdResult = await evaluateOneAd({
                    name: 'Ad của tôi',
                    caption: myAd.caption,
                    adLink: myAd.adLink,
                    frames: myAd.frames || [],
                  });
                }

                // Chấm từng đối thủ độc lập (tránh nhồi nhét nhiều ảnh vào 1 request)
                const competitorResults = [];
                const rawComps = Array.isArray(competitors) && competitors.length > 0 ? competitors : [];

                for (let i = 0; i < rawComps.length; i++) {
                  const compItem = rawComps[i];
                  const compName = compItem.title || compItem.name || `Ad đối thủ #${i + 1}`;
                  console.log(`[API /api/evaluate-ad] Chấm điểm "${compName}" (${i + 1}/${rawComps.length})...`);
                  const cRes = await evaluateOneAd({
                    name: compName,
                    caption: compItem.caption,
                    adLink: compItem.adLink,
                    frames: compItem.frames || [],
                  });
                  competitorResults.push(cRes);
                }

                // Tìm đối thủ có điểm cao nhất để so sánh trực diện
                let topCompetitor = competitorResults[0] || null;
                competitorResults.forEach((cr) => {
                  if (!topCompetitor || cr.totalScore > topCompetitor.totalScore) {
                    topCompetitor = cr;
                  }
                });

                // Xây dựng Bảng xếp hạng (Leaderboard)
                const leaderboard = [];
                if (myAdResult) {
                  leaderboard.push({
                    id: 'my_ad',
                    name: myAd?.name || 'Ad của tôi',
                    totalScore: myAdResult.totalScore,
                    statusLabel: myAdResult.statusLabel,
                    isMyAd: true,
                    thumbnail: myAd?.frames?.[0] || '',
                  });
                }
                rawComps.forEach((c, idx) => {
                  const cScore = competitorResults[idx]?.totalScore || 0;
                  const cStatus = competitorResults[idx]?.statusLabel || 'Cần cải thiện';
                  leaderboard.push({
                    id: c.id || `comp_${idx + 1}`,
                    name: c.title || c.name || `Ad đối thủ #${idx + 1}`,
                    totalScore: cScore,
                    statusLabel: cStatus,
                    isMyAd: false,
                    thumbnail: c.frames?.[0] || '',
                  });
                });

                // Sắp xếp leaderboard giảm dần theo totalScore
                leaderboard.sort((a, b) => b.totalScore - a.totalScore);
                const winner = leaderboard[0];

                // So sánh trực diện 18 tiêu chí giữa Ad của tôi vs Đối thủ cao điểm nhất
                const criteriaComparison = [];
                if (myAdResult && topCompetitor) {
                  // Nhóm A
                  listA.forEach((item, idx) => {
                    const myScore = myAdResult.groupAResults?.[idx]?.score ?? 3;
                    const compScore = topCompetitor.groupAResults?.[idx]?.score ?? 3;
                    const diff = myScore - compScore;
                    criteriaComparison.push({
                      group: 'A',
                      code: `A${idx + 1}`,
                      title: item.title,
                      myScore,
                      compScore,
                      diff,
                      status: diff > 0 ? 'win' : diff < 0 ? 'lose' : 'tie',
                      myComment: myAdResult.groupAResults?.[idx]?.comment || '',
                      compComment: topCompetitor.groupAResults?.[idx]?.comment || '',
                    });
                  });

                  // Nhóm B
                  listB.forEach((item, idx) => {
                    const myScore = myAdResult.groupBResults?.[idx]?.score ?? 3;
                    const compScore = topCompetitor.groupBResults?.[idx]?.score ?? 3;
                    const diff = myScore - compScore;
                    criteriaComparison.push({
                      group: 'B',
                      code: `B${idx + 1}`,
                      title: item.title,
                      myScore,
                      compScore,
                      diff,
                      status: diff > 0 ? 'win' : diff < 0 ? 'lose' : 'tie',
                      myComment: myAdResult.groupBResults?.[idx]?.comment || '',
                      compComment: topCompetitor.groupBResults?.[idx]?.comment || '',
                    });
                  });
                }

                // Điểm mạnh đối thủ (những tiêu chí đối thủ > myAd)
                const competitorStrengths = criteriaComparison
                  .filter((c) => c.status === 'lose')
                  .map((c) => ({
                    title: c.title,
                    code: c.code,
                    compScore: c.compScore,
                    myScore: c.myScore,
                    reason: c.compComment || 'Đối thủ thể hiện tiêu chí này thuyết phục hơn.',
                  }));

                // Điểm yếu / Rủi ro pháp lý của đối thủ (tiêu chí Nhóm A <= 2)
                const competitorWeaknesses = (topCompetitor?.groupAResults || [])
                  .filter((a) => a.score <= 2)
                  .map((a) => ({
                    title: a.title,
                    score: a.score,
                    issue: a.comment || 'Có nguy cơ vi phạm quy định quảng cáo.',
                  }));

                // Chiến lược vượt đối thủ
                const winningStrategy = myAdResult?.totalScore >= (topCompetitor?.totalScore || 0)
                  ? 'Quảng cáo của bạn đang giữ ưu thế về điểm tổng quan. Hãy giữ vững sự chuẩn mực pháp lý và tiếp tục thử nghiệm thêm các biến thể Hook mở đầu để tối ưu chi phí chuyển đổi.'
                  : `Đối thủ đang dẫn trước về điểm chất lượng sáng tạo. Để vượt mặt đối thủ, bạn cần cải thiện ngay các tiêu chí bị tụt điểm (${competitorStrengths.slice(0, 2).map((s) => s.title).join(', ')}), đồng thời tận dụng lợi thế tuân thủ luật để chạy quảng cáo ổn định lâu dài.`;

                const actionItems = [
                  `Cải thiện phần Hook 3 giây đầu: học hỏi nhịp điệu nhanh và cách đặt vấn đề trực diện của đối thủ.`,
                  `Loại bỏ sạch các từ ngữ nhạy cảm mà đối thủ đang dính lỗi để tài khoản quảng cáo của bạn đạt chất lượng tin cậy cao hơn.`,
                  `Triển khai thử nghiệm A/B Testing với 3 kịch bản viết lại bên dưới.`,
                ];

                const variants = topCompetitor?.finalSummary?.variants || myAdResult?.finalSummary?.variants || [
                  { tag: 'Góc nhìn Storytelling', content: 'Kể chuyện từ trải nghiệm thực tế của khách hàng, mở đầu tự nhiên không dùng từ ngữ cam kết tuyệt đối.' },
                  { tag: 'Góc nhìn Ưu đãi & CTA', content: 'Minh bạch chính sách giá và quà tặng, kêu gọi hành động dứt khoát kèm deadline rõ ràng.' },
                  { tag: 'Góc nhìn Bằng chứng thực tế', content: 'Đưa ra các dẫn chứng và phản hồi chân thực từ người dùng thật để củng cố uy tín.' }
                ];

                console.log(`[API /api/evaluate-ad] Hoàn tất So sánh Đa Video! Winner: ${winner?.name} (${winner?.totalScore}/100)`);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: true,
                    isComparison: true,
                    mode,
                    myAdResult: myAdResult
                      ? {
                          ...myAdResult,
                          name: myAd?.name || 'Ad của tôi',
                          frames: myAd?.frames || [],
                          caption: myAd?.caption || '',
                        }
                      : null,
                    competitorResults: competitorResults.map((cr, idx) => ({
                      ...cr,
                      name: rawComps[idx]?.title || rawComps[idx]?.name || `Ad đối thủ #${idx + 1}`,
                      frames: rawComps[idx]?.frames || [],
                      caption: rawComps[idx]?.caption || '',
                    })),
                    comparisonSummary: {
                      leaderboard,
                      winner,
                      scoreDiff: (myAdResult?.totalScore || 0) - (topCompetitor?.totalScore || 0),
                      topCompetitorName: rawComps[0]?.title || rawComps[0]?.name || 'Đối thủ #1',
                      criteriaComparison,
                      competitorStrengths,
                      competitorWeaknesses,
                      winningStrategy,
                      actionItems,
                      variants,
                    },
                  })
                );
                return;
              }

              // ========================================================
              // NHÁNH 2: CHUYÊN BIỆT CHO CHẾ ĐỘ CHECK KỊCH BẢN (check-script)
              // ========================================================
              if (mode === 'check-script') {
                console.log(`[API /api/evaluate-ad] Bắt đầu rà soát kịch bản tiền sản xuất...`);
                const scriptText = promptData?.caption || myAd?.caption || body?.caption || '';

                if (isDemo) {
                  const isRisky = /mụn|bác sĩ|100%|vĩnh viễn|tự ti|phát ghê/i.test(scriptText);
                  const evalA = [
                    { title: 'Không cam kết khỏi bệnh 100%, vĩnh viễn', score: isRisky ? 1 : 5, comment: isRisky ? 'Kịch bản dùng từ cam kết dứt điểm 100% - vi phạm nghiêm trọng NĐ 342/2025.' : 'Không sử dụng cam kết tuyệt đối.' },
                    { title: 'Không ám chỉ khuyết điểm cá nhân', score: isRisky ? 1 : 4, comment: isRisky ? 'Mở đầu bằng câu hỏi chê bai "mặt thâm xì nhìn phát ghê" vi phạm chính sách nội dung gây phản cảm.' : 'Đặt vấn đề tôn trọng khách hàng.' },
                    { title: 'Không dùng danh nghĩa bác sĩ/áo blouse trái phép', score: isRisky ? 2 : 5, comment: isRisky ? 'Quảng cáo dịch vụ spa/thẩm mỹ viện thông thường dùng bác sĩ cam kết cần có giấy phép hoạt động phòng khám.' : 'Tuân thủ đúng quy định về người hành nghề.' },
                    { title: 'Không dùng từ phóng đại số 1, duy nhất', score: isRisky ? 2 : 4, comment: isRisky ? 'Cụm từ "siêu công nghệ số 1 Châu Á" không có chứng nhận tài liệu kiểm chứng.' : 'Thông tin trung thực.' },
                    { title: 'Tính trung thực của khuyến mãi/giá', score: isRisky ? 3 : 5, comment: isRisky ? 'Mức giảm 90% (199K) cần lưu ý hạn mức khuyến mãi tối đa 50% theo Luật Thương mại.' : 'Ưu đãi rõ ràng.' },
                    { title: 'Tuyên bố miễn trừ trách nhiệm (Disclaimer)', score: isRisky ? 2 : 5, comment: isRisky ? 'Chưa bổ sung dòng chữ lưu ý kết quả tùy thuộc cơ địa từng người.' : 'Đã có disclaimer đầy đủ.' },
                    { title: 'Không vi phạm bản quyền & thương hiệu', score: 4, comment: 'Không ghi nhận vi phạm nhãn hiệu.' },
                    { title: 'Minh bạch nguồn gốc và cơ sở thực hiện', score: isRisky ? 3 : 5, comment: isRisky ? 'Cần nêu rõ địa chỉ cơ sở thẩm mỹ trong kịch bản.' : 'Minh bạch thông tin.' },
                    { title: 'Chuẩn mực văn hóa & đạo đức', score: isRisky ? 2 : 5, comment: isRisky ? 'Tránh dùng từ ngữ tiêu cực chê bai ngoại hình người xem.' : 'Phù hợp thuần phong mỹ tục.' },
                  ];
                  const evalB = [
                    { title: 'Sức hút Hook 3 giây đầu', score: isRisky ? 4 : 4, comment: 'Mở đầu có sức giật gân nhưng tiêu cực, cần chuyển sang gợi mở tò mò tích cực.' },
                    { title: 'Đánh trúng insight khách hàng', score: 4, comment: 'Đánh đúng tâm lý lo lắng về mụn và chi phí của người xem.' },
                    { title: 'Cấu trúc kịch bản mạch lạc', score: 4, comment: 'Cấu trúc vấn đề - giải pháp - ưu đãi rõ ràng.' },
                    { title: 'Độ dài và nhịp điệu voice-over', score: 4, comment: 'Độ dài khoảng 30-35s phù hợp video ngắn Reels/TikTok.' },
                    { title: 'Tính thuyết phục của bằng chứng', score: isRisky ? 2 : 4, comment: isRisky ? 'Bằng chứng còn nặng tính hứa hẹn suông, thiếu hình ảnh người thật việc thật.' : 'Thuyết phục và có căn cứ.' },
                    { title: 'Lời kêu gọi hành động (CTA)', score: 4, comment: 'CTA dứt khoát, dễ hiểu.' },
                    { title: 'Sự ăn khớp giữa hình ảnh và lời thoại', score: 4, comment: 'Gợi ý cảnh quay ăn khớp với lời dẫn.' },
                    { title: 'Khả năng khơi gợi tương tác', score: 4, comment: 'Kích thích người xem để lại bình luận nhận ưu đãi.' },
                    { title: 'Tính khả thi sản xuất phân cảnh (Storyboard)', score: 5, comment: 'Rất dễ quay, không đòi hỏi bối cảnh phức tạp.' },
                  ];

                  const sInfo = calculateStandardScore({ groupAResults: evalA, groupBResults: evalB });
                  const scriptEval = {
                    mode: 'check-script',
                    isScript: true,
                    isDemo: true,
                    totalScore: sInfo.finalScore,
                    score: sInfo.finalScore,
                    statusLabel: sInfo.statusLabel,
                    summary: `Kịch bản tiền sản xuất: "${scriptText.slice(0, 100)}..."`,
                    warnings: isRisky ? [
                      {
                        level: 'Cao',
                        message: "Từ ngữ vi phạm: 'cam kết khỏi dứt điểm 100% vĩnh viễn' -> Đề xuất thay bằng: 'hỗ trợ cải thiện tình trạng da mụn rõ rệt theo phác đồ cá nhân hóa'.",
                        legalBasisTitle: 'Không cam kết khỏi bệnh 100%',
                        legalCode: 'Nghị định 342/2025/NĐ-CP & Luật Quảng cáo'
                      },
                      {
                        level: 'Cao',
                        message: "Từ ngữ vi phạm: 'mặt đầy mụn bọc thâm xì nhìn phát ghê' -> Đề xuất thay bằng: 'bạn đang loay hoay tìm giải pháp chăm sóc làn da dầu mụn dai dẳng'.",
                        legalBasisTitle: 'Không ám chỉ khuyết điểm cá nhân',
                        legalCode: 'Quy chuẩn Meta/TikTok 2026'
                      },
                      {
                        level: 'Vừa',
                        message: "Từ ngữ vi phạm: 'siêu công nghệ số 1 Châu Á' -> Đề xuất thay bằng: 'công nghệ xung nhiệt hiện đại được ứng dụng phổ biến tại nhiều cơ sở uy tín'.",
                        legalBasisTitle: 'Không dùng từ phóng đại số 1, duy nhất',
                        legalCode: 'Điều 8 Luật Quảng cáo'
                      }
                    ] : [],
                    groupAResults: evalA,
                    groupBResults: evalB,
                    pros: ['Cấu trúc kịch bản súc tích, phân đoạn thời gian rõ ràng (0-3s, 3-10s, 10-20s, 20-30s).', 'Lời kêu gọi hành động dứt khoát, dễ chuyển đổi.'],
                    cons: isRisky ? ['Chứa 3 cụm từ vi phạm pháp lý quảng cáo nghiêm trọng, dễ bị khóa tài khoản ngay khi duyệt video.', 'Câu mở đầu mang tính chê bai ngoại hình người xem.'] : ['Cần bổ sung thêm feedback khách hàng thật vào phân cảnh 15-25s.'],
                    customerPerspective: 'Người xem bị thu hút bởi ưu đãi nhưng nghi ngờ tính xác thực do cam kết quá đà 100%.',
                    finalSummary: {
                      text: 'Kịch bản có cấu trúc bán hàng tốt nhưng CẦN SỬA SẠCH các cụm từ cam kết tuyệt đối trước khi tiến hành quay video để bảo vệ tài khoản quảng cáo.',
                      actionItems: [
                        'Thay thế ngay các từ: "khỏi 100%", "vĩnh viễn", "phát ghê" theo gợi ý.',
                        'Thêm dòng chữ disclaimer nhỏ ở góc màn hình: "*Hiệu quả phụ thuộc vào cơ địa và tình trạng da mỗi người".',
                        'Chuyển câu mở đầu sang phong cách chia sẻ câu chuyện (Storytelling) thay vì công kích ngoại hình.'
                      ],
                      variants: [
                        {
                          tag: 'Kịch bản phân cảnh 1: Góc nhìn Storytelling chân thực',
                          content: `[0-3s Hook]: Từng rất tự ti vì làn da dầu mụn, mình đã tìm thấy giải pháp này...\n[3-15s Vấn đề & Giải pháp]: Thấu hiểu sự lo lắng khi thử nhiều cách không đỡ, quy trình chăm sóc chuẩn y khoa tại cơ sở giúp làm sạch sâu và dịu nốt mụn viêm nhẹ nhàng.\n[15-25s Trải nghiệm & Bằng chứng]: Cảm nhận làn da thông thoáng, giảm nhờn sau buổi trải nghiệm đầu tiên. Quy trình thực hiện chuyên nghiệp, không gây đau rát.\n[25-30s CTA & Disclaimer]: Suất trải nghiệm ưu đãi 199K có hạn. Đăng ký tư vấn ngay hôm nay! (*Hiệu quả tùy cơ địa mỗi người).`
                        },
                        {
                          tag: 'Kịch bản phân cảnh 2: Góc nhìn Khoa học & Minh bạch',
                          content: `[0-3s Hook]: Bí quyết phục hồi làn da mụn mà không cần dùng cam kết quá đà.\n[3-15s Vấn đề & Giải pháp]: Ứng dụng công nghệ ánh sáng sinh học hỗ trợ gom cồi mụn và cân bằng lượng dầu tự nhiên trên da.\n[15-25s Trải nghiệm & Bằng chứng]: Chuyên viên kiểm tra da kỹ lưỡng, hướng dẫn phác đồ chăm sóc khoa học tại nhà.\n[25-30s CTA & Disclaimer]: Đặt lịch soi da miễn phí hôm nay để nhận trọn bộ cẩm nang skincare chuẩn khoa học.`
                        },
                        {
                          tag: 'Kịch bản phân cảnh 3: Góc nhìn Ưu đãi & Hành động nhanh',
                          content: `[0-3s Hook]: Đừng để mụn viêm cản trở sự tự tin của bạn mỗi ngày!\n[3-15s Vấn đề & Giải pháp]: Trải nghiệm liệu trình phục hồi da chuyên sâu với ưu đãi đặc biệt dành cho khách hàng đăng ký trước cuối tuần.\n[15-25s Trải nghiệm & Bằng chứng]: Không gian thư giãn, quy trình vệ sinh tiệt trùng đạt chuẩn, hàng ngàn khách hàng đã tin chọn.\n[25-30s CTA & Disclaimer]: Nhấn "Gửi tin nhắn" để giữ chỗ ưu đãi 199K ngay!`
                        }
                      ]
                    }
                  };

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, isComparison: false, evaluation: scriptEval }));
                  return;
                }

                // Chạy AI thực tế cho kịch bản (Text-only prompt, không cần frames)
                const scriptSystemPrompt = `BẠN LÀ CHUYÊN GIA KIỂM DUYỆT KỊCH BẢN QUẢNG CÁO TIỀN SẢN XUẤT (PRE-PRODUCTION SCRIPT AUDITOR) VÀ CHIẾN LƯỢC NỘI DUNG CHUYỂN ĐỔI (CONVERSION STRATEGIST) HÀNG ĐẦU TẠI VIỆT NAM (ÁP DỤNG LUẬT QUẢNG CÁO VIỆT NAM VÀ NGHỊ ĐỊNH 342/2025/NĐ-CP).

LƯU Ý ĐẶC BIỆT:
1. ĐÂY LÀ VĂN BẢN KỊCH BẢN / BRIEF DÀNH CHO EKIP QUAY PHIM TRƯỚC KHI BẤM MÁY (PRE-PRODUCTION).
2. TUYỆT ĐỐI KHÔNG TRỪ ĐIỂM HOẶC BÁO LỖI VỀ VIỆC "KHÔNG CÓ VIDEO / KHÔNG CÓ HÌNH ẢNH / KHÔNG CÓ KHUNG HÌNH". ĐÂY LÀ KỊCH BẢN CHỮ (TEXT SCRIPT).
3. NHIỆM VỤ CỦA BẠN LÀ RÀ SOÁT TỪNG CÂU CHỮ, LỜI THOẠI (VOICE-OVER), TEXT OVERLAY MÔ TẢ ĐỂ BẢO VỆ TÀI KHOẢN VÀ EKIP KHÔNG BỊ PHẠT HÀNH CHÍNH HOẶC CẤM SÓNG TRƯỚC KHI BỎ TIỀN QUAY.

TIÊU CHÍ ĐÁNH GIÁ (Mỗi tiêu chí cho điểm nguyên từ 1 đến 5):
BẢNG 1: NHÓM A — TUÂN THỦ PHÁP LUẬT QUẢNG CÁO VIỆT NAM 2026:
- A1: Không dùng từ ngữ cam kết tuyệt đối, trị dứt điểm 100%, vĩnh viễn, khỏi hoàn toàn.
- A2: Không ám chỉ chê bai khuyết điểm cơ thể ("mặt thâm xì nhìn phát ghê", "béo ú", "tự ti").
- A3: Quảng cáo mỹ phẩm/spa không được dùng danh nghĩa "bác sĩ", trang phục áo blouse trắng, hoặc thư cảm ơn của bệnh nhân.
- A4: Không dùng từ ngữ phóng đại không có kiểm chứng ("số 1 Châu Á", "duy nhất", "tốt nhất").
- A5: Tính trung thực của ưu đãi, giảm giá (không tạo khuyến mãi ảo 90%).
- A6: Cảnh báo và tuyên bố miễn trừ trách nhiệm bắt buộc (Disclaimer: "hiệu quả tùy thuộc cơ địa").
- A7: Không vi phạm sở hữu trí tuệ, thương hiệu đối thủ.
- A8: Minh bạch thông tin nguồn gốc cơ sở, đơn vị chịu trách nhiệm sản phẩm.
- A9: Phù hợp thuần phong mỹ tục, không gây kích động hay phản cảm.

BẢNG 2: NHÓM B — CHẤT LƯỢNG KỊCH BẢN & HIỆU QUẢ GIỮ CHÂN (STORYBOARD):
- B1: Hook 3s đầu tiên có kích thích tò mò và đánh trúng insight không?
- B2: Nêu bật vấn đề và nỗi đau thực tế của khách hàng mục tiêu.
- B3: Cấu trúc câu chuyện (Storytelling) mạch lạc, tự nhiên.
- B4: Nhịp điệu và độ dài lời thoại (Voice-over) có vừa vặn khung thời gian 30-45 giây không?
- B5: Tính thuyết phục của bằng chứng và lý do tin tưởng (Reason to Believe).
- B6: Lời kêu gọi hành động (CTA) dứt khoát, dễ thực hiện.
- B7: Độ ăn khớp giữa lời thoại và gợi ý hình ảnh trực quan (Visual & Audio sync).
- B8: Khả năng khơi gợi cảm xúc và tương tác.
- B9: Tính khả thi trong sản xuất phân cảnh (Storyboard & Production feasibility).

YÊU CẦU ĐẶC BIỆT TRONG OUTPUT:
- Trong mảng "warnings": Phải chỉ ra CHÍNH XÁC CỤM TỪ CẤM VI PHẠM TRONG KỊCH BẢN và ĐỀ XUẤT CỤM TỪ THAY THẾ AN TOÀN tương ứng.
- Trong "finalSummary.variants": Viết 3 KỊCH BẢN PHÂN CẢNH CHI TIẾT (Storyboard) cho ekip quay theo đúng 4 giai đoạn chuẩn:
  [0-3s Hook] ... | [3-15s Vấn đề & Giải pháp] ... | [15-25s Trải nghiệm & Bằng chứng] ... | [25-30s Kêu gọi hành động CTA & Disclaimer] ...

ĐỊNH DẠNG ĐẦU RA BẮT BUỘC: DUY NHẤT 1 chuỗi JSON hợp lệ:
{
  "totalScore": <số nguyên từ 0 đến 100>,
  "statusLabel": "<Tốt | Khá | Cần cải thiện>",
  "summary": "<Tóm tắt nội dung kịch bản và ngành hàng>",
  "warnings": [
    {
      "level": "Cao" hoặc "Vừa",
      "message": "Từ ngữ vi phạm: '[Cụm từ trong kịch bản]' -> Đề xuất thay bằng: '[Cụm từ an toàn]'. Lý do: [Giải thích quy định]",
      "legalBasisTitle": "<Tên tiêu chí vi phạm>",
      "legalCode": "<Căn cứ pháp lý>"
    }
  ],
  "groupAResults": [
    { "title": "<Tên tiêu chí Nhóm A>", "score": <số nguyên 1-5>, "comment": "<Nhận xét cụ thể về câu chữ kịch bản>" }
  ],
  "groupBResults": [
    { "title": "<Tên tiêu chí Nhóm B>", "score": <số nguyên 1-5>, "comment": "<Nhận xét cụ thể về tính hấp dẫn & khả thi>" }
  ],
  "pros": ["<Ưu điểm 1>", "<Ưu điểm 2>"],
  "cons": ["<Nhược điểm 1>", "<Nhược điểm 2>"],
  "customerPerspective": "<Tâm lý khách hàng khi nghe lời thoại này>",
  "finalSummary": {
    "text": "<Đánh giá tổng thể trước khi bấm máy>",
    "actionItems": ["<Việc ekip cần sửa 1>", "<Việc ekip cần sửa 2>"],
    "variants": [
      { "tag": "Kịch bản phân cảnh 1: Góc nhìn Storytelling chân thực", "content": "[0-3s Hook]: ...\n[3-15s Vấn đề & Giải pháp]: ...\n[15-25s Bằng chứng]: ...\n[25-30s CTA & Disclaimer]: ..." },
      { "tag": "Kịch bản phân cảnh 2: Góc nhìn Chuyên gia & Trải nghiệm", "content": "[0-3s Hook]: ...\n[3-15s Vấn đề & Giải pháp]: ...\n[15-25s Bằng chứng]: ...\n[25-30s CTA & Disclaimer]: ..." },
      { "tag": "Kịch bản phân cảnh 3: Góc nhìn Ưu đãi & Hành động nhanh", "content": "[0-3s Hook]: ...\n[3-15s Vấn đề & Giải pháp]: ...\n[15-25s Bằng chứng]: ...\n[25-30s CTA & Disclaimer]: ..." }
    ]
  }
}`;

                const userScriptPrompt = `KỊCH BẢN / BRIEF QUẢNG CÁO CẦN KIỂM DUYỆT TIỀN SẢN XUẤT:
Kênh dự kiến: ${channel?.label || 'Facebook'}
Nội dung kịch bản / Lời thoại:
"""
${scriptText}
"""

HÃY RÀ SOÁT TỈ MỈ 18 TIÊU CHÍ, BÓC TÁCH CÁC CỤM TỪ CẤM VÀ ĐỀ XUẤT CÂU TỪ THAY THẾ AN TOÀN, ĐỒNG THỜI VIẾT LẠI 3 KỊCH BẢN PHÂN CẢNH SẢN XUẤT [0-3s, 3-15s, 15-25s, 25-30s].`;

                const targetUrl = `${cleanBaseUrl}/chat/completions`;
                const apiResp = await fetch(targetUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey.trim()}`,
                  },
                  body: JSON.stringify({
                    model: targetModel,
                    messages: [
                      { role: 'system', content: scriptSystemPrompt },
                      { role: 'user', content: userScriptPrompt },
                    ],
                    temperature: 0.2,
                  }),
                });

                if (!apiResp.ok) {
                  const errText = await apiResp.text();
                  throw new Error(errText || `Lỗi từ AI server (${apiResp.status})`);
                }

                const respData = await apiResp.json().catch(() => ({}));
                const aiRawContent = respData?.choices?.[0]?.message?.content || '';

                let evaluation = null;
                try {
                  evaluation = JSON.parse(aiRawContent);
                } catch {
                  const match = aiRawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                  if (match && match[1]) {
                    try { evaluation = JSON.parse(match[1]); } catch { /* ignore */ }
                  }
                  if (!evaluation) {
                    const firstBrace = aiRawContent.indexOf('{');
                    const lastBrace = aiRawContent.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                      try { evaluation = JSON.parse(aiRawContent.substring(firstBrace, lastBrace + 1)); } catch { /* ignore */ }
                    }
                  }
                }

                if (!evaluation || !evaluation.groupAResults || !evaluation.groupBResults) {
                  throw new Error('Mô hình AI phản hồi không đúng cấu trúc JSON kịch bản.');
                }

                const scoreInfo = calculateStandardScore(evaluation);
                evaluation.mode = 'check-script';
                evaluation.isScript = true;
                evaluation.totalScore = scoreInfo.finalScore;
                evaluation.score = scoreInfo.finalScore;
                evaluation.baseScore = scoreInfo.baseScore;
                evaluation.penalty = scoreInfo.penalty;
                evaluation.criticalCount = scoreInfo.criticalCount;
                evaluation.statusLabel = scoreInfo.statusLabel;
                evaluation.status = scoreInfo.statusLabel;

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, isComparison: false, evaluation }));
                return;
              }

              // ========================================================
              // NHÁNH 3: CHẤM ĐIỂM ĐƠN CHO 1 AD (my-ad)
              // ========================================================
              console.log(`[API /api/evaluate-ad] Bắt đầu chấm điểm đơn 1 ad...`);
              const singleData = promptData || myAd || {};
              const evaluation = await evaluateOneAd({
                name: 'Ad của tôi',
                caption: singleData.caption,
                adLink: singleData.adLink,
                frames: singleData.frames || singleData.images || [],
              });

              console.log(`[API /api/evaluate-ad] Bóc tách JSON thành công! Tổng điểm: ${evaluation.totalScore}/100, Trạng thái: ${evaluation.statusLabel}`);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  isComparison: false,
                  evaluation,
                })
              );
            } catch (err) {
              console.error(`[API /api/evaluate-ad] Exception:`, err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: false,
                  error: `Lỗi xử lý máy chủ: ${err.message}`,
                })
              );
            }
          });
          return;
        }

        // ==========================================
        // CÁC ENDPOINT QUẢN LÝ LỊCH SỬ (/api/history)
        // ==========================================
        const reqUrl = new URL(req.url, 'http://localhost');
        const historyFilePath = path.resolve(process.cwd(), 'src/data/evaluationHistory.json');

        // Hàm đọc lịch sử với cơ chế tự phục hồi an toàn (Auto-recovery & Safe Parsing)
        const getHistoryList = () => {
          try {
            const dataDir = path.dirname(historyFilePath);
            if (!fs.existsSync(dataDir)) {
              fs.mkdirSync(dataDir, { recursive: true });
            }
            if (!fs.existsSync(historyFilePath)) {
              fs.writeFileSync(historyFilePath, '[]', 'utf-8');
              return [];
            }
            const content = fs.readFileSync(historyFilePath, 'utf-8');
            if (!content || !content.trim()) {
              fs.writeFileSync(historyFilePath, '[]', 'utf-8');
              return [];
            }
            const parsed = JSON.parse(content);
            if (!Array.isArray(parsed)) {
              console.warn('[History API] Dữ liệu evaluationHistory.json không phải mảng, tự động đặt lại []');
              fs.writeFileSync(historyFilePath, '[]', 'utf-8');
              return [];
            }
            return parsed;
          } catch (e) {
            console.error('[History API] Lỗi đọc hoặc parse evaluationHistory.json (tự phục hồi về []):', e.message);
            try {
              fs.writeFileSync(historyFilePath, '[]', 'utf-8');
            } catch (writeErr) {
              /* ignore */
            }
            return [];
          }
        };

        const saveHistoryList = (list) => {
          try {
            const dataDir = path.dirname(historyFilePath);
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
            const safeList = Array.isArray(list) ? list : [];
            fs.writeFileSync(historyFilePath, JSON.stringify(safeList, null, 2), 'utf-8');
            return true;
          } catch (e) {
            console.error('[History API] Lỗi ghi evaluationHistory.json:', e);
            return false;
          }
        };

        // 4. GET /api/history - Lấy danh sách lịch sử thẩm định (Safe Handler)
        if (reqUrl.pathname === '/api/history' && req.method === 'GET') {
          try {
            const list = getHistoryList();
            const normalizedList = (Array.isArray(list) ? list : []).map((item) => {
              if (!item) return null;
              try {
                if (item.result) {
                  const targetObj = item.result.myAdResult || item.result;
                  const scoreInfo = calculateStandardScore(targetObj);
                  const validScore = Number(targetObj.totalScore ?? scoreInfo?.finalScore ?? item.result.totalScore ?? 0) || 0;
                  item.result.totalScore = validScore;
                  item.result.score = validScore;
                  item.result.baseScore = Number(scoreInfo?.baseScore) || validScore;
                  item.result.penalty = Number(scoreInfo?.penalty) || 0;
                  item.result.criticalCount = Number(scoreInfo?.criticalCount) || 0;
                  item.result.statusLabel = scoreInfo?.statusLabel || (validScore >= 80 ? 'Tốt' : 'Cần cải thiện');
                  item.result.status = item.result.statusLabel;

                  // Đồng bộ thumbnail từ myAdResult nếu là so sánh
                  if (item.result.myAdResult?.frames?.[0]) {
                    item.thumbnail = item.result.myAdResult.frames[0];
                  }
                }
              } catch (itemErr) {
                console.warn('[History API] Lỗi chuẩn hóa 1 bản ghi:', itemErr.message);
              }
              return item;
            }).filter(Boolean);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, data: normalizedList }));
          } catch (err) {
            console.error('[History API] Exception trong GET /api/history:', err.message);
            // Tuyệt đối không để crash hoặc trả về HTML 500, luôn trả về JSON hợp lệ với data: []
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, data: [], error: err.message }));
          }
          return;
        }

        // 5. POST /api/history - Lưu bản ghi thẩm định mới
        if (reqUrl.pathname === '/api/history' && req.method === 'POST') {
          const chunks = [];
          req.on('data', (chunk) => chunks.push(chunk));
          req.on('end', () => {
            try {
              const bodyStr = Buffer.concat(chunks).toString('utf-8');
              const data = JSON.parse(bodyStr || '{}');

              const list = getHistoryList();
              const newRecord = {
                id: `eval_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                createdAt: new Date().toISOString(),
                createdAtFormatted: new Date().toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }),
                mode: data.mode || 'my-ad',
                channel: data.channel || { id: 'facebook', label: 'Facebook', dotColor: 'bg-blue-500' },
                caption: data.caption || '',
                adLink: data.adLink || '',
                thumbnail: data.thumbnail || (data.result?.myAdResult?.frames && data.result.myAdResult.frames[0]) || (data.frames && data.frames[0]) || '',
                frames: (data.frames || []).slice(0, 6),
                result: data.result || {},
              };

              // Thêm vào đầu mảng và giới hạn tối đa 100 bản ghi
              const updatedList = [newRecord, ...list].slice(0, 100);
              saveHistoryList(updatedList);

              console.log(`[API /api/history] Đã lưu bản ghi mới: ${newRecord.id} (${newRecord.channel?.label || 'Ad'}, Điểm: ${newRecord.result?.totalScore || 0})`);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, record: newRecord }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // 6. DELETE /api/history - Xóa 1 bản ghi hoặc xóa toàn bộ
        if (reqUrl.pathname === '/api/history' && req.method === 'DELETE') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const parsedBody = body ? JSON.parse(body) : {};
              const queryId = reqUrl.searchParams.get('id');
              const queryClearAll = reqUrl.searchParams.get('clearAll') === 'true';

              const id = queryId || parsedBody.id;
              const clearAll = queryClearAll || parsedBody.clearAll === true;

              if (clearAll) {
                saveHistoryList([]);
                console.log('[API /api/history] Đã xóa toàn bộ lịch sử thẩm định.');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, message: 'Đã xóa toàn bộ lịch sử thành công!' }));
                return;
              }

              if (id) {
                const list = getHistoryList();
                const filtered = list.filter((item) => item.id !== id);
                saveHistoryList(filtered);
                console.log(`[API /api/history] Đã xóa bản ghi: ${id}`);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, message: 'Đã xóa bản ghi thành công!' }));
                return;
              }

              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Thiếu tham số id hoặc clearAll để xóa.' }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), gwenConfigPlugin()],
});
