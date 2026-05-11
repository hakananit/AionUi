/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { networkInterfaces } from 'os';

export class WebuiService {
  /**
   * 获取局域网 IP 地址
   * Get LAN IP address using os.networkInterfaces()
   */
  static getLanIP(): string | null {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      const netInfo = nets[name];
      if (!netInfo) continue;

      for (const iface of netInfo) {
        // 跳过内部地址（127.0.0.1）和 IPv6
        // Skip internal addresses (127.0.0.1) and IPv6
        const isIPv4 = iface.family === 'IPv4';
        const isNotInternal = !iface.internal;
        if (isIPv4 && isNotInternal) {
          return iface.address;
        }
      }
    }
    return null;
  }
}
