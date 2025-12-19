import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "next-i18next";

interface CircleListPanelProps {
    circles: Array<{ id: number; inside: boolean; visible: boolean; shape: any }>;
    intersections: Array<{ id: number; inside: boolean; visible: boolean; polygons: any[] }>;
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
    const { t } = useTranslation("common");
    // Combine circles and intersections for display
    const allShapes = [
        ...circles.map((c) => ({ ...c, type: "circle" })),
        ...intersections.map((i) => ({ ...i, type: "polygon" })),
    ].sort((a, b) => a.id - b.id);

    if (allShapes.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p className="text-lg font-medium">{t("map.circleList.title")}</p>
                <p className="text-sm mt-1">{t("map.circle.create_new")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {allShapes.map((shape) => (
                <div
                    key={shape.id}
                    className={`flex items-stretch rounded-lg transition-all duration-200 overflow-hidden ${selectedCircle === shape.id
                        ? "bg-brand-green bg-opacity-20 border-2 border-brand-green shadow-sm"
                        : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                        }`}
                >
                    <button
                        onClick={() => {
                            onSelectCircle(shape.id);
                            onZoomToShape(shape.id);
                        }}
                        className="flex-1 text-left flex items-center gap-3 min-w-0 bg-transparent border-0 shadow-none p-3 m-0 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded-l-lg"
                    >
                        <span className="text-2xl flex-shrink-0">
                            {shape.type === "circle" ? "⭕" : "⬟"}
                        </span>
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {shape.type === "circle" ? t("map.circleList.circle") : t("map.circleList.polygon")} #{shape.id}
                            </span>
                            <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${shape.inside
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                    }`}
                            >
                                {shape.inside ? t("map.circleList.inside") : t("map.circleList.outside")}
                            </span>
                        </div>
                    </button>
                    <div className="w-px bg-gray-300 dark:bg-gray-600"></div>
                    <button
                        onClick={() => onToggleVisibility(shape.id)}
                        className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center bg-transparent border-0 shadow-none m-0 rounded-r-lg"
                        title={shape.visible ? t("map.circleList.hide") : t("map.circleList.show")}
                    >
                        {shape.visible ? (
                            <Eye className="w-5 h-5 text-brand-green" />
                        ) : (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                        )}
                    </button>
                </div>
            ))}
        </div>
    );
}