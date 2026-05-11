import { ipcBridge } from '@/common';
import useSWR from 'swr';

const useModeModeList = (
  platform: string,
  base_url?: string,
  api_key?: string,
  try_fix?: boolean,
  bedrockConfig?: {
    authMethod: 'accessKey' | 'profile';
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    profile?: string;
  }
) => {
  return useSWR(
    [platform + '/models', { platform, base_url, api_key, try_fix, bedrockConfig }],
    async ([_url, { platform, base_url, api_key, try_fix, bedrockConfig }]): Promise<{
      models: { label: string; value: string }[];
      fix_base_url?: string;
    }> => {
      // 如果有 API key、base_url 或 bedrockConfig，尝试通过 API 获取模型列表
      if (api_key || base_url || bedrockConfig) {
        const res = await ipcBridge.mode.fetchModelList.invoke({ base_url, api_key, try_fix, platform, bedrockConfig });
        if (res.success) {
          let modelList =
            res.data?.mode.map((v) => {
              // Handle both string and object formats (Bedrock returns objects with id and name)
              if (typeof v === 'string') {
                return { label: v, value: v };
              } else {
                return { label: v.name, value: v.id };
              }
            }) || [];

          // 如果返回了修复的 base_url，将其添加到结果中
          if (res.data?.fix_base_url) {
            return {
              models: modelList,
              fix_base_url: res.data.fix_base_url,
            };
          }

          return { models: modelList };
        }
        // 后端已经处理了回退逻辑，这里直接抛出错误
        return Promise.reject(res.msg);
      }

      // 既没有 API key 也没有 base_url 也没有 bedrockConfig 时，返回空列表
      return { models: [] };
    }
  );
};

export default useModeModeList;
