/**
 * Signature canvas component for drawing signatures
 */

"use client";

import { useRef, useState, useEffect } from "react";

interface SignatureCanvasProps {
  onSignatureChange: (signatureDataUrl: string | null) => void;
  width?: number;
  height?: number;
  initialSignature?: string; // Data URL of previously saved signature
}

export default function SignatureCanvas({
  onSignatureChange,
  width = 600,
  height = 200,
  initialSignature
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas internal resolution to fixed values
    canvas.width = width;
    canvas.height = height;

    // Set drawing style
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Fill with white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load initial signature if provided
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setIsEmpty(false);
        onSignatureChange(initialSignature);
      };
      img.src = initialSignature;
    }
  }, [width, height, initialSignature, onSignatureChange]);

  // Handle drawing continuation even when cursor moves outside canvas
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.lineTo(x, y);
      ctx.stroke();

      if (isEmpty) {
        setIsEmpty(false);
      }
    };

    const handleMouseUp = () => {
      if (!isDrawing) return;
      setIsDrawing(false);

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Export signature as data URL
      if (!isEmpty) {
        const dataUrl = canvas.toDataURL("image/png");
        onSignatureChange(dataUrl);
      }
    };

    if (isDrawing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrawing, isEmpty, onSignatureChange]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e 
      ? e.touches[0].clientX - rect.left
      : e.clientX - rect.left;
    const y = "touches" in e
      ? e.touches[0].clientY - rect.top
      : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e
      ? e.touches[0].clientX - rect.left
      : e.clientX - rect.left;
    const y = "touches" in e
      ? e.touches[0].clientY - rect.top
      : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();

    if (isEmpty) {
      setIsEmpty(false);
    }
  };

  const stopDrawing = () => {
    // Touch events are handled by the touch-specific handlers
    // Mouse events are now handled by the document-level listeners in useEffect
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and reset to white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setIsEmpty(true);
    onSignatureChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-neutral-700 rounded-lg p-2 bg-white w-fit">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair touch-none block"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          Desenează semnătura ta folosind mouse-ul sau degetul
        </p>
        <button
          type="button"
          onClick={clearCanvas}
          disabled={isEmpty}
          className="text-xs px-3 py-1 rounded border border-neutral-700 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Șterge
        </button>
      </div>
    </div>
  );
}
