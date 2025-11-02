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

  const windowRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const savedSize = useRef({ width: 600, height: 400 });
  const savedPos = useRef({ x: initialX, y: initialY });

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      // Constrain to viewport
      const maxX = (typeof window !== 'undefined' ? window.innerWidth : 1920) - 200; // Leave at least 200px visible
      const maxY = (typeof window !== 'undefined' ? window.innerHeight : 1080) - 60; // Leave title bar visible

      setPos({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(56, Math.min(newY, maxY)), // 56px for topbar
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
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    if (isMaximized) {
      // Restore
      setPos(savedPos.current);
      setSize(savedSize.current);
      setIsMaximized(false);
    } else {
      // Maximize
      savedPos.current = pos;
      savedSize.current = size;
      setPos({ x: 20, y: 76 });
      setSize({
        width: (typeof window !== 'undefined' ? window.innerWidth : 1920) - 40,
        height: (typeof window !== 'undefined' ? window.innerHeight : 1080) - 96,
      });
      setIsMaximized(true);
    }
  };

  return (
    <div
      ref={windowRef}
      className={`absolute bg-spark-black/95 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden backdrop-blur-sm transition-all ${
        isFocused ? 'border-4 border-spark-chartreuse' : 'border-2 border-gray-600'
      }`}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: isMaximized ? `${size.width}px` : '600px',
        height: isMaximized ? `${size.height}px` : isMinimized ? '40px' : '400px',
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
            className="w-5 h-5 rounded-full bg-spark-chartreuse hover:bg-spark-chartreuse/80 transition-colors"
            aria-label="Minimize"
          />
          <button
            onClick={handleMaximize}
            className="w-5 h-5 rounded-full bg-spark-eggshell hover:bg-spark-eggshell/80 transition-colors"
            aria-label="Maximize"
          />
          <button
            onClick={handleClose}
            className="w-5 h-5 rounded-full bg-spark-orange hover:bg-spark-orange/80 transition-colors"
            aria-label="Close"
          />
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-auto p-4 text-spark-eggshell">
          {children}
        </div>
      )}
    </div>
  );
}
