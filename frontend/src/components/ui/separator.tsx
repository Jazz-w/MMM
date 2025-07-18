import React from 'react';
import { cn } from "../../lib/utils";

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = 'horizontal', className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'shrink-0 bg-gray-200',
          orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
          className
        )}
      />
    );
  }
);

Separator.displayName = "Separator"; 