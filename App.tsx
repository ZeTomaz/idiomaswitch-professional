
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  LanguageVariant, 
  WritingStyle, 
  OperationMode, 
  OperationType, 
  ProcessingResult,
  UILanguage,
  ReferenceCitationStyle
} from './types';
import { translations } from './locales';
import { processTextStream } from './services/geminiService';
import { ConfidenceBadge } from './components/ConfidenceBadge';
import { AuditPanel } from './components/AuditPanel';

const App: React.FC = () => {
  const [uiLang, setUiLang] = useState<UILanguage>('PT');
  const t = translations[uiLang];

  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [sourceVariant, setSourceVariant] = useState(LanguageVariant.PT_EU_AO45);
  const [targetVariant, setTargetVariant] = useState(LanguageVariant.PT_EU_AO45);
  const [writingStyle, setWritingStyle] = useState(WritingStyle.REPORTER);
  const [mode, setMode] = useState(OperationMode.PROFESSIONAL);
  const [operations, setOperations] = useState<OperationType[]>([OperationType.REWRITE]);
  const [citStyle, setCitStyle] = useState<ReferenceCitationStyle>(ReferenceCitationStyle.NAME_AND_LINK);
  
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPausedRef = useRef<boolean>(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const toggleOperation = (op: OperationType) => {
    setOperations(prev => 
      prev.includes(op) 
        ? prev.filter(o => o !== op) 
        : [...prev, op]
    );
  };

  const handleFullReset = () => {
    setInputText('');
    setInputUrl('');
    setImages([]);
    setResult(null);
    setStreamingText('');
    setError(null);
    setLoading(false);
    setIsPaused(false);
    abortControllerRef.current = true;
  };

  const handleStop = () => {
    abortControllerRef.current = true;
    setLoading(false);
  };

  const handleProcess = async () => {
    if (!inputText.trim() && !inputUrl.trim() && images.length === 0) return;
    if (operations.length === 0) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setStreamingText('');
    abortControllerRef.current = false;
    setIsPaused(false);

    let fullJsonString = "";

    try {
      const stream = processTextStream(
        inputText,
        inputUrl,
        images,
        sourceVariant,
        targetVariant,
        writingStyle,
        mode,
        operations,
        citStyle
      );

      for await (const chunk of stream) {
        if (abortControllerRef.current) break;
        
        while (isPausedRef.current) {
          await new Promise(r => setTimeout(r, 200));
          if (abortControllerRef.current) break;
        }

        const chunkText = chunk.text || '';
        fullJsonString += chunkText;

        // Try to peek into the JSON for partial text updates
        try {
          const partial = JSON.parse(fullJsonString + '"}');
          if (partial.text) setStreamingText(partial.text);
        } catch {
          // Just keep accumulating
        }
      }

      if (!abortControllerRef.current) {
        const finalData = JSON.parse(fullJsonString) as ProcessingResult;
        if (finalData.error) {
          setError(finalData.error);
        } else {
          setResult(finalData);
        }
      }
    } catch (err: any) {
      if (!abortControllerRef.current) {
        setError(err.message || 'An unexpected error occurred during processing.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = useCallback(() => {
    const textToCopy = result?.text || streamingText;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      alert(uiLang === 'PT' ? 'Texto copiado!' : 'Text copied!');
    }
  }, [result, streamingText, uiLang]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(Array.from(files));
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setImages(prev => [...prev, e.target?.result as string]);
        reader.readAsDataURL(file);
      } else if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => setInputText(prev => prev + (prev ? '\n\n' : '') + (e.target?.result as string));
        reader.readAsText(file);
      }
    });
  };

  const insertSources = (sources: string[]) => {
    if (result) {
      const label = uiLang === 'PT' ? 'Referências' : 'References';
      const sourceList = `\n\n---\n${label}:\n${sources.join('\n')}`;
      setResult({ ...result, text: result.text + sourceList });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); processFiles(Array.from(e.dataTransfer.files)); }}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white w-8 h-8 rounded flex items-center justify-center font-bold">IS</div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">{t.title}</h1>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setUiLang(prev => prev === 'PT' ? 'EN' : 'PT')}
               className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-all uppercase tracking-widest"
             >
               {uiLang === 'PT' ? 'English UI' : 'Português UI'}
             </button>
             <span className="hidden sm:inline text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase tracking-wider">
               {t.level5}
             </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <div className="border-b border-gray-100 pb-2 mb-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">{t.configTitle}</h2>
                <p className="text-[10px] text-gray-500 mt-1 leading-tight">{t.configSubtitle}</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.sourceVariant}</label>
                <select 
                  value={sourceVariant}
                  onChange={(e) => setSourceVariant(e.target.value as LanguageVariant)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.values(LanguageVariant).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.targetVariant}</label>
                <select 
                  value={targetVariant}
                  onChange={(e) => setTargetVariant(e.target.value as LanguageVariant)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.values(LanguageVariant).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700">{t.operationType}</label>
                  <span className="text-[9px] text-blue-500 font-bold uppercase">{t.operationTypeHint}</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {Object.values(OperationType).map(v => (
                    <button
                      key={v}
                      onClick={() => toggleOperation(v)}
                      className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all border flex items-center justify-between ${
                        operations.includes(v) ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{(t as any)[`op_${v}`]}</span>
                      {operations.includes(v) && <span className="text-[10px]">SELECTO ✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {operations.includes(OperationType.ENRICH) && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                   <label className="block text-xs font-bold text-gray-700 mb-1">{t.refCitationStyle}</label>
                   <select 
                    value={citStyle}
                    onChange={(e) => setCitStyle(e.target.value as ReferenceCitationStyle)}
                    className="w-full bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {Object.values(ReferenceCitationStyle).map(v => <option key={v} value={v}>{(t as any)[`cit_${v}`]}</option>)}
                  </select>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.writingStyle}</label>
                <select 
                  value={writingStyle}
                  onChange={(e) => setWritingStyle(e.target.value as WritingStyle)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                >
                  {Object.values(WritingStyle).map(v => <option key={v} value={v}>{(t as any)[`style_${v}`]}</option>)}
                </select>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 mb-2">{t.operationMode}</label>
                <div className="space-y-2">
                  {Object.values(OperationMode).map(v => (
                    <button
                      key={v}
                      onClick={() => setMode(v)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                        mode === v ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider">{(t as any)[`mode_${v}`]}</div>
                      <div className={`text-[9px] mt-1 ${mode === v ? 'text-slate-400' : 'text-gray-400'}`}>
                        {(t as any)[`mode_${v}_DESC`]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button 
                  onClick={handleFullReset}
                  className="w-full py-2 border border-red-200 text-red-500 text-[10px] font-bold uppercase rounded-lg hover:bg-red-50 transition-colors tracking-widest"
                >
                  {t.reset}
                </button>
              </div>
            </section>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Files & Media</h2>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="text-3xl mb-2">📁</div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">{t.uploadHint}</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  multiple 
                  className="hidden" 
                  accept=".txt,.png,.jpg,.jpeg"
                  onChange={handleFileUpload} 
                />
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {images.map((img, i) => (
                    <div key={i} className="aspect-square rounded border border-gray-100 overflow-hidden relative group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setImages(images.filter((_, idx) => idx !== i)); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.linkPlaceholder}</span>
                <button 
                  onClick={() => setInputUrl('')}
                  className="text-[10px] font-bold text-red-500 uppercase hover:underline"
                >
                  {t.fieldReset}
                </button>
              </div>
              <input 
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.com/article..."
                className="w-full px-6 py-4 border-none focus:ring-0 text-sm font-mono text-blue-600 bg-white"
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.inputHeader}</span>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t.characters}: {inputText.length}</span>
                  <button 
                    onClick={() => setInputText('')}
                    className="text-[10px] font-bold text-red-500 uppercase hover:underline"
                  >
                    {t.fieldReset}
                  </button>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="w-full h-64 p-6 text-gray-800 focus:outline-none resize-none leading-relaxed text-sm"
              />
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="flex gap-2">
                  {loading && (
                    <>
                      <button
                        onClick={() => setIsPaused(!isPaused)}
                        className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase border transition-all ${
                          isPaused ? 'bg-green-500 border-green-500 text-white' : 'bg-yellow-50 border-yellow-200 text-yellow-600'
                        }`}
                      >
                        {isPaused ? t.resume : t.pause}
                      </button>
                      <button
                        onClick={handleStop}
                        className="px-4 py-2 rounded-lg font-bold text-[10px] uppercase border bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                      >
                        {t.stop}
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={handleProcess}
                  disabled={loading || (operations.length === 0) || (!inputText.trim() && !inputUrl.trim() && images.length === 0)}
                  className={`px-8 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all ${
                    loading ? 'bg-blue-400 cursor-not-allowed scale-95' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.processing}
                    </div>
                  ) : (
                    t.execute
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                <span className="text-xl">⚠️</span>
                <div>
                  <h3 className="text-red-800 font-bold text-sm">{t.systemRefusal}</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {(result || streamingText) && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden mb-6 ring-2 ring-blue-500/10">
                  <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.finalOutput}</span>
                      {result && <ConfidenceBadge level={result.confidence} />}
                      
                      {/* AI Trace Visibility - More Prominent */}
                      {result && (
                        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 ml-2">
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-tighter">{t.aiTrace}</span>
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${result.auditTrace.aiTracePercentage > 50 ? 'bg-red-500' : 'bg-green-500'}`} 
                              style={{ width: `${result.auditTrace.aiTracePercentage}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-black font-mono ${result.auditTrace.aiTracePercentage > 50 ? 'text-red-600' : 'text-green-600'}`}>
                            {result.auditTrace.aiTracePercentage}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleCopy}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 px-4 py-1.5 rounded-lg bg-blue-50 border border-blue-100 transition-all"
                      >
                        {t.copy}
                      </button>
                      <button 
                        onClick={() => { setResult(null); setStreamingText(''); }}
                        className="text-xs font-bold text-gray-500 hover:text-gray-700 px-4 py-1.5 rounded-lg bg-gray-50 border border-gray-100 transition-all"
                      >
                        {t.clear}
                      </button>
                    </div>
                  </div>
                  
                  {/* Dynamic Output Box */}
                  <div className={`p-8 min-h-[12rem] text-lg text-gray-900 font-serif leading-relaxed whitespace-pre-wrap transition-all duration-300 ${loading ? 'opacity-70 italic' : 'italic'} border-l-4 border-blue-500 ml-6 mr-6 my-6 bg-slate-50/50 rounded-r-lg shadow-inner`}>
                    {result?.text || streamingText || (loading && "Linguagem em fluxo dinâmico...")}
                    {loading && <span className="inline-block w-2 h-5 ml-1 bg-blue-500 animate-pulse align-middle"></span>}
                  </div>
                </div>

                {mode === OperationMode.EXPERT && result && (
                  <AuditPanel 
                    trace={result.auditTrace} 
                    lang={uiLang} 
                    onInsertSources={insertSources}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs gap-4">
          <p className="font-medium">&copy; 2024 IdiomaSwitch — Professional Language Governance</p>
          <div className="flex gap-6 uppercase tracking-widest font-black">
            <span className="text-gray-300">European Portuguese AO45/AO90</span>
            <span className="text-gray-300">English UK/US</span>
            <span className="text-red-500/80 bg-red-50 px-2 py-0.5 rounded">{t.brForbidden}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
