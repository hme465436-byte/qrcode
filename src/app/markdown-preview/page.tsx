"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileText, 
  Eye, 
  Code2, 
  Copy, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Info,
  Type,
  Layout,
  PanelLeft,
  PanelRight,
  Loader2,
  FileEdit,
  Globe,
  Terminal,
  Bold,
  Italic,
  Heading,
  Link as LinkIcon,
  List as ListIcon,
  Quote,
  Code as CodeIcon,
  Download,
  FileDown,
  Columns,
  Maximize2,
  Minimize2,
  Table as TableIcon,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const SAMPLE_MARKDOWN = `# Studio Master MD
## Premium Markup Environment

This document demonstrates the **full capabilities** of our high-performance synthesis engine.

### Essential Components
- [x] GFM Task Lists
- [x] Markdown Tables
- [x] Fenced Code Blocks
- [ ] Real-time Sync Scroll

#### Technical Matrix (Table)
| Standard | Protocol | Status |
| :--- | :--- | :--- |
| CommonMark | v0.31.2 | Active |
| GFM | enabled | Active |
| DOMPurify | v3.2 | Secure |

> "Excellence is not an act, but a habit of digital production."

---

#### Logic Sample (Code)
\`\`\`javascript
// Hardware-accelerated synthesis
function initStudio() {
  const engine = new MarkdownMaster();
  engine.render({
    sanitize: true,
    gfm: true
  });
}
\`\`\`

Enjoy professional-grade writing within **MY KIT TOOL**.
`;

type LayoutMode = 'split' | 'editor' | 'preview';

