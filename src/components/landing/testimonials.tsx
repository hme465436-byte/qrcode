'use client';

import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah L.",
    avatar: "/avatars/avatar1.png",
    rating: 5,
    quote: "The AI Image Generator is a game-changer! I create stunning visuals for my blog in minutes. MyKitTool is my secret weapon for content creation.",
    tool: "AI Image Generator"
  },
  {
    name: "Mark C.",
    avatar: "/avatars/avatar2.png",
    rating: 5,
    quote: "As a student, the PDF Merger and a Suite of other PDF tools are lifesavers. It's fast, free, and works right in my browser. I can't imagine my workflow without it.",
    tool: "PDF Tools"
  },
  {
    name: "David P.",
    avatar: "/avatars/avatar3.png",
    rating: 5,
    quote: "I needed a quick QR code with a logo, and the Single Studio delivered perfectly. The customization options are amazing for a free tool.",
    tool: "Single Studio"
  },
    {
    name: "Emily R.",
    avatar: "/avatars/avatar4.png",
    rating: 5,
    quote: "The Speech to Text tool is incredibly accurate. It saves me hours of transcription time. I recommend MyKitTool to all my colleagues!",
    tool: "Speech to Text"
  },
];

export function Testimonials() {
  return (
    <section className="w-full py-16 sm:py-20 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Trusted by Thousands</h2>
          <p className="mt-2 text-base text-gray-400">Our users love the simplicity and power of MyKitTool.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-4">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <div className="flex items-center mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="text-gray-300 text-sm leading-relaxed">"{testimonial.quote}"</blockquote>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                  <span className="text-xs text-gray-400 font-medium">Used: </span>
                  <span className="text-xs text-primary font-semibold">{testimonial.tool}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
