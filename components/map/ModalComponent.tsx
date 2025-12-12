import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useTranslation } from "next-i18next";

interface ModalButton {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  // New enhanced props
  message?: string;
  buttons?: ModalButton[];
  type?: "success" | "warning" | "info" | "danger";
  dismissible?: boolean;
  showCloseButton?: boolean;
  showFooterClose?: boolean; // Keep the old CLOSE button for backwards compatibility
};

const ModalComponent: React.FC<Props> = ({
  onClose,
  isOpen,
  title,
  children,
  message,
  buttons = [],
  type = "info",
  dismissible = true,
  showCloseButton = true,
  showFooterClose = true, // Default true for backwards compatibility
}: Props) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
  const { t } = useTranslation("common");
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, dismissible, onClose]);

  if (!isOpen) return null;

  // Get icon and colors based on type
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: "🎉",
          iconBg: "bg-brand-green/10",
          titleColor: "text-brand-green dark:text-brand-green-light",
          border: "border-brand-green",
        };
      case "warning":
        return {
          icon: "⚠️",
          iconBg: "bg-yellow-500/10",
          titleColor: "text-yellow-600 dark:text-yellow-500",
          border: "border-yellow-500",
        };
      case "danger":
        return {
          icon: "❌",
          iconBg: "bg-red-500/10",
          titleColor: "text-red-600 dark:text-red-500",
          border: "border-red-500",
        };
      default:
        return {
          icon: "ℹ️",
          iconBg: "bg-brand-orange/10",
          titleColor: "text-brand-orange dark:text-brand-orange-light",
          border: "border-brand-orange",
        };
    }
  };

  const typeStyles = getTypeStyles();

  const getButtonStyles = (variant: string = "primary") => {
    switch (variant) {
      case "primary":
        return "bg-brand-orange text-white hover:bg-brand-orange-dark active:scale-95 shadow-md hover:shadow-lg";
      case "secondary":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95";
      case "danger":
        return "bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-md hover:shadow-lg";
      default:
        return "bg-brand-orange text-white hover:bg-brand-orange-dark active:scale-95 shadow-md hover:shadow-lg";
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && dismissible) {
      onClose();
    }
  };

  // Use enhanced mode if message or buttons are provided
  const isEnhancedMode = message || buttons.length > 0;

  return createPortal(
    <>
      {/* Modal Container with Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1001] animate-fadeIn flex items-center justify-center"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={message ? "modal-description" : undefined}
      >
        {/* Modal Content */}
        <div
          className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-scaleIn border-4 ${typeStyles.border} transition-colors`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close X button */}
          {showCloseButton && dismissible && (
            <a
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              href="#"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </a>
          )}

          {isEnhancedMode ? (
            /* Enhanced mode with icon, message, and custom buttons */
            <div className="p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div
                  className={`${typeStyles.iconBg} w-16 h-16 rounded-full flex items-center justify-center`}
                >
                  <span className="text-3xl">{typeStyles.icon}</span>
                </div>
              </div>

              {/* Title */}
              {title && (
                <h2
                  id="modal-title"
                  className={`text-2xl font-bold text-center mb-3 ${typeStyles.titleColor}`}
                >
                  {title}
                </h2>
              )}

              {/* Message */}
              {message && (
                <p
                  id="modal-description"
                  className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed"
                >
                  {message}
                </p>
              )}

              {/* Custom content */}
              {children && <div className="mb-6">{children}</div>}

              {/* Custom buttons */}
              {buttons.length > 0 && (
                <div
                  className={`flex gap-3 ${
                    buttons.length === 1 ? "justify-center" : "justify-stretch"
                  }`}
                >
                  {buttons.map((button, index) => (
                    <button
                      key={index}
                      onClick={button.onClick}
                      className={`flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange ${getButtonStyles(
                        button.variant
                      )}`}
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Default OK button if no custom buttons */}
              {buttons.length === 0 && showFooterClose && (
                <div className="flex justify-center">
                  <button
                    onClick={onClose}
                    className="px-8 py-3 rounded-lg bg-brand-orange text-white font-semibold hover:bg-brand-orange-dark active:scale-95 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange"
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Legacy mode - maintains backwards compatibility */
            <>
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-4 border-b-2 border-brand-orange/30 dark:border-brand-orange/50 w-full bg-gradient-to-r from-brand-orange/10 to-brand-green/10 dark:from-brand-orange/20 dark:to-brand-green/20">
                  <h2
                    id="modal-title"
                    className="text-4xl text-center font-semibold p-0 m-0 text-brand-green dark:text-brand-green-light w-full"
                  >
                    {title}
                  </h2>
                </div>
              )}

              {/* Content */}
              <div className="p-4 text-gray-900 dark:text-gray-100">
                {children}
              </div>

              {/* Actions */}
              {showFooterClose && (
                <div className="bt-4 pb-3 pr-2 pl-2 border-t-2 border-brand-orange/30 dark:border-brand-orange/50 w-full bg-gradient-to-r from-brand-orange/5 to-brand-green/5 dark:from-brand-orange/15 dark:to-brand-green/15">
                  <button
                    onClick={onClose}
                    className="transition-all w-full hover:bg-brand-orange hover:text-white text-gray-900 dark:text-gray-200 py-2 rounded-md active:bg-brand-orange-dark"
                    aria-label="Close modal"
                  >
                    <p className="text-2xl font-semibold">{t("common.close").toUpperCase()}</p>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default ModalComponent;