export default function MarkdownPreviewPage() {
  const { toast } = useToast();
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [html, setHtml] = useState('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');
  const [activeTab, setActiveTab] = useState('preview');
  const [isCopiedHtml, setIsCopiedHtml] = useState(false);
  const [isCopiedMd, setIsCopiedMd] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Markdown Synthesis
  useEffect(() => {
    const parseContent = async () => {
      if (typeof window !== 'undefined') {
        const rawHtml = marked.parse(markdown, { gfm: true, breaks: true }) as string;
        setHtml(DOMPurify.sanitize(rawHtml));
      }
    };
    parseContent();
  }, [markdown]);

  // Toolbar Actions
  const insertText = (before: string, after: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    setMarkdown(newText);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // Stats
  const wordCount = useMemo(() => {
    return markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  }, [markdown]);

  const charCount = markdown.length;

  // Exports
  const handleCopy = (content: string, type: 'html' | 'md') => {
    navigator.clipboard.writeText(content);
    if (type === 'html') {
      setIsCopiedHtml(true);
      setTimeout(() => setIsCopiedHtml(false), 2000);
    } else {
      setIsCopiedMd(true);
      setTimeout(() => setIsCopiedMd(false), 2000);
    }
    toast({ title: "Matrix Copied", description: `${type.toUpperCase()} content saved to clipboard.` });
  };

  const handleDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    toast({ title: "Asset Exported", description: `${filename} ready for deployment.` });
  };

  // Sync Scroll
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (layoutMode !== 'split' || !previewRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const ratio = scrollTop / (scrollHeight - clientHeight);
    previewRef.current.scrollTop = ratio * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileText className="w-3.5 h-3.5" /> Web Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Markdown <span className="text-primary italic">Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
              Professional real-time Markdown synthesis. Draft high-quality documentation with precision GFM support and sanitized HTML output.
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-secondary border border-border">
            {[
              { id: 'editor', icon: Minimize2, label: 'Edit' },
              { id: 'split', icon: Columns, label: 'Split' },
              { id: 'preview', icon: Maximize2, label: 'View' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setLayoutMode(m.id as LayoutMode)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  layoutMode === m.id ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/40 hover:text-primary"
                )}
              >
                <m.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 items-start">
        <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[700px] flex flex-col">
          {/* Studio Toolbar */}
          <div className="border-b border-border bg-secondary/50 p-2 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1">
              {[
                { icon: Bold, act: () => insertText('**', '**'), label: 'Bold' },
                { icon: Italic, act: () => insertText('*', '*'), label: 'Italic' },
                { icon: Heading, act: () => insertText('### '), label: 'Heading' },
                { icon: LinkIcon, act: () => insertText('[', '](url)'), label: 'Link' },
                { icon: ListIcon, act: () => insertText('- '), label: 'List' },
                { icon: CheckSquare, act: () => insertText('- [ ] '), label: 'Task' },
                { icon: Quote, act: () => insertText('> '), label: 'Quote' },
                { icon: CodeIcon, act: () => insertText('`', '`'), label: 'Code' },
                { icon: TableIcon, act: () => insertText('\n| Col 1 | Col 2 |\n| :--- | :--- |\n| Data | Data |\n'), label: 'Table' },
              ].map((tool, i) => (
                <Button 
                  key={i} 
                  variant="ghost" 
                  size="icon" 
                  onClick={tool.act} 
                  title={tool.label}
                  className="h-10 w-10 rounded-lg text-foreground/40 hover:text-primary hover:bg-primary/10 transition-all"
                >
                  <tool.icon className="w-4 h-4" />
                </Button>
              ))}
              <div className="w-[1px] h-6 bg-border mx-2 hidden sm:block" />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { setMarkdown(SAMPLE_MARKDOWN); toast({ title: "Template Injected" }); }} 
                className="h-10 w-10 rounded-lg text-foreground/40 hover:text-primary"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMarkdown('')} 
                className="h-10 w-10 rounded-lg text-foreground/40 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
               <div className="px-3 py-1.5 rounded-lg bg-background border border-border text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-3">
                  <span>Words: {wordCount}</span>
                  <span className="opacity-20 text-foreground">|</span>
                  <span>Chars: {charCount}</span>
               </div>
            </div>
          </div>

          {/* Editor & Preview Area */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0">
            {/* Editor Pane */}
            {(layoutMode === 'split' || layoutMode === 'editor') && (
              <div className={cn(
                "flex-1 flex flex-col border-r border-border transition-all duration-500",
                layoutMode === 'editor' && "md:flex-[1.5]"
              )}>
                <div className="p-3 bg-secondary/30 border-b border-border flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                     <FileEdit className="w-3 h-3" /> MD Source
                   </span>
                   <div className="flex items-center gap-2">
                     <button onClick={() => handleCopy(markdown, 'md')} className="text-[10px] font-black uppercase text-primary hover:opacity-70 transition-all">
                       {isCopiedMd ? 'Copied' : 'Copy'}
                     </button>
                     <button onClick={() => handleDownload(markdown, 'document.md', 'text/markdown')} className="text-[10px] font-black uppercase text-foreground/40 hover:text-primary transition-all">
                       Download
                     </button>
                   </div>
                </div>
                <textarea 
                  ref={editorRef}
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  onScroll={handleScroll}
                  placeholder="Draft your documentation..."
                  className="flex-1 w-full p-8 bg-transparent text-foreground font-mono text-sm leading-relaxed resize-none focus:outline-none custom-scrollbar"
                />
              </div>
            )}

            {/* Preview Pane */}
            {(layoutMode === 'split' || layoutMode === 'preview') && (
              <div className="flex-1 flex flex-col bg-white/10 dark:bg-black/10 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="h-12 w-full justify-start rounded-none bg-secondary/50 border-b border-border p-0">
                    <TabsTrigger value="preview" className="h-full rounded-none px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary border-r border-border transition-all">
                      <Eye className="w-3.5 h-3.5 mr-2" /> Visual Master
                    </TabsTrigger>
                    <TabsTrigger value="html" className="h-full rounded-none px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary transition-all">
                      <Code2 className="w-3.5 h-3.5 mr-2" /> HTML Source
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="preview" className="h-full m-0">
                      <div 
                        ref={previewRef}
                        className="h-full overflow-y-auto p-8 custom-scrollbar markdown-preview text-foreground selection:bg-primary/20"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    </TabsContent>

                    <TabsContent value="html" className="h-full m-0">
                      <div className="h-full flex flex-col p-6 space-y-4">
                        <div className="flex-1 relative group/source">
                           <textarea 
                            readOnly
                            value={html}
                            className="w-full h-full bg-black/90 text-green-500/90 font-mono text-xs p-6 rounded-2xl border border-white/5 shadow-inner resize-none custom-scrollbar"
                           />
                           <div className="absolute top-4 right-4 text-white/10">
                              <Terminal className="w-5 h-5" />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <Button onClick={() => handleCopy(html, 'html')} className="h-14 rounded-2xl bg-secondary border border-border text-primary font-black uppercase text-[10px] tracking-widest hover:bg-secondary/80">
                             {isCopiedHtml ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                             Copy HTML
                           </Button>
                           <Button onClick={() => handleDownload(html, 'export.html', 'text/html')} className="h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/30">
                             <FileDown className="w-4 h-4 mr-2" />
                             Save .html
                           </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            )}
          </div>
        </Card>

        {/* Studio Intel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
              <Globe className="w-6 h-6 text-primary mt-1 shrink-0" />
              <div className="space-y-1">
                 <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">GFM Protocol</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">Standard GitHub Flavored Markdown support for technical documentation and reports.</p>
              </div>
           </div>
           <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
              <CheckCircle2 className="w-6 h-6 text-primary mt-1 shrink-0" />
              <div className="space-y-1">
                 <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Sanitized Engine</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">Automatic HTML sanitization ensures your studio environment remains secure and consistent.</p>
              </div>
           </div>
           <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
              <Terminal className="w-6 h-6 text-primary mt-1 shrink-0" />
              <div className="space-y-1">
                 <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Local Processing</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">100% private synthesis. Your drafting and code generation occur entirely in your browser memory.</p>
              </div>
           </div>
        </div>
      </div>

      <style jsx global>{`
        .markdown-preview h1 { @apply text-3xl font-black mb-6 mt-2 border-b-2 border-primary/20 pb-2 uppercase tracking-tight; }
        .markdown-preview h2 { @apply text-xl font-bold mb-4 mt-8 border-l-4 border-primary pl-4 uppercase tracking-tighter; }
        .markdown-preview h3 { @apply text-lg font-bold mb-3 mt-6 text-foreground/80; }
        .markdown-preview h4 { @apply text-base font-bold mb-2 mt-4 text-foreground/60; }
        .markdown-preview p { @apply mb-5 text-[15px] leading-relaxed font-medium text-foreground/70; }
        .markdown-preview strong { @apply text-foreground font-black; }
        .markdown-preview em { @apply text-primary italic font-medium; }
        .markdown-preview ul { @apply list-disc list-inside mb-6 space-y-2 text-foreground/60; }
        .markdown-preview ol { @apply list-decimal list-inside mb-6 space-y-2 text-foreground/60; }
        .markdown-preview li input[type="checkbox"] { @apply mr-2 scale-110 accent-primary; }
        .markdown-preview blockquote { @apply border-l-4 border-primary/20 bg-primary/5 p-6 my-8 rounded-r-2xl italic font-medium text-foreground/50 leading-loose; }
        .markdown-preview pre { @apply bg-black/90 p-6 rounded-2xl mb-6 overflow-x-auto border border-white/5 shadow-2xl; }
        .markdown-preview code { @apply font-mono text-[13px] text-green-500/80; }
        .markdown-preview :not(pre) > code { @apply bg-primary/10 px-1.5 py-0.5 rounded text-[12px] text-primary font-bold border border-primary/20; }
        .markdown-preview hr { @apply border-primary/10 my-10; }
        .markdown-preview a { @apply text-primary font-bold underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all; }
        .markdown-preview table { @apply w-full mb-8 border-collapse rounded-xl overflow-hidden; }
        .markdown-preview th { @apply bg-secondary p-4 text-left text-[11px] font-black uppercase tracking-widest border border-border; }
        .markdown-preview td { @apply p-4 text-[13px] font-medium border border-border text-foreground/60; }
        .markdown-preview img { @apply rounded-2xl shadow-xl max-w-full h-auto my-8 border border-white/10; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
