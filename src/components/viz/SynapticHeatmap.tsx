import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Sparkles } from 'lucide-react';
import type { SynapticWriteStep } from '../../engine/interference';

interface SynapticHeatmapProps {
  matrix: Float32Array;
  dim: number;
  sparsity: number;
  highlightUnit?: number | null;
  writeSteps?: SynapticWriteStep[];
  eta?: number;
  lambdaDecay?: number;
}

export const SynapticHeatmap: React.FC<SynapticHeatmapProps> = ({
  matrix,
  dim,
  sparsity,
  highlightUnit = null,
  writeSteps = [],
  eta = 1.0,
  lambdaDecay = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Animation state
  const hasSteps = writeSteps && writeSteps.length > 0;
  const maxStepIdx = hasSteps ? writeSteps.length - 1 : 0;
  
  // Current playback step index (-1 means showing final matrix)
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(maxStepIdx);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 1x, 2x, 4x

  // Reset to last step when writeSteps changes (e.g. preset changed)
  useEffect(() => {
    if (hasSteps) {
      setCurrentStepIdx(writeSteps.length - 1);
      setIsPlaying(false);
    }
  }, [writeSteps.length, hasSteps]);

  // Active matrix to display (either snapshot at current step or final matrix)
  const activeMatrix = hasSteps && currentStepIdx >= 0 && currentStepIdx <= maxStepIdx
    ? writeSteps[currentStepIdx].matrixSnapshot
    : matrix;

  const prevMatrix = hasSteps && currentStepIdx > 0
    ? writeSteps[currentStepIdx - 1].matrixSnapshot
    : null;

  const currentStepData = hasSteps && currentStepIdx >= 0 && currentStepIdx <= maxStepIdx
    ? writeSteps[currentStepIdx]
    : null;

  // Animation interval loop
  useEffect(() => {
    if (!isPlaying || !hasSteps) return;

    const baseDelay = 350; // ms per step at 1x
    const intervalTime = Math.max(70, baseDelay / speedMultiplier);

    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev >= maxStepIdx) {
          setIsPlaying(false);
          return maxStepIdx;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, maxStepIdx, speedMultiplier, hasSteps]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    if (!hasSteps) return;
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      // If at end, loop back to start
      if (currentStepIdx >= maxStepIdx) {
        setCurrentStepIdx(0);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, currentStepIdx, maxStepIdx, hasSteps]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  }, []);

  const handleStepForward = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIdx((prev) => Math.min(maxStepIdx, prev + 1));
  }, [maxStepIdx]);

  const handleStepBack = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIdx((prev) => Math.max(0, prev - 1));
  }, []);

  const handleJumpToEnd = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIdx(maxStepIdx);
  }, [maxStepIdx]);

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / dim;

    // Find max value in active matrix for normalization
    let maxVal = 0.0001;
    for (let i = 0; i < activeMatrix.length; i++) {
      if (activeMatrix[i] > maxVal) maxVal = activeMatrix[i];
    }

    ctx.clearRect(0, 0, width, height);

    // Draw individual synaptic weights
    for (let i = 0; i < dim; i++) {
      const rowOffset = i * dim;
      for (let j = 0; j < dim; j++) {
        const idx = rowOffset + j;
        const val = activeMatrix[idx];
        const normalized = Math.min(1, Math.max(0, val / maxVal));

        // Check if this synapse was newly updated in this step
        const isNewlyWritten = prevMatrix ? (val > 0.001 && val !== prevMatrix[idx]) : false;

        if (val === 0) {
          ctx.fillStyle = '#0a0f1d'; // dark background for inactive synapse
        } else {
          // Normal active synapse: deep purple to cyan
          const r = Math.round(99 + normalized * (16 - 99));
          const g = Math.round(102 + normalized * (185 - 102));
          const b = Math.round(241 + normalized * (129 - 241));
          const alpha = 0.2 + normalized * 0.8;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        ctx.fillRect(j * cellSize, i * cellSize, Math.max(1, cellSize - 0.2), Math.max(1, cellSize - 0.2));

        // Highlight newly modified outer-product synapses with glowing pulse
        if (isNewlyWritten) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = Math.max(1, cellSize > 8 ? 1.5 : 0.8);
          ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }
    }

    // Highlight row/column if active query is selected
    if (highlightUnit !== null && highlightUnit >= 0 && highlightUnit < dim) {
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, highlightUnit * cellSize, width, cellSize);
    }
  }, [activeMatrix, prevMatrix, dim, highlightUnit]);

  // Compute live active synapse percentage from activeMatrix
  let activeCount = 0;
  for (let i = 0; i < activeMatrix.length; i++) {
    if (activeMatrix[i] > 0.001) activeCount++;
  }
  const activePercent = ((activeCount / (dim * dim)) * 100).toFixed(1);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Heatmap Canvas Container */}
      <div className="relative p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 shadow-2xl flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="rounded-lg cursor-crosshair block"
        />
        <div className="absolute top-4 right-4 bg-slate-900/90 text-[10px] px-2 py-0.5 rounded border border-slate-700 text-indigo-300 font-mono backdrop-blur-sm">
          {dim} &times; {dim} Synapses
        </div>

        {/* Step-by-Step Info Ribbon */}
        {hasSteps && currentStepData && (
          <div className="w-full mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate max-w-[170px]" title={currentStepData.keyLabel}>
                Writing: <strong className="text-white">{currentStepData.keyLabel}</strong>
              </span>
            </div>
            <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded text-[10px]">
              t = {currentStepData.step}/{writeSteps.length}
            </span>
          </div>
        )}
      </div>

      {/* Step-by-Step Animation Controls */}
      {hasSteps && (
        <div className="w-full mt-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Hebbian Write Step: <span className="font-mono text-cyan-300">{currentStepIdx + 1} of {writeSteps.length}</span>
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSpeedMultiplier(spd)}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-all ${
                    speedMultiplier === spd
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Scrubber Range Slider */}
          <input
            type="range"
            min={0}
            max={maxStepIdx}
            value={currentStepIdx}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentStepIdx(Number(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          {/* Playback Control Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Reset to Step 1"
                className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStepBack}
                disabled={currentStepIdx <= 0}
                title="Previous Step"
                className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={togglePlay}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{currentStepIdx >= maxStepIdx ? 'Replay Write' : 'Play Write'}</span>
                  </>
                )}
              </button>
              <button
                onClick={handleStepForward}
                disabled={currentStepIdx >= maxStepIdx}
                title="Next Step"
                className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleJumpToEnd}
              className="text-[10px] px-2 py-1 rounded bg-slate-800/80 text-slate-400 hover:text-white font-mono transition"
            >
              Jump to End
            </button>
          </div>

          {/* Mathematical Rule Display for current step */}
          <div className="text-[10px] bg-slate-950/80 p-2 rounded border border-slate-800/80 font-mono text-slate-400">
            <span className="text-slate-500">// Hebbian Rule at Step {currentStepIdx + 1}:</span><br/>
            <span className="text-indigo-300">
              S_{'{' + (currentStepIdx + 1) + '}'} = {lambdaDecay.toFixed(2)} &middot; S_{'{' + currentStepIdx + '}'} + {eta.toFixed(2)} &middot; (v_{'{' + (currentStepIdx + 1) + '}'} k_{'{' + (currentStepIdx + 1) + '}'}&#7488;)
            </span>
          </div>
        </div>
      )}

      {/* Footer Metrics */}
      <div className="w-full flex justify-between items-center mt-3 text-xs text-slate-400 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Active Synapses: <strong className="text-slate-200 font-mono">{activePercent}%</strong></span>
        </span>
        <span className="text-slate-500 font-mono">Target Sparsity: {(sparsity * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};
