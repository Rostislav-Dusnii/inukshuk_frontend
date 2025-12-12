import React, { useState, useEffect } from "react";
import CircleService from "@services/CircleService";
import { AcceptedCircleShareDTO } from "@types";
import { Eye, EyeOff, Trash2, ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  onToggleVisibility: (shareId: string, visible: boolean) => void;
  onRemove: (shareId: string) => void;
  refreshTrigger?: number;
};

const AcceptedCirclesPanel: React.FC<Props> = ({ 
  onToggleVisibility, 
  onRemove,
  refreshTrigger 
}) => {
  const [acceptedShares, setAcceptedShares] = useState<AcceptedCircleShareDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedShare, setExpandedShare] = useState<string | null>(null);

  const loadAcceptedShares = async () => {
    try {
      const loggedInUserString = sessionStorage.getItem("loggedInUser");
      if (!loggedInUserString) {
        setIsLoading(false);
        return;
      }

      const loggedInUser = JSON.parse(loggedInUserString);
      const token = loggedInUser.token;

      if (!token) {
        setIsLoading(false);
        return;
      }

      const shares = await CircleService.getAcceptedCircleShares(token);
      setAcceptedShares(shares);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load accepted circles");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAcceptedShares();
  }, [refreshTrigger]);

  const handleToggleVisibility = async (shareId: string) => {
    try {
      const loggedInUserString = sessionStorage.getItem("loggedInUser");
      if (!loggedInUserString) return;

      const loggedInUser = JSON.parse(loggedInUserString);
      const token = loggedInUser.token;

      const updatedShare = await CircleService.toggleAcceptedShareVisibility(shareId, token);
      
      setAcceptedShares(prev => 
        prev.map(share => 
          share.shareId === shareId ? updatedShare : share
        )
      );

      onToggleVisibility(shareId, updatedShare.visible);
    } catch (err: any) {
      console.error("Failed to toggle visibility:", err);
    }
  };

  const handleRemove = async (shareId: string) => {
    if (!confirm("Are you sure you want to remove these shared circles from your map?")) {
      return;
    }

    try {
      const loggedInUserString = sessionStorage.getItem("loggedInUser");
      if (!loggedInUserString) return;

      const loggedInUser = JSON.parse(loggedInUserString);
      const token = loggedInUser.token;

      await CircleService.removeAcceptedCircleShare(shareId, token);
      
      setAcceptedShares(prev => prev.filter(share => share.shareId !== shareId));
      onRemove(shareId);
    } catch (err: any) {
      console.error("Failed to remove accepted share:", err);
    }
  };

  if (isLoading) {
    return null;
  }

  if (acceptedShares.length === 0) {
    return null;
  }

  return (
    <div className="accepted-circles-panel bg-white dark:bg-gray-800 shadow-xl backdrop-blur-sm" style={{
      position: "fixed",
      bottom: "20px",
      left: "20px",
      zIndex: 1000,
      border: "4px solid #9370DB",
      borderRadius: "8px",
      padding: "12px",
      minWidth: "280px",
      maxWidth: "350px",
      maxHeight: isExpanded ? "400px" : "auto"
    }}>
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          cursor: "pointer"
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-gray-900 dark:text-gray-100" style={{ 
          margin: 0, 
          fontWeight: 600,
          fontSize: "0.95em"
        }}>
          🔗 Shared Circles ({acceptedShares.length})
        </h3>
        {isExpanded ? (
          <ChevronDown className="text-gray-600 dark:text-gray-400" size={20} />
        ) : (
          <ChevronUp className="text-gray-600 dark:text-gray-400" size={20} />
        )}
      </div>

      {isExpanded && (
        <div style={{ marginTop: "12px", maxHeight: "320px", overflowY: "auto" }}>
          {error && (
            <p className="text-red-600 dark:text-red-400" style={{ fontSize: "0.85em", marginBottom: "8px" }}>
              {error}
            </p>
          )}

          {acceptedShares.map((share) => (
            <div 
              key={share.shareId}
              className="bg-gray-50 dark:bg-gray-700"
              style={{
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "8px",
                border: share.visible ? "2px solid #9370DB" : "2px dashed #999",
                opacity: share.visible ? 1 : 0.6
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                marginBottom: "6px"
              }}>
                <div>
                  <p className="text-gray-900 dark:text-gray-100" style={{ 
                    fontWeight: 600, 
                    fontSize: "0.9em",
                    margin: 0
                  }}>
                    From: {share.ownerUsername}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400" style={{ 
                    fontSize: "0.8em",
                    margin: "2px 0 0 0"
                  }}>
                    {share.circles.length} circle{share.circles.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(share.shareId);
                    }}
                    title={share.visible ? "Hide circles" : "Show circles"}
                    style={{
                      padding: "4px",
                      background: "none",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {share.visible ? (
                      <Eye className="text-green-600" size={16} />
                    ) : (
                      <EyeOff className="text-gray-400" size={16} />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(share.shareId);
                    }}
                    title="Remove shared circles"
                    style={{
                      padding: "4px",
                      background: "none",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Trash2 className="text-red-500" size={16} />
                  </button>
                </div>
              </div>

              {/* Expandable circle details */}
              <button
                onClick={() => setExpandedShare(
                  expandedShare === share.shareId ? null : share.shareId
                )}
                className="text-gray-600 dark:text-gray-400"
                style={{
                  background: "none",
                  border: "none",
                  padding: "4px 0",
                  fontSize: "0.8em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                {expandedShare === share.shareId ? "Hide details" : "Show details"}
                {expandedShare === share.shareId ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>

              {expandedShare === share.shareId && (
                <div style={{ marginTop: "8px" }}>
                  {share.circles.map((circle, index) => (
                    <div 
                      key={circle.id}
                      className="text-gray-700 dark:text-gray-300"
                      style={{
                        fontSize: "0.75em",
                        padding: "4px 8px",
                        marginBottom: "4px",
                        backgroundColor: "rgba(147, 112, 219, 0.1)",
                        borderRadius: "4px",
                        borderLeft: `3px solid ${circle.isInside ? "#28a745" : "#6c757d"}`
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>#{index + 1}</span>
                      {" - "}
                      <span>{circle.isInside ? "Inside" : "Outside"}</span>
                      {" • "}
                      <span>{circle.radius}m</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcceptedCirclesPanel;
