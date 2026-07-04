'use client';

import { useEffect } from 'react';
import { setAuthFlow } from './authFlow';

export type AuthSheetMethod = 'email' | 'phone';

interface AuthSheetProps {
  method?: AuthSheetMethod;
  open: boolean;
  sending?: boolean;
  codeActive?: boolean;
  onSubmit: (value: string) => void;
  onSubmitCode?: (code: string) => void;
  onBack?: () => void;
  onCancel?: () => void;
}

/**
 * Marketplace auth sheet — a BRIDGE, not a sheet. The marketplace sign-in is a
 * permanent iOS pageSheet owned by MarketplaceAuthScreen; the email/phone OTP
 * confirm screen pushes in from the right INSIDE that same surface (Aurora-style
 * nav push), so there is no separate overlay to mount here. This component just
 * mirrors the flow props into the skin-local store the auth screen reads.
 */
export function AuthSheet({
  method = 'email',
  open,
  sending = false,
  codeActive = false,
  onSubmit,
  onSubmitCode,
  onBack,
  onCancel,
}: AuthSheetProps) {
  useEffect(() => {
    setAuthFlow({ method, open, sending, codeActive, onSubmit, onSubmitCode, onBack, onCancel });
  }, [method, open, sending, codeActive, onSubmit, onSubmitCode, onBack, onCancel]);
  useEffect(() => () => setAuthFlow(null), []);
  return null;
}
