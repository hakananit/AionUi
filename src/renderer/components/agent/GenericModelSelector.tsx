/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IProvider } from '@/common/config/storage';
import { useModelProviderList } from '@/renderer/hooks/agent/useModelProviderList';
import type { ModelSelection } from '@/renderer/hooks/agent/useModelSelection';
import { iconColors } from '@/renderer/styles/colors';
import { Button, Dropdown, Menu, Tooltip } from '@arco-design/web-react';
import { Down, Robot } from '@icon-park/react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface GenericModelSelectorProps {
  selection?: ModelSelection;
  disabled?: boolean;
  label?: string;
  variant?: 'default' | 'settings';
}

const GenericModelSelector: React.FC<GenericModelSelectorProps> = ({
  selection,
  disabled,
  label,
  variant = 'default',
}) => {
  const { t } = useTranslation();
  const { providers, isLoading } = useModelProviderList();

  const currentModel = selection?.currentModel;

  const menu = useMemo(() => {
    if (isLoading)
      return (
        <Menu>
          <Menu.Item key='loading'>{t('common.loading')}</Menu.Item>
        </Menu>
      );
    if (providers.length === 0)
      return (
        <Menu>
          <Menu.Item key='empty'>{t('settings.model.noProviders')}</Menu.Item>
        </Menu>
      );

    return (
      <Menu selectedKeys={[currentModel ? `${currentModel.id}|${currentModel.useModel}` : '']}>
        {providers.map((p) => (
          <Menu.SubMenu
            key={p.id}
            title={
              <div className='flex items-center gap-8px'>
                <Robot size='14' fill={iconColors.primary} />
                <span>{p.name || p.platform}</span>
              </div>
            }
          >
            {(p.model || []).map((m) => {
              const modelName = typeof m === 'string' ? m : m.id;
              const displayName = typeof m === 'string' ? m : m.name;
              return (
                <Menu.Item key={`${p.id}|${modelName}`} onClick={() => selection?.selectModel(p, modelName)}>
                  {displayName}
                </Menu.Item>
              );
            })}
          </Menu.SubMenu>
        ))}
      </Menu>
    );
  }, [providers, isLoading, currentModel, selection, t]);

  const buttonContent = (
    <Button
      type={variant === 'settings' ? 'secondary' : 'text'}
      disabled={disabled || !selection}
      className='min-w-160px flex items-center justify-between gap-8px'
    >
      <span className='truncate'>{currentModel ? currentModel.useModel : t('settings.assistant.selectModel')}</span>
      <Down size='14' />
    </Button>
  );

  if (label || disabled) {
    return (
      <Tooltip content={label || (disabled ? t('settings.assistant.modelSelectionDisabled') : undefined)}>
        {buttonContent}
      </Tooltip>
    );
  }

  return (
    <Dropdown droplist={menu} trigger='click' position='br'>
      {buttonContent}
    </Dropdown>
  );
};

export default GenericModelSelector;
