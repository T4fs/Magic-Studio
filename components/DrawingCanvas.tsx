
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, MousePointer2, Undo2, Layers, Sparkles } from 'lucide-react';

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
      const containerWidth = containerRef.current!.clientWidth;
      const aspectRatio = img.height / img.width;
      const height = containerWidth * aspectRatio;
      setCanvasSize({ width: containerWidth, height });
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

    // Shadow/Glow effect for the path in Pink
    ctx.shadowBlur = isDrawing ? 0 : 25;
    ctx.shadowColor = 'rgba(255, 77, 141, 0.6)';
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));

    if (!isDrawing && points.length > 5) {
      ctx.closePath();
      ctx.strokeStyle = '#ff4d8d';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      
      // Filling with soft pink tint
      ctx.fillStyle = 'rgba(255, 77, 141, 0.2)';
      ctx.fill();
      
      const mask = generateMask();
      onSelectionComplete(mask);
    } else {
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#ff4d8d';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [points, isDrawing, onSelectionComplete, generateMask]);

  const getPos = (e: any) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPoints(prev => prev.slice(0, Math.max(0, prev.length - 20)));
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden bg-white select-none">
      <img src={imageUrl} alt="Edit" className="w-full h-auto pointer-events-none select-none" />
      
      <canvas ref={maskCanvasRef} width={canvasSize.width} height={canvasSize.height} className="hidden" />
      
      <canvas
        ref={canvasRef}
        width={canvasSize.width} height={canvasSize.height}
        className="absolute top-0 left-0 cursor-crosshair touch-none mix-blend-normal"
        onMouseDown={(e) => { setIsDrawing(true); setPoints([getPos(e)]); }}
        onMouseMove={(e) => isDrawing && setPoints(prev => [...prev, getPos(e)])}
        onMouseUp={() => setIsDrawing(false)}
        onTouchStart={(e) => { setIsDrawing(true); setPoints([getPos(e)]); }}
        onTouchMove={(e) => isDrawing && setPoints(prev => [...prev, getPos(e)])}
        onTouchEnd={() => setIsDrawing(false)}
      />

      <div className="absolute bottom-6 left-6 flex gap-3">
        {points.length > 0 && (
          <button onClick={handleUndo} className="p-3 bg-white hover:bg-pink-50 rounded-2xl shadow-xl border border-pink-50 transition-all active:scale-90 text-pink-200 hover:text-[#ff4d8d]">
            <Undo2 size={18} />
          </button>
        )}
        <button onClick={() => setPoints([])} className="p-3 bg-white hover:bg-pink-50 rounded-2xl shadow-xl border border-pink-50 transition-all active:scale-90 text-pink-200 hover:text-red-400">
          <RotateCcw size={18} />
        </button>
      </div>

      <style>{`
        canvas { 
          animation: ${points.length > 5 && !isDrawing ? 'pulse-selection 2s infinite ease-in-out' : 'none'}; 
        }
        @keyframes pulse-selection { 
          0%, 100% { opacity: 0.85; transform: scale(1); } 
          50% { opacity: 1; transform: scale(1.002); } 
        }
      `}</style>
    </div>
  );
};
export default DrawingCanvas;
