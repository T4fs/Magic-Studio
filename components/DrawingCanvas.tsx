
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, MousePointer2 } from 'lucide-react';

interface DrawingCanvasProps {
  imageUrl: string;
  brushSize: number;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ imageUrl, brushSize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || points.length < 2) {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));

    if (!isDrawing && points.length > 5) {
      ctx.closePath();
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(255, 255, 255, 1)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
      ctx.fill();
    } else {
      ctx.setLineDash([8, 4]);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [points, isDrawing]);

  const getPos = (e: any) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvasRef.current!.width / rect.width),
      y: (clientY - rect.top) * (canvasRef.current!.height / rect.height)
    };
  };

  return (
    <div ref={containerRef} className="relative w-full rounded-[3rem] overflow-hidden bg-white shadow-sm border border-zinc-100">
      <img src={imageUrl} alt="Edit" className="w-full h-auto pointer-events-none select-none" />
      <canvas
        ref={canvasRef}
        width={canvasSize.width} height={canvasSize.height}
        className="absolute top-0 left-0 cursor-crosshair touch-none mix-blend-screen"
        onMouseDown={(e) => { setIsDrawing(true); setPoints([getPos(e)]); }}
        onMouseMove={(e) => isDrawing && setPoints(prev => [...prev, getPos(e)])}
        onMouseUp={() => setIsDrawing(false)}
        onTouchStart={(e) => { setIsDrawing(true); setPoints([getPos(e)]); }}
        onTouchMove={(e) => isDrawing && setPoints(prev => [...prev, getPos(e)])}
        onTouchEnd={() => setIsDrawing(false)}
      />
      {points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xl px-6 py-3 rounded-full shadow-2xl border border-white/50 flex items-center gap-3">
            <MousePointer2 size={18} className="text-zinc-400" />
            <span className="text-sm font-bold text-zinc-900">Circle a subject to edit</span>
          </div>
        </div>
      )}
      <button onClick={() => setPoints([])} className="absolute bottom-8 right-8 p-4 bg-white hover:bg-zinc-50 rounded-full shadow-2xl border border-zinc-100 active:scale-90 transition-all">
        <RotateCcw size={20} className="text-zinc-400" />
      </button>
      <style>{`
        canvas { animation: ${points.length > 5 && !isDrawing ? 'shimmer 2s infinite ease-in-out' : 'none'}; }
        @keyframes shimmer { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
      `}</style>
    </div>
  );
};
export default DrawingCanvas;
