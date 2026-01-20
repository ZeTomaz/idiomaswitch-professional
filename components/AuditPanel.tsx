
import React from 'react';
import { AuditTrace, UILanguage } from '../types';
import { translations } from '../locales';

interface AuditPanelProps {
  trace: AuditTrace;
  lang: UILanguage;
  onInsertSources: (sources: string[]) => void;
}

export const AuditPanel: React.FC<AuditPanelProps> = ({ trace, lang, onInsertSources }) => {
  const t = translations[lang];

  const handleCopySources = () => {
    if (trace.references && trace.references.length > 0) {
      navigator.clipboard.writeText(trace.references.join('\n'));
      alert('Sources copied!');
    }
  };

  return (
    <div className="bg-slate-900 text-slate-300 p-6 rounded-xl shadow-inner mt-6 overflow-hidden border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{t.expertPanel}</h3>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[10px] text-slate-500 uppercase">{t.aiTrace}</span>
           <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${trace.aiTracePercentage > 50 ? 'bg-red-500' : 'bg-green-500'}`} 
                style={{ width: `${trace.aiTracePercentage}%` }}
              ></div>
           </div>
           <span className="text-xs font-mono font-bold">{trace.aiTracePercentage}%</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <TraceItem label="Intent Confidence" value={trace.intentConfidence} />
        <TraceItem label="Constraint Satisfaction" value={trace.constraintSatisfaction} />
        <TraceItem label="Humanisation Applied" value={trace.humanisationApplied} />
        <TraceItem label="AI-Trace Risk" value={trace.aiTraceRisk} />
        <TraceItem label="Variant Compliance" value={trace.variantCompliance} />
      </div>

      {trace.references && trace.references.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">{t.references}</h4>
            <div className="flex gap-2">
              <button 
                onClick={handleCopySources}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 transition-colors uppercase font-bold"
              >
                {t.copySources}
              </button>
              <button 
                onClick={() => onInsertSources(trace.references)}
                className="text-[10px] bg-blue-900 hover:bg-blue-800 text-blue-100 px-2 py-1 rounded border border-blue-800 transition-colors uppercase font-bold"
              >
                {t.insertSources}
              </button>
            </div>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {trace.references.map((ref, i) => (
              <li key={i} className="text-slate-400 hover:text-white transition-colors">
                <a href={ref} target="_blank" rel="noopener noreferrer" className="underline decoration-slate-600 underline-offset-4">
                  {ref}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const TraceItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col border-b border-slate-800 pb-2">
    <span className="text-[10px] text-slate-500 uppercase">{label}</span>
    <span className="font-mono text-slate-200">{value}</span>
  </div>
);
