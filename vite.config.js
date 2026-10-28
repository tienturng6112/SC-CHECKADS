import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

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

              const fileContent = `// File cấu hình kết nối Gwen (Qwen AI)
// Tự động lưu và cập nhật trực tiếp vào file này khi bấm nút "Lưu" ở menu Bộ tiêu chí
// Cập nhật lúc: ${new Date().toLocaleString('vi-VN')}

export const GWEN_CONFIG = {
  baseUrl: ${JSON.stringify(data.baseUrl || '')},
  apiKey: ${JSON.stringify(data.apiKey || '')},
  model: ${JSON.stringify(data.model || 'qwen-plus')},
  selectedAI: ${JSON.stringify(data.selectedAI || 'gwen')},
};

export default GWEN_CONFIG;
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

              const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
              const targetUrl = `${cleanBaseUrl}/chat/completions`;

              const headers = {
                'Content-Type': 'application/json',
              };
              if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
              }

              const apiResp = await fetch(targetUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  model: model || 'qwen-plus',
                  messages: [{ role: 'user', content: 'Ping connection test. Reply with OK.' }],
                  max_tokens: 10,
                }),
              });

              const respData = await apiResp.json().catch(() => ({}));

              if (!apiResp.ok) {
                res.statusCode = apiResp.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    error: respData?.error?.message || `Lỗi phản hồi từ máy chủ Gwen (Mã: ${apiResp.status})`,
                  })
                );
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  message: 'Kết nối thành công tới cổng Gwen!',
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

        // 3. Cổng API phân tích và chấm điểm quảng cáo theo bộ tiêu chí bằng Model Gwen
        if (req.url === '/api/evaluate-ad' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { config, promptData } = JSON.parse(body || '{}');
              const { baseUrl, apiKey, model } = config || {};
              const { systemPrompt, userContent, sampleFrames } = promptData || {};

              if (!apiKey) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    error: 'Chưa có API Key. Vui lòng vào menu "Bộ tiêu chí" để cấu hình API Key cho Gwen (Qwen AI).',
                  })
                );
                return;
              }

              const cleanBaseUrl = (baseUrl || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1').replace(/\/+$/, '');
              const targetUrl = `${cleanBaseUrl}/chat/completions`;

              // Kiểm tra xem model có hỗ trợ Vision không (qwen-vl, qwen2.5-vl...)
              const isVisionModel = /vl|vision|4o|gemini/i.test(model || '');

              let userMsgContent = userContent;
              if (isVisionModel && sampleFrames && sampleFrames.length > 0) {
                userMsgContent = [
                  { type: 'text', text: userContent },
                  ...sampleFrames.map((frame) => ({
                    type: 'image_url',
                    image_url: { url: frame },
                  })),
                ];
              }

              const requestPayload = {
                model: model || 'qwen-plus',
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userMsgContent },
                ],
                temperature: 0.3,
              };

              const apiResp = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey.trim()}`,
                },
                body: JSON.stringify(requestPayload),
              });

              const respData = await apiResp.json().catch(() => ({}));

              if (!apiResp.ok) {
                res.statusCode = apiResp.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    error: respData?.error?.message || `Lỗi từ nhà cung cấp AI Gwen (Mã: ${apiResp.status})`,
                  })
                );
                return;
              }

              const aiRawContent = respData?.choices?.[0]?.message?.content || '';

              // Xử lý bóc tách JSON an toàn
              let evaluation = null;
              try {
                evaluation = JSON.parse(aiRawContent);
              } catch {
                const match = aiRawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (match && match[1]) {
                  try {
                    evaluation = JSON.parse(match[1]);
                  } catch {
                    /* ignore */
                  }
                }
                if (!evaluation) {
                  const firstBrace = aiRawContent.indexOf('{');
                  const lastBrace = aiRawContent.lastIndexOf('}');
                  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    try {
                      evaluation = JSON.parse(aiRawContent.substring(firstBrace, lastBrace + 1));
                    } catch {
                      /* ignore */
                    }
                  }
                }
              }

              if (!evaluation) {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    error: 'Mô hình AI phản hồi nhưng không đúng cấu trúc JSON yêu cầu.',
                    raw: aiRawContent,
                  })
                );
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  evaluation,
                  raw: aiRawContent,
                })
              );
            } catch (err) {
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

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), gwenConfigPlugin()],
});
