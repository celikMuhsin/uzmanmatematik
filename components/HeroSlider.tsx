
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SLIDER_ITEMS } from '../constants';

const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === SLIDER_ITEMS.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev === SLIDER_ITEMS.length - 1 ? 0 : prev + 1));
  const prev = () => setCurrent((prev) => (prev === 0 ? SLIDER_ITEMS.length - 1 : prev - 1));

  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-2xl bg-slate-900 shadow-lg">
      {SLIDER_ITEMS.map((item, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-slate-900/80 to-transparent">
            <h2 className="text-white text-3xl md:text-4xl font-bold mb-2 transform transition-transform duration-700 delay-100">
              {item.title}
            </h2>
            <p className="text-slate-200 text-lg md:text-xl max-w-2xl">
              {item.description}
            </p>
          </div>
        </div>
      ))}

      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {SLIDER_ITEMS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === current ? 'bg-white w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
