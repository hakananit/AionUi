/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AcpBackend, AcpBackendAll, AcpBackendConfig } from '@/common/types/acpTypes';
import type { SpeechToTextConfig } from '@/common/types/speech';
import { storage } from '@office-ai/platform';

/**
 * @description 聊天相关的存储
 */
export const ChatStorage = storage.buildStorage<IChatConversationRefer>('agent.chat');

// 聊天消息存储
export const ChatMessageStorage = storage.buildStorage('agent.chat.message');

// 系统配置存储
export const ConfigStorage = storage.buildStorage<IConfigStorageRefer>('agent.config');

// 系统环境变量存储
export const EnvStorage = storage.buildStorage<IEnvStorageRefer>('agent.env');

export interface IConfigStorageRefer {
  'codex.config'?: {
    cliPath?: string;
    yoloMode?: boolean;
    sandboxMode?: 'read-only' | 'workspace-write' | 'danger-full-access';
  };
  'acp.config': {
    [backend in AcpBackend]?: {
      authMethodId?: string;
      authToken?: string;
      lastAuthTime?: number;
      cliPath?: string;
      yoloMode?: boolean;
      /** Preferred session mode for new conversations / 新会话的默认模式 */
      preferredMode?: string;
      /** Preferred model ID for new conversations / 新会话的默认模型 */
      preferredModelId?: string;
      /** LLM prompt timeout in seconds (default: 300) / LLM 请求超时时间（秒，默认 300） */
      promptTimeout?: number;
    };
  };
  /** Global LLM prompt timeout in seconds (default: 300). Per-backend promptTimeout overrides this. */
  'acp.promptTimeout'?: number;
  /** Idle timeout in minutes before an ACP agent process is killed to reclaim memory (default: 5). */
  'acp.agentIdleTimeout'?: number;
  /** User-defined custom ACP agents (isPreset !== true, require defaultCliPath). */
  'acp.customAgents'?: AcpBackendConfig[];
  /** Preset assistant configurations (isPreset === true, prompt-only, no CLI). */
  assistants?: AcpBackendConfig[];
  // Cached initialize results per ACP backend (persisted across sessions)
  'acp.cachedInitializeResult'?: Record<string, import('@/common/types/acpTypes').AcpInitializeResult>;
  // Cached model lists per ACP backend for Guid page pre-selection
  'acp.cachedModels'?: Record<string, import('@/common/types/acpTypes').AcpModelInfo>;
  // Cached config options per ACP backend for Guid page pre-selection
  'acp.cachedConfigOptions'?: Record<string, import('@/common/types/acpTypes').AcpSessionConfigOption[]>;
  // Cached modes per ACP backend for Guid page / AgentModeSelector
  'acp.cachedModes'?: Record<string, import('@/common/types/acpTypes').AcpSessionModes>;
  'model.config': IProvider[];
  'mcp.config': IMcpServer[];
  'mcp.agentInstallStatus': Record<string, string[]>;
  language: string;
  theme: string;
  colorScheme: string;
  /** Persisted app-wide UI zoom factor for Display settings */
  'ui.zoomFactor'?: number;
  customCss: string; // 自定义 CSS 样式
  'css.themes': ICssTheme[]; // 自定义 CSS 主题列表 / Custom CSS themes list
  'css.activeThemeId': string; // 当前激活的主题 ID / Currently active theme ID
  'tools.imageGenerationModel': TProviderWithModel & {
    /** @deprecated Image generation is now controlled via built-in MCP server toggle */
    switch?: boolean;
  };
  'tools.speechToText'?: SpeechToTextConfig;
  // 是否在粘贴文件到工作区时询问确认（true = 不再询问）
  'workspace.pasteConfirm'?: boolean;
  // 上传的文件是否保存到工作区目录（true = 保存到工作区，false = 保存到缓存目录）
  'upload.saveToWorkspace'?: boolean;
  // guid 页面上次选择的 agent 类型 / Last selected agent type on guid page
  'guid.lastSelectedAgent'?: string;
  // 迁移标记：修复老版本中助手 enabled 默认值问题 / Migration flag: fix assistant enabled default value issue
  'migration.assistantEnabledFixed'?: boolean;
  // 迁移标记：为 cowork 助手添加默认启用的 skills / Migration flag: add default enabled skills for cowork assistant
  /** @deprecated Use migration.builtinDefaultSkillsAdded_v2 instead */
  'migration.coworkDefaultSkillsAdded'?: boolean;
  // 迁移标记：为所有内置助手添加默认启用的 skills / Migration flag: add default enabled skills for all builtin assistants
  'migration.builtinDefaultSkillsAdded_v2'?: boolean;
  // 迁移标记：为所有内置助手添加 promptsI18n / Migration flag: add promptsI18n for all builtin assistants
  'migration.promptsI18nAdded'?: boolean;
  /** Migration flag: split 'assistants' into presets-only + 'acp.customAgents' (user-defined customs). */
  'migration.assistantsSplitCustom'?: boolean;
  /** Migration flag: Electron desktop config has been imported to server config */
  'migration.electronConfigImported'?: boolean;
  // 关闭窗口时最小化到系统托盘 / Minimize to system tray when closing window
  'system.closeToTray'?: boolean;
  // 任务完成时显示系统通知 / Show system notification when task completes
  'system.notificationEnabled'?: boolean;
  // 定时任务完成时显示系统通知 / Show system notification when scheduled task completes
  'system.cronNotificationEnabled'?: boolean;
  // 阻止系统休眠以保证定时任务执行 / Prevent system sleep to ensure scheduled tasks run
  'system.keepAwake'?: boolean;
  // Automatically preview newly created Office files in the current workspace
  'system.autoPreviewOfficeFiles'?: boolean;
  // Skills Market: whether the aionui-skills builtin skill is enabled
  'skillsMarket.enabled'?: boolean;
  // Desktop Pet: whether the desktop pet feature is enabled
  'pet.enabled'?: boolean;
  // Desktop Pet: size in pixels (200, 280, or 360)
  'pet.size'?: number;
  // Desktop Pet: do not disturb mode (pet stays idle, ignores AI events)
  'pet.dnd'?: boolean;
  // Desktop Pet: whether tool-call confirmations are routed to the pet's bubble
  // (true) or remain in the main chat window (false). Default true.
  'pet.confirmEnabled'?: boolean;
}

