import { render, screen, fireEvent } from "@testing-library/react";
import FriendRequests from "../../../components/friends/FriendRequests";
import { GetFriendRequests } from "@types";
import enTranslations from "../../../public/locales/en/common.json";

// Helper function to get nested translation
const getTranslation = (key: string): string => {
  const keys = key.split(".");
  let value: any = enTranslations;
  for (const k of keys) {
    value = value?.[k];
  }
  return typeof value === "string" ? value : key;
};

// Mock next-i18next
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => getTranslation(key),
  }),
}));

describe("FriendRequests", () => {
  const mockOnAccept = jest.fn();
  const mockOnDecline = jest.fn();

  const defaultProps = {
    requests: [],
    onAccept: mockOnAccept,
    onDecline: mockOnDecline,
    currentUserId: 1,
  };

  const mockRequests: GetFriendRequests[] = [
    {
      id: 1,
      sender: {
        id: 2,
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
      },
      receiver: {
        id: 1,
        firstName: "Current",
        lastName: "User",
        username: "currentuser",
      },
      status: "PENDING",
    },
    {
      id: 2,
      sender: {
        id: 3,
        firstName: "Jane",
        lastName: "Smith",
        username: "janesmith",
      },
      receiver: {
        id: 1,
        firstName: "Current",
        lastName: "User",
        username: "currentuser",
      },
      status: "PENDING",
    },
    {
      id: 3,
      sender: {
        id: 1,
        firstName: "Current",
        lastName: "User",
        username: "currentuser",
      },
      receiver: {
        id: 4,
        firstName: "Bob",
        lastName: "Johnson",
        username: "bobjohnson",
      },
      status: "PENDING",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when there are no incoming requests", () => {
    render(<FriendRequests {...defaultProps} />);

    expect(screen.getByText("No pending friend requests.")).toBeInTheDocument();
  });

  it("displays incoming friend requests with sender information", () => {
    render(<FriendRequests {...defaultProps} requests={mockRequests} />);

    // Should show incoming requests (where currentUserId is receiver)
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("@johndoe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("@janesmith")).toBeInTheDocument();
  });

  it("does not display outgoing requests (where currentUserId is sender)", () => {
    render(<FriendRequests {...defaultProps} requests={mockRequests} />);

    // Should NOT show outgoing request (where currentUserId is sender)
    expect(screen.queryByText("Bob Johnson")).not.toBeInTheDocument();
    expect(screen.queryByText("@bobjohnson")).not.toBeInTheDocument();
  });

  it("renders Accept and Decline buttons for each incoming request", () => {
    render(<FriendRequests {...defaultProps} requests={mockRequests} />);

    const acceptButtons = screen.getAllByText("Accept");
    const declineButtons = screen.getAllByText("Decline");

    // Should have 2 accept buttons (2 incoming requests)
    expect(acceptButtons).toHaveLength(2);
    expect(declineButtons).toHaveLength(2);
  });

  it("calls onAccept with correct id when Accept button is clicked", () => {
    render(<FriendRequests {...defaultProps} requests={mockRequests} />);

    const acceptButtons = screen.getAllByText("Accept");

    // Click first accept button
    fireEvent.click(acceptButtons[0]);

    expect(mockOnAccept).toHaveBeenCalledWith(1);
    expect(mockOnAccept).toHaveBeenCalledTimes(1);
  });

  it("calls onDecline with correct id when Decline button is clicked", () => {
    render(<FriendRequests {...defaultProps} requests={mockRequests} />);

    const declineButtons = screen.getAllByText("Decline");

    // Click second decline button
    fireEvent.click(declineButtons[1]);

    expect(mockOnDecline).toHaveBeenCalledWith(2);
    expect(mockOnDecline).toHaveBeenCalledTimes(1);
  });

  it("filters out requests with status other than PENDING", () => {
    const requestsWithDifferentStatuses: GetFriendRequests[] = [
      ...mockRequests,
      {
        id: 4,
        sender: {
          id: 5,
          firstName: "Alice",
          lastName: "Williams",
          username: "alicew",
        },
        receiver: {
          id: 1,
          firstName: "Current",
          lastName: "User",
          username: "currentuser",
        },
        status: "ACCEPTED",
      },
      {
        id: 5,
        sender: {
          id: 6,
          firstName: "Charlie",
          lastName: "Brown",
          username: "charlieb",
        },
        receiver: {
          id: 1,
          firstName: "Current",
          lastName: "User",
          username: "currentuser",
        },
        status: "REJECTED",
      },
    ];

    render(
      <FriendRequests
        {...defaultProps}
        requests={requestsWithDifferentStatuses}
      />
    );

    // Should only show PENDING requests
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();

    // Should NOT show ACCEPTED or REJECTED requests
    expect(screen.queryByText("Alice Williams")).not.toBeInTheDocument();
    expect(screen.queryByText("Charlie Brown")).not.toBeInTheDocument();
  });

  it("renders correctly when currentUserId is null", () => {
    render(
      <FriendRequests
        {...defaultProps}
        currentUserId={null}
        requests={mockRequests}
      />
    );

    // Should show empty state since no requests match null userId
    expect(screen.getByText("No pending friend requests.")).toBeInTheDocument();
  });

  it("handles requests with missing sender information gracefully", () => {
    const requestsWithMissingSender: GetFriendRequests[] = [
      {
        id: 1,
        sender: {
          id: 2,
          // Missing firstName and lastName
          username: "johndoe",
        },
        receiver: {
          id: 1,
          firstName: "Current",
          lastName: "User",
          username: "currentuser",
        },
        status: "PENDING",
      },
    ];

    render(
      <FriendRequests {...defaultProps} requests={requestsWithMissingSender} />
    );

    // Should still render with username
    expect(screen.getByText("@johndoe")).toBeInTheDocument();
    expect(screen.getByText("Accept")).toBeInTheDocument();
  });

  it("renders multiple requests in order", () => {
    render(<FriendRequests {...defaultProps} requests={mockRequests} />);

    const listItems = screen.getAllByRole("listitem");

    // Should have 2 incoming requests
    expect(listItems).toHaveLength(2);
  });

  it("does not call callbacks when no buttons are clicked", () => {
    render(<FriendRequests {...defaultProps} requests={mockRequests} />);

    expect(mockOnAccept).not.toHaveBeenCalled();
    expect(mockOnDecline).not.toHaveBeenCalled();
  });

  it("handles empty sender or receiver gracefully", () => {
    const requestsWithNullSender: GetFriendRequests[] = [
      {
        id: 1,
        sender: null,
        receiver: {
          id: 1,
          firstName: "Current",
          lastName: "User",
          username: "currentuser",
        },
        status: "PENDING",
      },
    ];

    render(
      <FriendRequests {...defaultProps} requests={requestsWithNullSender} />
    );

    // Component renders the request even with null sender, showing empty name and @
    expect(screen.getByText("@")).toBeInTheDocument();
    expect(screen.getByText("Accept")).toBeInTheDocument();
    expect(screen.getByText("Decline")).toBeInTheDocument();
  });
});
