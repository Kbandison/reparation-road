"use client";

import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, delay = 300 }) => {
  const [show, setShow] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setShow(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setShow(false);
  };

  return (
    <div className="relative inline-block min-w-0 overflow-hidden">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block min-w-0 overflow-hidden"
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
          <div className="bg-brand-brown text-brand-tan px-3 py-2 rounded-lg shadow-lg text-xs font-medium whitespace-nowrap">
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-brand-brown"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
