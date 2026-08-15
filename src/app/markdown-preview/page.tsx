
"use client"

import React, { useState, useEffect, useMemo } from 'react';
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
  Terminal
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
## Professional Sub-Heading

This is a **bold** and *italic* demonstration of the **MY KIT TOOL** markdown engine.

### Production Features
- **Real-time synthesis**
- Hardware-accelerated preview
- Safe HTML protocols

> "Efficiency is the foundation of digital excellence."

\`\`\`javascript
function studioInit() {
  console.log("Mastering the digital matrix...");
}
\`\`\`

---

[Explore More Tools](/) | [Studio Documentation](/faq)
`;

export default function MarkdownPreviewPage() {
  const { toast } = useToast();
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [html, setHtml] = useState('');
  const [activeView, setActiveView] = useState('preview');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const parseContent = async () => {
      // Basic check for server-side safety
      if (typeof window !== 'undefined') {
        const rawHtml = marked.parse(markdown) as string;
        setHtml(DOMPurify.sanitize(rawHtml));
      }
    };
    parseContent();
  }, [markdown]);

  const handleCopy = () => {
    if (html) {
      navigator.clipboard.writeText(html);
      setIsCopied(true);
      toast({ title: "HTML Copied", description: "Source protocol saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const loadSample = () => {
    setMarkdown(SAMPLE_MARKDOWN);
    toast({ title: "Sample Loaded", description: "Studio template injected." });
  };

  const handleClear = () => {
    setMarkdown('');
    toast({ title: "Studio Reset", description: "Matrix purged and fields cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileText className="w-3.5 h-3.5" /> Web Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Markdown <span className="text-primary italic">to HTML Preview</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional real-time Markdown synthesis. Draft high-quality documentation and preview the visual output or the sanitized HTML protocol instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Editor Panel */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                    <FileEdit className="w-6 h-6" />
                  </div>
                  Source Editor
                </CardTitle>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" onClick={loadSample} className="h-9 w-9 rounded-xl text-foreground/40 hover:text-primary transition-all">
                     <Sparkles className="w-4 h-4" />
                   </Button>
                   <Button variant="ghost" size="icon" onClick={handleClear} className="h-9 w-9 rounded-xl text-foreground/40 hover:text-destructive transition-all">
                     <Trash2 className="w-4 h-4" />
                   </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  <Label>Markdown Syntax</Label>
                  <span className="font-mono">{markdown.length} Chars</span>
                </div>
                <Textarea 
                  placeholder="Type your markdown here... # Header, **Bold**, etc."
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="min-h-[500px] bg-secondary border-border text-base rounded-[2rem] p-8 text-foreground font-mono leading-relaxed resize-none shadow-inner custom-scrollbar transition-all focus:bg-secondary/80"
                />
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4 group hover:bg-primary/10 transition-colors">
                <Info className="w-5 h-5 text-primary mt-1 shrink-0" />
                <p className="text-[11px] text-foreground/50 leading-relaxed font-medium">
                  Our studio utilizes the standard CommonMark specification with GFM extensions for maximum compatibility.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative min-h-[660px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <CardHeader className="py-0 px-0 border-b border-border bg-secondary/30">
              <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
                <TabsList className="w-full h-20 bg-transparent rounded-none p-0 flex">
                  <TabsTrigger 
                    value="preview" 
                    className="flex-1 h-full rounded-none data-[state=active]:bg-background data-[state=active]:text-primary transition-all border-r border-border"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Master Preview</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="source" 
                    className="flex-1 h-full rounded-none data-[state=active]:bg-background data-[state=active]:text-primary transition-all"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <Code2 className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Source Protocol</span>
                    </div>
                  </TabsTrigger>
                </TabsList>

                <div className="p-6 flex-1 overflow-auto bg-white/20 dark:bg-black/20 min-h-[500px] custom-scrollbar">
                  <TabsContent value="preview" className="mt-0 animate-in fade-in zoom-in duration-500">
                    {markdown.trim() ? (
                      <div 
                        className="markdown-preview text-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[400px] opacity-10 space-y-6">
                        <Globe className="w-20 h-20 text-primary" />
                        <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Content</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="source" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-6">
                      <div className="relative group/source">
                        <Textarea 
                          readOnly
                          value={html}
                          className="min-h-[400px] bg-black/90 text-green-500/90 font-mono text-xs p-6 rounded-2xl border-white/5 shadow-2xl resize-none custom-scrollbar"
                        />
                        <div className="absolute top-4 right-4 opacity-40">
                          <Terminal className="w-5 h-5" />
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleCopy}
                        disabled={!html}
                        className={cn(
                          "w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-lg transition-all active:scale-95",
                          !html && "opacity-50"
                        )}
                      >
                        {isCopied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                        {isCopied ? 'HTML Protocol Copied' : 'Copy HTML Source'}
                      </Button>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardHeader>

            <div className="mt-auto p-8 border-t border-border bg-secondary/20">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] font-medium text-foreground/50 leading-relaxed">
                  <div className="flex items-start gap-4">
                     <Layout className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-foreground font-black uppercase tracking-widest">Sanitized Render</p>
                        <p>Our studio applies DOMPurify to every keystroke, ensuring zero cross-site script vulnerabilities during visual synthesis.</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <Globe className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-foreground font-black uppercase tracking-widest">Global Standards</p>
                        <p>Output is standard HTML5 semantic code, ready for professional web development and digital asset production.</p>
                     </div>
                  </div>
               </div>
            </div>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        .markdown-preview h1 { @apply text-3xl font-black mb-6 mt-2 border-b border-primary/10 pb-2 uppercase tracking-tight; }
        .markdown-preview h2 { @apply text-xl font-bold mb-4 mt-8 border-l-4 border-primary pl-4 uppercase tracking-tighter; }
        .markdown-preview h3 { @apply text-lg font-bold mb-3 mt-6 text-foreground/80; }
        .markdown-preview p { @apply mb-5 text-[15px] leading-relaxed font-medium text-foreground/70; }
        .markdown-preview strong { @apply text-foreground font-black; }
        .markdown-preview em { @apply text-primary italic font-medium; }
        .markdown-preview ul { @apply list-disc list-inside mb-6 space-y-2 text-foreground/60; }
        .markdown-preview ol { @apply list-decimal list-inside mb-6 space-y-2 text-foreground/60; }
        .markdown-preview blockquote { @apply border-l-4 border-primary/20 bg-primary/5 p-6 my-8 rounded-r-2xl italic font-medium text-foreground/50 leading-loose; }
        .markdown-preview pre { @apply bg-black/90 p-6 rounded-2xl mb-6 overflow-x-auto border border-white/5; }
        .markdown-preview code { @apply font-mono text-[13px] text-green-500/80; }
        .markdown-preview :not(pre) > code { @apply bg-primary/10 px-1.5 py-0.5 rounded text-[12px] text-primary font-bold border border-primary/20; }
        .markdown-preview hr { @apply border-primary/10 my-10; }
        .markdown-preview a { @apply text-primary font-bold underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all; }
        .markdown-preview img { @apply rounded-2xl shadow-xl max-w-full h-auto my-8 border border-white/10; }
      `}</style>
    </div>
  );
}
