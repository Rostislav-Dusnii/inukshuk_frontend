import React, { useEffect, useRef, useState } from "react";

interface CircleContextMenuProps {
    x: number;
    y: number;
    circleId: number;
    onDelete: () => void;
    onClose: () => void;
}

export default function CircleContextMenu({
    x,
    y,
    circleId,
    onDelete,
    onClose,
}: CircleContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
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

    return (
        <div
            ref={menuRef}
            className="fixed z-[2000]"
            style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: "translateX(-50%)",
            }}
        >
            {/* Triangle pointer */}
            <div
                style={{
                    position: "absolute",
                    top: "-8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "0",
                    height: "0",
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderBottom: "8px solid white",
                }}
            />
            <div style={{
                background: "white",
                border: "none",
                padding: "8px",
                borderRadius: "6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}>
                {!showConfirmation ? (
                    <button
                        onClick={() => setShowConfirmation(true)}
                        style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "normal",
                        }}
                    >
                        Delete circle
                    </button>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <p style={{ margin: "0", fontSize: "14px", color: "#333", textAlign: "center" }}>
                            Are you sure?
                        </p>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                onClick={onDelete}
                                style={{
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "normal",
                                    flex: 1,
                                }}
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => setShowConfirmation(false)}
                                style={{
                                    background: "#6b7280",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "normal",
                                    flex: 1,
                                }}
                            >
                                No
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
