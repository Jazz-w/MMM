import React from 'react';
import { cn } from "../../lib/utils";

interface SliderProps {
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ value, onValueChange, min = 0, max = 100, step = 1, className }, ref) => {
    const [minVal, maxVal] = value;

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Math.min(Number(e.target.value), maxVal - step);
      onValueChange([newMin, maxVal]);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Math.max(Number(e.target.value), minVal + step);
      onValueChange([minVal, newMax]);
    };

    const minPercent = ((minVal - min) / (max - min)) * 100;
    const maxPercent = ((maxVal - min) / (max - min)) * 100;

    return (
      <div ref={ref} className={cn("relative w-full", className)}>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-2 bg-emerald-600 rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
        </div>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
        />
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
        />
        
        <div
          className="absolute w-4 h-4 bg-white border-2 border-emerald-600 rounded-full shadow-md cursor-pointer transform -translate-x-1/2 -translate-y-1"
          style={{ left: `${minPercent}%`, top: '0px' }}
        />
        
        <div
          className="absolute w-4 h-4 bg-white border-2 border-emerald-600 rounded-full shadow-md cursor-pointer transform -translate-x-1/2 -translate-y-1"
          style={{ left: `${maxPercent}%`, top: '0px' }}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider"; 