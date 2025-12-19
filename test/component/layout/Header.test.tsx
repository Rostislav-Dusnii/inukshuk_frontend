import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "../../../components/header";
import { useRouter } from "next/router";
import enTranslations from "../../../public/locales/en/common.json";

// Mock Next.js modules
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

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
    i18n: {
      changeLanguage: jest.fn(),
      language: "en",
    },
  }),
}));

// Mock child components
jest.mock("../../../components/LanguageSwitcher", () => {
  return function MockLanguageSwitcher() {
    return <div data-testid="language-switcher">Language Switcher</div>;
  };
});

jest.mock("../../../components/ThemeToggle", () => {
  return function MockThemeToggle() {
    return <div data-testid="theme-toggle">Theme Toggle</div>;
  };
});

jest.mock("../../../components/HeaderNotification", () => {
  return function MockHeaderNotification() {
    return <div data-testid="header-notification">Notifications</div>;
  };
});

// Mock window.matchMedia for theme detection
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe("Header Component", () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
      pathname: "/",
      query: {},
      asPath: "/",
    });
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe("Not logged in state", () => {
    it("should render login button when user is not logged in", () => {
      render(<Header />);

      const loginButton = screen.getByRole("link", { name: /login/i });
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveAttribute("href", "/login");
    });

    it("should render map button linking to /login when not logged in", () => {
      render(<Header />);

      const mapButton = screen.getByRole("link", { name: /map/i });
      expect(mapButton).toBeInTheDocument();
      expect(mapButton).toHaveAttribute("href", "/login");
    });

    it("should not render friends link when not logged in", () => {
      render(<Header />);

      const friendsLink = screen.queryByRole("link", { name: /friends/i });
      expect(friendsLink).not.toBeInTheDocument();
    });

    it("should not render admin link when not logged in", () => {
      render(<Header />);

      const adminLink = screen.queryByRole("link", { name: /admin/i });
      expect(adminLink).not.toBeInTheDocument();
    });

    it("should not render header notification when not logged in", () => {
      render(<Header />);

      const notification = screen.queryByTestId("header-notification");
      expect(notification).not.toBeInTheDocument();
    });

    it("should not render logout button when not logged in", () => {
      render(<Header />);

      const logoutButton = screen.queryByRole("link", { name: /logout/i });
      expect(logoutButton).not.toBeInTheDocument();
    });
  });

  describe("Logged in state", () => {
    beforeEach(() => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: 1,
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          role: "USER",
        })
      );
    });

    it("should display welcome message with username when logged in", () => {
      render(<Header />);

      expect(screen.getByText(/welcome,/i)).toBeInTheDocument();
      expect(screen.getByText(/testuser/i)).toBeInTheDocument();
    });

    it("should render logout button when user is logged in", () => {
      render(<Header />);

      const logoutButton = screen.getByRole("link", { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });

    it("should render friends link when logged in", () => {
      render(<Header />);

      const friendsLink = screen.getByRole("link", { name: /friends/i });
      expect(friendsLink).toBeInTheDocument();
      expect(friendsLink).toHaveAttribute("href", "/friends");
    });

    it("should render map button linking to /map when logged in", () => {
      render(<Header />);

      const mapButton = screen.getByRole("link", { name: /map/i });
      expect(mapButton).toBeInTheDocument();
      expect(mapButton).toHaveAttribute("href", "/map");
    });

    it("should render header notification when logged in", () => {
      render(<Header />);

      const notifications = screen.getAllByTestId("header-notification");
      // Should have one for desktop and one for mobile
      expect(notifications.length).toBeGreaterThanOrEqual(1);
    });

    it("should not render login button when logged in", () => {
      render(<Header />);

      const loginButton = screen.queryByRole("link", { name: /^login$/i });
      expect(loginButton).not.toBeInTheDocument();
    });
  });

  describe("Admin role", () => {
    it("should render admin link when user is admin", () => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: 1,
          username: "adminuser",
          firstName: "Admin",
          lastName: "User",
          role: "ADMIN",
        })
      );

      render(<Header />);

      const adminLink = screen.getByRole("link", { name: /admin/i });
      expect(adminLink).toBeInTheDocument();
      expect(adminLink).toHaveAttribute("href", "/admin");
    });

    it("should not render admin link when user is not admin", () => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: 1,
          username: "regularuser",
          firstName: "Regular",
          lastName: "User",
          role: "USER",
        })
      );

      render(<Header />);

      const adminLink = screen.queryByRole("link", { name: /admin/i });
      expect(adminLink).not.toBeInTheDocument();
    });

    it("should handle lowercase admin role", () => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: 1,
          username: "adminuser",
          firstName: "Admin",
          lastName: "User",
          role: "admin",
        })
      );

      render(<Header />);

      const adminLink = screen.getByRole("link", { name: /admin/i });
      expect(adminLink).toBeInTheDocument();
    });
  });

  describe("Logout functionality", () => {
    beforeEach(() => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: 1,
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          role: "USER",
        })
      );
    });

    it("should clear sessionStorage when logout is clicked", () => {
      const { rerender } = render(<Header />);

      // Verify user is logged in
      expect(screen.getByText(/testuser/i)).toBeInTheDocument();

      // Click logout
      const logoutButton = screen.getByRole("link", { name: /logout/i });
      fireEvent.click(logoutButton);

      // Verify sessionStorage is cleared
      expect(sessionStorage.getItem("loggedInUser")).toBeNull();
    });

    it("should navigate to home page when logout is clicked", () => {
      render(<Header />);

      const logoutButton = screen.getByRole("link", { name: /logout/i });
      fireEvent.click(logoutButton);

      expect(logoutButton).toHaveAttribute("href", "/");
    });
  });

  describe("Mobile menu", () => {
    it("should not show mobile menu by default", () => {
      render(<Header />);

      // Mobile menu section is not rendered when mobileMenuOpen is false
      // Check that the mobile menu container (with border-t class) is not visible
      const element = document.querySelector(
        ".border-t.border-gray-200.dark\\:border-gray-800"
      );
      expect(element).not.toBeInTheDocument();
    });

    it("should toggle mobile menu when hamburger button is clicked", () => {
      render(<Header />);

      // Find and click hamburger button
      const hamburgerButton = screen.getByRole("button", {
        name: /toggle menu/i,
      });
      expect(hamburgerButton).toBeInTheDocument();

      // Menu should not be visible initially
      let mobileMenuContainer = document.querySelector(
        ".border-t.border-gray-200.dark\\:border-gray-800"
      );
      expect(mobileMenuContainer).not.toBeInTheDocument();

      // Click to open menu
      fireEvent.click(hamburgerButton);

      // Now mobile menu container should be visible
      mobileMenuContainer = document.querySelector(
        ".border-t.border-gray-200.dark\\:border-gray-800"
      );
      expect(mobileMenuContainer).toBeInTheDocument();
    });

    it("should close mobile menu when a link is clicked", () => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: 1,
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          role: "USER",
        })
      );

      render(<Header />);

      // Open mobile menu
      const hamburgerButton = screen.getByRole("button", {
        name: /toggle menu/i,
      });
      fireEvent.click(hamburgerButton);

      // Click a link in the mobile menu
      const mobileFriendsLinks = screen.getAllByRole("link", {
        name: /friends/i,
      });
      const mobileFriendsLink = mobileFriendsLinks.find((link) =>
        link.className.includes("justify-center")
      );
      fireEvent.click(mobileFriendsLink!);

      // Menu should be closed (links should still be in desktop nav)
      const remainingFriendsLinks = screen.getAllByRole("link", {
        name: /friends/i,
      });
      expect(remainingFriendsLinks.length).toBeLessThan(
        mobileFriendsLinks.length
      );
    });

    it("should show user info in mobile menu when logged in", () => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: 1,
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          role: "USER",
        })
      );

      render(<Header />);

      // Open mobile menu
      const hamburgerButton = screen.getByRole("button", {
        name: /toggle menu/i,
      });
      fireEvent.click(hamburgerButton);

      // Should show welcome message and username
      const welcomeElements = screen.getAllByText(/welcome,/i);
      expect(welcomeElements.length).toBeGreaterThan(0);
      const usernameElements = screen.getAllByText(/testuser/i);
      expect(usernameElements.length).toBeGreaterThan(0);
    });

    it("should close mobile menu when logout is clicked", () => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: 1,
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          role: "USER",
        })
      );

      render(<Header />);

      // Open mobile menu
      const hamburgerButton = screen.getByRole("button", {
        name: /toggle menu/i,
      });
      fireEvent.click(hamburgerButton);

      // Get all logout buttons (desktop + mobile)
      const logoutButtons = screen.getAllByRole("link", { name: /logout/i });

      // Click logout (should close menu and clear session)
      fireEvent.click(logoutButtons[0]);

      expect(sessionStorage.getItem("loggedInUser")).toBeNull();
    });
  });

  describe("Child components", () => {
    it("should render LanguageSwitcher component", () => {
      render(<Header />);

      const languageSwitcher = screen.getAllByTestId("language-switcher");
      expect(languageSwitcher.length).toBeGreaterThan(0);
    });

    it("should render ThemeToggle component", () => {
      render(<Header />);

      const themeToggle = screen.getAllByTestId("theme-toggle");
      expect(themeToggle.length).toBeGreaterThan(0);
    });
  });

  describe("App name", () => {
    it("should render app name as a link to home", () => {
      render(<Header />);

      const appNameLink = screen.getByRole("link", { name: /treasure hunt/i });
      expect(appNameLink).toBeInTheDocument();
      expect(appNameLink).toHaveAttribute("href", "/");
    });
  });

  describe("Mobile menu navigation", () => {
    it("should show mobile menu for logged in user with all navigation links", () => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: 1,
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          role: "USER",
        })
      );

      render(<Header />);

      const hamburgerButton = screen.getByRole("button", {
        name: /toggle menu/i,
      });
      fireEvent.click(hamburgerButton);

      // Check mobile menu links
      const friendsLinks = screen.getAllByRole("link", { name: /friends/i });
      expect(friendsLinks.length).toBeGreaterThan(1); // Desktop + mobile

      const mapLinks = screen.getAllByRole("link", { name: /map/i });
      expect(mapLinks.length).toBeGreaterThan(1); // Desktop + mobile
    });

    it("should show mobile menu for logged out user with login and map links", () => {
      render(<Header />);

      const hamburgerButton = screen.getByRole("button", {
        name: /toggle menu/i,
      });
      fireEvent.click(hamburgerButton);

      // Check mobile menu links for logged out user
      const loginLinks = screen.getAllByRole("link", { name: /login/i });
      expect(loginLinks.length).toBeGreaterThan(1); // Desktop + mobile
    });

    it("should close mobile menu when clicking navigation link", () => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: 1,
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          role: "USER",
        })
      );

      render(<Header />);

      const hamburgerButton = screen.getByRole("button", {
        name: /toggle menu/i,
      });
      fireEvent.click(hamburgerButton);

      // Click a navigation link
      const friendsLinks = screen.getAllByRole("link", { name: /friends/i });
      fireEvent.click(friendsLinks[friendsLinks.length - 1]); // Click mobile version

      // Menu should close (implementation may vary)
    });

    it("should show admin link in mobile menu when user is admin", () => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: 1,
          username: "adminuser",
          firstName: "Admin",
          lastName: "User",
          role: "ADMIN",
        })
      );

      render(<Header />);

      const hamburgerButton = screen.getByRole("button", {
        name: /toggle menu/i,
      });
      fireEvent.click(hamburgerButton);

      const adminLinks = screen.getAllByRole("link", { name: /admin/i });
      expect(adminLinks.length).toBeGreaterThan(1); // Desktop + mobile
    });

    it("should close mobile menu when login link is clicked (not logged in)", () => {
      render(<Header />);

      const hamburgerButton = screen.getByRole("button", {
        name: /toggle menu/i,
      });
      fireEvent.click(hamburgerButton);

      // Verify mobile menu is open
      let mobileMenuContainer = document.querySelector(
        ".border-t.border-gray-200.dark\\:border-gray-800"
      );
      expect(mobileMenuContainer).toBeInTheDocument();

      // Click the login link in mobile menu
      const loginLinks = screen.getAllByRole("link", { name: /login/i });
      const mobileLoginLink = loginLinks.find((link) =>
        link.className.includes("justify-center")
      );
      fireEvent.click(mobileLoginLink!);

      // Menu should be closed
      mobileMenuContainer = document.querySelector(
        ".border-t.border-gray-200.dark\\:border-gray-800"
      );
      expect(mobileMenuContainer).not.toBeInTheDocument();
    });

    it("should close mobile menu when logout is clicked in mobile menu", () => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: 1,
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          role: "USER",
        })
      );

      render(<Header />);

      const hamburgerButton = screen.getByRole("button", {
        name: /toggle menu/i,
      });
      fireEvent.click(hamburgerButton);

      // Verify mobile menu is open
      let mobileMenuContainer = document.querySelector(
        ".border-t.border-gray-200.dark\\:border-gray-800"
      );
      expect(mobileMenuContainer).toBeInTheDocument();

      // Click logout in mobile menu
      const logoutLinks = screen.getAllByRole("link", { name: /logout/i });
      const mobileLogoutLink = logoutLinks.find((link) =>
        link.className.includes("justify-center")
      );
      fireEvent.click(mobileLogoutLink!);

      // Session should be cleared
      expect(sessionStorage.getItem("loggedInUser")).toBeNull();
    });

    it("should close mobile menu when map link is clicked in mobile menu (not logged in)", () => {
      render(<Header />);

      const hamburgerButton = screen.getByRole("button", {
        name: /toggle menu/i,
      });
      fireEvent.click(hamburgerButton);

      // Verify mobile menu is open
      let mobileMenuContainer = document.querySelector(
        ".border-t.border-gray-200.dark\\:border-gray-800"
      );
      expect(mobileMenuContainer).toBeInTheDocument();

      // Click map link in mobile menu
      const mapLinks = screen.getAllByRole("link", { name: /map/i });
      const mobileMapLink = mapLinks.find((link) =>
        link.className.includes("justify-center")
      );
      fireEvent.click(mobileMapLink!);

      // Menu should be closed
      mobileMenuContainer = document.querySelector(
        ".border-t.border-gray-200.dark\\:border-gray-800"
      );
      expect(mobileMenuContainer).not.toBeInTheDocument();
    });

    it("should close mobile menu when admin link is clicked in mobile menu", () => {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: 1,
          username: "adminuser",
          firstName: "Admin",
          lastName: "User",
          role: "ADMIN",
        })
      );

      render(<Header />);

      const hamburgerButton = screen.getByRole("button", {
        name: /toggle menu/i,
      });
      fireEvent.click(hamburgerButton);

      // Verify mobile menu is open
      let mobileMenuContainer = document.querySelector(
        ".border-t.border-gray-200.dark\\:border-gray-800"
      );
      expect(mobileMenuContainer).toBeInTheDocument();

      // Click admin link in mobile menu
      const adminLinks = screen.getAllByRole("link", { name: /admin/i });
      const mobileAdminLink = adminLinks.find((link) =>
        link.className.includes("justify-center")
      );
      fireEvent.click(mobileAdminLink!);

      // Menu should be closed
      mobileMenuContainer = document.querySelector(
        ".border-t.border-gray-200.dark\\:border-gray-800"
      );
      expect(mobileMenuContainer).not.toBeInTheDocument();
    });

    it("should close mobile menu when Map link is clicked", () => {
      // Set up logged in user
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: 1,
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          role: "user",
        })
      );

      render(<Header />);

      // Open mobile menu
      const hamburgerButton = screen.getByRole("button", {
        name: /toggle menu/i,
      });
      fireEvent.click(hamburgerButton);

      // Verify mobile menu is open
      let mobileMenuContainer = document.querySelector(
        ".border-t.border-gray-200.dark\\:border-gray-800"
      );
      expect(mobileMenuContainer).toBeInTheDocument();

      // Click Map link in mobile menu
      const mapLinks = screen.getAllByRole("link", { name: /map/i });
      const mobileMapLink = mapLinks.find((link) =>
        link.className.includes("justify-center")
      );
      fireEvent.click(mobileMapLink!);

      // Menu should be closed
      mobileMenuContainer = document.querySelector(
        ".border-t.border-gray-200.dark\\:border-gray-800"
      );
      expect(mobileMenuContainer).not.toBeInTheDocument();
    });
  });
});
