
import React, { useState, useRef } from 'react';
import { 
  Sparkles, History, Download, ChevronRight, Image as ImageIcon,
  Plus, ArrowLeft, Eye, Wand2, ImagePlus, X,
  RotateCcw, CheckCircle2, Upload, Maximize, MousePointer2, Settings,
  LogOut, Info, Heart
} from 'lucide-react';
import DrawingCanvas from './components/DrawingCanvas';
import { processImageEditing } from './services/geminiService';
import { EditorMode, HistoryItem } from './types';

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

  const handleProcess = async () => {
    if (!originalImage || (!prompt.trim() && !referenceImage)) return;
    setMode(EditorMode.PROCESSING);
    setError(null);
    try {
      const edited = await processImageEditing(originalImage, prompt, selectionMask, referenceImage);
      setResultImage(edited);
      setMode(EditorMode.RESULT);
      setHistory(prev => [{
        id: crypto.randomUUID(), originalImage, editedImage: edited,
        prompt: prompt || "Pink Magic Transformation", timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || "Magic failed. Try again!");
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
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-800 font-sans selection:bg-[#ff4d8d] selection:text-white">
      {/* Header */}
      <nav className="h-16 flex items-center justify-between px-6 md:px-12 bg-white/40 backdrop-blur-xl border-b border-pink-50 sticky top-0 z-[100]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
            <div className="w-9 h-9 bg-[#ff4d8d] rounded-xl flex items-center justify-center text-white shadow-[0_4px_12px_rgba(255,77,141,0.3)] group-hover:scale-110 transition-transform duration-300">
              <Sparkles size={18} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-zinc-900">Magic<span className="text-[#ff4d8d]">Studio</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button className="text-sm font-bold text-zinc-400 hover:text-[#ff4d8d] transition-colors">Features</button>
            <button className="text-sm font-bold text-zinc-400 hover:text-[#ff4d8d] transition-colors">Showcase</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
            Free Forever
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 text-pink-300 hover:text-[#ff4d8d] hover:bg-white/50 rounded-xl transition-all">
            <History size={20} />
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        {mode === EditorMode.IDLE && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Left: Content */}
            <div className="flex-1 flex flex-col justify-center px-6 md:px-24 py-12 space-y-8 animate-in fade-in slide-in-from-left duration-700 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-md text-[#ff4d8d] rounded-full text-xs font-black uppercase tracking-widest shadow-sm border border-pink-50">
                <Heart size={12} fill="currentColor" /> 100% Free AI Editor
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 leading-[1.05]">
                Magically edit <br/>your world in <span className="text-[#ff4d8d] relative">Pink.<span className="absolute -bottom-2 left-0 w-full h-2 bg-pink-100/60 -z-10"></span></span>
              </h1>
              <p className="text-lg text-zinc-400 max-w-lg leading-relaxed font-medium">
                Our advanced AI lets you isolate any subject and transform it instantly. No subscriptions, no hidden fees. Just pure magic for everyone.
              </p>
              <div className="flex items-center gap-6">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-pink-100 shadow-sm" />
                    ))}
                 </div>
                 <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Joined by 10k+ Creators</p>
              </div>
            </div>

            {/* Right: Upload Section */}
            <div className="flex-1 bg-white/20 backdrop-blur-sm flex items-center justify-center p-6 md:p-12 lg:rounded-l-[5rem] relative overflow-hidden border-l border-pink-50/20">
              <div className="absolute top-20 right-20 w-32 h-32 bg-pink-200/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 left-20 w-48 h-48 bg-pink-300/10 rounded-full blur-3xl animate-pulse delay-700" />
              
              <div className="w-full max-w-md bg-white/80 backdrop-blur-3xl p-10 rounded-[3rem] shadow-[0_32px_80px_rgba(255,77,141,0.08)] border border-white text-center relative z-10 animate-in zoom-in duration-1000">
                <div 
                  className="group relative w-full aspect-square border-2 border-dashed border-pink-100 rounded-[2.5rem] bg-pink-50/10 hover:border-[#ff4d8d] hover:bg-pink-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-6" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Upload size={32} className="text-[#ff4d8d]" />
                  </div>
                  <div>
                    <button className="px-10 py-4 bg-[#ff4d8d] text-white rounded-2xl font-black text-lg shadow-[0_10px_25px_rgba(255,77,141,0.4)] hover:bg-[#ff3377] hover:-translate-y-1 transition-all active:scale-95 mb-3">
                      Upload Photo
                    </button>
                    <p className="text-sm font-bold text-pink-300">Free, no account needed</p>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                </div>
                <div className="mt-10">
                  <p className="text-[10px] font-black text-pink-200 uppercase tracking-[0.2em] mb-4">Try a Sample</p>
                  <div className="flex justify-center gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-14 h-14 bg-white/40 backdrop-blur-md rounded-2xl cursor-pointer hover:scale-110 hover:shadow-md transition-all border border-pink-100" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === EditorMode.BRUSH && originalImage && (
          <div className="flex-1 bg-transparent p-4 md:p-8 flex flex-col items-center relative animate-in fade-in duration-500">
            <div className="w-full max-w-4xl bg-white p-3 rounded-[2.5rem] shadow-[0_40px_100px_rgba(255,77,141,0.1)] overflow-hidden relative border border-pink-50">
              <DrawingCanvas imageUrl={originalImage} onSelectionComplete={setSelectionMask} />
              
              {/* Floating Toolbar */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-2xl px-6 py-2.5 rounded-full shadow-2xl border border-pink-100 flex items-center gap-4 z-50">
                 <div className="flex items-center gap-4 px-2">
                    <button onClick={handleReset} className="p-2 text-pink-200 hover:text-[#ff4d8d] transition-all hover:scale-110"><RotateCcw size={20}/></button>
                    <button className="p-2 text-pink-200 hover:text-[#ff4d8d] transition-all hover:scale-110"><Settings size={20}/></button>
                 </div>
              </div>
            </div>

            {/* Prompt Area */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 animate-in slide-in-from-bottom-10 duration-700">
              <div className="bg-white/90 backdrop-blur-3xl p-5 rounded-[2.5rem] shadow-[0_32px_64px_rgba(255,77,141,0.15)] border border-pink-50 flex items-center gap-5">
                <div className="flex-shrink-0 relative group">
                  {referenceImage ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md relative ring-4 ring-pink-50">
                       <img src={referenceImage} className="w-full h-full object-cover" />
                       <button onClick={() => setReferenceImage(null)} className="absolute inset-0 bg-pink-500/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><X size={16}/></button>
                    </div>
                  ) : (
                    <button onClick={() => referenceInputRef.current?.click()} className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-[#ff4d8d] hover:bg-[#ff4d8d] hover:text-white transition-all shadow-inner">
                      <ImagePlus size={24} />
                      <input type="file" ref={referenceInputRef} onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const r = new FileReader();
                          r.onload = (ev) => setReferenceImage(ev.target?.result as string);
                          r.readAsDataURL(f);
                        }
                      }} className="hidden" accept="image/*" />
                    </button>
                  )}
                </div>
                <input 
                  type="text" 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  placeholder="What should we change? ✨" 
                  className="flex-1 bg-transparent text-lg font-bold focus:outline-none placeholder:text-pink-200 px-2 text-zinc-800"
                  onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
                />
                <button 
                  onClick={handleProcess} 
                  disabled={!prompt.trim() && !referenceImage}
                  className="px-8 py-4 bg-[#ff4d8d] text-white rounded-2xl font-black shadow-lg flex items-center gap-3 hover:bg-[#ff3377] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all group"
                >
                  <Sparkles size={20} className="group-hover:animate-pulse" />
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === EditorMode.PROCESSING && (
          <div className="flex-1 flex flex-col items-center justify-center bg-transparent gap-10 animate-in fade-in duration-500">
            <div className="w-32 h-32 relative">
              <div className="absolute inset-0 border-[6px] border-white/40 rounded-full" />
              <div className="absolute inset-0 border-[6px] border-[#ff4d8d] border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Heart size={32} className="text-[#ff4d8d] animate-bounce" fill="currentColor" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Sprinkling some magic...</h2>
              <p className="text-pink-400 font-bold uppercase tracking-widest text-xs">AI is perfecting your vision</p>
            </div>
          </div>
        )}

        {mode === EditorMode.RESULT && resultImage && (
          <div className="flex-1 flex flex-col md:flex-row bg-transparent overflow-hidden animate-in fade-in duration-700">
            {/* Main Result Display */}
            <div className="flex-[3] p-6 md:p-12 flex items-center justify-center overflow-auto relative">
              <div className="relative bg-white/60 backdrop-blur-xl p-5 rounded-[3rem] shadow-[0_50px_100px_rgba(255,77,141,0.12)] max-w-4xl w-full group border border-white">
                 {/* Checkerboard with pink tint */}
                 <div className="absolute inset-5 rounded-[2rem] opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ff4d8d 15%, transparent 15%), radial-gradient(#ff4d8d 15%, transparent 15%)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }} />
                 <img src={isComparing ? originalImage! : resultImage} alt="Result" className="w-full h-auto relative rounded-[2rem] shadow-sm transition-opacity duration-300" />
                 
                 <div className="absolute top-10 right-10 flex gap-3">
                    <button 
                      onMouseDown={() => setIsComparing(true)} onMouseUp={() => setIsComparing(false)} onMouseLeave={() => setIsComparing(false)}
                      className="p-4 bg-white/95 backdrop-blur rounded-2xl shadow-xl text-[#ff4d8d] border border-pink-50 hover:scale-110 active:scale-95 transition-all"
                    >
                      <Eye size={22} />
                    </button>
                 </div>
              </div>
            </div>

            {/* Right Side Control Panel */}
            <div className="flex-1 bg-white/80 backdrop-blur-3xl border-l border-pink-50 p-10 flex flex-col gap-10 overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-500">
              <div className="flex justify-between items-center">
                 <div className="flex bg-pink-50/50 p-1.5 rounded-2xl">
                    <button 
                      className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${!isComparing ? 'bg-white text-[#ff4d8d] shadow-sm' : 'text-pink-300'}`}
                      onClick={() => setIsComparing(false)}
                    >Magic</button>
                    <button 
                      className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${isComparing ? 'bg-white text-[#ff4d8d] shadow-sm' : 'text-pink-300'}`}
                      onClick={() => setIsComparing(true)}
                    >Original</button>
                 </div>
                 <button onClick={handleReset} className="p-3 text-pink-200 hover:text-red-400 hover:bg-red-50 rounded-2xl transition-all"><RotateCcw size={20}/></button>
              </div>

              <div className="space-y-5">
                 <button 
                  onClick={() => {const l=document.createElement('a');l.href=resultImage!;l.download='magic-edit.png';l.click();}}
                  className="w-full py-5 bg-[#ff4d8d] text-white rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(255,77,141,0.3)] hover:bg-[#ff3377] hover:-translate-y-1 transition-all group"
                 >
                   Download Art
                   <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                 </button>
                 <button 
                  onClick={() => {const l=document.createElement('a');l.href=resultImage!;l.download='magic-hd.png';l.click();}}
                  className="w-full py-5 bg-zinc-900 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-black transition-all hover:-translate-y-1 shadow-xl group"
                 >
                   Ultra HD (4K)
                   <CheckCircle2 size={16} className="text-green-400 group-hover:scale-110 transition-transform" />
                 </button>
                 <div className="text-center">
                   <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">Unlimited Free HD</span>
                 </div>
              </div>

              <div className="pt-10 border-t border-pink-50">
                 <h3 className="text-[10px] font-black text-pink-200 uppercase tracking-[0.2em] mb-5">Transformation Log</h3>
                 <div className="bg-white/60 p-5 rounded-[2rem] border border-pink-50 relative group">
                    <p className="text-sm font-bold italic text-zinc-600 leading-relaxed pr-2">"{prompt || 'Pink enhancement applied.'}"</p>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#ff4d8d] rounded-full flex items-center justify-center text-white shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
                      <Sparkles size={14} />
                    </div>
                 </div>
                 <button 
                  onClick={() => {setOriginalImage(resultImage); setMode(EditorMode.BRUSH); setPrompt(''); setSelectionMask(null);}}
                  className="w-full mt-6 py-4 border-2 border-white/60 hover:border-[#ff4d8d] hover:text-[#ff4d8d] text-pink-300 rounded-[2rem] font-black text-sm transition-all flex items-center justify-center gap-3 active:scale-95"
                 >
                   Layer another edit <Maximize size={16} />
                 </button>
              </div>

              <div className="mt-auto p-5 bg-white/40 rounded-[2.5rem] border border-pink-100 flex items-start gap-4">
                 <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-[#ff4d8d] shadow-sm flex-shrink-0">
                    <Info size={18} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-xs font-black text-zinc-900">Magic Tip</p>
                    <p className="text-[10px] font-bold text-zinc-400 leading-normal">Everything here is completely free. Use as much as you like!</p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* History Sidebar */}
      {isSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-pink-100/10 backdrop-blur-md z-[110]" onClick={() => setIsSidebarOpen(false)} />
          <aside className="w-[420px] max-w-full bg-white/90 backdrop-blur-2xl fixed inset-y-0 right-0 z-[120] shadow-[0_0_100px_rgba(255,77,141,0.1)] flex flex-col animate-in slide-in-from-right duration-500 rounded-l-[3rem] border-l border-white">
            <div className="p-10 border-b border-pink-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-zinc-900">Your Gallery</h2>
                <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest mt-1">Free Storage</p>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-3 hover:bg-pink-50 rounded-2xl transition-colors text-pink-200 hover:text-[#ff4d8d]"><X size={28}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-4">
                  <ImageIcon size={64} className="text-pink-300" strokeWidth={1} />
                  <p className="font-black uppercase tracking-widest text-xs">Awaiting your first creation</p>
                </div>
              ) : (
                history.map(item => (
                  <div key={item.id} className="group cursor-pointer space-y-4" onClick={() => {setOriginalImage(item.originalImage); setResultImage(item.editedImage); setPrompt(item.prompt); setMode(EditorMode.RESULT); setIsSidebarOpen(false);}}>
                    <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden border-2 border-white shadow-sm group-hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300">
                      <img src={item.editedImage} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-between items-center px-2">
                       <p className="text-xs font-bold italic text-zinc-500 line-clamp-1">"{item.prompt}"</p>
                       <span className="text-[10px] font-black text-pink-200 uppercase">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </>
      )}

      {error && (
        <div className="fixed bottom-8 right-8 z-[200] bg-white text-zinc-900 px-8 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-l-4 border-[#ff4d8d] font-bold text-sm flex items-center gap-4 animate-in slide-in-from-right">
          <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <Info size={18} />
          </div>
          <span className="max-w-xs">{error}</span>
          <button onClick={() => setError(null)} className="ml-4 p-2 hover:bg-zinc-50 rounded-lg text-zinc-300 hover:text-zinc-900"><X size={16}/></button>
        </div>
      )}
    </div>
  );
};

export default App;
