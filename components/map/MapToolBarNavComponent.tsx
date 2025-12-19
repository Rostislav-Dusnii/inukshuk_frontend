import { useState } from "react";
import { Trash, MapPin, Share2, Plus, Circle, List } from "lucide-react";
import CircleCreationPanelComponent from "./MapTools/CircleCreationPanelComponent";
import CircleListPanel from "./MapTools/CircleListPanel";
import MapLocationTrackerComponent from "./MapTools/MapLocationTrackerComponent";
import ShareCircleModal from "./MapModals/ShareCircleModal";
import MapClearModal from "./MapModals/MapClearModal";
import CircleCounterComponent from "./MapTools/CircleCounterComponent";
import CollapsiblePanel from "./MapNavCollapsiblePanel";
import { useTranslation } from "next-i18next";

type Props = {
    counter: number;
    latitude: number;
    longitude: number;
    radius: number;
    isInside: boolean;
    circles: any[];
    circlesLength: number;
    intersections: any[];
    selectedCircle: number | null;
    onSelectCircle: (id: number) => void;
    onToggleVisibility: (id: number) => void;
    onZoomToShape: (id: number) => void;
    map: any;
    leafletLib: any;
    mapReady: boolean;
    onLatitudeChange: (value: number) => void;
    onLongitudeChange: (value: number) => void;
    onRadiusChange: (value: number) => void;
    onInsideChange: (value: boolean) => void;
    onAddCircle: () => void;
    onClearComplete?: () => void;
};

