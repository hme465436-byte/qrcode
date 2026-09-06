'use client';

import Link from 'next/link';
import {
  MessageSquare,
  Sparkles,
  Contact2,
  QrCode,
  Mic,
  Volume2,
  ArrowRight
} from 'lucide-react';

const popularTools = [
  {
    href: '/ai-chatbot',
    icon: <MessageSquare className="w-12 h-12 text-indigo-400" />,
    title: 'AI Chatbot',
    desc: 'Engage with our smart AI assistant.',
  },
  {
    href: '/ai-image-generator',
    icon: <Sparkles className="w-12 h-12 text-rose-400" />,
    title: 'AI Image Generator',
    desc: 'Create stunning images from text prompts.',
  },
  {
    href: '/ai-resume-builder',
    icon: <Contact2 className="w-12 h-12 text-emerald-400" />,
    title: 'AI Resume Builder',
    desc: 'Build a professional resume in minutes.',
  },
  {
    href: '/single',
    icon: <QrCode className="w-12 h-12 text-blue-400" />,
    title: 'QR Code Generator',
    desc: 'Create custom branded QR codes.',
  },
  {
    href: '/speech-to-text',
    icon: <Mic className="w-12 h-12 text-orange-400" />,
    title: 'Speech to Text',
    desc: 'Transcribe audio to text accurately.',
  },
  {
    href: '/text-to-speech',
    icon: <Volume2 className="w-12 h-12 text-cyan-400" />,
    title: 'Text to Speech',
    desc: 'Convert text into natural-sounding speech.',
  },
];

export function PopularTools() {
  return (
    <section className="w-full py-16 sm:py-20 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Most Popular Tools</h2>
          <p className="mt-2 text-base text-gray-400 max-w-xl mx-auto">Explore our most used tools, trusted by thousands of users daily.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularTools.map((tool) => (
            <div key={tool.href}>
              <Link href={tool.href} className="group block h-full">
                <div className={'flex flex-col justify-between h-full p-8 rounded-xl bg-white/[.02] border border-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/5 hover:border-cyan-400/50 hover:shadow-2xl'}>
                    <div>
                        <div className="mb-6">
                            {tool.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{tool.title}</h3>
                        <p className="text-sm text-gray-400/80">{tool.desc}</p>
                    </div>
                    <div className="mt-8 flex items-center text-sm font-semibold text-gray-400 group-hover:text-white transition-colors duration-300">
                        Open Tool
                        <ArrowRight className="h-4 w-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