export interface IEnvStorageRefer {
  'aionui.dir': {
    workDir: string;
    cacheDir: string;
  };
}

/**
 * Conversation source type - identifies where the conversation was created
 * 会话来源类型 - 标识会话创建的来源
 */
export type ConversationSource = 'aionui';

interface IChatConversation<T, Extra> {
  createTime: number;
  modifyTime: number;
  name: string;
  desc?: string;
  id: string;
  type: T;
  extra: Extra;
  model: TProviderWithModel;
  status?: 'pending' | 'running' | 'finished' | undefined;
  /** 会话来源，默认为 aionui / Conversation source, defaults to aionui */
  source?: ConversationSource;
  /** Channel chat isolation ID (e.g. user:xxx, group:xxx) */
  channelChatId?: string;
}

// Token 使用统计数据类型
export interface TokenUsageData {
  totalTokens: number;
}

export type TChatConversation =
  | Omit<
      IChatConversation<
        'acp',
        {
          workspace?: string;
          backend: import('@/common/types/acpTypes').AcpBackend;
          cliPath?: string;
          customWorkspace?: boolean;
          agentName?: string;
          customAgentId?: string; // UUID for identifying specific custom agent
          presetContext?: string; // 智能助手的预设规则/提示词 / Preset context from smart assistant
          /** 启用的 skills 列表，用于过滤 SkillManager 加载的 skills / Enabled skills list for filtering SkillManager skills */
          enabledSkills?: string[];
          /** 排除的内置自动注入 skills / Builtin auto-injected skills to exclude */
          excludeBuiltinSkills?: string[];
          /** 实际加载的 skills 快照 / Snapshot of actually loaded skills */
          loadedSkills?: Array<{ name: string; description: string }>;
          /** 预设助手 ID，用于在会话面板显示助手名称和头像 / Preset assistant ID for displaying name and avatar in conversation panel */
          presetAssistantId?: string;
          /** 是否置顶会话 / Whether this conversation is pinned */
          pinned?: boolean;
          /** 置顶时间戳（毫秒）/ Pin timestamp in milliseconds */
          pinnedAt?: number;
          /** ACP 后端的 session UUID，用于会话恢复 / ACP backend session UUID for session resume */
          acpSessionId?: string;
          /** Conversation ID that owns the ACP session / 拥有该 ACP session 的会话 ID */
          acpSessionConversationId?: string;
          /** ACP session 最后更新时间 / Last update time of ACP session */
          acpSessionUpdatedAt?: number;
          /** Last context usage from usage_update */
          lastTokenUsage?: TokenUsageData;
          /** Context window capacity from usage_update */
          lastContextLimit?: number;
          /** Persisted session mode for resume support / 持久化的会话模式，用于恢复 */
          sessionMode?: string;
          /** Persisted model ID for resume support / 持久化的模型 ID，用于恢复 */
          currentModelId?: string;
          /** Cached config options from ACP backend / 缓存的 ACP 配置选项 */
          cachedConfigOptions?: import('@/common/types/acpTypes').AcpSessionConfigOption[];
          /** Pending config option selections from Guid page / Guid 页面待应用的配置选项 */
          pendingConfigOptions?: Record<string, string>;
          /** Explicit marker for temporary health-check conversations */
          isHealthCheck?: boolean;
          /** Cron job ID that spawned this conversation */
          cronJobId?: string;
        }
      >,
      'model'
    >
  | Omit<
      IChatConversation<
        'codex',
        {
          workspace?: string;
          cliPath?: string;
          customWorkspace?: boolean;
          sandboxMode?: 'read-only' | 'workspace-write' | 'danger-full-access'; // Codex sandbox permission mode
          presetContext?: string; // 智能助手的预设规则/提示词 / Preset context from smart assistant
          /** 启用的 skills 列表，用于过滤 SkillManager 加载的 skills / Enabled skills list for filtering SkillManager skills */
          enabledSkills?: string[];
          /** 实际加载的 skills 快照 / Snapshot of actually loaded skills */
          loadedSkills?: Array<{ name: string; description: string }>;
          /** 预设助手 ID，用于在会话面板显示助手名称和头像 / Preset assistant ID for displaying name and avatar in conversation panel */
          presetAssistantId?: string;
          /** 是否置顶会话 / Whether this conversation is pinned */
          pinned?: boolean;
          /** 置顶时间戳（毫秒）/ Pin timestamp in milliseconds */
          pinnedAt?: number;
          /** Persisted session mode for resume support / 持久化的会话模式，用于恢复 */
          sessionMode?: string;
          /** User-selected Codex model from Guid page / 用户在引导页选择的 Codex 模型 */
          codexModel?: string;
          /** Explicit marker for temporary health-check conversations */
          isHealthCheck?: boolean;
          /** Cron job ID that spawned this conversation */
          cronJobId?: string;
        }
      >,
      'model'
    >
  | IChatConversation<
      'aionrs',
      {
        workspace: string;
        proxy?: string;
        yoloMode?: boolean;
        presetRules?: string;
        maxTokens?: number;
        maxTurns?: number;
        sessionMode?: string;
        sessionId?: string;
        resume?: string;
        /** Coordination MCP for team sessions / 团队会话的协调 MCP */
        teamMcpStdioConfig?: {
          name: string;
          command: string;
          args: string[];
          env: Array<{ name: string; value: string }>;
        };
        /** Snapshot of actually loaded skills / 实际加载的 skills 快照 */
        loadedSkills?: Array<{ name: string; description: string }>;
        /** Whether this conversation is pinned / 是否置顶会话 */
        pinned?: boolean;
        /** Pin timestamp in milliseconds / 置顶时间戳（毫秒） */
        pinnedAt?: number;
        /** Last token usage from aionrs / aionrs 的最后 token 使用情况 */
        lastTokenUsage?: TokenUsageData;
      }
    >;

