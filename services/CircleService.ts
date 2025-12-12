import { CircleShareRequest, CircleShareResponse, SharedCircleDTO, AcceptedCircleShareDTO } from "@types";

const shareCircles = async (circles: CircleShareRequest, token: string): Promise<CircleShareResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  try {
    const response = await fetch(`${apiUrl}/api/circles/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(circles),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.errorMessage || `Server error: ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error("Network error: Unable to connect to server. Please check if the backend is running.");
  }
};

const getSharedCircles = async (shareId: string): Promise<SharedCircleDTO[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  try {
    const response = await fetch(`${apiUrl}/api/circles/shared/${shareId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.errorMessage || "Shared circles not found";
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error("Network error: Unable to connect to server");
  }
};

const getMySharedCircles = async (token: string): Promise<SharedCircleDTO[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  try {
    const response = await fetch(`${apiUrl}/api/circles/my-shared`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.errorMessage || "Failed to retrieve shared circles";
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error("Network error: Unable to connect to server");
  }
};

/**
 * Accept shared circles from another user
 */
const acceptSharedCircles = async (shareId: string, token: string): Promise<AcceptedCircleShareDTO> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  try {
    const response = await fetch(`${apiUrl}/api/circles/accept/${shareId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.errorMessage || "Failed to accept circles";
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error("Network error: Unable to connect to server");
  }
};

/**
 * Get all accepted circle shares for the current user
 */
const getAcceptedCircleShares = async (token: string): Promise<AcceptedCircleShareDTO[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  try {
    const response = await fetch(`${apiUrl}/api/circles/accepted`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.errorMessage || "Failed to get accepted circles";
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error("Network error: Unable to connect to server");
  }
};

/**
 * Toggle visibility of accepted circle share
 */
const toggleAcceptedShareVisibility = async (shareId: string, token: string): Promise<AcceptedCircleShareDTO> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  try {
    const response = await fetch(`${apiUrl}/api/circles/accepted/${shareId}/toggle-visibility`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.errorMessage || "Failed to toggle visibility";
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error("Network error: Unable to connect to server");
  }
};

/**
 * Remove accepted circle share
 */
const removeAcceptedCircleShare = async (shareId: string, token: string): Promise<void> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  try {
    const response = await fetch(`${apiUrl}/api/circles/accepted/${shareId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.errorMessage || "Failed to remove accepted share";
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error("Network error: Unable to connect to server");
  }
};

/**
 * Get share preview (for accept/decline dialog)
 */
const getSharePreview = async (shareId: string): Promise<AcceptedCircleShareDTO> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  try {
    const response = await fetch(`${apiUrl}/api/circles/preview/${shareId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.errorMessage || "Shared circles not found";
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error("Network error: Unable to connect to server");
  }
};

/**
 * Check if user has already accepted a share
 */
const checkAcceptedShare = async (shareId: string, token: string): Promise<boolean> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  try {
    const response = await fetch(`${apiUrl}/api/circles/accepted/${shareId}/check`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.accepted;
  } catch (error: any) {
    return false;
  }
};

const CircleService = {
  shareCircles,
  getSharedCircles,
  getMySharedCircles,
  acceptSharedCircles,
  getAcceptedCircleShares,
  toggleAcceptedShareVisibility,
  removeAcceptedCircleShare,
  getSharePreview,
  checkAcceptedShare,
};

export default CircleService;
