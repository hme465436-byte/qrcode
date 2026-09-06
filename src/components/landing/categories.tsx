'use client';

import Link from 'next/link';
import { BrainCircuit, FileText, Image, Film, Wrench } from 'lucide-react';

const categories = [
  {
    name: "AI Tools",
    count: "25+ Tools",
    icon: <BrainCircuit className="w-16 h-16" />,
    href: "/ai",
    gradient: "from-blue-500/80 to-cyan-500/80",
  },
  {
    name: "PDF Tools",
    count: "30+ Tools",
    icon: <FileText className="w-16 h-16" />,
    href: "/pdf",
    gradient: "from-purple-500/80 to-pink-500/80",
  },
  {
    name: "Image Tools",
    count: "20+ Tools",
    icon: <Image className="w-16 h-16" />,
    href: "/image",
    gradient: "from-orange-500/80 to-red-500/80",
  },
  {
    name: "Media Tools",
    count: "15+ Tools",
    icon: <Film className="w-16 h-16" />,
    href: "/media",
    gradient: "from-green-500/80 to-cyan-500/80",
  },
  {
    name: "Utilities",
    count: "30+ Tools",
    icon: <Wrench className="w-16 h-16" />,
    href: "/utilities",
    gradient: "from-pink-500/80 to-purple-500/80",
  },
];

export function Categories() {
  return (
    <section className="w-full py-16 sm:py-20 bg-opacity-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">Browse by Category</h2>
          <p className="mt-2 text-base text-gray-400 max-w-xl mx-auto">Find the right tool for the job from our comprehensive categories.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category) => (
            <div key={category.name}>
              <Link href={category.href} className="group block">
                <div className={`relative h-80 rounded-2xl overflow-hidden p-6 flex flex-col justify-between items-center text-center text-white bg-gradient-to-br ${category.gradient} transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                  <div className="relative z-10 flex flex-col items-center justify-center flex-grow">
                    <div className="mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                        {category.icon}
                    </div>
                    <h3 className="text-2xl font-bold">{category.name}</h3>
                    <p className="text-sm text-white/70 mt-1">{category.count}</p>
                  </div>
                  <div className="relative z-10 text-xs font-semibold text-white/80 group-hover:text-white transition-colors duration-300">
                    EXPLORE
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
