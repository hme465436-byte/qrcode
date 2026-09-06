'use client';

import { CheckCircle2 } from 'lucide-react';

const benefits = [
  "Completely Free - No hidden charges, no premium plans",
  "No Registration - Start using instantly without signup",
  "Browser-Based - No software installation needed",
  "Secure & Safe - Your data stays on your device",
  "Always Available - 24/7 access from anywhere",
  "Regular Updates - New tools added every week",
];

export function WhyChooseUs() {
  return (
    <section className="w-full py-16 sm:py-20 bg-opacity-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Why Choose MyKitTool?</h2>
          <p className="mt-2 text-base text-gray-400">The ultimate toolkit for professionals, students, and creators.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-base text-gray-300">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
