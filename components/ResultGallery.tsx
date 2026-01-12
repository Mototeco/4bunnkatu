import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { SplitResult } from '../types';

interface ResultGalleryProps {
  results: SplitResult[];
}

const ResultGallery: React.FC<ResultGalleryProps> = ({ results }) => {
  if (results.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {results.map((result, index) => (
        <div key={result.id} className="group relative flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="relative bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200 aspect-square flex items-center justify-center">
            {/* Checkerboard background for transparency */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                backgroundSize: '10px 10px'
            }}></div>
            
            <img 
              src={result.dataUrl} 
              alt={`Split part ${index + 1}`} 
              className="max-w-full max-h-full object-contain z-10"
            />
            
            <div className="absolute top-2 left-2 z-20">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-sm">
                 {index + 1}
               </span>
            </div>
          </div>
          
          <a
            href={result.dataUrl}
            download={`split_image_${index + 1}.png`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all text-sm font-medium shadow-md group-hover:shadow-lg"
          >
            <Download className="w-4 h-4" />
            保存する
          </a>
        </div>
      ))}
    </div>
  );
};

export default ResultGallery;