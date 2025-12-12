import { EventCode, UpdateCodeDTO } from "@types";
import { getToken } from "@util/auth";
import { Hint, HintInputDto } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getEventCode = async (): Promise<EventCode> => {
  const token = getToken();
  console.log("Token being sent:", token ? "Token exists" : "No token");

  const response = await fetch(`${API_BASE_URL}/admin/code`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    console.error(
      "Failed to fetch event code:",
      response.status,
      response.statusText
    );
    throw new Error("Failed to fetch event code");
  }

  return response.json();
};

const updateEventCode = async (input: UpdateCodeDTO): Promise<EventCode> => {
  const response = await fetch(`${API_BASE_URL}/admin/code`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

const getHints = async (): Promise<Hint[]> => {
  const response = await fetch(`${API_BASE_URL}/admin/hints`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch hints");
  }

  return response.json();
};

const addHint = async (input: HintInputDto): Promise<Hint> => {
  const response = await fetch(`${API_BASE_URL}/admin/hint`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

const activateHint = async (id: number): Promise<Hint> => {
  const response = await fetch(`${API_BASE_URL}/admin/hint/${id}/activate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

const deleteHint = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/admin/hint/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
};

const deleteAllUsersWithRoleUser = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
};

const AdminService = {
  getEventCode,
  updateEventCode,
  getHints,
  addHint,
  activateHint,
  deleteHint,
  deleteAllUsersWithRoleUser,
};

export default AdminService;
