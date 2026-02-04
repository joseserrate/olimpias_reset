'use client';

import React, { useEffect, useRef } from 'react';

interface Node3D {
  x: number; // 3D coordinates
  y: number;
  z: number;
  projectedX: number; // 2D screen coordinates
  projectedY: number;
  projectedZ: number; // depth for z-ordering
  activation: number; // 0-1
  connections: number[];
}

export const NeuralNetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node3D[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const rotationRef = useRef(0);
  const wavePhaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};

    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    // Set canvas size
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      initializeSphere();
    };

    // Create sphere with nodes
    const initializeSphere = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const radius = Math.min(width, height) * 0.7; // Large sphere - half visible
      const nodeCount = 180; // More nodes for denser network
      const nodes: Node3D[] = [];

      // Fibonacci sphere distribution for even spacing
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      const angleIncrement = Math.PI * 2 * goldenRatio;

      for (let i = 0; i < nodeCount; i++) {
        const t = i / nodeCount;
        const inclination = Math.acos(1 - 2 * t);
        const azimuth = angleIncrement * i;

        const x = radius * Math.sin(inclination) * Math.cos(azimuth);
        const y = radius * Math.sin(inclination) * Math.sin(azimuth);
        const z = radius * Math.cos(inclination);

        nodes.push({
          x, y, z,
          projectedX: 0,
          projectedY: 0,
          projectedZ: 0,
          activation: 0,
          connections: []
        });
      }

      // Create connections between nearby nodes on sphere
      nodes.forEach((node, i) => {
        nodes.forEach((otherNode, j) => {
          if (i >= j) return;

          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const dz = node.z - otherNode.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < radius * 0.45) { // Tighter connections for denser network
            node.connections.push(j);
            otherNode.connections.push(i);
          }
        });
      });

      nodesRef.current = nodes;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // 3D projection function
    const project = (x: number, y: number, z: number, centerX: number, centerY: number) => {
      const perspective = 800;
      const scale = perspective / (perspective + z);
      
      return {
        x: x * scale + centerX,
        y: y * scale + centerY,
        z: z,
        scale
      };
    };

    // Rotation matrix
    const rotateY = (x: number, y: number, z: number, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: x * cos + z * sin,
        y: y,
        z: -x * sin + z * cos
      };
    };

    const rotateX = (x: number, y: number, z: number, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: x,
        y: y * cos - z * sin,
        z: y * sin + z * cos
      };
    };

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;
      
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const centerX = width * 0.85; // Shift sphere right - left half visible
      const centerY = height * 0.5;
      const nodes = nodesRef.current;

      // Clear canvas completely each frame
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Solid white - no trails
      ctx.fillRect(0, 0, width, height);

      // Update rotation
      rotationRef.current += 0.003;
      wavePhaseRef.current += 0.02;

      // Rotate and project all nodes
      nodes.forEach((node) => {
        // Rotate around Y axis (horizontal spin)
        let rotated = rotateY(node.x, node.y, node.z, rotationRef.current);
        // Slight tilt on X axis for better view
        rotated = rotateX(rotated.x, rotated.y, rotated.z, 0.3);
        
        // Project to 2D
        const projected = project(rotated.x, rotated.y, rotated.z, centerX, centerY);
        node.projectedX = projected.x;
        node.projectedY = projected.y;
        node.projectedZ = projected.z;

        // Calculate activation based on wave passing through
        // Wave moves from left to right across the sphere
        const wavePosition = Math.sin(wavePhaseRef.current);
        const normalizedX = rotated.x / (Math.min(width, height) * 0.7);
        
        // Create wave that sweeps across
        const distanceFromWave = Math.abs(normalizedX - wavePosition);
        const waveWidth = 0.28; // Balanced wave width for clear visibility
        
        if (distanceFromWave < waveWidth) {
          const intensity = 1 - (distanceFromWave / waveWidth);
          node.activation = Math.max(node.activation, intensity * intensity);
        }

        // Decay activation
        node.activation *= 0.92;
      });

      // Sort nodes by depth for proper rendering
      const sortedIndices = nodes
        .map((node, index) => ({ index, z: node.projectedZ }))
        .sort((a, b) => a.z - b.z)
        .map(item => item.index);

      // Draw connections (back to front)
      sortedIndices.forEach(i => {
        const node = nodes[i];
        
        // Only draw connections for nodes facing us
        if (node.projectedZ < 0) {
          node.connections.forEach(j => {
            const target = nodes[j];
            
            // Only draw if target is also visible
            if (target.projectedZ < 0 && i < j) {
              const avgActivation = (node.activation + target.activation) / 2;
              const baseOpacity = 0.096; // Reduced 20% for subtlety
              const activeOpacity = 0.4; // Reduced 20% for subtlety
              const opacity = baseOpacity + avgActivation * activeOpacity;

              // Calculate line width based on activation
              const lineWidth = 0.5 + avgActivation * 1.5;

              ctx.beginPath();
              ctx.moveTo(node.projectedX, node.projectedY);
              ctx.lineTo(target.projectedX, target.projectedY);
              ctx.strokeStyle = `rgba(91, 61, 245, ${opacity})`;
              ctx.lineWidth = lineWidth;
              ctx.stroke();
            }
          });
        }
      });

      // Draw nodes (back to front)
      sortedIndices.forEach(i => {
        const node = nodes[i];
        
        // Only draw nodes facing us
        if (node.projectedZ < 0) {
          const baseSize = 2;
          const activeSize = 4;
          const size = baseSize + node.activation * activeSize;

          // Glow effect when activated
          if (node.activation > 0.3) {
            ctx.beginPath();
            ctx.arc(node.projectedX, node.projectedY, size * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(91, 61, 245, ${node.activation * 0.16})`;
            ctx.fill();
          }

          // Node core
          ctx.beginPath();
          ctx.arc(node.projectedX, node.projectedY, size, 0, Math.PI * 2);
          
          const brightness = 0.4 + node.activation * 0.6;
          ctx.fillStyle = `rgba(${147 * brightness}, ${51 * brightness}, ${234 * brightness}, ${0.56 + node.activation * 0.24})`;
          ctx.fill();

          // Bright center when highly activated
          if (node.activation > 0.6) {
            ctx.beginPath();
            ctx.arc(node.projectedX, node.projectedY, size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${node.activation * 0.64})`;
            ctx.fill();
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute right-0 top-0 bottom-0 w-full md:w-[50%] flex items-center justify-center pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
};
