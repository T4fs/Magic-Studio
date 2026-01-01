
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Sparkles, History, Download, ChevronRight, Image as ImageIcon,
  RefreshCw, ArrowRight, Plus, ArrowLeft, Eye, Wand2, Palette, ImagePlus, X
} from 'lucide-react';
import DrawingCanvas from './components/DrawingCanvas';
import { processImageEditing } from './services/geminiService';
import { EditorMode, HistoryItem } from './types';

const PRESETS = [
  { id: 'anime', label: 'Anime Style', prompt: 'Turn the selection into a high-quality Studio Ghibli anime style character' },
  { id: 'cyber', label: 'Cyberpunk', prompt: 'Give the selection a futuristic cyberpunk neon aesthetic with robotic details' },
  { id: 'sketch', label: 'Sketch', prompt: 'Convert the selection into a detailed pencil sketch' },
  { id: 'professional', label: 'Pro Photo', prompt: 'Enhance the selection with professional studio lighting and 8k resolution details' },
  { id: 'clay', label: 'Claymation', prompt: 'Make the selection look like a 3D claymation figure' },
];

const App: React.FC = () => {
  const [mode, setMode] = useState<EditorMode>(EditorMode.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectionMask, setSelectionMask] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOriginalImage(ev.target?.result as string);
        setMode(EditorMode.BRUSH);
        setResultImage(null);
        setReferenceImage(null);
        setPrompt('');
        setSelectionMask(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReferenceImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!originalImage || (!finalPrompt.trim() && !referenceImage)) return;
    
    setMode(EditorMode.PROCESSING);
    setError(null);
    try {
      const edited = await processImageEditing(originalImage, finalPrompt || "Modify selection using reference image", selectionMask, referenceImage);
      setResultImage(edited);
      setMode(EditorMode.RESULT);
      setHistory(prev => [{
        id: crypto.randomUUID(), originalImage, editedImage: edited,
        prompt: finalPrompt || "Reference Image Transformation", timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || "Transformation failed.");
      setMode(EditorMode.BRUSH);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setReferenceImage(null);
    setResultImage(null);
    setSelectionMask(null);
    setPrompt('');
    setMode(EditorMode.IDLE);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Navbar */}
      <nav className="h-20 flex items-center justify-between px-8 bg-white border-b border-zinc-100 sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
          <div 
            className="w-11 h-11 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all" 
            onClick={handleReset}
          >
            <Wand2 size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none uppercase">Studio</h1>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Multi-Modal Magic</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-colors border border-zinc-100"
          >
            <History size={18} className="text-zinc-500" />
          </button>
          {originalImage && (
            <button 
              onClick={handleReset} 
              className="px-5 py-2.5 text-zinc-400 hover:text-zinc-900 font-bold text-xs uppercase tracking-widest"
            >
              Reset
            </button>
          )}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-6 lg:p-12 flex flex-col items-center">
        {mode === EditorMode.IDLE && (
          <div className="w-full max-w-xl flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div 
              className="group relative w-full aspect-square border-2 border-dashed border-zinc-200 rounded-[3rem] bg-white hover:border-zinc-400 transition-all cursor-pointer flex flex-col items-center justify-center gap-6 shadow-sm hover:shadow-2xl" 
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-300 group-hover:scale-110 group-hover:bg-zinc-900 group-hover:text-white transition-all shadow-inner">
                <Plus size={40} strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black tracking-tight mb-1">Start your creation</h2>
                <p className="text-sm font-medium text-zinc-400">Upload a photo to begin the magic</p>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>
          </div>
        )}

        {mode === EditorMode.BRUSH && originalImage && (
          <div className="w-full max-w-4xl flex flex-col gap-10 animate-in fade-in duration-700 pb-52">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Step 01</span>
              <h2 className="text-3xl font-black tracking-tight text-center">Circle the target</h2>
            </div>
            
            <DrawingCanvas imageUrl={originalImage} onSelectionComplete={setSelectionMask} />

            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-[100]">
              <div className="bg-white/80 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-zinc-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] flex flex-col gap-5">
                
                {/* Reference & Presets Row */}
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                  {/* Reference Image Slot */}
                  <div className="flex-shrink-0">
                    {referenceImage ? (
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-zinc-900 shadow-lg group">
                        <img src={referenceImage} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setReferenceImage(null)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => referenceInputRef.current?.click()}
                        className="w-16 h-16 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-all active:scale-95"
                      >
                        <ImagePlus size={20} />
                        <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Ref</span>
                        <input type="file" ref={referenceInputRef} onChange={handleReferenceUpload} className="hidden" accept="image/*" />
                      </button>
                    )}
                  </div>

                  <div className="h-10 w-[1px] bg-zinc-100 mx-1 flex-shrink-0" />

                  {/* Presets Bar */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {PRESETS.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => { setPrompt(p.prompt); handleProcess(p.prompt); }}
                        className="whitespace-nowrap px-4 py-2 bg-zinc-50 hover:bg-zinc-900 hover:text-white border border-zinc-100 rounded-xl text-xs font-bold transition-all active:scale-95"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="text" 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    placeholder={referenceImage ? "Describe how to use the reference..." : "Describe the change..."} 
                    className="flex-1 bg-zinc-50 rounded-2xl px-6 py-4 font-bold text-lg focus:outline-none placeholder:text-zinc-300" 
                    onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
                  />
                  <button 
                    onClick={() => handleProcess()} 
                    disabled={!prompt.trim() && !referenceImage}
                    className="px-10 py-4 bg-zinc-900 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 disabled:opacity-20 transition-all hover:bg-black active:scale-95 group"
                  >
                    <Sparkles size={18} className="group-hover:animate-pulse" />
                    Transform
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === EditorMode.PROCESSING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-10">
            <div className="relative w-36 h-36 rounded-full border-[8px] border-zinc-50 border-t-zinc-900 animate-spin" />
            <div className="text-center">
              <h2 className="text-4xl font-black tracking-tight mb-2">Creating...</h2>
              <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px]">Processing Multi-Modal Inputs</p>
            </div>
          </div>
        )}

        {mode === EditorMode.RESULT && resultImage && (
          <div className="w-full max-w-5xl flex flex-col items-center gap-10 animate-in zoom-in-95 duration-700 pb-20">
            <div className="relative rounded-[3rem] overflow-hidden border-8 border-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] bg-white group select-none">
              <img src={isComparing ? originalImage! : resultImage} alt="Result" className="w-full h-auto" />
              
              <div className="absolute top-8 right-8 flex flex-col gap-3">
                <button 
                  onMouseDown={() => setIsComparing(true)}
                  onMouseUp={() => setIsComparing(false)}
                  onMouseLeave={() => setIsComparing(false)}
                  onTouchStart={() => setIsComparing(true)}
                  onTouchEnd={() => setIsComparing(false)}
                  className="p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-zinc-900 active:scale-90 transition-all border border-zinc-100"
                  title="Hold to see original"
                >
                  <Eye size={20} />
                </button>
                <button 
                  onClick={() => {const l=document.createElement('a');l.href=resultImage;l.download='magic-edit.png';l.click();}} 
                  className="p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all border border-zinc-100"
                >
                  <Download size={20} />
                </button>
              </div>
              
              {isComparing && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                  <span className="px-6 py-2 bg-black/60 backdrop-blur rounded-full text-white font-black text-xs uppercase tracking-widest">Original Image</span>
                </div>
              )}
            </div>

            <div className="w-full max-w-3xl bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl flex flex-col items-center gap-8">
              <div className="text-center">
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Transformation</span>
                <p className="text-2xl font-black italic mt-2 text-zinc-800 leading-tight">"{prompt || 'Visual Reference Fusion'}"</p>
              </div>
              
              <div className="w-full grid md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setMode(EditorMode.BRUSH)} 
                  className="py-5 bg-zinc-50 hover:bg-zinc-100 rounded-[1.5rem] font-black flex items-center justify-center gap-3 transition-colors"
                >
                  <ArrowLeft size={18} />
                  Try Again
                </button>
                <button 
                  onClick={() => {setOriginalImage(resultImage); setMode(EditorMode.BRUSH); setPrompt(''); setSelectionMask(null); setReferenceImage(null);}} 
                  className="py-5 bg-zinc-900 hover:bg-black text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                >
                  Edit Result
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-6 left-6 z-[200] bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm animate-in slide-in-from-left">
          {error}
        </div>
      )}

      {/* Sidebar Gallery */}
      {isSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[110]" onClick={() => setIsSidebarOpen(false)} />
          <aside className="w-[400px] max-w-full bg-white fixed inset-y-0 right-0 z-[120] shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
                <History className="text-zinc-400" />
                Your Magic
              </h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-zinc-50 rounded-xl transition-colors"><ChevronRight size={28}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center text-zinc-200 mb-6">
                    <ImageIcon size={32} />
                  </div>
                  <p className="text-zinc-400 font-bold leading-relaxed">No history yet.<br/>Upload a photo to begin!</p>
                </div>
              ) : (
                history.map(item => (
                  <div 
                    key={item.id} 
                    className="group relative cursor-pointer space-y-3" 
                    onClick={() => {setOriginalImage(item.originalImage); setResultImage(item.editedImage); setPrompt(item.prompt); setMode(EditorMode.RESULT); setIsSidebarOpen(false);}}
                  >
                    <div className="aspect-[4/5] rounded-[2rem] overflow-hidden border border-zinc-100 shadow-sm group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1">
                      <img src={item.editedImage} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-bold italic text-zinc-800 line-clamp-1">"{item.prompt}"</p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </>
      )}

      <footer className="h-14 flex items-center justify-center border-t border-zinc-100 bg-white">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300">
            Multi-Modal AI Engine &bull; Magic Studio
          </p>
      </footer>
    </div>
  );
};
export default App;
