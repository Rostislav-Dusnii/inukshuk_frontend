import FriendService from "@services/FriendService";
import { GetFriendRequests, GetFriends, UserFormatFriendRequest } from "@types";

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";

// Mock console methods to avoid cluttering test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

describe("FriendService", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("getFriendsForUser", () => {
    it("should get friends for user successfully (happy path)", async () => {
      // Arrange
      const userId = 1;
      const mockFriends: GetFriends[] = [
        {
          id: 2,
          username: "friend1",
          firstName: "John",
          lastName: "Doe",
        },
        {
          id: 3,
          username: "friend2",
          firstName: "Jane",
          lastName: "Smith",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFriends,
      });

      // Act
      const result = await FriendService.getFriendsForUser(userId);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/friends/${userId}`,
        expect.objectContaining({
          cache: "no-store",
        })
      );
      expect(result).toEqual(mockFriends);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when user has no friends (happy path)", async () => {
      // Arrange
      const userId = 1;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      // Act
      const result = await FriendService.getFriendsForUser(userId);

      // Assert
      expect(result).toEqual([]);
    });

    it("should handle error but still return data (unhappy path)", async () => {
      // Arrange
      const userId = 1;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => [],
      });

      // Act
      const result = await FriendService.getFriendsForUser(userId);

      // Assert
      expect(console.log).toHaveBeenCalledWith("No friends found");
      expect(result).toEqual([]);
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const userId = 1;

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(FriendService.getFriendsForUser(userId)).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("getFriendRequests", () => {
    it("should get incoming pending friend requests (happy path)", async () => {
      // Arrange
      const userId = 1;
      const mockRequests: GetFriendRequests[] = [
        {
          id: 1,
          sender: {
            id: 2,
            username: "user2",
            firstName: "John",
            lastName: "Doe",
          },
          receiver: {
            id: 1,
            username: "user1",
            firstName: "Current",
            lastName: "User",
          },
          status: "PENDING",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRequests,
      });

      // Act
      const result = await FriendService.getFriendRequests(
        userId,
        "incoming",
        "PENDING"
      );

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/friends/requests?"),
        expect.objectContaining({
          cache: "no-store",
        })
      );
      expect(result).toEqual(mockRequests);
    });

    it("should get all friend requests without status filter (happy path)", async () => {
      // Arrange
      const userId = 1;
      const mockRequests: GetFriendRequests[] = [
        {
          id: 1,
          status: "PENDING",
        },
        {
          id: 2,
          status: "ACCEPTED",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRequests,
      });

      // Act
      const result = await FriendService.getFriendRequests(userId, "all");

      // Assert
      expect(result).toEqual(mockRequests);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no requests found (unhappy path)", async () => {
      // Arrange
      const userId = 1;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Act
      const result = await FriendService.getFriendRequests(userId, "incoming");

      // Assert
      expect(console.log).toHaveBeenCalledWith("No friend requests found");
      expect(result).toEqual([]);
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const userId = 1;

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(
        FriendService.getFriendRequests(userId, "incoming")
      ).rejects.toThrow("Network error");
    });
  });

  describe("searchUsers", () => {
    it("should search users successfully (happy path)", async () => {
      // Arrange
      const ownId = 1;
      const searchTerm = "john";
      const mockUsers: UserFormatFriendRequest[] = [
        {
          id: 2,
          username: "john_doe",
          firstName: "John",
          lastName: "Doe",
        },
        {
          id: 3,
          username: "johnny",
          firstName: "Johnny",
          lastName: "Smith",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

      // Act
      const result = await FriendService.searchUsers(ownId, searchTerm);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/users/search/${ownId}?searchTerm=john`),
        expect.objectContaining({
          cache: "no-store",
        })
      );
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it("should return empty array for empty search term (happy path)", async () => {
      // Arrange
      const ownId = 1;
      const searchTerm = "   ";

      // Act
      const result = await FriendService.searchUsers(ownId, searchTerm);

      // Assert
      expect(global.fetch).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should handle no results found (unhappy path)", async () => {
      // Arrange
      const ownId = 1;
      const searchTerm = "nonexistent";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Act
      const result = await FriendService.searchUsers(ownId, searchTerm);

      // Assert
      expect(console.error).toHaveBeenCalledWith("Failed to search users");
      expect(result).toEqual([]);
    });

    it("should handle non-array response (unhappy path)", async () => {
      // Arrange
      const ownId = 1;
      const searchTerm = "john";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Invalid response" }),
      });

      // Act
      const result = await FriendService.searchUsers(ownId, searchTerm);

      // Assert
      expect(result).toEqual([]);
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const ownId = 1;
      const searchTerm = "john";

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(
        FriendService.searchUsers(ownId, searchTerm)
      ).rejects.toThrow("Network error");
    });
  });

  describe("sendFriendRequest", () => {
    it("should send friend request successfully (happy path)", async () => {
      // Arrange
      const senderId = 1;
      const receiverId = 2;
      const mockRequest: GetFriendRequests = {
        id: 1,
        sender: {
          id: senderId,
          username: "user1",
          firstName: "Current",
          lastName: "User",
        },
        receiver: {
          id: receiverId,
          username: "user2",
          firstName: "Friend",
          lastName: "User",
        },
        status: "PENDING",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRequest,
      });

      // Act
      const result = await FriendService.sendFriendRequest(
        senderId,
        receiverId
      );

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/friends/request",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderId, receiverId }),
        })
      );
      expect(result).toEqual(mockRequest);
    });

    it("should throw error when request already exists (unhappy path)", async () => {
      // Arrange
      const senderId = 1;
      const receiverId = 2;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: async () => "Friend request already exists",
      });

      // Act & Assert
      await expect(
        FriendService.sendFriendRequest(senderId, receiverId)
      ).rejects.toThrow("Friend request already exists");
    });

    it("should throw error when users are already friends (unhappy path)", async () => {
      // Arrange
      const senderId = 1;
      const receiverId = 2;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Users are already friends",
      });

      // Act & Assert
      await expect(
        FriendService.sendFriendRequest(senderId, receiverId)
      ).rejects.toThrow("Users are already friends");
    });

    it("should throw error when receiver not found (unhappy path)", async () => {
      // Arrange
      const senderId = 1;
      const receiverId = 999;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "User not found",
      });

      // Act & Assert
      await expect(
        FriendService.sendFriendRequest(senderId, receiverId)
      ).rejects.toThrow("User not found");
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const senderId = 1;
      const receiverId = 2;

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(
        FriendService.sendFriendRequest(senderId, receiverId)
      ).rejects.toThrow("Network error");
    });
  });

  describe("acceptFriendRequest", () => {
    it("should accept friend request successfully (happy path)", async () => {
      // Arrange
      const requestId = 1;
      const userId = 1;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => "Friend request accepted",
      });

      // Act
      const result = await FriendService.acceptFriendRequest(requestId, userId);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/friends/accept?userId=${userId}`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ requestId }),
        })
      );
      expect(result).toBe("Friend request accepted");
    });

    it("should throw error when request not found (unhappy path)", async () => {
      // Arrange
      const requestId = 999;
      const userId = 1;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "Friend request not found",
      });

      // Act & Assert
      await expect(
        FriendService.acceptFriendRequest(requestId, userId)
      ).rejects.toThrow("Friend request not found");
    });

    it("should throw error when already accepted (unhappy path)", async () => {
      // Arrange
      const requestId = 1;
      const userId = 1;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Request already accepted",
      });

      // Act & Assert
      await expect(
        FriendService.acceptFriendRequest(requestId, userId)
      ).rejects.toThrow("Request already accepted");
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const requestId = 1;
      const userId = 1;

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(
        FriendService.acceptFriendRequest(requestId, userId)
      ).rejects.toThrow("Network error");
    });
  });

  describe("rejectFriendRequest", () => {
    it("should reject friend request successfully (happy path)", async () => {
      // Arrange
      const requestId = 1;
      const userId = 1;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => "Friend request rejected",
      });

      // Act
      const result = await FriendService.rejectFriendRequest(requestId, userId);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/friends/reject?userId=${userId}`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ requestId }),
        })
      );
      expect(result).toBe("Friend request rejected");
    });

    it("should throw error when request not found (unhappy path)", async () => {
      // Arrange
      const requestId = 999;
      const userId = 1;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "Friend request not found",
      });

      // Act & Assert
      await expect(
        FriendService.rejectFriendRequest(requestId, userId)
      ).rejects.toThrow("Friend request not found");
    });

    it("should throw error when not authorized (unhappy path)", async () => {
      // Arrange
      const requestId = 1;
      const userId = 2;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => "Not authorized to reject this request",
      });

      // Act & Assert
      await expect(
        FriendService.rejectFriendRequest(requestId, userId)
      ).rejects.toThrow("Not authorized to reject this request");
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const requestId = 1;
      const userId = 1;

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(
        FriendService.rejectFriendRequest(requestId, userId)
      ).rejects.toThrow("Network error");
    });
  });

  describe("removeFriend", () => {
    it("should remove friend successfully (happy path)", async () => {
      // Arrange
      const userId = 1;
      const friendId = 2;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => "Friend removed successfully",
      });

      // Act
      const result = await FriendService.removeFriend(userId, friendId);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/friends/${userId}/${friendId}`,
        expect.objectContaining({
          method: "DELETE",
          cache: "no-store",
        })
      );
      expect(result).toBe("Friend removed successfully");
    });

    it("should throw error when friendship not found (unhappy path)", async () => {
      // Arrange
      const userId = 1;
      const friendId = 999;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "Friendship not found",
      });

      // Act & Assert
      await expect(
        FriendService.removeFriend(userId, friendId)
      ).rejects.toThrow("Friendship not found");
    });

    it("should throw error when not authorized (unhappy path)", async () => {
      // Arrange
      const userId = 1;
      const friendId = 2;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => "Not authorized to remove this friend",
      });

      // Act & Assert
      await expect(
        FriendService.removeFriend(userId, friendId)
      ).rejects.toThrow("Not authorized to remove this friend");
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const userId = 1;
      const friendId = 2;

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(
        FriendService.removeFriend(userId, friendId)
      ).rejects.toThrow("Network error");
    });
  });
});
