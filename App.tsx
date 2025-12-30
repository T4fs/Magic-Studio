
import React, { useState, useRef } from 'react';
import { 
  Upload, Sparkles, Trash2, History, Download, ChevronRight, Image as ImageIcon,
  Brush, RefreshCw, ArrowRight, Plus, ArrowLeft 
} from 'lucide-react';
import DrawingCanvas from './components/DrawingCanvas';
import { processImageEditing } from './services/geminiService';
import { EditorMode, HistoryItem } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<EditorMode>(EditorMode.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOriginalImage(ev.target?.result as string);
        setMode(EditorMode.BRUSH);
        setResultImage(null);
        setPrompt('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!originalImage || !prompt.trim()) return;
    setMode(EditorMode.PROCESSING);
    try {
      const edited = await processImageEditing(originalImage, prompt);
      setResultImage(edited);
      setMode(EditorMode.RESULT);
      setHistory(prev => [{
        id: crypto.randomUUID(), originalImage, editedImage: edited,
        prompt, timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message);
      setMode(EditorMode.BRUSH);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9FB] text-zinc-900">
      <nav className="h-20 flex items-center justify-between px-8 bg-white/70 backdrop-blur-xl border-b border-zinc-100 sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl cursor-pointer" onClick={() => setMode(EditorMode.IDLE)}>
            <Sparkles size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">MagicStudio</h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Nano Banana AI</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white hover:bg-zinc-50 rounded-2xl border border-zinc-100 shadow-sm"><History size={20} /></button>
          {originalImage && <button onClick={() => setMode(EditorMode.IDLE)} className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-2xl font-bold text-sm">Reset</button>}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-6 lg:p-12 flex flex-col items-center">
        {mode === EditorMode.IDLE && (
          <div className="w-full max-w-2xl flex flex-col items-center justify-center min-h-[60vh]">
            <div className="group relative w-full p-24 border-2 border-dashed border-zinc-200 rounded-[3.5rem] bg-white hover:border-zinc-400 transition-all cursor-pointer shadow-sm hover:shadow-2xl" onClick={() => fileInputRef.current?.click()}>
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-xl rotate-12"><Plus size={32} strokeWidth={3} /></div>
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-zinc-50 rounded-[2rem] flex items-center justify-center text-zinc-300 group-hover:scale-110 transition-transform"><ImageIcon size={48} /></div>
                <h2 className="text-3xl font-black tracking-tight">Upload Photo</h2>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>
          </div>
        )}

        {mode === EditorMode.BRUSH && originalImage && (
          <div className="w-full max-w-4xl flex flex-col gap-10 animate-in fade-in duration-700 pb-24">
            <DrawingCanvas imageUrl={originalImage} brushSize={40} />
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[100]">
              <div className="bg-white/90 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-zinc-100 shadow-2xl flex flex-col md:flex-row gap-4">
                <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the magic..." className="flex-1 bg-zinc-50 rounded-2xl px-6 py-4 font-bold text-lg focus:outline-none" />
                <button onClick={handleProcess} className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black shadow-xl flex items-center gap-3"><Sparkles size={20}/>Transform</button>
              </div>
            </div>
          </div>
        )}

        {mode === EditorMode.PROCESSING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-10">
            <div className="relative w-32 h-32 rounded-full border-[6px] border-zinc-100 border-t-zinc-900 animate-spin" />
            <div className="text-center">
              <h2 className="text-4xl font-black tracking-tight mb-2">Reimagining...</h2>
              <p className="text-zinc-500 font-medium">The AI is processing your request</p>
            </div>
          </div>
        )}

        {mode === EditorMode.RESULT && resultImage && (
          <div className="w-full max-w-5xl flex flex-col items-center gap-12 animate-in zoom-in-95 duration-700">
            <div className="relative rounded-[3.5rem] overflow-hidden border-8 border-white shadow-2xl group">
              <img src={resultImage} alt="Result" className="w-full h-auto" />
              <button onClick={() => {const l=document.createElement('a');l.href=resultImage;l.download='edit.png';l.click();}} className="absolute top-8 right-8 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"><Download size={24}/></button>
            </div>
            <div className="w-full max-w-3xl bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl text-center space-y-8">
              <p className="text-2xl font-bold italic">"{prompt}"</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setMode(EditorMode.BRUSH)} className="py-5 bg-zinc-50 rounded-[1.5rem] font-black flex items-center justify-center gap-3"><ArrowLeft size={20}/>Back</button>
                <button onClick={() => {setOriginalImage(resultImage); setMode(EditorMode.BRUSH); setPrompt('');}} className="py-5 bg-zinc-900 text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3">Refine further<ArrowRight size={20}/></button>
              </div>
            </div>
          </div>
        )}
      </main>

      {isSidebarOpen && (
        <aside className="w-[380px] bg-white fixed inset-y-0 right-0 z-[110] shadow-2xl border-l border-zinc-100 flex flex-col animate-in slide-in-from-right">
          <div className="p-8 border-b flex items-center justify-between">
            <h2 className="text-xl font-black">History</h2>
            <button onClick={() => setIsSidebarOpen(false)}><ChevronRight size={28}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {history.map(item => (
              <div key={item.id} className="rounded-[2rem] overflow-hidden border group cursor-pointer" onClick={() => {setOriginalImage(item.originalImage); setResultImage(item.editedImage); setPrompt(item.prompt); setMode(EditorMode.RESULT); setIsSidebarOpen(false);}}>
                <img src={item.editedImage} className="w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="p-4"><p className="text-sm font-bold italic line-clamp-2">"{item.prompt}"</p></div>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};
export default App;
