import { useState, useRef, useEffect, type ReactNode } from 'react';

interface WindowProps {
  title: string;
  children: ReactNode;
  initialX?: number;
  initialY?: number;
  id: string;
  onFocus?: () => void;
  zIndex: number;
  isFocused?: boolean;
}

export function Window({
  title,
  children,
  initialX = 80,
  initialY = 80,
  id,
  onFocus,
  zIndex,
  isFocused = true,
}: WindowProps) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);

  const windowRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
  const savedSize = useRef({ width: 600, height: 400 });
  const savedPos = useRef({ x: initialX, y: initialY });

  const MIN_WIDTH = 300;
  const MIN_HEIGHT = 200;

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      // Constrain to viewport
      const maxX = (typeof window !== 'undefined' ? window.innerWidth : 1920) - 200; // Leave at least 200px visible
      const maxY = (typeof window !== 'undefined' ? window.innerHeight : 1080) - 60; // Leave title bar visible

      // Desktop has pt-14 padding, so minY=0 keeps window below header
      const minY = 0;

      setPos({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(minY, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Resize handling
  useEffect(() => {
    if (!isResizing || !resizeDirection) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.current.x;
      const deltaY = e.clientY - resizeStart.current.y;

      let newWidth = resizeStart.current.width;
      let newHeight = resizeStart.current.height;
      let newX = resizeStart.current.posX;
      let newY = resizeStart.current.posY;

      // Handle horizontal resizing
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(MIN_WIDTH, resizeStart.current.width + deltaX);
      } else if (resizeDirection.includes('w')) {
        const proposedWidth = resizeStart.current.width - deltaX;
        if (proposedWidth >= MIN_WIDTH) {
          newWidth = proposedWidth;
          newX = resizeStart.current.posX + deltaX;
        }
      }

      // Handle vertical resizing
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(MIN_HEIGHT, resizeStart.current.height + deltaY);
      } else if (resizeDirection.includes('n')) {
        const proposedHeight = resizeStart.current.height - deltaY;
        if (proposedHeight >= MIN_HEIGHT) {
          newHeight = proposedHeight;
          newY = Math.max(0, resizeStart.current.posY + deltaY);
        }
      }

      setSize({ width: newWidth, height: newHeight });
      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, MIN_WIDTH, MIN_HEIGHT]);

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      posX: pos.x,
      posY: pos.y,
    };
    onFocus?.();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return; // Don't drag if clicking buttons

    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    onFocus?.();
  };

  const handleClose = () => {
    // Dispatch event to WindowManager to properly close this window
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('closeWindow', { detail: id }));
    }
  };

  const handleMinimize = () => {
    if (!isMinimized && isMaximized) {
      // If maximized, restore first then minimize
      setPos(savedPos.current);
      setSize(savedSize.current);
      setIsMaximized(false);
    }
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    if (isMaximized) {
      // Restore
      setPos(savedPos.current);
      setSize(savedSize.current);
      setIsMaximized(false);
    } else {
      // Maximize to the desktop area (below topbar, above dock)
      savedPos.current = pos;
      savedSize.current = size;

      const computeDesktopBounds = () => {
        const w = typeof window !== 'undefined' ? window : undefined;
        const bottomGutter = 8; // Small gutter above dock
        const leftGutter = 20;
        const rightGutter = 20;

        const winW = w ? w.innerWidth : 1920;
        const winH = w ? w.innerHeight : 1080;

        let headerHeight = 56; // Topbar default (h-14)
        let dockTop = winH - 80; // Default estimate if dock not found

        if (w && typeof document !== 'undefined') {
          const headerEl = document.querySelector('header');
          if (headerEl) {
            headerHeight = (headerEl as HTMLElement).offsetHeight;
          }

          // Measure actual dock position
          const dockEl = document.getElementById('dock');
          if (dockEl) {
            const dockRect = dockEl.getBoundingClientRect();
            dockTop = dockRect.top;
          }
        }

  // Desktop has pt-14 (56px padding-top), so windows at y=0 start below header
  // Window fills from top of desktop area (y=0) to dock top minus gutter
  const x = leftGutter;
  const y = 0;
  const width = winW - (leftGutter + rightGutter);
  // Height is from desktop top to dock top minus header height and gutter
  const height = Math.max(120, dockTop - headerHeight - bottomGutter);

  return { x, y, width, height };
      };

      const bounds = computeDesktopBounds();
      setPos({ x: bounds.x, y: bounds.y });
      setSize({ width: bounds.width, height: bounds.height });
      setIsMaximized(true);
      // Clear minimize if maximizing
      if (isMinimized) {
        setIsMinimized(false);
      }
    }
  };

  // Keep maximized window fitted on viewport resize
  useEffect(() => {
    if (!isMaximized) return;
    const onResize = () => {
      const w = typeof window !== 'undefined' ? window : undefined;
      const bottomGutter = 8; // Small gutter above dock
      const leftGutter = 20;
      const rightGutter = 20;

      const winW = w ? w.innerWidth : 1920;
      const winH = w ? w.innerHeight : 1080;

      let headerHeight = 56;
      let dockTop = winH - 80; // Default estimate if dock not found

      if (w && typeof document !== 'undefined') {
        const headerEl = document.querySelector('header');
        if (headerEl) {
          headerHeight = (headerEl as HTMLElement).offsetHeight;
        }

        // Measure actual dock position
        const dockEl = document.getElementById('dock');
        if (dockEl) {
          dockTop = dockEl.getBoundingClientRect().top;
        }
      }

      // Desktop has pt-14, so y=0 positions window at desktop top (below header)
      setPos({ x: leftGutter, y: 0 });
      setSize({
        width: winW - (leftGutter + rightGutter),
        height: Math.max(120, dockTop - headerHeight - bottomGutter),
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isMaximized]);

  return (
    <div
      ref={windowRef}
      className={`absolute bg-spark-black/95 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden backdrop-blur-sm transition-all ${
        isFocused ? 'border-4 border-spark-chartreuse' : 'border-2 border-gray-600'
      }`}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: isMinimized ? '600px' : `${size.width}px`,
        height: isMinimized ? '52px' : `${size.height}px`,
        zIndex,
      }}
      onMouseDown={onFocus}
      data-window-id={id}
    >
      {/* Title Bar */}
      <div
        className={`px-4 py-3 flex items-center justify-between cursor-move select-none transition-colors ${
          isFocused
            ? 'bg-spark-teal border-b-2 border-spark-chartreuse'
            : 'bg-gray-700 border-b border-gray-600'
        }`}
        onMouseDown={handleMouseDown}
      >
        <span className={`font-mono font-bold text-base ${isFocused ? 'text-spark-black' : 'text-gray-400'}`}>{title}</span>
        <div className="flex gap-2">
          <button
            onClick={handleMinimize}
            className="w-5 h-5 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/90 transition-colors flex items-center justify-center group"
            aria-label="Minimize"
          >
            <span className="text-[#995700] text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity leading-none pb-0.5">−</span>
          </button>
          <button
            onClick={handleMaximize}
            className="w-5 h-5 rounded-full bg-[#28CA42] hover:bg-[#28CA42]/90 transition-colors flex items-center justify-center group"
            aria-label="Maximize"
          >
            <span className="text-[#006500] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity leading-none">⛶</span>
          </button>
          <button
            onClick={handleClose}
            className="w-5 h-5 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/90 transition-colors flex items-center justify-center group"
            aria-label="Close"
          >
            <span className="text-[#4D0000] text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity leading-none">×</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-auto p-4 text-spark-eggshell">
          {children}
        </div>
      )}

      {/* Resize Handles - only show when not maximized or minimized */}
      {!isMaximized && !isMinimized && (
        <>
          {/* Corner handles */}
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            style={{ touchAction: 'none' }}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            style={{ touchAction: 'none' }}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            style={{ touchAction: 'none' }}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            style={{ touchAction: 'none' }}
          />

          {/* Edge handles - positioned at outer edges */}
          <div
            className="absolute top-0 left-3 right-3 h-2 cursor-n-resize -translate-y-1"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
            style={{ touchAction: 'none' }}
          />
          <div
            className="absolute bottom-0 left-3 right-3 h-2 cursor-s-resize translate-y-1"
            onMouseDown={(e) => handleResizeStart(e, 's')}
            style={{ touchAction: 'none' }}
          />
          <div
            className="absolute left-0 top-3 bottom-3 w-2 cursor-w-resize -translate-x-1"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
            style={{ touchAction: 'none' }}
          />
          <div
            className="absolute right-0 top-3 bottom-3 w-2 cursor-e-resize translate-x-1"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
            style={{ touchAction: 'none' }}
          />
        </>
      )}
    </div>
  );
}
