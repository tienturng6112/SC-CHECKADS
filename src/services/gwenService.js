import { GWEN_CONFIG } from '../config/gwenConfig';

/**
 * Lưu cấu hình Gwen trực tiếp vào file code `src/config/gwenConfig.js`
 * thông qua API của Vite dev server và đồng bộ vào localStorage.
 */
export async function saveGwenConfigToCode(config) {
  try {
    const res = await fetch('/api/save-gwen-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('gwen_config', JSON.stringify(config));
      return {
        success: true,
        message: data.message || 'Đã lưu cấu hình trực tiếp vào src/config/gwenConfig.js thành công!',
        directCodeSave: true,
      };
    }
  } catch (err) {
    console.warn('Vite server endpoint not reachable, falling back to localStorage:', err);
  }

  // Dự phòng khi chạy preview tĩnh không có Vite dev server middleware
  localStorage.setItem('gwen_config', JSON.stringify(config));
  return {
    success: true,
    message: 'Đã lưu cấu hình vào bộ nhớ trình duyệt (Khởi động `npm run dev` để tự động ghi đè file code src/config/gwenConfig.js).',
    directCodeSave: false,
  };
}

/**
 * Kiểm tra kết nối tới cổng Gwen (Qwen AI)
 */
export async function testGwenConnection({ baseUrl, apiKey, model }) {
  if (!baseUrl || !baseUrl.trim()) {
    return { success: false, error: 'Vui lòng nhập Base URL hợp lệ.' };
  }

  // 1. Thử qua backend endpoint của Vite server (tránh bị chặn CORS trên trình duyệt)
  try {
    const res = await fetch('/api/test-gwen-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl, apiKey, model }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: 'Kết nối tới cổng Gwen thành công! Phản hồi từ máy chủ tốt.',
      };
    } else if (res.status !== 404) {
      return {
        success: false,
        error: data.error || `Lỗi kết nối từ máy chủ (HTTP ${res.status})`,
      };
    }
  } catch (err) {
    console.warn('Không gọi được /api/test-gwen-connection, thử kết nối trực tiếp:', err);
  }

  // 2. Thử fetch trực tiếp từ trình duyệt
  try {
    const cleanUrl = baseUrl.trim().replace(/\/+$/, '');
    const directRes = await fetch(`${cleanUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey.trim()}` } : {}),
      },
      body: JSON.stringify({
        model: model?.trim() || 'qwen-plus',
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 5,
      }),
    });

    if (directRes.ok) {
      return {
        success: true,
        message: 'Kết nối trực tiếp tới cổng Gwen thành công!',
      };
    }

    const errData = await directRes.json().catch(() => ({}));
    return {
      success: false,
      error: errData?.error?.message || `Lỗi phản hồi HTTP ${directRes.status}`,
    };
  } catch (directErr) {
    return {
      success: false,
      error: `Không thể kết nối tới Base URL: ${directErr.message} (Kiểm tra lại URL hoặc CORS)`,
    };
  }
}

/**
 * Lấy cấu hình Gwen hiện tại (ưu tiên code gwenConfig.js, sau đó localStorage)
 */
export function getActiveGwenConfig() {
  try {
    const stored = localStorage.getItem('gwen_config');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...GWEN_CONFIG,
        ...parsed,
      };
    }
  } catch {
    // Ignore error
  }
  return GWEN_CONFIG;
}