export type IChatConversationRefer = {
  'chat.history': TChatConversation[];
};

export type ModelType =
  | 'text' // 文本对话
  | 'vision' // 视觉理解
  | 'function_calling' // 工具调用
  | 'image_generation' // 图像生成
  | 'web_search' // 网络搜索
  | 'reasoning' // 推理模型
  | 'embedding' // 嵌入模型
  | 'rerank' // 重排序模型
  | 'excludeFromPrimary'; // 排除：不适合作为主力模型

export type ModelCapability = {
  type: ModelType;
  /**
   * 是否为用户手动选择，如果为true，则表示用户手动选择了该类型，否则表示用户手动禁止了该模型；如果为undefined，则表示使用默认值
   */
  isUserSelected?: boolean;
};

export interface IProvider {
  id: string;
  platform: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string[];
  /**
   * 模型能力标签列表。打了标签就是支持，没打就是不支持
   */
  capabilities?: ModelCapability[];
  /**
   * 上下文token限制，可选字段，只在明确知道时填写
   */
  contextLimit?: number;
  /**
   * 每个模型的协议覆盖配置。映射模型名称到协议字符串。
   * 仅在 platform 为 'new-api' 时使用。
   * Per-model protocol overrides. Maps model name to protocol string.
   * Only used when platform is 'new-api'.
   * e.g. { "gemini-2.5-pro": "gemini", "claude-sonnet-4": "anthropic", "gpt-4o": "openai" }
   */
  modelProtocols?: Record<string, string>;
  /**
   * AWS Bedrock specific configuration
   * Only used when platform is 'bedrock'
   */
  bedrockConfig?: {
    authMethod: 'accessKey' | 'profile';
    region: string;
    // For access key method
    accessKeyId?: string;
    secretAccessKey?: string;
    // For profile method
    profile?: string;
  };
  /**
   * 供应商启用状态，默认为 true
   * Provider enabled state, defaults to true
   */
  enabled?: boolean;
  /**
   * 各个模型的启用状态，默认全部为 true
   * Individual model enabled states, defaults to all true
   */
  modelEnabled?: Record<string, boolean>;
  /**
   * 各个模型的健康检测结果（仅用于 UI 显示，不影响启用状态）
   * Model health check results (for UI display only, does not affect enabled state)
   */
  modelHealth?: Record<
    string,
    {
      status: 'unknown' | 'healthy' | 'unhealthy';
      lastCheck?: number; // 时间戳 / timestamp
      latency?: number; // 延迟时间（毫秒）/ latency in milliseconds
      error?: string; // 错误信息 / error message
    }
  >;
}

