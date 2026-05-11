import { useMemo } from 'react';
import useSWR from 'swr';
import { ipcBridge } from '@/common';

const useConfigModelListWithImage = () => {
  const { data } = useSWR('configModelListWithImage', () => {
    return ipcBridge.mode.getModelConfig.invoke();
  });

  const modelListWithImage = useMemo(() => {
    return (data || []).map((platform) => {
      const platformLower = platform.platform?.toLowerCase() || '';
      const hasImageModel = platform.model.some((m) => {
        const name = m.toLowerCase();
        return name.includes('image') || name.includes('imagine');
      });

      if (platform.platform === 'OpenRouter' && platform.baseUrl && platform.baseUrl.includes('openrouter.ai')) {
        // 官方 OpenRouter 平台（baseUrl 包含 openrouter.ai）至少要有免费图像模型
        const hasOpenRouterImage = platform.model.some((m) => m.toLowerCase().includes('image') || m.toLowerCase().includes('imagine'));
        if (!hasOpenRouterImage) {
          // Fallback logic if needed
        }
      } else if (platformLower.includes('antigravity') && !hasImageModel) {
        // AntigravityTools 平台 logic
      }

      return platform;
    });
  }, [data]);

  return {
    modelListWithImage,
  };
};

export default useConfigModelListWithImage;
