import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileControlsProps {
  onMoveStart: (direction: number) => void;
  onMoveEnd: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveStart,
  onMoveEnd,
}) => {
  return (
    <div className="sm:hidden w-full px-4 py-2 bg-gradient-to-t from-amber-950 via-amber-950/80 to-transparent flex justify-between items-center z-20 pointer-events-auto select-none">
      {/* Left button */}
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          onMoveStart(-1);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          onMoveEnd();
        }}
        onPointerLeave={onMoveEnd}
        className="w-16 h-13 rounded-2xl bg-gradient-to-br from-amber-800 to-amber-950 active:from-amber-600 active:to-amber-800 border-2 border-amber-400/60 shadow-lg flex items-center justify-center text-amber-200 active:scale-95 touch-manipulation cursor-pointer"
        aria-label="Move Left"
      >
        <ChevronLeft className="w-8 h-8 text-amber-300" />
      </button>

      <div className="text-[10px] text-amber-400/80 font-medium tracking-wide uppercase px-2 text-center pointer-events-none">
        Drag Screen or Tap Arrows
      </div>

      {/* Right button */}
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          onMoveStart(1);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          onMoveEnd();
        }}
        onPointerLeave={onMoveEnd}
        className="w-16 h-13 rounded-2xl bg-gradient-to-br from-amber-800 to-amber-950 active:from-amber-600 active:to-amber-800 border-2 border-amber-400/60 shadow-lg flex items-center justify-center text-amber-200 active:scale-95 touch-manipulation cursor-pointer"
        aria-label="Move Right"
      >
        <ChevronRight className="w-8 h-8 text-amber-300" />
      </button>
    </div>
  );
};
