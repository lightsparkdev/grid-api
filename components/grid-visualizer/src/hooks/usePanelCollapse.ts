'use client';

import { useState, useCallback } from 'react';

export function usePanelCollapse() {
  const [flowExpanded, setFlowExpanded] = useState(true);
  const [codeExpanded, setCodeExpanded] = useState(true);

  const toggleFlow = useCallback(() => {
    setFlowExpanded((prev) => {
      if (prev) {
        // Collapsing flow → ensure code stays open
        setCodeExpanded(true);
        return false;
      }
      return true;
    });
  }, []);

  const toggleCode = useCallback(() => {
    setCodeExpanded((prev) => {
      if (prev) {
        // Collapsing code → ensure flow stays open
        setFlowExpanded(true);
        return false;
      }
      return true;
    });
  }, []);

  return { flowExpanded, codeExpanded, toggleFlow, toggleCode };
}
