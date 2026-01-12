import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Columns, Rows, MoveVertical, MoveHorizontal, Download } from 'lucide-react';
import { SplitDirection, SplitResult } from '../types';

interface ImageEditorProps {
  imageSrc: string;
  onResultsGenerated: (results: SplitResult[]) => void;
  isProcessing: boolean;
  setIsProcessing: (state: boolean) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ 
  imageSrc, 
  onResultsGenerated,
  isProcessing,
  setIsProcessing
}) => {
  // We need 3 cuts to make 4 pieces. 
  // Store positions as percentages (0.0 to 1.0)
  const [cuts, setCuts] = useState<number[]>([0.25, 0.50, 0.75]);
  const [direction, setDirection] = useState<SplitDirection>(SplitDirection.VERTICAL);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);

  // Reset cuts when direction changes
  const handleDirectionChange = (newDirection: SplitDirection) => {
    setDirection(newDirection);
    setCuts([0.25, 0.50, 0.75]); // Reset to even distribution
    // Clear previous results as the layout changed
    onResultsGenerated([]); 
  };

  // Generate the slices whenever cuts, direction or image changes
  useEffect(() => {
    generateSlices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuts, direction, imageSrc]);

  const generateSlices = useCallback(async () => {
    if (!imageRef.current) return;
    setIsProcessing(true);
    
    const img = imageRef.current;
    
    // Create an off-screen canvas to process the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Wait for image to be fully loaded (just in case, though it should be by render time)
    if (!img.complete) {
      await new Promise(resolve => { img.onload = resolve; });
    }

    const newResults: SplitResult[] = [];
    
    // Sort cuts to ensure order
    const sortedCuts = [0, ...cuts, 1].sort((a, b) => a - b);

    for (let i = 0; i < sortedCuts.length - 1; i++) {
      const startPct = sortedCuts[i];
      const endPct = sortedCuts[i + 1];
      const sizePct = endPct - startPct;

      let sx, sy, sw, sh;

      if (direction === SplitDirection.VERTICAL) {
        // Splitting vertically (columns)
        sx = img.naturalWidth * startPct;
        sy = 0;
        sw = img.naturalWidth * sizePct;
        sh = img.naturalHeight;
      } else {
        // Splitting horizontally (rows)
        sx = 0;
        sy = img.naturalHeight * startPct;
        sw = img.naturalWidth;
        sh = img.naturalHeight * sizePct;
      }

      // Avoid zero-width/height issues
      if (sw <= 0 || sh <= 0) continue;

      canvas.width = sw;
      canvas.height = sh;
      
      // Draw the portion
      ctx.clearRect(0, 0, sw, sh);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      
      const dataUrl = canvas.toDataURL('image/png');
      newResults.push({
        id: i,
        dataUrl,
        width: sw,
        height: sh
      });
    }

    onResultsGenerated(newResults);
    setIsProcessing(false);
  }, [cuts, direction, imageSrc, onResultsGenerated, setIsProcessing]);


  // ---- Dragging Logic ----

  const handleDragStart = (index: number) => {
    setActiveDragIndex(index);
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (activeDragIndex === null || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let newPct;

    if (direction === SplitDirection.VERTICAL) {
      const x = clientX - rect.left;
      newPct = x / rect.width;
    } else {
      const y = clientY - rect.top;
      newPct = y / rect.height;
    }

    // Clamp between previous and next cut (or 0 and 1)
    // Limits: cut[i] must be > cut[i-1] + padding and < cut[i+1] - padding
    const padding = 0.05; // 5% minimum gap
    const prevLimit = activeDragIndex > 0 ? cuts[activeDragIndex - 1] + padding : 0 + padding;
    const nextLimit = activeDragIndex < cuts.length - 1 ? cuts[activeDragIndex + 1] - padding : 1 - padding;

    newPct = Math.max(prevLimit, Math.min(newPct, nextLimit));

    setCuts(prev => {
      const next = [...prev];
      next[activeDragIndex] = newPct;
      return next;
    });
  }, [activeDragIndex, cuts, direction]);

  const handleDragEnd = () => {
    setActiveDragIndex(null);
  };

  // Mouse event listeners
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleDragEnd();

    if (activeDragIndex !== null) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [activeDragIndex, handleMove]);

  // Touch event listeners
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchEnd = () => handleDragEnd();

    if (activeDragIndex !== null) {
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [activeDragIndex, handleMove]);


  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => handleDirectionChange(SplitDirection.VERTICAL)}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all shadow-sm
            ${direction === SplitDirection.VERTICAL 
              ? 'bg-blue-600 text-white shadow-blue-200' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }
          `}
        >
          <Columns className="w-5 h-5" />
          <span>縦割り (横並び4枚)</span>
        </button>
        <button
          onClick={() => handleDirectionChange(SplitDirection.HORIZONTAL)}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all shadow-sm
            ${direction === SplitDirection.HORIZONTAL 
              ? 'bg-blue-600 text-white shadow-blue-200' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }
          `}
        >
          <Rows className="w-5 h-5" />
          <span>横割り (縦並び4枚)</span>
        </button>
      </div>

      <p className="text-center text-sm text-gray-500">
        白い点線をドラッグして、画像の切り取り位置を調整してください。
      </p>

      {/* Editor Canvas */}
      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-inner select-none touch-none">
        <div 
          ref={containerRef} 
          className="relative mx-auto"
          style={{ width: 'fit-content' }}
        >
          {/* Base Image */}
          <img 
            ref={imageRef}
            src={imageSrc} 
            alt="Original" 
            className="max-w-full max-h-[70vh] block object-contain"
            onLoad={() => generateSlices()} 
            draggable={false}
          />
          
          {/* Overlay Mask - Darken areas slightly? Maybe just clear lines is better. */}
          <div className="absolute inset-0 pointer-events-none bg-black/5" />

          {/* Draggable Lines */}
          {cuts.map((cut, index) => (
            <div
              key={index}
              onMouseDown={() => handleDragStart(index)}
              onTouchStart={() => handleDragStart(index)}
              className={`absolute z-10 hover:bg-blue-500 transition-colors duration-200 group cursor-pointer 
                ${direction === SplitDirection.VERTICAL 
                  ? 'top-0 bottom-0 w-1 -ml-0.5 cursor-col-resize' 
                  : 'left-0 right-0 h-1 -mt-0.5 cursor-row-resize'
                }
              `}
              style={{
                left: direction === SplitDirection.VERTICAL ? `${cut * 100}%` : '0',
                top: direction === SplitDirection.HORIZONTAL ? `${cut * 100}%` : '0',
                backgroundColor: activeDragIndex === index ? '#2563EB' : 'white',
              }}
            >
              {/* Handle Icon for better visibility */}
              <div 
                className={`
                  absolute bg-white rounded-full shadow-md flex items-center justify-center pointer-events-none
                  text-blue-600 border border-gray-200
                  ${direction === SplitDirection.VERTICAL 
                    ? 'w-6 h-8 top-1/2 -mt-4 -left-2.5' 
                    : 'w-8 h-6 left-1/2 -ml-4 -top-2.5'
                  }
                  ${activeDragIndex === index ? 'scale-125 border-blue-500' : 'group-hover:scale-110'}
                `}
              >
                {direction === SplitDirection.VERTICAL ? (
                  <MoveHorizontal size={14} />
                ) : (
                  <MoveVertical size={14} />
                )}
              </div>
              
              {/* Dashed guide line inside the handle area for visibility on image */}
              <div className={`absolute inset-0 border-dashed border-gray-800 opacity-40 pointer-events-none
                ${direction === SplitDirection.VERTICAL ? 'border-l-2' : 'border-t-2'}
              `} />
            </div>
          ))}

          {/* Slice Numbers (1, 2, 3, 4) for visual aid */}
          {[0, ...cuts].map((pos, i) => {
             const nextPos = i < cuts.length ? cuts[i] : 1;
             const center = (pos + nextPos) / 2;
             
             return (
               <div 
                  key={`label-${i}`}
                  className="absolute pointer-events-none flex items-center justify-center"
                  style={{
                    left: direction === SplitDirection.VERTICAL ? `${center * 100}%` : '50%',
                    top: direction === SplitDirection.HORIZONTAL ? `${center * 100}%` : '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
               >
                 <span className="w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center font-bold text-lg backdrop-blur-sm border border-white/30 shadow-sm">
                   {i + 1}
                 </span>
               </div>
             );
          })}

        </div>
      </div>
    </div>
  );
};

export default ImageEditor;