"use client"

import React from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { HelpCircle, Sparkles, Shield, Zap, Globe, Layers, Download, QrCode } from 'lucide-react';

const FAQ_DATA = [
  {
    icon: Globe,
    q: "Is MY KIT TOOL completely free to use?",
    a: "Yes! MY KIT TOOL is 100% free for both personal and commercial use. We do not charge subscriptions, usage fees, or for high-resolution downloads."
  },
  {
    icon: Shield,
    q: "Are the generated assets permanent?",
    a: "Absolutely. We generate static assets (like QR codes), which means the data is encoded directly into the pattern. They will never expire and do not require our servers to function once generated."
  },
  {
    icon: Sparkles,
    q: "Can I add my business logo to QR codes?",
    a: "Yes. Our Single Studio allows you to upload any brand icon. We use advanced error correction to ensure your QR code remains perfectly scannable even with a central logo."
  },
  {
    icon: Layers,
    q: "How does the Bulk Production mode work?",
    a: "Bulk mode allows you to paste a list of URLs or text strings. Our engine then renders each one into a high-resolution asset and bundles them into a single ZIP file for you."
  },
  {
    icon: Zap,
    q: "What is an AI-Generated Background?",
    a: "We integrate with Google Imagen to generate artistic backgrounds based on your text prompts. These are specifically optimized for scannability and aesthetics."
  },
  {
    icon: Download,
    q: "What file formats can I download?",
    a: "You can export your assets in high-resolution PNG, JPG, and professional vector SVG formats, suitable for everything from social media to large-format print."
  },
  {
    icon: QrCode,
    q: "Does the scanner support all technical types?",
    a: "Our Live Studio Scanner supports standard QR codes, Data Matrix, and Aztec formats. It can decode URLs, Wi-Fi credentials, and plain text instantly."
  },
  {
    icon: Shield,
    q: "Is my data stored on your servers?",
    a: "Never. Privacy is our core principle. All generation, OCR extraction, and image editing happens locally in your browser. We never see or store the data you process."
  },
  {
    icon: Zap,
    q: "What is the Technical Score?",
    a: "It's a real-time analysis of your design. We calculate contrast ratios and pattern density to give you a confidence rating (80%+ is recommended for professional use)."
  },
  {
    icon: Layers,
    q: "Can I use MY KIT TOOL offline?",
    a: "Yes! MY KIT TOOL is a Progressive Web App (PWA). Once installed on your device, you can use most features even without an internet connection."
  }
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-6 py-20 max-w-4xl">
      <div className="text-center mb-20 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <HelpCircle className="w-3.5 h-3.5" /> Knowledge Base
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight mb-8">
          Frequent <span className="text-primary italic">Questions</span>
        </h1>
        <p className="text-lg text-foreground/50 leading-relaxed font-medium">
          Everything you need to know about using MY KIT TOOL for your professional workflow.
        </p>
      </div>

      <div className="glass-card p-1 md:p-8 rounded-[3rem] border-border overflow-hidden animate-reveal stagger-1">
        <Accordion type="single" collapsible className="w-full">
          {FAQ_DATA.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-white/10 px-6 py-2">
              <AccordionTrigger className="hover:no-underline hover:text-primary transition-all text-left group py-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm md:text-base font-bold uppercase tracking-tight">{item.q}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2 pl-12 text-sm md:text-base text-foreground/50 leading-relaxed font-medium">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-20 glass-card p-12 rounded-[3rem] border-border text-center animate-reveal stagger-2">
        <h2 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight mb-4 text-center">Still have questions?</h2>
        <p className="text-sm text-foreground/40 font-medium mb-10 text-center">
          Our studio is built for ease of use. Try one of our professional tools to see how simple digital production can be.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <div className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 cursor-default">
            Developed by Umar Farooq 💝
          </div>
          <div className="px-8 py-3 rounded-2xl bg-secondary border border-border text-[10px] font-black uppercase tracking-widest text-foreground/40 cursor-default">
            Studio Engine v6.0
          </div>
        </div>
      </div>
    </div>
  );
}
