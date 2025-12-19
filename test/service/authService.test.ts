import AuthService from "@services/AuthService";
import { NewUser, User } from "@types";

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";

describe("AuthService", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("register", () => {
    it("should register a new user successfully (happy path)", async () => {
      // Arrange
      const newUser: NewUser = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        code: "EVENT2024",
      };

      const mockResponse = {
        ok: true,
        status: 201,
        json: async () => ({
          id: 1,
          username: "johndoe",
          email: "john@example.com",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await AuthService.register(newUser);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/users/create?code=${newUser.code}`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        })
      );
      expect(result.ok).toBe(true);
      expect(result.status).toBe(201);
    });

    it("should handle registration with invalid code (unhappy path)", async () => {
      // Arrange
      const newUser: NewUser = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        code: "INVALID",
      };

      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          message: "Invalid registration code",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await AuthService.register(newUser);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(400);
    });

    it("should handle registration with duplicate username (unhappy path)", async () => {
      // Arrange
      const newUser: NewUser = {
        firstName: "John",
        lastName: "Doe",
        username: "existinguser",
        email: "john@example.com",
        password: "password123",
        code: "EVENT2024",
      };

      const mockResponse = {
        ok: false,
        status: 409,
        json: async () => ({
          message: "Username already exists",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await AuthService.register(newUser);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(409);
    });

    it("should handle network error during registration (unhappy path)", async () => {
      // Arrange
      const newUser: NewUser = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        code: "EVENT2024",
      };

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(AuthService.register(newUser)).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("loginUser", () => {
    it("should login user successfully (happy path)", async () => {
      // Arrange
      const user: User = {
        username: "johndoe",
        password: "password123",
        captchaToken: "valid-captcha-token",
      };

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          token: "jwt-token-123",
          username: "johndoe",
          id: 1,
          role: "USER",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await AuthService.loginUser(user);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/users/login",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        })
      );
      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
      const data = await result.json();
      expect(data.token).toBe("jwt-token-123");
    });

    it("should handle invalid credentials (unhappy path)", async () => {
      // Arrange
      const user: User = {
        username: "johndoe",
        password: "wrongpassword",
        captchaToken: "valid-captcha-token",
      };

      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          message: "Invalid credentials",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await AuthService.loginUser(user);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(401);
    });

    it("should handle invalid captcha token (unhappy path)", async () => {
      // Arrange
      const user: User = {
        username: "johndoe",
        password: "password123",
        captchaToken: "invalid-captcha",
      };

      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          message: "Invalid captcha",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await AuthService.loginUser(user);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(400);
    });

    it("should handle network error during login (unhappy path)", async () => {
      // Arrange
      const user: User = {
        username: "johndoe",
        password: "password123",
        captchaToken: "valid-captcha-token",
      };

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network connection failed")
      );

      // Act & Assert
      await expect(AuthService.loginUser(user)).rejects.toThrow(
        "Network connection failed"
      );
    });
  });

  describe("requestPasswordReset", () => {
    it("should request password reset successfully (happy path)", async () => {
      // Arrange
      const email = "john@example.com";

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          message: "Password reset email sent",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await AuthService.requestPasswordReset(email);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/users/forgot-password",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })
      );
      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
    });

    it("should handle non-existent email (unhappy path)", async () => {
      // Arrange
      const email = "nonexistent@example.com";

      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({
          message: "Email not found",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await AuthService.requestPasswordReset(email);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(404);
    });

    it("should handle invalid email format (unhappy path)", async () => {
      // Arrange
      const email = "invalid-email";

      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          message: "Invalid email format",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await AuthService.requestPasswordReset(email);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(400);
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const email = "john@example.com";

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(AuthService.requestPasswordReset(email)).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully (happy path)", async () => {
      // Arrange
      const token = "valid-reset-token";
      const newPassword = "newSecurePassword123";

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          message: "Password reset successful",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await AuthService.resetPassword(token, newPassword);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/users/reset-password",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, newPassword }),
        })
      );
      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
    });

    it("should handle invalid token (unhappy path)", async () => {
      // Arrange
      const token = "invalid-token";
      const newPassword = "newSecurePassword123";

      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          message: "Invalid or expired reset token",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await AuthService.resetPassword(token, newPassword);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(400);
    });

    it("should handle expired token (unhappy path)", async () => {
      // Arrange
      const token = "expired-token";
      const newPassword = "newSecurePassword123";

      const mockResponse = {
        ok: false,
        status: 410,
        json: async () => ({
          message: "Reset token has expired",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await AuthService.resetPassword(token, newPassword);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(410);
    });

    it("should handle weak password (unhappy path)", async () => {
      // Arrange
      const token = "valid-reset-token";
      const newPassword = "weak";

      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          message: "Password does not meet requirements",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await AuthService.resetPassword(token, newPassword);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(400);
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const token = "valid-reset-token";
      const newPassword = "newSecurePassword123";

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(
        AuthService.resetPassword(token, newPassword)
      ).rejects.toThrow("Network error");
    });
  });
});
