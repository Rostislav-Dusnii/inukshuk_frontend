import React, { useState } from "react";
import { useTranslation } from "next-i18next";

interface CircleListPanelProps {
    circles: Array<{ id: number; inside: boolean; visible: boolean; shape: any }>;
    intersections: Array<{ id: number; inside: boolean; visible: boolean; polygons: any[]; isHighlight?: boolean }>;
    selectedCircle: number | null;
    onSelectCircle: (id: number) => void;
    onToggleVisibility: (id: number) => void;
    onZoomToShape: (id: number) => void;
}

export default function CircleListPanel({
  circles,
  intersections,
  selectedCircle,
  onSelectCircle,
  onToggleVisibility,
  onZoomToShape,
}: CircleListPanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Combine circles and intersections for display
    // Mark intersection highlights with a special type
    const allShapes = [
        ...circles.map((c) => ({ ...c, type: "circle" as const })),
        ...intersections.map((i) => ({ 
            ...i, 
            type: i.isHighlight ? "intersection" as const : "polygon" as const 
        })),
    ].sort((a, b) => a.id - b.id);

  if (allShapes.length === 0) {
    return null;
  }

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed z-[1000] top-[160px] left-4 w-12 h-12 flex items-center justify-center rounded-lg border-2 border-brand-green bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                title="Toggle elements list"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-brand-green"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                </svg>
                {allShapes.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-green text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-md">
                        {allShapes.length}
                    </span>
                )}
            </button>

      {/* Panel */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-[1000] md:hidden"
            onClick={() => setIsOpen(false)}
          />

                    <div className="fixed z-[1001] top-[200px] left-4 md:left-20 right-4 md:right-auto border-solid rounded-lg border-brand-green border-2 bg-white dark:bg-gray-800 shadow-2xl p-3 max-h-[60vh] md:max-h-[400px] overflow-y-auto min-w-0 md:min-w-[250px] max-w-[calc(100vw-2rem)] md:max-w-sm animate-slideIn">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-300 dark:border-gray-600">
                            <h3 className="font-bold text-brand-green dark:text-brand-green-light text-base flex items-center gap-2">
                                <span>Elements</span>
                                <span className="text-xs font-semibold bg-brand-green dark:bg-brand-green-light text-white dark:text-gray-900 px-2 py-0.5 rounded-full">
                                    {allShapes.length}
                                </span>
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded bg-transparent border-0 shadow-none m-0"
                                title="Close"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-1">
                            {allShapes.map((shape) => (
                                <div
                                    key={shape.id}
                                    className={`flex items-stretch rounded-lg transition-all duration-200 overflow-hidden ${selectedCircle === shape.id
                                        ? "bg-brand-green bg-opacity-20 border-2 border-brand-green shadow-sm"
                                        : "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                                        }`}
                                >
                                    <button
                                        onClick={() => {
                                            onSelectCircle(shape.id);
                                            onZoomToShape(shape.id);
                                        }}
                                        className="flex-1 text-left flex items-center gap-2 min-w-0 bg-transparent border-0 shadow-none p-2 m-0 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded-l-lg"
                                    >
                                        <span className="text-2xl flex-shrink-0">
                                            {shape.type === "circle" ? "⭕" : shape.type === "intersection" ? "🟢" : "⬟"}
                                        </span>
                                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {shape.type === "circle" ? "Circle" : shape.type === "intersection" ? "Search Area" : "Polygon"} #{shape.id}
                                            </span>
                                            <span
                                                className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                                                    shape.type === "intersection"
                                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                                                    : shape.inside
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                    }`}
                                            >
                                                {shape.type === "intersection" ? "Highlighted" : shape.inside ? "Inside" : "Outside"}
                                            </span>
                                        </div>
                                    </button>
                                    <div className="w-px bg-gray-300 dark:bg-gray-600"></div>
                                    <button
                                        onClick={() => onToggleVisibility(shape.id)}
                                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center bg-transparent border-0 shadow-none m-0 rounded-r-lg"
                                        title={shape.visible ? `Hide ${shape.type}` : `Show ${shape.type}`}
                                    >
                                        {shape.visible ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-5 h-5 text-brand-green"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-5 h-5 text-gray-400"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
