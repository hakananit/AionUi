/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IProvider, TProviderWithModel } from '@/common/config/storage';
import { useCallback, useState, useEffect } from 'react';

export interface ModelSelection {
  currentModel: TProviderWithModel | undefined;
  selectModel: (provider: IProvider, modelName: string) => Promise<void>;
}

export interface UseModelSelectionOptions {
  initialModel?: TProviderWithModel;
  onSelectModel?: (provider: IProvider, modelName: string) => Promise<boolean>;
}

/**
 * Generic hook for managing model selection state.
 */
export function useModelSelection(options: UseModelSelectionOptions = {}): ModelSelection {
  const { initialModel, onSelectModel } = options;
  const [currentModel, setCurrentModel] = useState<TProviderWithModel | undefined>(initialModel);

  useEffect(() => {
    if (initialModel) {
      setCurrentModel(initialModel);
    }
  }, [initialModel]);

  const selectModel = useCallback(
    async (provider: IProvider, modelName: string) => {
      const ok = onSelectModel ? await onSelectModel(provider, modelName) : true;
      if (ok) {
        setCurrentModel({ ...provider, useModel: modelName } as TProviderWithModel);
      }
    },
    [onSelectModel]
  );

  return {
    currentModel,
    selectModel,
  };
}
