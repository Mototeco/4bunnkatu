import React, { useState, useCallback } from 'react';
import { Upload, Scissors, Image as ImageIcon, RotateCcw } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ImageEditor from './components/ImageEditor';
import ResultGallery from './components/ResultGallery';
import { SplitDirection, SplitResult } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [results, setResults] = useState<SplitResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setOriginalImage(e.target.result as string);
        setResults([]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-10 max-w-2xl">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-50 rounded-full">
            <Scissors className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          画像4分割ツール
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          1枚の画像を自由に4つに分割して保存できます。<br />
          SNSの投稿やデザイン素材の作成に最適です。
        </p>
      </header>

      <main className="w-full max-w-4xl space-y-12">
        {/* Step 1: Upload */}
        {!originalImage && (
          <section className="animate-fade-in">
            <ImageUploader onImageSelect={handleImageSelect} />
          </section>
        )}

        {/* Step 2: Edit & Preview */}
        {originalImage && (
          <section className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm">1</span>
                分割位置の調整 (Before)
              </h2>
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                画像をリセット
              </button>
            </div>
            
            <ImageEditor 
              imageSrc={originalImage} 
              onResultsGenerated={setResults}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          </section>
        )}

        {/* Step 3: Download */}
        {results.length > 0 && (
          <section className="space-y-8 animate-fade-in pt-8 border-t border-gray-100">
             <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-sm">2</span>
                分割結果 (After)
              </h2>
              <span className="text-sm text-gray-500">
                必要な画像をタップして保存
              </span>
            </div>
            
            <ResultGallery results={results} />
          </section>
        )}
      </main>

      <footer className="mt-20 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} SplitMaster. All rights reserved.
      </footer>
    </div>
  );
};

export default App;