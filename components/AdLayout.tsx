"use client";

import { ReactNode } from 'react';

interface AdLayoutProps {
  children: ReactNode;
  leftAdCode?: string;
  rightAdCode?: string;
  footerAdCode?: string;
}

export default function AdLayout({ children, leftAdCode, rightAdCode, footerAdCode }: AdLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <div className="flex">
        {/* Left Advertisement Area */}
        {leftAdCode && (
          <aside className="hidden xl:block fixed left-0 top-0 bottom-0 w-40 bg-neutral-900/50 border-r border-white/5 overflow-hidden">
            <div className="sticky top-24 p-4">
              <div
                className="bg-neutral-800/30 rounded-lg p-2 text-center text-xs text-neutral-600"
                dangerouslySetInnerHTML={{ __html: leftAdCode }}
              />
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${leftAdCode ? 'xl:ml-40' : ''} ${rightAdCode ? 'xl:mr-40' : ''}`}>
          {children}
        </main>

        {/* Right Advertisement Area */}
        {rightAdCode && (
          <aside className="hidden xl:block fixed right-0 top-0 bottom-0 w-40 bg-neutral-900/50 border-l border-white/5 overflow-hidden">
            <div className="sticky top-24 p-4">
              <div
                className="bg-neutral-800/30 rounded-lg p-2 text-center text-xs text-neutral-600"
                dangerouslySetInnerHTML={{ __html: rightAdCode }}
              />
            </div>
          </aside>
        )}
      </div>

      {/* Footer Advertisement Area */}
      {footerAdCode && (
        <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 border-t border-white/10 backdrop-blur-md z-40">
          <div className="max-w-7xl mx-auto p-4">
            <div
              className="bg-neutral-800/30 rounded-lg p-4 text-center text-sm text-neutral-600"
              dangerouslySetInnerHTML={{ __html: footerAdCode }}
            />
          </div>
        </div>
      )}

      {/* Bottom padding to prevent footer ad from covering content */}
      {footerAdCode && <div className="h-24" />}
    </div>
  );
}
