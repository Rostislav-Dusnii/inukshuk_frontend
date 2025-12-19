import React, { useState, useEffect } from "react";
import CircleService from "@services/CircleService";
import { CircleData } from "@types";
import ModalComponent from "../ModalComponent";
import { useTranslation } from "next-i18next";

type Props = {
  circles: any[];
  isOpen: boolean;
  onClose: () => void;
};

const ShareCircleModal: React.FC<Props> = ({ circles, isOpen, onClose }) => {
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation("common");

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShareUrl("");
      setError("");
      setSuccess(false);
      setCopied(false);
    }
  }, [isOpen]);

  const handleShare = async () => {
    setIsLoading(true);
    setError("");
    setSuccess(false);
    setCopied(false);

    try {
      const loggedInUserString = sessionStorage.getItem("loggedInUser");
      if (!loggedInUserString) {
        setError(t("map.share_modal.share_error"));
        setIsLoading(false);
        return;
      }

      const loggedInUser = JSON.parse(loggedInUserString);
      const token = loggedInUser.token;

      if (!token) {
        setError(t("map.share_modal.share_error"));
        setIsLoading(false);
        return;
      }

      // Convert circles to the format expected by the API
      const circleData: CircleData[] = circles.map((circle) => {
        const latLng = circle.shape.getLatLng();
        const radius = circle.shape.getRadius();
        return {
          latitude: latLng.lat,
          longitude: latLng.lng,
          radius: radius,
          isInside: circle.inside,
        };
      });

      const response = await CircleService.shareCircles(
        { circles: circleData },
        token
      );

      // Replace port 3000 with the current window location port (8000)
      const correctedUrl = response.shareUrl.replace(':3000', `:${window.location.port || '8000'}`);
      setShareUrl(correctedUrl);
      setSuccess(true);
    } catch (err: any) {
      console.error("Share error:", err);
      const errorMsg = err?.message || `${t("map.share_modal.error")} ${t("error.again")}`;
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalComponent
      isOpen={isOpen}
      onClose={onClose}
      title={success ? t("map.share_modal.header2") : t("map.share_modal.header1")}
      dismissible={!isLoading}
      showCloseButton={!isLoading}
      showFooterClose={false}
    >
      <div className="space-y-4">
        {!success ? (
          <>
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {t("map.share_modal.confirmation1")}<span className="font-bold text-brand-orange">{circles.length}</span> {t("map.share_modal.confirmation2")}
                {circles.length !== 1 ? t("map.share_modal.plural") : ""}.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("map.share_modal.info")}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleShare}
              disabled={isLoading || circles.length === 0}
              className="w-full px-6 py-3 rounded-lg bg-brand-orange text-white font-semibold hover:bg-brand-orange-dark active:scale-95 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-orange"
            >
              {isLoading ? t("map.share_modal.generating") : t("map.share_modal.generate_link")}
            </button>
          </>
        ) : (
          <>
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 rounded">
              <p className="text-green-700 dark:text-green-400 font-semibold">
                ✓ {t("map.share_modal.success")}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="share-url-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("map.share_modal.share_link")}
              </label>
              <div className="flex gap-2">
                <input
                  id="share-url-input"
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  onClick={(e) => e.currentTarget.select()}
                />
                <a
                  onClick={handleCopyLink}
                  className="px-6 py-2 bg-green-600 border border-green-600 text-white rounded-lg font-semibold hover:bg-green-700 hover:border-green-700 active:scale-95 transition-all shadow-md whitespace-nowrap cursor-pointer inline-flex items-center"
                >
                  {copied ? `✓ ${t("map.share_modal.link_copied")}!` : t("map.share_modal.copy_link")}
                </a>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {t("map.share_modal.tip")}
            </p>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all focus:outline-none"
            >
              {t("common.close")}
            </button>
          </>
        )}
      </div>
    </ModalComponent>
  );
};

export default ShareCircleModal;