export type TProviderWithModel = Omit<IProvider, 'model'> & {
  useModel: string;
};

// MCP Server Configuration Types
export type McpTransportType = 'stdio' | 'sse' | 'http';

export interface IMcpServerTransportStdio {
  type: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface IMcpServerTransportSSE {
  type: 'sse';
  url: string;
  headers?: Record<string, string>;
}

export interface IMcpServerTransportHTTP {
  type: 'http';
  url: string;
  headers?: Record<string, string>;
}

export interface IMcpServerTransportStreamableHTTP {
  type: 'streamable_http';
  url: string;
  headers?: Record<string, string>;
}

export type IMcpServerTransport =
  | IMcpServerTransportStdio
  | IMcpServerTransportSSE
  | IMcpServerTransportHTTP
  | IMcpServerTransportStreamableHTTP;

export interface IMcpServer {
  id: string;
  name: string;
  description?: string;
  enabled: boolean; // 是否已安装到 CLI agents（控制 Switch 状态）
  transport: IMcpServerTransport;
  tools?: IMcpTool[];
  status?: 'connected' | 'disconnected' | 'error' | 'testing'; // 连接状态（同时表示服务可用性）
  lastConnected?: number;
  createdAt: number;
  updatedAt: number;
  originalJson: string; // 存储原始JSON配置，用于编辑时的准确显示
  /** Built-in MCP server managed by AionUi (hide edit/delete in UI) */
  builtin?: boolean;
}

/** Stable ID for the built-in image generation MCP server */
export const BUILTIN_IMAGE_GEN_ID = 'builtin-image-gen';

export interface IMcpTool {
  name: string;
  description?: string;
  inputSchema?: unknown;
  _meta?: Record<string, unknown>;
}

/**
 * CSS 主题配置接口 / CSS Theme configuration interface
 * 用于存储用户自定义的 CSS 皮肤 / Used to store user-defined CSS skins
 */
export interface ICssTheme {
  id: string; // 唯一标识 / Unique identifier
  name: string; // 主题名称 / Theme name
  cover?: string; // 封面图片 base64 或 URL / Cover image base64 or URL
  css: string; // CSS 样式代码 / CSS style code
  isPreset?: boolean; // 是否为预设主题 / Whether it's a preset theme
  createdAt: number; // 创建时间 / Creation time
  updatedAt: number; // 更新时间 / Update time
}
