'use client';

import Link from 'next/link';
import { Sparkles, FileText, ImageIcon, Film, Grid3X3, ArrowRight } from 'lucide-react';

const categories = [
  {
    icon: <Sparkles className="w-8 h-8 text-indigo-400" />,
    name: "AI Tools",
    count: "20+ Tools",
    href: "/all-tools?category=ai",
    glowClass: "group-hover:border-indigo-400/50",
  },
  {
    icon: <FileText className="w-8 h-8 text-rose-400" />,
    name: "PDF Tools",
    count: "15+ Tools",
    href: "/all-tools?category=pdf",
    glowClass: "group-hover:border-rose-400/50",
  },
  {
    icon: <ImageIcon className="w-8 h-8 text-emerald-400" />,
    name: "Image Tools",
    count: "25+ Tools",
    href: "/all-tools?category=image",
    glowClass: "group-hover:border-emerald-400/50",
  },
  {
    icon: <Film className="w-8 h-8 text-amber-400" />,
    name: "Media Tools",
    count: "10+ Tools",
    href: "/all-tools?category=media",
    glowClass: "group-hover:border-amber-400/50",
  },
  {
    icon: <Grid3X3 className="w-8 h-8 text-sky-400" />,
    name: "Utilities",
    count: "50+ Tools",
    href: "/all-tools?category=utilities",
    glowClass: "group-hover:border-sky-400/50",
  },
];

export function Categories() {
  return (
    <section id="categories" className="w-full py-16 sm:py-20 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Browse by Category</h2>
          <p className="mt-2 text-base text-gray-400 max-w-xl mx-auto">Find the right tool for your task by exploring our curated categories.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link href={category.href} key={category.name} className={`group relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-lg hover:-translate-y-1 transition-all duration-300 ${category.glowClass}`}>
              <div className="relative z-10">
                <div className="mb-4">
                  {category.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{category.name}</h3>
                <p className="mt-1 text-sm text-gray-400">{category.count}</p>
                <div className="flex items-center mt-4 text-xs font-bold text-primary/70 group-hover:text-primary transition-colors duration-300">
                  View Tools <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
