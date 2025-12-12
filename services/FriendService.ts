import { GetFriendRequests, GetFriends, UserFormatFriendRequest } from "@types";

const getFriendsForUser = async (id: number): Promise<GetFriends[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/friends/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    console.log("No friends found");
  }

  return response.json();
};

const getFriendRequests = async (
  userId: number,
  type: "incoming" | "outgoing" | "all",
  status?: "PENDING" | "ACCEPTED" | "REJECTED"
): Promise<GetFriendRequests[]> => {
  const params = new URLSearchParams({ type });
  if (status) {
    params.append("status", status);
  }
  params.append("userId", userId.toString());

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/friends/requests?${params.toString()}`;

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    console.log("No friend requests found");
    return [];
  }

  const data = await response.json();
  return data;
};

const searchUsers = async (
  ownId: number,
  searchTerm: string
): Promise<UserFormatFriendRequest[]> => {
  if (!searchTerm.trim()) return [];

  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/users/search/${ownId}?searchTerm=${encodeURIComponent(searchTerm)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    console.error("Failed to search users");
    return [];
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const sendFriendRequest = async (
  senderId: number,
  receiverId: number
): Promise<GetFriendRequests> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/friends/request`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId, receiverId }),
    }
  );

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to send friend request");
  }

  const data: GetFriendRequests = await response.json();
  return data;
};

const acceptFriendRequest = async (
  requestId: number,
  userId: number
): Promise<string> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/friends/accept?userId=${userId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ requestId }),
    }
  );

  if (!response.ok) throw new Error(await response.text());
  return response.text();
};

const rejectFriendRequest = async (
  requestId: number,
  userId: number
): Promise<string> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/friends/reject?userId=${userId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ requestId }),
    }
  );

  if (!response.ok) throw new Error(await response.text());
  return response.text();
};

const removeFriend = async (
  userId: number,
  friendId: number
): Promise<string> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/friends/${userId}/${friendId}`,
    {
      method: "DELETE",
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error(await response.text());
  return response.text();
};

const FriendService = {
  getFriendsForUser,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendRequests,
  searchUsers,
};

export default FriendService;
