import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      onImageSelect(file);
    } else {
      alert('画像ファイルを選択してください');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full h-80 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center group
        ${isDragging 
          ? 'border-blue-500 bg-blue-50 scale-[1.01]' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <div className={`p-4 bg-white rounded-full shadow-sm mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
        <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
      </div>
      
      <p className="text-lg font-medium text-gray-700">
        画像をここにドロップ
      </p>
      <p className="text-sm text-gray-500 mt-2">
        または <span className="text-blue-500 font-semibold hover:underline">ファイルを選択</span>
      </p>
      <p className="text-xs text-gray-400 mt-4">
        JPG, PNG, WEBP 対応
      </p>
    </div>
  );
};

export default ImageUploader;