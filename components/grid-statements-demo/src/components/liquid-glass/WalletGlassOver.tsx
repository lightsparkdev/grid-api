'use client';

import React, {
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type { GlassConfig } from './index';

interface GlassOverProps extends Partial<GlassConfig> {
  backdrop?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const { GlassOver: WalletGlassOver } = require(
  '../../../../grid-wallet-demo/src/components/liquid-glass/GlassOver',
) as {
  GlassOver: ComponentType<GlassOverProps>;
};

export function GlassOver(props: GlassOverProps) {
  const { className, style, ...glassProps } = props;
  return (
    <div className={className} style={style}>
      <WalletGlassOver {...glassProps} />
    </div>
  );
}
