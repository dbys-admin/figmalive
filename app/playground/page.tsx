'use client';

import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const Page = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Create the fabric canvas and add text to it
      const canvas = new fabric.Canvas(canvasRef.current);
      const question = new fabric.Text('Hello world!', {
        left: 50,
        top: 50,
        fontSize: 40,
      });
      
      canvas.add(question);
      canvas.centerObject(question);
      canvas.renderAll();
    }
  }, []);

  return (
    <div>
      <h1>Fabric.js Demo</h1>
      <canvas ref={canvasRef} width={800} height={400} />
    </div>
  );
};

export default Page;