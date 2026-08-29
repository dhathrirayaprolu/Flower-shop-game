import React, { useState, useRef, useEffect } from 'react';
import { PlacedStem, WrapOption, RibbonOption, CardTagOption } from '../types';
import { FLOWERS_BY_ID } from '../data/flowers';
import { UnifiedFlowerPiece } from './UnifiedFlowerPiece';
import { soundManager } from '../audio/soundManager';
import { 
  RotateCw, 
  RotateCcw, 
  Trash2, 
  Layers, 
  FlipHorizontal, 
  Plus, 
  Minus,
  Sparkles,
  RefreshCw,
  Move,
  Maximize2,
  Sliders,
  Crosshair
} from 'lucide-react';

interface BouquetCanvasProps {
  stems: PlacedStem[];
  wrap: WrapOption;
  ribbon: RibbonOption;
  cardTag: CardTagOption | null;
  selectedStemUid?: string | null;
  selectedStemUids?: string[];
  onSelectStem?: (uid: string | null) => void;
  onSelectStems?: (uids: string[]) => void;
  onUpdateStem?: (updated: PlacedStem) => void;
  onUpdateStems?: (updated: PlacedStem[]) => void;
  onRemoveStem?: (uid: string) => void;
  onRemoveStems?: (uids: string[]) => void;
  onDuplicateStem?: (stem: PlacedStem) => void;
  onDuplicateStems?: (stems: PlacedStem[]) => void;
  onMoveStemLayer?: (stemUid: string, direction: 'forward' | 'backward' | 'front' | 'back') => void;
  interactive?: boolean;
  vesselStyle?: 'hand_tied_wrap' | 'vintage_vase';
}

type DragMode = 'move' | 'move-group' | 'scale-corner' | 'rotate-pin' | 'stem-length' | 'blossom-scale' | null;

