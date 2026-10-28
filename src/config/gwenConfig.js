// Cấu hình mặc định cho cổng kết nối Gwen (Qwen AI) - OpenAI Compatible
export const defaultGwenConfig = {
  baseUrl: 'https://api.xkiro.com/v1',
  apiKey: '',
  model: 'qwen/qwen3.8-omni-flash:free',
};

export const GWEN_CONFIG = defaultGwenConfig;

const STORAGE_KEY = 'cac_gwen_config';

export function getGwenConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultGwenConfig, ...JSON.parse(saved) };
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
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanConfig));
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
