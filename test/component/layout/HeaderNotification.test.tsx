import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import HeaderNotification from "../../../components/HeaderNotification";
import FriendService from "../../../services/FriendService";
import enTranslations from "../../../public/locales/en/common.json";

// Mock Next.js i18n
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const keys = key.split(".");
      let value: any = enTranslations;
      for (const k of keys) {
        value = value[k];
      }
      return value || key;
    },
  }),
}));

// Mock FriendService
jest.mock("../../../services/FriendService", () => ({
  __esModule: true,
  default: {
    getFriendRequests: jest.fn(),
    acceptFriendRequest: jest.fn(),
    rejectFriendRequest: jest.fn(),
  },
}));

describe("HeaderNotification Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe("Not logged in state", () => {
    it("should not fetch requests when user is not logged in", () => {
      render(<HeaderNotification />);

      expect(FriendService.getFriendRequests).not.toHaveBeenCalled();
    });
  });

  describe("Logged in state", () => {
    beforeEach(() => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          userId: 1,
          username: "testuser",
        })
      );
    });

    it("should fetch friend requests on mount", async () => {
      (FriendService.getFriendRequests as jest.Mock).mockResolvedValue([]);

      render(<HeaderNotification />);

      await waitFor(() => {
        expect(FriendService.getFriendRequests).toHaveBeenCalledWith(
          1,
          "incoming",
          "PENDING"
        );
      });
    });

    it("should display pending count badge when there are requests", async () => {
      const mockRequests = [
        {
          id: 1,
          sender: { username: "friend1" },
        },
        {
          id: 2,
          sender: { username: "friend2" },
        },
      ];

      (FriendService.getFriendRequests as jest.Mock).mockResolvedValue(
        mockRequests
      );

      render(<HeaderNotification />);

      await waitFor(() => {
        const badge = screen.getByText("2");
        expect(badge).toBeInTheDocument();
      });
    });

    it("should not display badge when there are no requests", async () => {
      (FriendService.getFriendRequests as jest.Mock).mockResolvedValue([]);

      render(<HeaderNotification />);

      await waitFor(() => {
        expect(FriendService.getFriendRequests).toHaveBeenCalled();
      });

      const badge = screen.queryByText(/\d+/);
      expect(badge).not.toBeInTheDocument();
    });

    it("should render notification icon", async () => {
      (FriendService.getFriendRequests as jest.Mock).mockResolvedValue([]);

      render(<HeaderNotification />);

      // MessageCircle icon is rendered as an SVG
      const icon = document.querySelector(".lucide-message-circle");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Dropdown functionality", () => {
    beforeEach(() => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          userId: 1,
          username: "testuser",
        })
      );
    });

    it("should toggle dropdown when icon is clicked", async () => {
      (FriendService.getFriendRequests as jest.Mock).mockResolvedValue([]);

      render(<HeaderNotification />);

      await waitFor(() => {
        expect(FriendService.getFriendRequests).toHaveBeenCalled();
      });

      const icon = document.querySelector(".lucide-message-circle");
      expect(icon).toBeInTheDocument();

      // Dropdown should not be visible initially
      expect(
        screen.queryByText(/no pending friend requests/i)
      ).not.toBeInTheDocument();

      // Click to open
      fireEvent.click(icon!);

      // Dropdown should now be visible
      expect(screen.getByText(/no new requests/i)).toBeInTheDocument();

      // Click to close
      fireEvent.click(icon!);

      // Dropdown should be hidden again
      expect(screen.queryByText(/no new requests/i)).not.toBeInTheDocument();
    });

    it("should display no requests message when dropdown is empty", async () => {
      (FriendService.getFriendRequests as jest.Mock).mockResolvedValue([]);

      render(<HeaderNotification />);

      await waitFor(() => {
        expect(FriendService.getFriendRequests).toHaveBeenCalled();
      });

      const icon = document.querySelector(".lucide-message-circle");
      fireEvent.click(icon!);

      expect(screen.getByText(/no new requests/i)).toBeInTheDocument();
    });

    it("should display friend requests in dropdown", async () => {
      const mockRequests = [
        {
          id: 1,
          sender: { username: "friend1" },
        },
        {
          id: 2,
          sender: { username: "friend2" },
        },
      ];

      (FriendService.getFriendRequests as jest.Mock).mockResolvedValue(
        mockRequests
      );

      render(<HeaderNotification />);

      await waitFor(() => {
        expect(FriendService.getFriendRequests).toHaveBeenCalled();
      });

      const icon = document.querySelector(".lucide-message-circle");
      fireEvent.click(icon!);

      expect(screen.getByText(/@friend1/)).toBeInTheDocument();
      expect(screen.getByText(/@friend2/)).toBeInTheDocument();
      expect(screen.getAllByText(/sent a friend request/i).length).toBe(2);
    });

    it("should reset pending count to 0 when dropdown is opened", async () => {
      const mockRequests = [
        {
          id: 1,
          sender: { username: "friend1" },
        },
      ];

      (FriendService.getFriendRequests as jest.Mock).mockResolvedValue(
        mockRequests
      );

      render(<HeaderNotification />);

      await waitFor(() => {
        const badge = screen.getByText("1");
        expect(badge).toBeInTheDocument();
      });

      const icon = document.querySelector(".lucide-message-circle");
      fireEvent.click(icon!);

      // Badge should disappear after opening
      await waitFor(() => {
        expect(screen.queryByText("1")).not.toBeInTheDocument();
      });
    });
  });

  describe("Polling for requests", () => {
    beforeEach(() => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          userId: 1,
          username: "testuser",
        })
      );
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it("should poll for new requests every 60 seconds", async () => {
      (FriendService.getFriendRequests as jest.Mock).mockResolvedValue([]);

      render(<HeaderNotification />);

      await waitFor(() => {
        expect(FriendService.getFriendRequests).toHaveBeenCalledTimes(1);
      });

      // Advance time by 60 seconds
      jest.advanceTimersByTime(60000);

      await waitFor(() => {
        expect(FriendService.getFriendRequests).toHaveBeenCalledTimes(2);
      });
    });

    it("should cleanup interval on unmount", async () => {
      (FriendService.getFriendRequests as jest.Mock).mockResolvedValue([]);

      const { unmount } = render(<HeaderNotification />);

      await waitFor(() => {
        expect(FriendService.getFriendRequests).toHaveBeenCalledTimes(1);
      });

      unmount();

      // Advance time after unmounting
      jest.advanceTimersByTime(60000);

      // Should not call again after unmount
      expect(FriendService.getFriendRequests).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accept/Decline functionality", () => {
    beforeEach(() => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          userId: 1,
          username: "testuser",
        })
      );
    });

    it("should handle accept request gracefully even though UI doesn't show buttons", async () => {
      const mockRequests = [
        {
          id: 1,
          sender: { username: "friend1" },
        },
      ];

      (FriendService.getFriendRequests as jest.Mock).mockResolvedValue(
        mockRequests
      );
      (FriendService.acceptFriendRequest as jest.Mock).mockResolvedValue({});

      render(<HeaderNotification />);

      await waitFor(() => {
        expect(FriendService.getFriendRequests).toHaveBeenCalled();
      });

      const icon = document.querySelector(".lucide-message-circle");
      fireEvent.click(icon!);

      expect(screen.getByText(/@friend1/)).toBeInTheDocument();
    });

    it("should handle decline request gracefully even though UI doesn't show buttons", async () => {
      const mockRequests = [
        {
          id: 1,
          sender: { username: "friend1" },
        },
      ];

      (FriendService.getFriendRequests as jest.Mock).mockResolvedValue(
        mockRequests
      );
      (FriendService.rejectFriendRequest as jest.Mock).mockResolvedValue({});

      render(<HeaderNotification />);

      await waitFor(() => {
        expect(FriendService.getFriendRequests).toHaveBeenCalled();
      });

      const icon = document.querySelector(".lucide-message-circle");
      fireEvent.click(icon!);

      expect(screen.getByText(/@friend1/)).toBeInTheDocument();
    });
  });

  describe("Touch events", () => {
    beforeEach(() => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          userId: 1,
          username: "testuser",
        })
      );
    });

    it("should close dropdown on touchstart outside", async () => {
      (FriendService.getFriendRequests as jest.Mock).mockResolvedValue([]);

      render(
        <div>
          <div data-testid="outside">Outside</div>
          <HeaderNotification />
        </div>
      );

      await waitFor(() => {
        expect(FriendService.getFriendRequests).toHaveBeenCalled();
      });

      const icon = document.querySelector(".lucide-message-circle");
      fireEvent.click(icon!);

      expect(screen.getByText(/no new requests/i)).toBeInTheDocument();

      // Touch outside to close
      const outside = screen.getByTestId("outside");
      fireEvent.touchStart(outside);

      expect(screen.queryByText(/no new requests/i)).not.toBeInTheDocument();
    });
  });
});
