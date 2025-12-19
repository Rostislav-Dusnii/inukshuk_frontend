import React, { ReactNode, useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown } from 'lucide-react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: ReactNode;
    children: ReactNode;
}

export default function CollapsiblePanel({ isOpen, onClose, title, icon, children }: Props) {
    const [mounted, setMounted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartY = useRef(0);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen && mounted) {
            // Trigger animation after mount
            requestAnimationFrame(() => {
                setIsAnimating(true);
            });
        } else {
            setIsAnimating(false);
            setDragOffset(0);
        }
    }, [isOpen, mounted]);

    // Handle drag start (touch)
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        dragStartY.current = e.touches[0].clientY;
        setIsDragging(true);
    }, []);

    // Handle drag move (touch)
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const delta = currentY - dragStartY.current;
        // Only allow dragging downward (positive delta)
        setDragOffset(Math.max(0, delta));
    }, [isDragging]);

    // Handle drag end (touch)
    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        // If dragged more than 100px or 30% of panel height, close the panel
        const threshold = panelRef.current ? panelRef.current.offsetHeight * 0.3 : 100;
        if (dragOffset > threshold) {
            onClose();
        }
        setDragOffset(0);
    }, [dragOffset, onClose]);

    // Handle drag start (mouse - for desktop testing)
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        dragStartY.current = e.clientY;
        setIsDragging(true);
        e.preventDefault();
    }, []);

    // Handle mouse move and mouse up globally when dragging
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const delta = e.clientY - dragStartY.current;
            setDragOffset(Math.max(0, delta));
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            const threshold = panelRef.current ? panelRef.current.offsetHeight * 0.3 : 100;
            if (dragOffset > threshold) {
                onClose();
            }
            setDragOffset(0);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, onClose]);

    if (!isOpen || !mounted) return null;

    // Calculate transform based on animation state and drag offset (mobile only)
    const getMobileTransform = () => {
        if (!isAnimating) return 'translateY(100%)';
        if (dragOffset > 0) return `translateY(${dragOffset}px)`;
        return 'translateY(0)';
    };

    // Check if we're on mobile (will be used for inline style)
    const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;

    const panelContent = (
        <>
            {/* Backdrop for mobile */}
            <div
                className={`fixed inset-0 bg-black/50 z-[9999] md:hidden transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                style={{ opacity: isAnimating ? Math.max(0, 1 - dragOffset / 300) : 0 }}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel - Bottom sheet on mobile, side panel on desktop */}
            <div
                ref={panelRef}
                className={`
                    fixed z-[10000] bg-white dark:bg-gray-800 flex flex-col shadow-xl overflow-hidden
                    ${isDragging ? '' : 'transition-transform duration-300 ease-out'}
                    /* Mobile: Bottom sheet */
                    inset-x-0 bottom-0 top-auto max-h-[85vh] rounded-t-2xl
                    /* Desktop: Side panel - positioned after navbar on left */
                    md:top-[73px] md:left-[135px] md:bottom-0 md:right-auto md:w-96 md:max-h-none md:rounded-none
                    md:border-l md:border-gray-200 md:dark:border-gray-700
                    ${isAnimating ? 'md:translate-x-0' : 'md:-translate-x-full'}
                `}
                style={isMobileView ? { transform: getMobileTransform() } : undefined}
            >
                {/* Drag handle for mobile */}
                <div
                    className="flex justify-center pt-3 pb-1 md:hidden cursor-grab active:cursor-grabbing touch-none"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                >
                    <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>

                {/* Header */}
                <div className="bg-gradient-to-br from-brand-orange to-brand-orange-dark py-3 px-6 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {icon && <div className="text-white">{icon}</div>}
                        <h3 className="m-0 text-lg font-bold text-white tracking-wide">{title}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white/15 border p-0 border-white/30 text-white w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-none hover:translate-y-0 hover:bg-white/25 hover:border-white/50"
                        aria-label="Close panel"
                    >
                        {/* Show down chevron on mobile, X on desktop */}
                        <ChevronDown className="w-6 h-6 md:hidden" />
                        <X className="w-6 h-6 hidden md:block" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </>
    );

    return createPortal(panelContent, document.body);
}
