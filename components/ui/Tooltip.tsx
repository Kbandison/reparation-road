"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, delay = 300 }) => {
  const [show, setShow] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + rect.width / 2 + window.scrollX,
        });
      }
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
    <>
      <div
        ref={wrapperRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="min-w-0 overflow-hidden"
      >
        {children}
      </div>
      {show && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: `${position.top - 8}px`,
            left: `${position.left}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-brand-brown text-brand-tan px-3 py-2 rounded-lg shadow-lg text-xs font-medium whitespace-nowrap">
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-brand-brown"></div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
