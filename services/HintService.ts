import { Hint } from "@types";
import { getToken } from "@util/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getActiveHint = async (): Promise<Hint> => {
  const response = await fetch(`${API_BASE_URL}/hints/active`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch active hint");
  }

  return response.json();
};

const HintsService = {
  getActiveHint,
};

export default HintsService;
