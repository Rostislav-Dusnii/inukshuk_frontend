import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import SearchFriends from "../../../components/friends/FriendSearch";
import { UserFormatFriendRequest } from "@types";
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

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { priority, ...otherProps } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...otherProps} />;
  },
}));

describe("SearchFriends", () => {
  const mockSearchFunction = jest.fn();
  const mockOnSendRequest = jest.fn();

  const defaultProps = {
    searchFunction: mockSearchFunction,
    onSendRequest: mockOnSendRequest,
    friendIds: [],
    outgoingRequestIds: [],
    incomingRequestIds: [],
    rejectedRequestIds: [],
    currentUserId: 1,
  };

  const mockUsers: UserFormatFriendRequest[] = [
    {
      id: 2,
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
    },
    {
      id: 3,
      firstName: "Jane",
      lastName: "Smith",
      username: "janesmith",
    },
    {
      id: 4,
      firstName: "Bob",
      lastName: "Johnson",
      username: "bobjohnson",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders search input with correct placeholder", () => {
    render(<SearchFriends {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search users...");
    expect(searchInput).toBeInTheDocument();
  });

  it("shows idle state with 'Type to search' message initially", () => {
    render(<SearchFriends {...defaultProps} />);

    expect(screen.getByText("Type to search…")).toBeInTheDocument();
    expect(screen.getByAltText("Idle logo")).toBeInTheDocument();
  });

  it("debounces search input and calls searchFunction after 300ms", async () => {
    mockSearchFunction.mockResolvedValue(mockUsers);

    render(<SearchFriends {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search users...");

    // Type in search field
    fireEvent.change(searchInput, { target: { value: "john" } });

    // Should not call immediately
    expect(mockSearchFunction).not.toHaveBeenCalled();

    // Fast-forward 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockSearchFunction).toHaveBeenCalledWith("john");
      expect(mockSearchFunction).toHaveBeenCalledTimes(1);
    });
  });

  it("shows loading state while searching", async () => {
    mockSearchFunction.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockUsers), 1000);
        })
    );

    render(<SearchFriends {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "john" } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText("Loading")).toBeInTheDocument();
    });
  });

  it("displays search results with user information", async () => {
    mockSearchFunction.mockResolvedValue(mockUsers);

    render(<SearchFriends {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "john" } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("@johndoe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("@janesmith")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
      expect(screen.getByText("@bobjohnson")).toBeInTheDocument();
    });
  });

  it("filters out current user from search results", async () => {
    const usersIncludingCurrent = [
      ...mockUsers,
      {
        id: 1,
        firstName: "Current",
        lastName: "User",
        username: "currentuser",
      },
    ];

    mockSearchFunction.mockResolvedValue(usersIncludingCurrent);

    render(<SearchFriends {...defaultProps} currentUserId={1} />);

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "user" } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.queryByText("Current User")).not.toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("shows 'No users found' when search returns empty results", async () => {
    mockSearchFunction.mockResolvedValue([]);

    render(<SearchFriends {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText("No users found")).toBeInTheDocument();
      expect(screen.getByAltText("No results logo")).toBeInTheDocument();
    });
  });

  it("shows 'Send Request' button for users with NONE status", async () => {
    mockSearchFunction.mockResolvedValue([mockUsers[0]]);

    render(<SearchFriends {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "john" } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText("Send Request")).toBeInTheDocument();
    });
  });

  it("calls onSendRequest when Send Request button is clicked", async () => {
    mockSearchFunction.mockResolvedValue([mockUsers[0]]);

    render(<SearchFriends {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "john" } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      const sendButton = screen.getByText("Send Request");
      fireEvent.click(sendButton);
    });

    expect(mockOnSendRequest).toHaveBeenCalledWith(2);
  });

  it("shows 'Pending' status for users with outgoing friend requests", async () => {
    mockSearchFunction.mockResolvedValue([mockUsers[0]]);

    render(<SearchFriends {...defaultProps} outgoingRequestIds={[2]} />);

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "john" } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText("Pending")).toBeInTheDocument();
      expect(screen.queryByText("Send Request")).not.toBeInTheDocument();
    });
  });

  it("shows 'Friend' status for users who are already friends", async () => {
    mockSearchFunction.mockResolvedValue([mockUsers[0]]);

    render(<SearchFriends {...defaultProps} friendIds={[2]} />);

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "john" } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      // The component shows the first word of "Friend removed." which is "Friend"
      expect(screen.getByText("Friend")).toBeInTheDocument();
      expect(screen.queryByText("Send Request")).not.toBeInTheDocument();
    });
  });

  it("shows 'Incoming' status for users with incoming friend requests", async () => {
    mockSearchFunction.mockResolvedValue([mockUsers[0]]);

    render(<SearchFriends {...defaultProps} incomingRequestIds={[2]} />);

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "john" } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText("Incoming")).toBeInTheDocument();
      expect(screen.queryByText("Send Request")).not.toBeInTheDocument();
    });
  });

  it("shows 'Rejected' status for users with rejected requests", async () => {
    mockSearchFunction.mockResolvedValue([mockUsers[0]]);

    render(<SearchFriends {...defaultProps} rejectedRequestIds={[2]} />);

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "john" } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText("Rejected")).toBeInTheDocument();
      expect(screen.queryByText("Send Request")).not.toBeInTheDocument();
    });
  });

  it("clears results when search input is cleared", async () => {
    mockSearchFunction.mockResolvedValue(mockUsers);

    render(<SearchFriends {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search users...");

    // First search
    fireEvent.change(searchInput, { target: { value: "john" } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Clear search
    fireEvent.change(searchInput, { target: { value: "" } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      expect(screen.getByText("Type to search…")).toBeInTheDocument();
    });
  });

  it("trims whitespace from search query", async () => {
    mockSearchFunction.mockResolvedValue(mockUsers);

    render(<SearchFriends {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "  john  " } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockSearchFunction).toHaveBeenCalledWith("john");
    });
  });

  it("handles search function errors gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockSearchFunction.mockRejectedValue(new Error("Network error"));

    render(<SearchFriends {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "john" } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "searchFunction failed:",
        expect.any(Error)
      );
      // Should show no results after error
      expect(screen.getByText("No users found")).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it("cancels previous search when new search is typed", async () => {
    mockSearchFunction.mockResolvedValue(mockUsers);

    render(<SearchFriends {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search users...");

    // Type first search
    fireEvent.change(searchInput, { target: { value: "john" } });
    jest.advanceTimersByTime(150);

    // Type second search before first completes debounce
    fireEvent.change(searchInput, { target: { value: "jane" } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      // Should only call with final query
      expect(mockSearchFunction).toHaveBeenCalledTimes(1);
      expect(mockSearchFunction).toHaveBeenCalledWith("jane");
    });
  });

  it("displays multiple users with different statuses correctly", async () => {
    const threeUsers = [mockUsers[0], mockUsers[1], mockUsers[2]];
    mockSearchFunction.mockResolvedValue(threeUsers);

    render(
      <SearchFriends
        {...defaultProps}
        friendIds={[2]}
        outgoingRequestIds={[3]}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "user" } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      // User 2 is a friend
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Friend")).toBeInTheDocument();

      // User 3 has pending request
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();

      // User 4 can receive a request
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
      expect(screen.getByText("Send Request")).toBeInTheDocument();
    });
  });
});
