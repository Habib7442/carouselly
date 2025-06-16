'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, FabricImage, FabricText } from 'fabric';

interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: string;
}

export default function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('Your Text Here');
  const [textStyle, setTextStyle] = useState<TextStyle>({
    fontSize: 60,
    fontFamily: 'Arial',
    fill: '#ffffff',
    fontWeight: 'bold'
  });
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#f8fafc'
      });
      setIsCanvasReady(true);
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;
    
    setImageFile(file);
    const imgUrl = URL.createObjectURL(file);
    
    try {
      const img = await FabricImage.fromURL(imgUrl);
      if (!fabricCanvasRef.current) return;
      
      // Clear canvas
      fabricCanvasRef.current.clear();
      
      // Scale image to fit canvas
      const canvasWidth = fabricCanvasRef.current.width!;
      const canvasHeight = fabricCanvasRef.current.height!;
      const imgWidth = img.width!;
      const imgHeight = img.height!;
      
      const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
      img.scale(scale);
      
      // Center the image
      img.set({
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
        selectable: false
      });
      
      fabricCanvasRef.current.add(img);
      fabricCanvasRef.current.renderAll();
      
      // Clean up URL
      URL.revokeObjectURL(imgUrl);
    } catch (error) {
      console.error('Error loading image:', error);
      URL.revokeObjectURL(imgUrl);
    }
  };

  // Add text to canvas
  const addText = () => {
    if (!fabricCanvasRef.current || !textContent.trim()) return;
    
    // Remove existing text objects
    const objects = fabricCanvasRef.current.getObjects();
    objects.forEach(obj => {
      if (obj.type === 'text') {
        fabricCanvasRef.current!.remove(obj);
      }
    });
    
    const text = new FabricText(textContent, {
      left: 100,
      top: 100,
      fontSize: textStyle.fontSize,
      fontFamily: textStyle.fontFamily,
      fill: textStyle.fill,
      fontWeight: textStyle.fontWeight,
      selectable: true,
      editable: true
    });
    
    fabricCanvasRef.current.add(text);
    
    // Send text behind image (if image exists)
    const images = fabricCanvasRef.current.getObjects().filter(obj => obj.type === 'image');
    if (images.length > 0) {
      fabricCanvasRef.current.sendObjectToBack(text);
      // Bring image to front
      images.forEach(img => fabricCanvasRef.current!.bringObjectToFront(img));
    }
    
    fabricCanvasRef.current.renderAll();
  };

  // Download the canvas as image
  const downloadImage = () => {
    if (!fabricCanvasRef.current) return;
    
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1
    });
    
    const link = document.createElement('a');
    link.download = 'text-behind-image.png';
    link.href = dataURL;
    link.click();
  };

  // Clear canvas
  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = '#f8fafc';
    fabricCanvasRef.current.renderAll();
    setImageFile(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Text Behind Image Editor</h2>
        
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Content
            </label>
            <input
              type="text"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your text"
            />
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size: {textStyle.fontSize}px
            </label>
            <input
              type="range"
              min="20"
              max="120"
              value={textStyle.fontSize}
              onChange={(e) => setTextStyle(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>

          {/* Text Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <input
              type="color"
              value={textStyle.fill}
              onChange={(e) => setTextStyle(prev => ({ ...prev, fill: e.target.value }))}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>
        </div>

        {/* Font Family and Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={textStyle.fontFamily}
              onChange={(e) => setTextStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Impact">Impact</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Weight
            </label>
            <select
              value={textStyle.fontWeight}
              onChange={(e) => setTextStyle(prev => ({ ...prev, fontWeight: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="lighter">Light</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={addText}
            disabled={!isCanvasReady}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add Text Behind Image
          </button>
          <button
            onClick={downloadImage}
            disabled={!isCanvasReady}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Download Image
          </button>
          <button
            onClick={clearCanvas}
            disabled={!isCanvasReady}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Clear Canvas
          </button>
        </div>

        {/* Canvas */}
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>Upload an image using the file input</li>
            <li>Enter your desired text in the text input field</li>
            <li>Customize the text appearance using the controls</li>
            <li>Click "Add Text Behind Image" to place the text</li>
            <li>Drag the text to reposition it on the canvas</li>
            <li>Download your final image when satisfied</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 