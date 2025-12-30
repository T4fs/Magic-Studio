
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, MousePointer2, Undo2 } from 'lucide-react';

interface DrawingCanvasProps {
  imageUrl: string;
  onSelectionComplete: (maskBase64: string | null) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ imageUrl, onSelectionComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<{ x: number, y: number }[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const initCanvas = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const width = containerRef.current!.clientWidth;
      const height = width * (img.height / img.width);
      setCanvasSize({ width, height });
    };
  }, [imageUrl]);

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [initCanvas]);

  const generateMask = useCallback(() => {
    if (!maskCanvasRef.current || points.length < 3) return null;
    const ctx = maskCanvasRef.current.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();

    return maskCanvasRef.current.toDataURL('image/png');
  }, [points]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (points.length < 2) {
      onSelectionComplete(null);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));

    if (!isDrawing && points.length > 5) {
      ctx.closePath();
      // Samsung-style pulsing glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.2)';
      ctx.fill();
      
      // Export mask to parent
      const mask = generateMask();
      onSelectionComplete(mask);
    } else {
      ctx.setLineDash([6, 3]);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [points, isDrawing, onSelectionComplete, generateMask]);

  const getPos = (e: any) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvasRef.current!.width / rect.width),
      y: (clientY - rect.top) * (canvasRef.current!.height / rect.height)
    };
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPoints(prev => prev.slice(0, -10)); // Undo chunk of points
  };

  return (
    <div ref={containerRef} className="relative w-full rounded-[2.5rem] overflow-hidden bg-zinc-100 shadow-inner group/canvas">
      <img src={imageUrl} alt="Edit" className="w-full h-auto pointer-events-none select-none" />
      
      {/* Invisible canvas for generating the black/white mask for AI */}
      <canvas ref={maskCanvasRef} width={canvasSize.width} height={canvasSize.height} className="hidden" />
      
      {/* Visible drawing canvas */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width} height={canvasSize.height}
        className="absolute top-0 left-0 cursor-crosshair touch-none mix-blend-screen transition-opacity"
        onMouseDown={(e) => { setIsDrawing(true); setPoints([getPos(e)]); }}
        onMouseMove={(e) => isDrawing && setPoints(prev => [...prev, getPos(e)])}
        onMouseUp={() => setIsDrawing(false)}
        onTouchStart={(e) => { setIsDrawing(true); setPoints([getPos(e)]); }}
        onTouchMove={(e) => isDrawing && setPoints(prev => [...prev, getPos(e)])}
        onTouchEnd={() => setIsDrawing(false)}
      />

      {points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-xl border border-white/50 flex items-center gap-2 animate-in fade-in zoom-in duration-500">
            <MousePointer2 size={14} className="text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900 tracking-tight uppercase">Circle to select</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 right-6 flex gap-2">
        {points.length > 0 && (
          <button onClick={handleUndo} className="p-3 bg-white/80 backdrop-blur hover:bg-white rounded-full shadow-lg border border-zinc-100 transition-all active:scale-90 text-zinc-400 hover:text-zinc-900">
            <Undo2 size={18} />
          </button>
        )}
        <button onClick={() => setPoints([])} className="p-3 bg-white/80 backdrop-blur hover:bg-white rounded-full shadow-lg border border-zinc-100 transition-all active:scale-90 text-zinc-400 hover:text-red-500">
          <RotateCcw size={18} />
        </button>
      </div>

      <style>{`
        canvas { animation: ${points.length > 5 && !isDrawing ? 'shimmer 3s infinite' : 'none'}; }
        @keyframes shimmer { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
};
export default DrawingCanvas;
