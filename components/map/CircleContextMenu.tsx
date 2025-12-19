import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";

interface CircleContextMenuProps {
    x: number;
    y: number;
    circleId: number;
    circleData?: { id: number; inside: boolean; visible: boolean; shape: any };
    onDelete: () => void;
    onClose: () => void;
    onUpdateCircleInside?: (circleId: number, newInsideValue: boolean) => void;
    onToggleVisibility?: (circleId: number) => void;
}

export default function CircleContextMenu({
    x,
    y,
    circleId,
    circleData,
    onDelete,
    onClose,
    onUpdateCircleInside,
    onToggleVisibility,
}: CircleContextMenuProps) {
    const { t } = useTranslation("common");
    const menuRef = useRef<HTMLDivElement>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Close menu when clicking/tapping outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [onClose]);

    // Close menu on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    // Adjust position to keep menu within viewport
    const adjustedX = Math.min(Math.max(x, 100), window.innerWidth - 100);
    const adjustedY = Math.min(y, window.innerHeight - 250);

    return (
        <div
            ref={menuRef}
            className="fixed z-[2000]"
            style={{
                left: `${adjustedX}px`,
                top: `${adjustedY}px`,
                transform: "translateX(-50%)",
            }}
        >
            {/* Triangle pointer */}
            <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-gray-800"
            />
            <div className="bg-white dark:bg-gray-800 border-none p-3 rounded-lg shadow-lg min-w-[180px]">
                {/* Is Inside Toggle */}
                {circleData && onUpdateCircleInside && (
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                        <p className="font-semibold text-brand-green dark:text-green-400 text-sm mb-2 text-center">
                            {t("map.circle.is_inside")}
                        </p>
                        <div className="flex justify-center gap-4">
                            <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`inside-${circleId}`}
                                    checked={circleData.inside === true}
                                    onChange={() => onUpdateCircleInside(circleId, true)}
                                    className="w-4 h-4 text-brand-green"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-200">{t("map.circle.yes")}</span>
                            </label>
                            <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`inside-${circleId}`}
                                    checked={circleData.inside === false}
                                    onChange={() => onUpdateCircleInside(circleId, false)}
                                    className="w-4 h-4 text-brand-green"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-200">{t("map.circle.no")}</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Visibility Toggle */}
                {circleData && onToggleVisibility && (
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                        <button
                            onClick={() => onToggleVisibility(circleId)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-brand-green hover:bg-green-600 text-white transition-colors text-sm"
                        >
                            {circleData.visible ? (
                                <>
                                    <EyeOff className="w-4 h-4" />
                                    <span>{t("map.circleList.hide")}</span>
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4" />
                                    <span>{t("map.circleList.show")}</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Delete Button */}
                {!showConfirmation ? (
                    <button
                        onClick={() => setShowConfirmation(true)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors text-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>{t("map.deleteCircle")}</span>
                    </button>
                ) : (
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-700 dark:text-gray-200 text-center">
                            {t("map.confirm")}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={onDelete}
                                className="flex-1 px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm transition-colors"
                            >
                                {t("common.yes")}
                            </button>
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 px-3 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white text-sm transition-colors"
                            >
                                {t("common.no")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}



