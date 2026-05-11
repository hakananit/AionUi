/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '@/common';
import { ConfigStorage } from '@/common/config/storage';
import type { AcpBackendConfig } from '@/common/types/acpTypes';
import AionModal from '@/renderer/components/base/AionModal';
import { Button, Typography } from '@arco-design/web-react';
import { Home, Plus, Speed } from '@icon-park/react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import useSWR from 'swr';
import AgentCard from './AgentCard';
import { AgentHubModal } from './AgentHubModal';
import InlineAgentEditor from './InlineAgentEditor';

const LocalAgents: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hubModalVisible, setHubModalVisible] = useState(false);

  // Detected agents (include built-in backends and extension-contributed agents, exclude user custom and remote)
  const { data: detectedAgents } = useSWR('acp.agents.available.settings', async () => {
    const result = await ipcBridge.acpConversation.getAvailableAgents.invoke();
    if (result.success && result.data) {
      return result.data.filter((agent) => agent.backend !== 'remote' && agent.backend !== 'custom' && !agent.isPreset);
    }
    return [];
  });

  // Custom agents (user-defined, stored in 'acp.customAgents')
  const { data: customAgents, mutate: mutateCustomAgents } = useSWR('acp.customAgents.settings', async () => {
    const agents = await ConfigStorage.get('acp.customAgents');
    return (agents || []) as AcpBackendConfig[];
  });

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AcpBackendConfig | null>(null);

  const handleSaveCustomAgent = useCallback(
    async (agent: AcpBackendConfig) => {
      const current = ((await ConfigStorage.get('acp.customAgents')) || []) as AcpBackendConfig[];
      const existingIndex = current.findIndex((a) => a.id === agent.id);
      const updatedAgents =
        existingIndex >= 0 ? current.map((a, i) => (i === existingIndex ? agent : a)) : [...current, agent];
      await ConfigStorage.set('acp.customAgents', updatedAgents);
      await mutateCustomAgents();
      setEditorVisible(false);
      setEditingAgent(null);
    },
    [mutateCustomAgents]
  );

  const handleDeleteCustomAgent = useCallback(
    async (agentId: string) => {
      const current = ((await ConfigStorage.get('acp.customAgents')) || []) as AcpBackendConfig[];
      const agents = current.filter((a) => a.id !== agentId);
      await ConfigStorage.set('acp.customAgents', agents);
      await mutateCustomAgents();
    },
    [mutateCustomAgents]
  );

  const handleToggleCustomAgent = useCallback(
    async (agentId: string, enabled: boolean) => {
      const current = ((await ConfigStorage.get('acp.customAgents')) || []) as AcpBackendConfig[];
      const updatedAgents = current.map((a) => (a.id === agentId ? { ...a, enabled } : a));
      if (updatedAgents.some((a) => a.id === agentId)) {
        await ConfigStorage.set('acp.customAgents', updatedAgents);
        await mutateCustomAgents();
      }
    },
    [mutateCustomAgents]
  );

  const otherDetected = detectedAgents ?? [];

  const openCustomAgentEditor = useCallback(() => {
    setEditingAgent(null);
    setEditorVisible(true);
  }, []);

  return (
    <div className='flex flex-col gap-8px py-16px'>
      <div className='px-16px text-12px text-t-secondary'>
        <span>{t('settings.agentManagement.localAgentsDescription')}</span>
      </div>

      {/* Detected Agents section */}
      <div className='px-16px mt-8px'>
        <Typography.Text className='text-12px font-medium text-t-secondary mb-4px block'>
          {t('settings.agentManagement.detected')}
        </Typography.Text>
      </div>

      <div className='grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-16px px-16px'>
        {/* Status card for Cursor Agent */}
        <div className='flex min-h-[160px] flex-col rounded-12px border border-solid border-[var(--color-border-2)] bg-[var(--color-bg-2)] p-12px transition-all hover:border-[var(--color-border-3)] hover:shadow-sm'>
          <div className='mb-10px flex items-center justify-between'>
            <div className='w-32px h-32px flex items-center justify-center bg-fill-2 rd-8px'>
              <Speed theme='outline' size='20' className='text-t-secondary' />
            </div>
            <div
              className={classNames(
                'px-6px py-2px rd-4px text-10px font-medium uppercase tracking-wider',
                otherDetected.some((a) => a.backend === 'cursor')
                  ? 'bg-success/10 text-success'
                  : 'bg-warning/10 text-warning'
              )}
            >
              {otherDetected.some((a) => a.backend === 'cursor') ? t('common.detected') : t('common.notDetected')}
            </div>
          </div>

          <div className='flex-1'>
            <Typography.Text className='block text-14px font-600 text-t-primary mb-2px'>Cursor Agent</Typography.Text>
            <Typography.Text className='block text-11px text-t-secondary leading-16px'>
              {otherDetected.some((a) => a.backend === 'cursor')
                ? 'Local agent CLI is active.'
                : t('settings.agentManagement.cursorDetectionHint')}
            </Typography.Text>
          </div>

          <div className='mt-10px pt-8px border-t border-t-solid border-[var(--color-border-1)] flex items-center justify-between'>
            <span className='text-10px text-t-tertiary font-medium uppercase'>{t('common.status')}</span>
            <div className='flex items-center gap-6px'>
              <span className='text-10px text-t-secondary'>
                {otherDetected.some((a) => a.backend === 'cursor') ? 'Active' : 'Missing'}
              </span>
              <div
                className={classNames(
                  'w-6px h-6px rd-full',
                  otherDetected.some((a) => a.backend === 'cursor') ? 'bg-success' : 'bg-warning'
                )}
              />
            </div>
          </div>
        </div>

        {otherDetected
          .filter((a) => a.backend !== 'cursor')
          .map((agent) => (
            <AgentCard key={agent.backend} type='detected' agent={agent} variant='grid' />
          ))}
      </div>

      {/* Custom Agents section */}
      <div className='px-16px mt-24px flex items-center justify-between'>
        <Typography.Text className='text-12px font-medium text-t-secondary'>
          {t('settings.agentManagement.custom')}
        </Typography.Text>
        <Button
          type='text'
          size='mini'
          icon={<Plus size='14' />}
          onClick={openCustomAgentEditor}
          className='text-t-secondary hover:text-t-primary'
        >
          {t('common.add')}
        </Button>
      </div>

      <div className='grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-16px px-16px'>
        {customAgents?.map((agent) => (
          <AgentCard
            key={agent.id}
            type='custom'
            agent={agent}
            variant='grid'
            onEdit={() => {
              setEditingAgent(agent);
              setEditorVisible(true);
            }}
            onDelete={() => handleDeleteCustomAgent(agent.id)}
            onToggle={(enabled) => handleToggleCustomAgent(agent.id, enabled)}
          />
        ))}
      </div>

      {editorVisible && (
        <InlineAgentEditor
          visible={editorVisible}
          agent={editingAgent}
          onSave={handleSaveCustomAgent}
          onCancel={() => {
            setEditorVisible(false);
            setEditingAgent(null);
          }}
        />
      )}

      {hubModalVisible && <AgentHubModal visible={hubModalVisible} onCancel={() => setHubModalVisible(false)} />}
    </div>
  );
};

export default LocalAgents;