interface MarqueeBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const BouquetCanvas: React.FC<BouquetCanvasProps> = ({
  stems,
  wrap,
  ribbon,
  cardTag,
  selectedStemUid,
  selectedStemUids,
  onSelectStem,
  onSelectStems,
  onUpdateStem,
  onUpdateStems,
  onRemoveStem,
  onRemoveStems,
  onDuplicateStem,
  onDuplicateStems,
  onMoveStemLayer,
  interactive = false,
  vesselStyle = 'hand_tied_wrap',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Dragging state
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [activeStemUid, setActiveStemUid] = useState<string | null>(null);
  const [dragStartMouse, setDragStartMouse] = useState<{ x: number; y: number } | null>(null);
  const [initialStemState, setInitialStemState] = useState<PlacedStem | null>(null);
  const [initialGroupStems, setInitialGroupStems] = useState<PlacedStem[]>([]);
  const [activeHandleCorner, setActiveHandleCorner] = useState<'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const hasMovedRef = useRef<boolean>(false);

  // Marquee selection state
  const [marquee, setMarquee] = useState<MarqueeBox | null>(null);
  const isMarqueeActiveRef = useRef<boolean>(false);

  // Unified list of selected UIDs
  const currentSelectedUids: string[] = React.useMemo(() => {
    if (selectedStemUids && selectedStemUids.length > 0) return selectedStemUids;
    if (selectedStemUid) return [selectedStemUid];
    return [];
  }, [selectedStemUids, selectedStemUid]);

  const updateSelectedUids = (uids: string[]) => {
    if (onSelectStems) {
      onSelectStems(uids);
    } else if (onSelectStem) {
      onSelectStem(uids.length === 1 ? uids[0] : (uids.length > 0 ? uids[0] : null));
    }
  };

  // Handle pointer down on a flower stem
  const handlePointerDownStem = (e: React.PointerEvent, stem: PlacedStem) => {
    if (!interactive) return;
    e.stopPropagation();

    const isShiftKey = e.shiftKey;
    const isAlreadySelected = currentSelectedUids.includes(stem.uid);

    let nextSelected: string[];
    if (isShiftKey) {
      // Toggle selection in multi-select
      if (isAlreadySelected) {
        nextSelected = currentSelectedUids.filter(id => id !== stem.uid);
      } else {
        nextSelected = [...currentSelectedUids, stem.uid];
      }
      updateSelectedUids(nextSelected);
    } else {
      if (!isAlreadySelected) {
        // Clicking unselected flower -> select only this one
        nextSelected = [stem.uid];
        updateSelectedUids(nextSelected);
      } else {
        // Clicking an already-selected flower -> KEEP all selected so user can drag all together
        nextSelected = currentSelectedUids;
      }
    }

    hasMovedRef.current = false;
    setActiveStemUid(stem.uid);
    setDragStartMouse({ x: e.clientX, y: e.clientY });

    if (nextSelected.length > 1 && nextSelected.includes(stem.uid)) {
      setDragMode('move-group');
      const groupStems = stems.filter(s => nextSelected.includes(s.uid));
      setInitialGroupStems(groupStems.map(s => ({ ...s })));
    } else {
      setDragMode('move');
      setInitialStemState({ ...stem });
    }

    try {
      containerRef.current?.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Corner handle resizing (for single selected stem)
  const handlePointerDownCornerHandle = (e: React.PointerEvent, stem: PlacedStem, corner: 'tl' | 'tr' | 'bl' | 'br') => {
    if (!interactive) return;
    e.stopPropagation();

    setDragMode('scale-corner');
    setActiveStemUid(stem.uid);
    setActiveHandleCorner(corner);
    setDragStartMouse({ x: e.clientX, y: e.clientY });
    setInitialStemState({ ...stem });

    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Top rotation pin handle
  const handlePointerDownRotatePin = (e: React.PointerEvent, stem: PlacedStem) => {
    if (!interactive) return;
    e.stopPropagation();

    setDragMode('rotate-pin');
    setActiveStemUid(stem.uid);
    setDragStartMouse({ x: e.clientX, y: e.clientY });
    setInitialStemState({ ...stem });

    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Stem length handle
  const handlePointerDownStemLengthHandle = (e: React.PointerEvent, stem: PlacedStem) => {
    if (!interactive) return;
    e.stopPropagation();

    setDragMode('stem-length');
    setActiveStemUid(stem.uid);
    setDragStartMouse({ x: e.clientX, y: e.clientY });
    setInitialStemState({ ...stem });

    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Pointer down on canvas background -> start marquee or prepare deselect
  const handleContainerPointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    const target = e.target as HTMLElement;
    // If click was on a button or toolbar or active stem, don't start canvas marquee
    if (target.closest('button') || target.closest('[data-stem-interactive="true"]')) {
      return;
    }

    isMarqueeActiveRef.current = true;
    hasMovedRef.current = false;
    setMarquee({
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });

    try {
      containerRef.current?.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Global pointer move on container
  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. Handle marquee selection dragging
    if (isMarqueeActiveRef.current && marquee) {
      const currentX = e.clientX;
      const currentY = e.clientY;
      setMarquee(prev => (prev ? { ...prev, currentX, currentY } : null));

      const dx = Math.abs(currentX - marquee.startX);
      const dy = Math.abs(currentY - marquee.startY);

      if (dx > 4 || dy > 4) {
        hasMovedRef.current = true;
        const minX = Math.min(marquee.startX, currentX);
        const maxX = Math.max(marquee.startX, currentX);
        const minY = Math.min(marquee.startY, currentY);
        const maxY = Math.max(marquee.startY, currentY);

        const enclosedUids: string[] = [];
        stems.forEach(stem => {
          const el = document.getElementById(`bouquet-stem-${stem.uid}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            // Check intersection between element rect and marquee rect
            const intersects = !(rect.right < minX || rect.left > maxX || rect.bottom < minY || rect.top > maxY);
            if (intersects) {
              enclosedUids.push(stem.uid);
            }
          }
        });

        updateSelectedUids(enclosedUids);
      }
      return;
    }

    // 2. Handle group dragging (multi-selection)
    if (dragMode === 'move-group' && dragStartMouse && initialGroupStems.length > 0) {
      const dx = e.clientX - dragStartMouse.x;
      const dy = e.clientY - dragStartMouse.y;

      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        hasMovedRef.current = true;
      }

      const updatedStems = initialGroupStems.map(stem => ({
        ...stem,
        x: Math.max(-280, Math.min(280, Math.round(stem.x + dx))),
        y: Math.max(-260, Math.min(160, Math.round(stem.y + dy))),
      }));

      if (onUpdateStems) {
        onUpdateStems(updatedStems);
      } else if (onUpdateStem) {
        updatedStems.forEach(s => onUpdateStem(s));
      }
      return;
    }

    // 3. Handle single stem transformation
    if (!dragMode || !activeStemUid || !dragStartMouse || !initialStemState || !onUpdateStem) return;

    const dx = e.clientX - dragStartMouse.x;
    const dy = e.clientY - dragStartMouse.y;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      hasMovedRef.current = true;
    }

    if (dragMode === 'move') {
      const newX = Math.max(-280, Math.min(280, Math.round(initialStemState.x + dx)));
      const newY = Math.max(-260, Math.min(160, Math.round(initialStemState.y + dy)));
      onUpdateStem({
        ...initialStemState,
        x: newX,
        y: newY,
      });
    } else if (dragMode === 'scale-corner') {
      const dist = (activeHandleCorner === 'br' || activeHandleCorner === 'tr') ? (dx + dy * -0.5) : (-dx + dy * -0.5);
      const scaleDelta = dist * 0.008;
      const newScale = Math.max(0.45, Math.min(2.2, Math.round((initialStemState.scale + scaleDelta) * 100) / 100));
      onUpdateStem({
        ...initialStemState,
        scale: newScale,
      });
    } else if (dragMode === 'rotate-pin') {
      const rotDelta = dx * 0.8;
      const newRot = Math.round(initialStemState.rotation + rotDelta);
      onUpdateStem({
        ...initialStemState,
        rotation: newRot,
      });
    } else if (dragMode === 'stem-length') {
      const currentStemLen = initialStemState.stemLength ?? 1.0;
      const lenDelta = dy * 0.01;
      const newStemLen = Math.max(0.4, Math.min(2.2, Math.round((currentStemLen + lenDelta) * 100) / 100));
      onUpdateStem({
        ...initialStemState,
        stemLength: newStemLen,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // Finalize marquee
    if (isMarqueeActiveRef.current) {
      isMarqueeActiveRef.current = false;
      const hadMovement = hasMovedRef.current;
      setMarquee(null);
      hasMovedRef.current = false;

      try {
        containerRef.current?.releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }

      // If user simply clicked on empty background without dragging, deselect all
      if (!hadMovement) {
        updateSelectedUids([]);
      }
      return;
    }

    if (dragMode) {
      setDragMode(null);
      setActiveStemUid(null);
      setDragStartMouse(null);
      setInitialStemState(null);
      setInitialGroupStems([]);
      setActiveHandleCorner(null);
      hasMovedRef.current = false;
      try {
        containerRef.current?.releasePointerCapture?.(e.pointerId);
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Keyboard shortcuts: Ctrl+A / Cmd+A, Escape, Delete
  React.useEffect(() => {
    if (!interactive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      // Ctrl/Cmd + A -> Select all flowers
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        if (stems.length > 0) {
          e.preventDefault();
          updateSelectedUids(stems.map(s => s.uid));
        }
      }

      // Escape -> Deselect all
      if (e.key === 'Escape') {
        if (currentSelectedUids.length > 0) {
          e.preventDefault();
          updateSelectedUids([]);
        }
      }

      // Delete or Backspace -> Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (currentSelectedUids.length > 0) {
          e.preventDefault();
          handleBatchDelete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactive, stems, currentSelectedUids]);

  // Batch action handlers for multi-selection
  const handleBatchRotate = (deltaDeg: number) => {
    soundManager.playPaperRustle();
    const updated = stems
      .filter(s => currentSelectedUids.includes(s.uid))
      .map(s => ({ ...s, rotation: Math.round(s.rotation + deltaDeg) }));

    if (onUpdateStems) {
      onUpdateStems(updated);
    } else if (onUpdateStem) {
      updated.forEach(s => onUpdateStem(s));
    }
  };

  const handleBatchScale = (deltaScale: number) => {
    soundManager.playPaperRustle();
    const updated = stems
      .filter(s => currentSelectedUids.includes(s.uid))
      .map(s => ({ ...s, scale: Math.max(0.45, Math.min(2.2, Math.round((s.scale + deltaScale) * 100) / 100)) }));

    if (onUpdateStems) {
      onUpdateStems(updated);
    } else if (onUpdateStem) {
      updated.forEach(s => onUpdateStem(s));
    }
  };

  const handleBatchCenter = () => {
    soundManager.playPaperRustle();
    const selectedStems = stems.filter(s => currentSelectedUids.includes(s.uid));
    if (selectedStems.length === 0) return;
    
    // Calculate centroid of selected stems and center on canvas
    const avgX = selectedStems.reduce((sum, s) => sum + s.x, 0) / selectedStems.length;
    const avgY = selectedStems.reduce((sum, s) => sum + s.y, 0) / selectedStems.length;
    const offsetX = 0 - avgX;
    const offsetY = -20 - avgY;

    const updated = selectedStems.map(s => ({
      ...s,
      x: Math.round(s.x + offsetX),
      y: Math.round(s.y + offsetY),
    }));

    if (onUpdateStems) {
      onUpdateStems(updated);
    } else if (onUpdateStem) {
      updated.forEach(s => onUpdateStem(s));
    }
  };

  const handleBatchDuplicate = () => {
    soundManager.playSnip();
    const selectedStems = stems.filter(s => currentSelectedUids.includes(s.uid));
    if (selectedStems.length === 0) return;

    if (onDuplicateStems) {
      onDuplicateStems(selectedStems);
    } else if (onDuplicateStem) {
      selectedStems.forEach(s => onDuplicateStem(s));
    }
  };

  const handleBatchDelete = () => {
    soundManager.playSnip();
    if (onRemoveStems) {
      onRemoveStems(currentSelectedUids);
    } else if (onRemoveStem) {
      currentSelectedUids.forEach(uid => onRemoveStem(uid));
    }
    updateSelectedUids([]);
  };

  const handleSelectAll = () => {
    soundManager.playPaperRustle();
    updateSelectedUids(stems.map(s => s.uid));
  };

  const selectedStem = currentSelectedUids.length === 1 ? stems.find(s => s.uid === currentSelectedUids[0]) : null;

  // Marquee overlay geometry
  const containerRect = containerRef.current?.getBoundingClientRect();
  const marqueeStyle = marquee && containerRect ? {
    left: Math.min(marquee.startX, marquee.currentX) - containerRect.left,
    top: Math.min(marquee.startY, marquee.currentY) - containerRect.top,
    width: Math.abs(marquee.currentX - marquee.startX),
    height: Math.abs(marquee.currentY - marquee.startY),
  } : null;

  return (
    <div
      ref={containerRef}
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-full h-[380px] sm:h-[450px] md:h-[500px] bg-[#f8f5ef] bg-[radial-gradient(#e6dfd3_1.2px,transparent_1.2px)] [background-size:24px_24px] rounded-3xl border border-[#e8e2d8] flex items-center justify-center overflow-hidden shadow-inner select-none transition-all cursor-default isolate"
    >
      {/* Studio Lighting Ambient Glow */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/70 via-transparent to-black/5 pointer-events-none" 
      />

      {/* Crafting Grid Center Alignment Guide */}
      {interactive && stems.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[1px] h-72 bg-[#8ca68e] border-dashed border-l border-[#8ca68e]" />
          <div className="absolute w-72 h-[1px] bg-[#8ca68e] border-dashed border-t border-[#8ca68e] translate-y-16" />
        </div>
      )}

      {/* TOP CANVAS QUICK SELECTION BAR */}
      {interactive && stems.length > 0 && (
        <div 
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none"
        >
          {/* Left: Selection Controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {currentSelectedUids.length === stems.length ? (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  updateSelectedUids([]);
                }}
                title="Deselect all (Esc)"
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-700 text-white rounded-full text-[11px] font-bold shadow-xs hover:bg-emerald-800 active:scale-95 transition-all cursor-pointer"
              >
                <span>✓ All {stems.length} Flowers Selected</span>
                <span className="opacity-75 text-[9px]">✕</span>
              </button>
            ) : (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAll();
                }}
                title="Select all flowers on canvas (Ctrl+A / ⌘A)"
                className="flex items-center gap-1.5 px-3 py-1 bg-white/95 hover:bg-white text-[#4a4238] rounded-full border border-[#d6cfc5] text-[11px] font-bold shadow-2xs hover:border-[#8ca68e] active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#8ca68e]" />
                <span>Select All ({stems.length})</span>
              </button>
            )}

            {currentSelectedUids.length > 0 && currentSelectedUids.length < stems.length && (
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#e8e2d8] text-[11px] text-[#5c544b] shadow-2xs">
                <span className="font-bold text-emerald-800">{currentSelectedUids.length} selected</span>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateSelectedUids([]);
                  }}
                  title="Deselect"
                  className="p-0.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Right: Helpful hint */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-xs rounded-full border border-[#e8e2d8] text-[10.5px] text-[#78716c] shadow-2xs">
            <span>Drag box to select • Drag any selected to move together</span>
          </div>
        </div>
      )}

      {/* MARQUEE DRAG SELECTION RECTANGLE */}
      {marqueeStyle && marqueeStyle.width > 2 && marqueeStyle.height > 2 && (
        <div
          style={{
            position: 'absolute',
            left: `${marqueeStyle.left}px`,
            top: `${marqueeStyle.top}px`,
            width: `${marqueeStyle.width}px`,
            height: `${marqueeStyle.height}px`,
            zIndex: 45,
          }}
          className="border-2 border-emerald-500/80 bg-emerald-500/15 border-dashed rounded-lg pointer-events-none backdrop-blur-[0.5px]"
        />
      )}

      {/* EMPTY CANVAS STATE HELPER */}
      {stems.length === 0 && (
        <div className="text-center p-6 max-w-sm text-[#a69d91] z-10 space-y-2 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-[#8ca68e]/15 border border-[#8ca68e]/30 flex items-center justify-center mx-auto text-[#6d7a6e]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-lg text-[#4a4238] font-bold">
            Your Artisan Crafting Canvas
          </h4>
          <p className="text-xs text-[#78716c] leading-relaxed">
            Click any flower from your inventory on the right. Drag a box over multiple flowers to select and move them together!
          </p>
        </div>
      )}

      {/* 1. BACK WRAPPING PAPER BACKDROP LAYER */}
      {stems.length > 0 && vesselStyle === 'hand_tied_wrap' && (
        <div className="absolute bottom-6 z-0 pointer-events-none flex flex-col items-center drop-shadow-xs">
          <svg viewBox="0 0 280 240" className="w-68 h-60 overflow-visible">
            {/* Back Paper Fan / Collar backdrop */}
            <path
              d="M 25 15 Q 140 -25 255 15 L 175 175 Q 140 190 105 175 Z"
              fill={wrap.color}
              opacity="0.5"
              stroke="#4a4238"
              strokeWidth="0.8"
            />
            {/* Soft crinkle texture lines */}
            <path d="M 45 40 Q 140 15 235 40" stroke="#ffffff" strokeWidth="1" opacity="0.35" fill="none" />
            <path d="M 75 80 Q 140 55 205 80" stroke="#ffffff" strokeWidth="1" opacity="0.25" fill="none" />
          </svg>
        </div>
      )}

      {/* 2. UNIFIED FLOWER PIECES (FLOWER + STEM + LEAVES AS ONE PIECE) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {stems
          .slice()
          .sort((a, b) => a.layer - b.layer)
          .map((stem) => {
            const flower = FLOWERS_BY_ID[stem.flowerId];
            if (!flower) return null;
            const isSingleSelected = selectedStem?.uid === stem.uid;
            const isMultiSelected = currentSelectedUids.includes(stem.uid);
            const isDraggingThis = activeStemUid === stem.uid || (dragMode === 'move-group' && isMultiSelected);

            const scale = stem.scale || 1.0;
            const stemLength = stem.stemLength ?? 1.0;
            const flowerScale = stem.flowerScale ?? 1.0;
            const stemCurve = stem.stemCurve ?? 0;
            const isFlipped = !!stem.flipped;

            // Bounding box dimensions for realistic unified piece
            const baseW = 120;
            const baseH = 200;

            const currentLayerIdx = stems.slice().sort((a, b) => a.layer - b.layer).findIndex(s => s.uid === stem.uid);

            return (
              <div
                key={stem.uid}
                id={`bouquet-stem-${stem.uid}`}
                data-stem-interactive="true"
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: `${baseW}px`,
                  height: `${baseH}px`,
                  marginLeft: `-${baseW / 2}px`,
                  marginTop: `-${baseH / 2}px`,
                  transform: `translate(${stem.x}px, ${stem.y}px) rotate(${stem.rotation}deg) scale(${scale}) scaleX(${isFlipped ? -1 : 1})`,
                  transformOrigin: '50% 60%',
                  zIndex: isDraggingThis ? 40 : Math.max(1, currentLayerIdx + 5),
                  cursor: isDraggingThis ? 'grabbing' : 'grab',
                }}
                onPointerDown={(e) => handlePointerDownStem(e, stem)}
                className="group select-none pointer-events-auto"
              >
                {/* UNIFIED BOTANICAL FLOWER PIECE */}
                <div className="w-full h-full relative">
                  <UnifiedFlowerPiece
                    flower={flower}
                    stemLength={stemLength}
                    flowerScale={flowerScale}
                    stemCurve={stemCurve}
                    isSelected={isMultiSelected}
                  />

                  {/* MULTI-SELECT BADGE / BORDER */}
                  {isMultiSelected && currentSelectedUids.length > 1 && interactive && (
                    <div
                      className="absolute inset-0 border-2 border-dashed border-emerald-500 rounded-xl bg-emerald-500/10 pointer-events-none"
                      style={{
                        boxShadow: '0 0 0 1px rgba(255,255,255,0.8), 0 2px 8px rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-600 rounded-full border border-white" />
                    </div>
                  )}

                  {/* SINGLE PIECE TRANSFORM BOUNDING BOX */}
                  {isSingleSelected && currentSelectedUids.length === 1 && interactive && (
                    <div
                      className="absolute inset-0 border-2 border-emerald-600/90 rounded-xl bg-emerald-500/5 pointer-events-none"
                      style={{
                        boxShadow: '0 0 0 1px rgba(255,255,255,0.8), 0 4px 12px rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      {/* Top-Left Corner Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDownCornerHandle(e, stem, 'tl')}
                        title="Drag to resize flower piece"
                        style={{ transform: `scaleX(${isFlipped ? -1 : 1})` }}
                        className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-xs shadow-md pointer-events-auto cursor-nwse-resize hover:scale-125 transition-transform flex items-center justify-center"
                      >
                        <div className="w-1 h-1 bg-emerald-600 rounded-full" />
                      </div>

                      {/* Top-Right Corner Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDownCornerHandle(e, stem, 'tr')}
                        title="Drag to resize flower piece"
                        style={{ transform: `scaleX(${isFlipped ? -1 : 1})` }}
                        className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-xs shadow-md pointer-events-auto cursor-nesw-resize hover:scale-125 transition-transform flex items-center justify-center"
                      >
                        <div className="w-1 h-1 bg-emerald-600 rounded-full" />
                      </div>

                      {/* Bottom-Left Corner Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDownCornerHandle(e, stem, 'bl')}
                        title="Drag to resize flower piece"
                        style={{ transform: `scaleX(${isFlipped ? -1 : 1})` }}
                        className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-xs shadow-md pointer-events-auto cursor-nesw-resize hover:scale-125 transition-transform flex items-center justify-center"
                      >
                        <div className="w-1 h-1 bg-emerald-600 rounded-full" />
                      </div>

                      {/* Bottom-Right Corner Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDownCornerHandle(e, stem, 'br')}
                        title="Drag to resize flower piece"
                        style={{ transform: `scaleX(${isFlipped ? -1 : 1})` }}
                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-xs shadow-md pointer-events-auto cursor-nwse-resize hover:scale-125 transition-transform flex items-center justify-center"
                      >
                        <div className="w-1 h-1 bg-emerald-600 rounded-full" />
                      </div>

                      {/* --- TOP ROTATION PIN HANDLE (Drag to rotate) --- */}
                      <div
                        style={{ transform: `scaleX(${isFlipped ? -1 : 1})` }}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto"
                      >
                        <div
                          onPointerDown={(e) => handlePointerDownRotatePin(e, stem)}
                          title="Drag to rotate flower angle"
                          className="w-5 h-5 bg-emerald-600 text-white rounded-full shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                        >
                          <RotateCw className="w-2.5 h-2.5" />
                        </div>
                        <div className="w-0.5 h-2.5 bg-emerald-600" />
                      </div>

                      {/* --- BOTTOM STEM LENGTH HANDLE (Drag to lengthen / trim stem) --- */}
                      <div
                        style={{ transform: `scaleX(${isFlipped ? -1 : 1})` }}
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto"
                      >
                        <div
                          onPointerDown={(e) => handlePointerDownStemLengthHandle(e, stem)}
                          title="Drag down to lengthen stem, drag up to trim"
                          className="px-2 py-0.5 bg-white border border-emerald-600 text-emerald-800 rounded-full shadow-xs text-[9px] font-bold cursor-ns-resize hover:bg-emerald-50 active:scale-95 transition-transform flex items-center gap-0.5"
                        >
                          <span>Stem</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hover indicator for non-selected pieces */}
                  {!isMultiSelected && interactive && (
                    <div className="absolute inset-0 rounded-xl border border-dashed border-[#8ca68e]/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* 3. FOREGROUND WRAPPING PAPER CONE / VINTAGE VASE LAYER */}
      {stems.length > 0 && (
        <div className="absolute bottom-4 z-30 pointer-events-none flex flex-col items-center">
          {vesselStyle === 'hand_tied_wrap' ? (
            <svg viewBox="0 0 240 180" className="w-56 h-48 drop-shadow-md overflow-visible">
              {/* Kraft / Linen Conical Front Fold */}
              <path
                d="M 25 15 L 120 145 L 215 15 Q 170 38 120 22 Q 70 38 25 15 Z"
                fill={wrap.color}
                stroke="#4a4238"
                strokeWidth="1.2"
                opacity="0.95"
              />

              {/* Left wrap fold flap with realistic shading */}
              <path
                d="M 25 15 L 120 145 L 105 22 Z"
                fill={wrap.color}
                stroke="#4a4238"
                strokeWidth="0.8"
                opacity="0.65"
              />

              {/* Right wrap fold flap overlapping */}
              <path
                d="M 215 15 L 120 145 L 135 22 Z"
                fill={wrap.color}
                stroke="#4a4238"
                strokeWidth="0.8"
                opacity="0.85"
              />

              {/* Pattern Texture Details */}
              {wrap.pattern === 'newspaper' && (
                <g opacity="0.35" stroke="#4a4238" strokeWidth="0.8">
                  <line x1="55" y1="45" x2="95" y2="45" />
                  <line x1="55" y1="53" x2="98" y2="53" />
                  <line x1="55" y1="61" x2="90" y2="61" />
                  <line x1="140" y1="45" x2="180" y2="45" />
                  <line x1="138" y1="53" x2="180" y2="53" />
                  <line x1="142" y1="61" x2="175" y2="61" />
                </g>
              )}

              {wrap.pattern === 'sage_linen' && (
                <g opacity="0.25" stroke="#14532d" strokeWidth="0.6">
                  <line x1="50" y1="35" x2="110" y2="95" />
                  <line x1="130" y1="95" x2="190" y2="35" />
                  <line x1="70" y1="30" x2="130" y2="90" />
                </g>
              )}

              {/* RIBBON & FLOWING BOW TIED AT THE WAIST */}
              <g transform="translate(120, 100)">
                {/* Left bow loop */}
                <ellipse
                  cx="-20"
                  cy="-6"
                  rx="15"
                  ry="9"
                  fill={ribbon.color}
                  stroke="#4a4238"
                  strokeWidth="1"
                  transform="rotate(-18)"
                />
                {/* Left inner shadow */}
                <ellipse
                  cx="-20"
                  cy="-6"
                  rx="8"
                  ry="4"
                  fill="#000000"
                  opacity="0.15"
                  transform="rotate(-18)"
                />

                {/* Right bow loop */}
                <ellipse
                  cx="20"
                  cy="-6"
                  rx="15"
                  ry="9"
                  fill={ribbon.color}
                  stroke="#4a4238"
                  strokeWidth="1"
                  transform="rotate(18)"
                />
                {/* Right inner shadow */}
                <ellipse
                  cx="20"
                  cy="-6"
                  rx="8"
                  ry="4"
                  fill="#000000"
                  opacity="0.15"
                  transform="rotate(18)"
                />

                {/* Knot Center with highlight */}
                <circle
                  cx="0"
                  cy="-4"
                  r="7"
                  fill={ribbon.color}
                  stroke="#383129"
                  strokeWidth="1.2"
                />
                <circle cx="-2" cy="-6" r="2" fill="#ffffff" opacity="0.4" />

                {/* Left draped ribbon tail */}
                <path
                  d="M -5 2 Q -18 28 -24 44 Q -14 36 -3 10 Z"
                  fill={ribbon.color}
                  stroke="#4a4238"
                  strokeWidth="0.8"
                />

                {/* Right draped ribbon tail */}
                <path
                  d="M 5 2 Q 18 28 24 44 Q 14 36 3 10 Z"
                  fill={ribbon.color}
                  stroke="#4a4238"
                  strokeWidth="0.8"
                />
              </g>

              {/* ATTACHED ARTISAN GIFT TAG (Clean, properly dimensioned & highly readable) */}
              {cardTag && (
                <g transform="translate(136, 96) rotate(8)">
                  {/* Natural Twine string hanging from bouquet bow */}
                  <path
                    d="M -18 -8 Q -8 4 6 12"
                    fill="none"
                    stroke="#785c40"
                    strokeWidth="1.4"
                    strokeDasharray="2,1.5"
                  />
                  {/* Gift Tag Card Body (Generously sized for clear typography) */}
                  <rect
                    x="0"
                    y="0"
                    width="86"
                    height="48"
                    rx="6"
                    fill="#fffefb"
                    stroke="#7b947d"
                    strokeWidth="1.2"
                    className="drop-shadow-md"
                  />
                  {/* Golden brass eyelet ring */}
                  <circle cx="8" cy="8" r="3.2" fill="#d97706" />
                  <circle cx="8" cy="8" r="1.6" fill="#4a4238" />

                  {/* Tag Header Title */}
                  <text
                    x="16"
                    y="13"
                    fill="#2d2822"
                    className="text-[8.5px] font-serif font-extrabold select-none tracking-tight"
                  >
                    {cardTag.icon} {cardTag.title.slice(0, 16)}
                  </text>

                  {/* Tag Message Note Text - Multi-line formatted for optimal legibility */}
                  <foreignObject x="5" y="16" width="76" height="28">
                    <div className="w-full h-full flex flex-col justify-start overflow-hidden leading-tight p-0.5">
                      <p 
                        style={{
                          fontSize: '6.5px',
                          lineHeight: '1.25',
                          fontFamily: 'Georgia, serif',
                          color: '#4a3e35',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word'
                        }}
                        className="italic select-none"
                      >
                        "{cardTag.note.slice(0, 55)}"
                      </p>
                    </div>
                  </foreignObject>
                </g>
              )}
            </svg>
          ) : (
            /* Vintage Ceramic Pitcher / Table Vase Option with decorative glazing */
            <svg viewBox="0 0 240 200" className="w-60 h-52 drop-shadow-lg overflow-visible">
              {/* Vase body */}
              <path
                d="M 80 25 L 160 25 L 175 140 Q 175 170 120 170 Q 65 170 65 140 Z"
                fill="#fcf8f2"
                stroke="#5c4a3d"
                strokeWidth="1.8"
              />
              {/* Vase Rim */}
              <ellipse cx="120" cy="25" rx="40" ry="10" fill="#ede3d5" stroke="#5c4a3d" strokeWidth="1.4" />
              {/* Gloss highlight */}
              <path
                d="M 85 45 Q 75 100 85 145"
                stroke="#ffffff"
                strokeWidth="3.5"
                opacity="0.6"
                strokeLinecap="round"
                fill="none"
              />

              {/* Hand-painted Botanical Glaze Emblem */}
              <circle cx="120" cy="100" r="22" fill="#8ca68e" opacity="0.2" />
              <path d="M 120 85 Q 110 100 120 115 Q 130 100 120 85" fill="#6d856f" />
              <circle cx="120" cy="98" r="4" fill="#d97706" />

              {/* Tied neck ribbon on vase */}
              <ellipse cx="120" cy="38" rx="34" ry="5" fill={ribbon.color} stroke="#4a4238" strokeWidth="0.8" />
              <g transform="translate(120, 42)">
                <ellipse cx="-10" cy="2" rx="8" ry="4" fill={ribbon.color} stroke="#4a4238" strokeWidth="0.8" transform="rotate(-15)" />
                <ellipse cx="10" cy="2" rx="8" ry="4" fill={ribbon.color} stroke="#4a4238" strokeWidth="0.8" transform="rotate(15)" />
                <circle cx="0" cy="2" r="3" fill={ribbon.color} stroke="#4a4238" strokeWidth="0.8" />
              </g>

              {/* Attached Gift Tag on Vase */}
              {cardTag && (
                <g transform="translate(138, 42) rotate(10)">
                  <line x1="-14" y1="-4" x2="4" y2="8" stroke="#785c40" strokeWidth="1.2" strokeDasharray="2,1.5" />
                  <rect x="0" y="0" width="82" height="46" rx="5" fill="#fffefb" stroke="#7b947d" strokeWidth="1.2" className="drop-shadow-md" />
                  <circle cx="8" cy="8" r="2.8" fill="#d97706" />
                  <circle cx="8" cy="8" r="1.4" fill="#4a4238" />
                  <text x="15" y="12" fill="#2d2822" className="text-[8px] font-serif font-extrabold select-none">
                    {cardTag.icon} {cardTag.title.slice(0, 16)}
                  </text>
                  <foreignObject x="5" y="15" width="72" height="26">
                    <div className="w-full h-full flex flex-col justify-start overflow-hidden leading-tight p-0.5">
                      <p 
                        style={{
                          fontSize: '6px',
                          lineHeight: '1.25',
                          fontFamily: 'Georgia, serif',
                          color: '#4a3e35',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word'
                        }}
                        className="italic select-none"
                      >
                        "{cardTag.note.slice(0, 55)}"
                      </p>
                    </div>
                  </foreignObject>
                </g>
              )}
            </svg>
          )}
        </div>
      )}

      {/* 4. FLOATING QUICK-ACTION TOOLBAR FOR SINGLE SELECTED FLOWER */}
      {interactive && currentSelectedUids.length === 1 && selectedStem && onUpdateStem && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full border border-[#8ca68e] shadow-lg flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-[#4a4238] animate-in fade-in zoom-in duration-150"
        >
          {/* Flower Identity Tag */}
          <div className="flex items-center gap-1.5 px-2 border-r border-[#e8e2d8]">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: FLOWERS_BY_ID[selectedStem.flowerId]?.color || '#8ca68e' }}
            />
            <span className="font-bold text-[#4a4238] max-w-[90px] truncate">
              {FLOWERS_BY_ID[selectedStem.flowerId]?.name}
            </span>
          </div>

          {/* Rotate Left 15 deg */}
          <button
            onClick={() => {
              soundManager.playSnip();
              onUpdateStem({ ...selectedStem, rotation: selectedStem.rotation - 15 });
            }}
            title="Rotate Left (15°)"
            className="p-1.5 rounded-full hover:bg-[#f4f1eb] text-[#5c544b] active:scale-90 transition-transform"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Rotate Right 15 deg */}
          <button
            onClick={() => {
              soundManager.playSnip();
              onUpdateStem({ ...selectedStem, rotation: selectedStem.rotation + 15 });
            }}
            title="Rotate Right (15°)"
            className="p-1.5 rounded-full hover:bg-[#f4f1eb] text-[#5c544b] active:scale-90 transition-transform"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Scale Down Piece */}
          <button
            onClick={() => {
              const newScale = Math.max(0.5, Math.round((selectedStem.scale - 0.1) * 10) / 10);
              onUpdateStem({ ...selectedStem, scale: newScale });
            }}
            title="Scale Piece Smaller"
            className="p-1.5 rounded-full hover:bg-[#f4f1eb] text-[#5c544b] active:scale-90 transition-transform"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Scale Up Piece */}
          <button
            onClick={() => {
              const newScale = Math.min(2.0, Math.round((selectedStem.scale + 0.1) * 10) / 10);
              onUpdateStem({ ...selectedStem, scale: newScale });
            }}
            title="Scale Piece Larger"
            className="p-1.5 rounded-full hover:bg-[#f4f1eb] text-[#5c544b] active:scale-90 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Flip Horizontal */}
          <button
            onClick={() => {
              soundManager.playSnip();
              onUpdateStem({ ...selectedStem, flipped: !selectedStem.flipped });
            }}
            title="Flip Horizontal (Mirror)"
            className={`p-1.5 rounded-full text-[#5c544b] active:scale-90 transition-transform ${
              selectedStem.flipped ? 'bg-[#8ca68e]/20 text-[#6d7a6e]' : 'hover:bg-[#f4f1eb]'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Layer Controls */}
          <div className="flex items-center gap-0.5 px-1 bg-[#f4f1eb] rounded-full border border-[#e8e2d8]">
            <button
              onClick={() => {
                soundManager.playPaperRustle();
                if (onMoveStemLayer) {
                  onMoveStemLayer(selectedStem.uid, 'backward');
                } else {
                  onUpdateStem({ ...selectedStem, layer: Math.max(0, selectedStem.layer - 1) });
                }
              }}
              title="Send Layer Backward (Behind other flowers)"
              className="p-1.5 rounded-full hover:bg-white text-[#5c544b] active:scale-90 transition-transform"
            >
              <Layers className="w-3.5 h-3.5 rotate-180" />
            </button>

            <span className="text-[10px] font-bold text-[#6d7a6e] px-1 select-none">
              {(stems.slice().sort((a, b) => a.layer - b.layer).findIndex(s => s.uid === selectedStem.uid) + 1)}/{stems.length}
            </span>

            <button
              onClick={() => {
                soundManager.playPaperRustle();
                if (onMoveStemLayer) {
                  onMoveStemLayer(selectedStem.uid, 'forward');
                } else {
                  onUpdateStem({ ...selectedStem, layer: selectedStem.layer + 1 });
                }
              }}
              title="Bring Layer Forward (In front of other flowers)"
              className="p-1.5 rounded-full hover:bg-white text-[#5c544b] active:scale-90 transition-transform"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Duplicate Stem */}
          {onDuplicateStem && (
            <button
              onClick={() => onDuplicateStem(selectedStem)}
              title="Duplicate Stem"
              className="px-2 py-1 rounded-full bg-[#f4f1eb] hover:bg-[#e8e2d8] text-[11px] font-bold text-[#5c544b] active:scale-90 transition-transform hidden sm:inline-block"
            >
              +Copy
            </button>
          )}

          {/* Snip / Delete Stem */}
          {onRemoveStem && (
            <button
              onClick={() => onRemoveStem(selectedStem.uid)}
              title="Remove Flower"
              className="p-1.5 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-90 transition-transform ml-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Deselect / Done Button */}
          <button
            onClick={() => updateSelectedUids([])}
            title="Done editing / Deselect flower"
            className="px-2.5 py-1 rounded-full bg-[#8ca68e]/15 hover:bg-[#8ca68e]/30 text-[#4a4238] text-[11px] font-bold active:scale-90 transition-transform ml-0.5 border border-[#8ca68e]/30 flex items-center gap-1"
          >
            <span>✕</span>
            <span className="hidden sm:inline">Done</span>
          </button>
        </div>
      )}

      {/* 5. FLOATING QUICK-ACTION TOOLBAR FOR MULTI-SELECTION (2+ FLOWERS) */}
      {interactive && currentSelectedUids.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full border border-emerald-600 shadow-xl flex items-center gap-2 text-xs font-semibold text-[#4a4238] animate-in fade-in zoom-in duration-150"
        >
          {/* Multi-Selection Count Badge */}
          <div className="flex items-center gap-1.5 pr-2 border-r border-[#e8e2d8]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-bold text-emerald-800">
              {currentSelectedUids.length} Selected
            </span>
          </div>

          {/* Rotate Group Left */}
          <button
            onClick={() => handleBatchRotate(-15)}
            title="Rotate All Selected Left (-15°)"
            className="p-1.5 rounded-full hover:bg-[#f4f1eb] text-[#5c544b] active:scale-90 transition-transform flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Rotate Group Right */}
          <button
            onClick={() => handleBatchRotate(15)}
            title="Rotate All Selected Right (+15°)"
            className="p-1.5 rounded-full hover:bg-[#f4f1eb] text-[#5c544b] active:scale-90 transition-transform flex items-center gap-1"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Scale Group Down */}
          <button
            onClick={() => handleBatchScale(-0.1)}
            title="Scale Group Smaller (-10%)"
            className="p-1.5 rounded-full hover:bg-[#f4f1eb] text-[#5c544b] active:scale-90 transition-transform"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Scale Group Up */}
          <button
            onClick={() => handleBatchScale(0.1)}
            title="Scale Group Larger (+10%)"
            className="p-1.5 rounded-full hover:bg-[#f4f1eb] text-[#5c544b] active:scale-90 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Center Group */}
          <button
            onClick={handleBatchCenter}
            title="Center Selected Flowers on Canvas"
            className="p-1.5 rounded-full hover:bg-[#f4f1eb] text-[#5c544b] active:scale-90 transition-transform flex items-center gap-1"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate Group */}
          <button
            onClick={handleBatchDuplicate}
            title="Duplicate Selected Group"
            className="px-2.5 py-1 rounded-full bg-[#f4f1eb] hover:bg-[#e8e2d8] text-[11px] font-bold text-[#5c544b] active:scale-90 transition-transform"
          >
            +Clone Group
          </button>

          {/* Remove Selected Group */}
          <button
            onClick={handleBatchDelete}
            title="Remove Selected Flowers"
            className="p-1.5 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-90 transition-transform"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Deselect All */}
          <button
            onClick={() => updateSelectedUids([])}
            title="Deselect All"
            className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-[#5c544b] text-[11px] font-bold active:scale-90 transition-transform border border-stone-300"
          >
            ✕ Done
          </button>
        </div>
      )}
    </div>
  );
};
