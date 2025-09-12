import React, { useMemo, useRef, useState } from 'react';
import { API_URL } from '../utils/constants';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const sectionRegex = /^(#{2,3})\s+(.+)$/m;

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function downloadFile(filename, content, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const AIResponse = ({ content = '', title = 'AI Result' }) => {
  const [expanded, setExpanded] = useState(true);
  const [fontScale, setFontScale] = useState(1);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState({});
  const [translateError, setTranslateError] = useState('');
  const containerRef = useRef(null);

  const headings = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const items = [];
    lines.forEach((line, idx) => {
      const match = line.match(sectionRegex);
      if (match) {
        const level = match[1].length; // 2 for h2, 3 for h3
        const text = match[2].trim();
        const id = `${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${idx}`;
        items.push({ id, level, text });
      }
    });
    return items;
  }, [content]);

  // No HTML injection to avoid raw tag rendering; IDs will be added in heading components

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(language === 'en' ? content : (translations[language] || content));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };

  const handleDownloadMd = () => {
    const text = language === 'en' ? content : (translations[language] || content);
    downloadFile(`${title.replace(/\s+/g, '_').toLowerCase()}.md`, text, 'text/markdown;charset=utf-8');
  };

  const handleDownloadTxt = () => {
    const text = language === 'en' ? content : (translations[language] || content);
    downloadFile(`${title.replace(/\s+/g, '_').toLowerCase()}.txt`, text);
  };

  const handlePrint = () => {
    if (!containerRef.current) return;
    const printContents = containerRef.current.innerHTML;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>${title}</title><meta charset="utf-8"/><style>body{font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial;line-height:1.6;padding:24px;}</style></head><body>${printContents}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const currentText = language === 'en' ? content : (translations[language] || content);

  const translate = async (target) => {
    if (!content || target === 'en') {
      setLanguage('en');
      setIsLangOpen(false);
      return;
    }
    if (translations[target]) {
      setLanguage(target);
      setIsLangOpen(false);
      return;
    }
    try {
      setTranslateError('');
      setIsTranslating(true);
      const base = API_URL || '';
      const res = await fetch(`${base}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'auto', target, text: content })
      });
      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      const translated = data?.translation || '';
      if (!translated) throw new Error('Empty translation');
      setTranslations((prev) => ({ ...prev, [target]: translated }));
      setLanguage(target);
    } catch (e) {
      setTranslateError('Unable to translate right now. Please try again later.');
    } finally {
      setIsTranslating(false);
      setIsLangOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto rounded-xl border border-gray-200 shadow-sm bg-white">
      <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-primary/10 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsLangOpen((v) => !v)}
              className="px-3 py-1.5 text-xs rounded-md border border-transparent bg-primary text-white hover:bg-primary/90 flex items-center gap-1 min-w-[132px] justify-center shadow-sm"
              title="Translate"
            >
              {isTranslating ? (
                <span className="inline-flex items-center gap-1">
                  <svg className="animate-spin h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                  Translating
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a1 1 0 000 2h3.02a7.07 7.07 0 01-.493 1.2A11.02 11.02 0 014.2 9.2a1 1 0 101.6 1.2c.37-.493.704-1.003 1.003-1.525A12.9 12.9 0 018.2 7.2c.163.34.342.676.538 1.006a1 1 0 101.724-1.012A11.7 11.7 0 019.8 5H12a1 1 0 100-2H4z"/><path d="M12.707 11.293a1 1 0 00-1.414 1.414l4.586 4.586a1 1 0 001.414-1.414l-.586-.586h1.293a1 1 0 100-2H15.12l-1.414-1.414z"/></svg>
                  {language === 'en' ? 'English' : language === 'hi' ? 'Hindi' : 'Gujarati'}
                </span>
              )}
              <svg className="h-3.5 w-3.5 ml-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.19l3.71-3.96a.75.75 0 111.08 1.04l-4.25 4.53a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/></svg>
            </button>
            {isLangOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-20 overflow-hidden">
                <button onClick={() => translate('en')} className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/5 ${language==='en'?'bg-primary/5 text-primary':''}`}>English (default)</button>
                <div className="h-px bg-gray-100"/>
                <button onClick={() => translate('hi')} className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/5 ${language==='hi'?'bg-primary/5 text-primary':''}`}>हिन्दी (Hindi)</button>
                <button onClick={() => translate('gu')} className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/5 ${language==='gu'?'bg-primary/5 text-primary':''}`}>ગુજરાતી (Gujarati)</button>
              </div>
            )}
          </div>
          <button onClick={() => setFontScale((s) => Math.max(0.85, s - 0.05))} className="px-2.5 py-1.5 text-xs rounded-md border border-primary text-primary hover:bg-primary/5" title="Smaller text">A-</button>
          <button onClick={() => setFontScale((s) => Math.min(1.4, s + 0.05))} className="px-2.5 py-1.5 text-xs rounded-md border border-primary text-primary hover:bg-primary/5" title="Larger text">A+</button>
          <button onClick={handleCopy} className="px-2.5 py-1.5 text-xs rounded-md border border-primary text-primary hover:bg-primary/5 flex items-center gap-1" title="Copy markdown">
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 012-2h5a1 1 0 010 2H6v10a2 2 0 01-2 2H2a1 1 0 110-2h2V4z"/><path d="M8 6a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2h-6a2 2 0 01-2-2V6z"/></svg>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={handleDownloadMd} className="px-2.5 py-1.5 text-xs rounded-md border border-primary text-primary hover:bg-primary/5" title="Download .md">.md</button>
          <button onClick={handleDownloadTxt} className="px-2.5 py-1.5 text-xs rounded-md border border-primary text-primary hover:bg-primary/5" title="Download .txt">.txt</button>
          <button onClick={handlePrint} className="px-2.5 py-1.5 text-xs rounded-md border border-primary text-primary hover:bg-primary/5 flex items-center gap-1" title="Print">
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a2 2 0 00-2 2v2h12V4a2 2 0 00-2-2H6z"/><path d="M4 8a2 2 0 00-2 2v3h3v3h10v-3h3v-3a2 2 0 00-2-2H4z"/></svg>
            Print
          </button>
          <button onClick={() => setExpanded((e) => !e)} className="px-2.5 py-1.5 text-xs rounded-md border border-primary text-primary hover:bg-primary/5" title={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      

      {expanded && (
        <div ref={containerRef} className="px-4 md:px-6 py-6" style={{ fontSize: `${fontScale}rem` }}>
          {translateError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {translateError}
            </div>
          )}
          <div className={`prose max-w-3xl mx-auto ${isTranslating ? 'opacity-60' : ''}`}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>{children}</code>
                  );
                },
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 hover:underline" />
                ),
                ul: ({ node, ...props }) => (<ul className="list-none pl-0 space-y-2 my-2" {...props} />),
                ol: ({ node, ...props }) => (<ol className="list-decimal pl-6 space-y-2 my-2" {...props} />),
                h2: ({ node, children, ...props }) => {
                  const text = Array.isArray(children) ? children.map(String).join('') : String(children);
                  const id = `${slugify(text)}-h2`;
                  return <h2 id={id} className="text-2xl font-bold mt-8 mb-4 text-gray-900 tracking-tight border-b border-primary/10 pb-2" {...props}>{children}</h2>;
                },
                h3: ({ node, children, ...props }) => {
                  const text = Array.isArray(children) ? children.map(String).join('') : String(children);
                  const id = `${slugify(text)}-h3`;
                  return <h3 id={id} className="text-xl font-semibold mt-6 mb-3 text-gray-900" {...props}>{children}</h3>;
                },
                p: ({ node, ...props }) => (<p className="mb-4 leading-relaxed md:leading-7 text-gray-800 text-justify" {...props} />),
                strong: ({ node, ...props }) => (<strong className="font-semibold text-gray-900" {...props} />),
                em: ({ node, ...props }) => (<em className="italic" {...props} />),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-green-300 bg-green-50/40 px-4 py-2 my-4 italic text-gray-700" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full text-sm border border-gray-200" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => (<thead className="bg-gray-50 text-gray-700" {...props} />),
                th: ({ node, ...props }) => (<th className="px-3 py-2 border-b border-gray-200 text-left font-semibold" {...props} />),
                td: ({ node, ...props }) => (<td className="px-3 py-2 border-b border-gray-100 align-top" {...props} />),
              }}
            >
              {currentText}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIResponse;