export default function MapToolBarNavComponent({
    counter,
    latitude,
    longitude,
    radius,
    isInside,
    circles,
    circlesLength,
    intersections,
    selectedCircle,
    onSelectCircle,
    onToggleVisibility,
    onZoomToShape,
    map,
    leafletLib,
    mapReady,
    onLatitudeChange,
    onLongitudeChange,
    onRadiusChange,
    onInsideChange,
    onAddCircle,
    onClearComplete,
}: Props) {
    const { t } = useTranslation("common");
    const [activePopup, setActivePopup] = useState<'location' | 'settings' | 'circles' | null>(null);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Shared button styling
    const baseButtonClass = "w-full min-w-0 py-2 px-2 bg-white dark:bg-gray-800 border rounded-xl text-[15px] font-semibold cursor-pointer transition-all duration-200 shadow-sm flex flex-col items-center gap-1.5 justify-center text-gray-800 dark:text-gray-200 active:translate-y-0 active:shadow-sm";
    const hoverClass = "hover:enabled:-translate-y-0.5 hover:enabled:shadow-md";
    const disabledClass = "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700";

    return (
        <div className="flex flex-row md:flex-row h-auto md:h-full">
            {/* Navbar - Fixed bottom on mobile, side panel on desktop */}
            <div className="fixed bottom-0 left-0 right-0 z-[1000] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-row p-3 gap-2 md:relative md:bottom-auto md:left-auto md:right-auto md:z-auto md:bg-transparent md:border-t-0 md:flex-col md:p-4 md:gap-3 md:overflow-x-visible md:overflow-y-auto md:justify-between md:flex-none shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:shadow-none">
                {/* Circle Counter - first on desktop, third on mobile */}
                <div className="flex-1 min-w-0 md:flex-none md:flex-shrink-0 order-3 md:order-1">
                    <CircleCounterComponent counter={counter} />
                </div>

                {/* Bottom group on desktop - uses order to position correctly on mobile */}
                <div className="contents md:flex md:flex-col md:gap-3 md:mt-auto md:order-2">
                    {/* Clear Map Button */}
                    <div className="flex-1 min-w-0 md:flex-none order-1 md:order-none">
                        <button
                            onClick={() => setIsClearModalOpen(true)}
                            className={`${baseButtonClass} ${hoverClass} ${disabledClass} border-red-600/20 dark:border-red-600/30 hover:enabled:border-red-600 hover:enabled:bg-red-500 dark:hover:enabled:bg-red-600/20`}
                            title={t("map.map_clear")}
                        >
                            <span className="break-words text-center hidden md:block">{t("map.toolbar.clear")}</span>
                            <Trash className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Map Location Tracker Button */}
                    {mapReady && map && leafletLib && (
                        <div className="flex-1 min-w-0 md:flex-none order-2 md:order-none">
                            <button
                                type="button"
                                onClick={() => setActivePopup(activePopup === 'location' ? null : 'location')}
                                className={`${baseButtonClass} ${hoverClass} border-blue-500/30 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20`}
                                aria-label={t("map.locationTracker")}
                            >
                                <span className="break-words text-center hidden md:block">{t("map.location.myLocation")}</span>
                                <MapPin className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Share Circles Button */}
                    <div className="flex-1 min-w-0 md:flex-none order-4 md:order-none">
                        <button
                            type="button"
                            onClick={() => setIsShareModalOpen(true)}
                            disabled={circlesLength === 0}
                            className={`${baseButtonClass} ${hoverClass} ${disabledClass} border-brand-green/30 dark:border-gray-700 hover:enabled:border-brand-green hover:enabled:bg-green-50 dark:hover:enabled:bg-green-900/20`}
                        >
                            <span className="break-words text-center hidden md:block">{t("map.toolbar.share")}</span>
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Create Circle Button */}
                    <div className="flex-1 min-w-0 md:flex-none order-5 md:order-none">
                        <button
                            onClick={() => setActivePopup(activePopup === 'settings' ? null : 'settings')}
                            className={`${baseButtonClass} ${hoverClass} border-brand-orange/30 dark:border-gray-700 hover:border-brand-orange hover:bg-orange-50 dark:hover:bg-orange-900/20`}
                            aria-label={activePopup === 'settings' ? t("map.closeSettings") : t("map.openSettings")}
                        >
                            <span className="break-words text-center hidden md:block">{t("map.createCircle")}</span>
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Circles List Button */}
                    <div className="flex-1 min-w-0 md:flex-none order-6 md:order-none">
                        <button
                            onClick={() => setActivePopup(activePopup === 'circles' ? null : 'circles')}
                            className={`${baseButtonClass} ${hoverClass} border-brand-green/30 dark:border-gray-700 hover:border-brand-green hover:bg-green-50 dark:hover:bg-green-900/20 relative`}
                            aria-label={t("map.circleList.toggle")}
                        >
                            <span className="break-words text-center hidden md:block">{t("map.circleList.title")}</span>
                            <List className="w-5 h-5" />
                            {circlesLength > 0 && (
                                <span className="absolute -top-1 -right-1 bg-brand-green text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-md">
                                    {circlesLength}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Collapsible Side Panel */}
            {activePopup === 'location' && mapReady && map && leafletLib && (
                <CollapsiblePanel
                    isOpen={true}
                    onClose={() => setActivePopup(null)}
                    title={t("map.locationTracker")}
                    icon={<MapPin />}
                >
                    <MapLocationTrackerComponent
                        map={map}
                        leafletLib={leafletLib}
                        mapReady={mapReady}
                    />
                </CollapsiblePanel>
            )}

            {activePopup === 'settings' && (
                <CollapsiblePanel
                    isOpen={true}
                    onClose={() => setActivePopup(null)}
                    title={t("map.createNewCircle")}
                    icon={<Circle />}
                >
                    <CircleCreationPanelComponent
                        latitude={latitude}
                        longitude={longitude}
                        radius={radius}
                        isInside={isInside}
                        onLatitudeChange={onLatitudeChange}
                        onLongitudeChange={onLongitudeChange}
                        onRadiusChange={onRadiusChange}
                        onInsideChange={onInsideChange}
                        onAddCircle={onAddCircle}
                    />
                </CollapsiblePanel>
            )}

            {activePopup === 'circles' && (
                <CollapsiblePanel
                    isOpen={true}
                    onClose={() => setActivePopup(null)}
                    title={t("map.circleList.title")}
                    icon={<List />}
                >
                    <CircleListPanel
                        circles={circles}
                        intersections={intersections}
                        selectedCircle={selectedCircle}
                        onSelectCircle={onSelectCircle}
                        onToggleVisibility={onToggleVisibility}
                        onZoomToShape={onZoomToShape}
                    />
                </CollapsiblePanel>
            )}

            {/* Modals */}
            <MapClearModal
                isOpen={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
                onClearComplete={onClearComplete}
            />

            <ShareCircleModal
                circles={circles}
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />
        </div>
    );
}
