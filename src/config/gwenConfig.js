// Cấu hình mặc định cho cổng kết nối Gwen (Qwen AI) - OpenAI Compatible
export const defaultGwenConfig = {
  baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
  apiKey: '',
  model: 'qwen-vl-max',
};

export const GWEN_CONFIG = defaultGwenConfig;

const STORAGE_KEY = 'cac_gwen_config';

export function getGwenConfig() {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      const parsed = JSON.parse(saved);
      let model = parsed.model || defaultGwenConfig.model;
      // Tự động nâng cấp model text thuần cũ sang model Vision qwen-vl-max
      if (/^(qwen-plus|qwen-max|qwen-turbo|qwen-long)$/i.test(model.trim())) {
        model = 'qwen-vl-max';
      }
      return {
        ...defaultGwenConfig,
        ...parsed,
        model,
      };
    }
  } catch (e) {
    console.error('Lỗi đọc cấu hình Gwen:', e);
  }
  return defaultGwenConfig;
}

export function saveGwenConfig(config) {
  const cleanConfig = {
    baseUrl: (config.baseUrl || defaultGwenConfig.baseUrl).trim().replace(/\/+$/, ''),
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
  return `// src/config/gwenConfig.js
export const gwenConfig = {
  baseUrl: "${config.baseUrl}",
  apiKey: "${config.apiKey ? config.apiKey.slice(0, 6) + '...' + config.apiKey.slice(-4) : ''}",
  model: "${config.model}"
};`;
}

export default defaultGwenConfig;
