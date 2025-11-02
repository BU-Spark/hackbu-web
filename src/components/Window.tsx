import { useState, useRef, useEffect, type ReactNode } from 'react';

interface WindowProps {
  title: string;
  children: ReactNode;
  initialX?: number;
  initialY?: number;
  id: string;
  onFocus?: () => void;
  zIndex: number;
}

export function Window({
  title,
  children,
  initialX = 80,
  initialY = 80,
  id,
  onFocus,
  zIndex,
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
      const maxX = window.innerWidth - 200; // Leave at least 200px visible
      const maxY = window.innerHeight - 60; // Leave title bar visible

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
    windowRef.current?.remove();
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
        width: window.innerWidth - 40,
        height: window.innerHeight - 96,
      });
      setIsMaximized(true);
    }
  };

  return (
    <div
      ref={windowRef}
      className="absolute bg-spark-black/95 border-2 border-spark-teal rounded-lg shadow-2xl flex flex-col overflow-hidden backdrop-blur-sm"
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
        className="bg-spark-teal px-4 py-2 flex items-center justify-between cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <span className="font-mono text-spark-black font-semibold">{title}</span>
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
