import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "../../../components/auth/LoginForm";
import AuthService from "@services/AuthService";
import enTranslations from "../../../public/locales/en/common.json";

// Mock the UserService module
jest.mock("@services/AuthService");
const mockLoginUser = AuthService.loginUser as jest.MockedFunction<
  typeof AuthService.loginUser
>;

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

// Mock react-google-recaptcha-v3
const mockExecuteRecaptcha = jest.fn();
const mockUseGoogleReCaptcha = jest.fn();

jest.mock("react-google-recaptcha-v3", () => ({
  useGoogleReCaptcha: () => mockUseGoogleReCaptcha(),
}));

// create push mock; we'll spy on next/router.useRouter in beforeEach
const pushMock = jest.fn();

// Helper function to create mock Response objects
const createMockResponse = (status: number, data: unknown): Response => {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => data,
    headers: new Headers(),
    redirected: false,
    statusText: status === 200 ? "OK" : "Error",
    type: "basic",
    url: "",
    clone: jest.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    text: jest.fn(),
    bytes: jest.fn(),
  } as unknown as Response;
};

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    // Ensure real timers by default
    jest.useRealTimers();

    // Mock executeRecaptcha to return a fake token
    mockExecuteRecaptcha.mockResolvedValue("fake-recaptcha-token");
    mockUseGoogleReCaptcha.mockReturnValue({
      executeRecaptcha: mockExecuteRecaptcha,
    });

    // spy on next/router.useRouter to return our push mock
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nextRouter = require("next/router");
    jest.spyOn(nextRouter, "useRouter").mockReturnValue({ push: pushMock });
  });

  afterEach(() => {
    // restore any spied implementations and reset push mock calls
    jest.restoreAllMocks();
    pushMock.mockReset();
  });

  it("renders username and password fields and the login button", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("successful login sets sessionStorage and redirects", async () => {
    // Use fake timers to control setTimeout
    jest.useFakeTimers();

    mockLoginUser.mockResolvedValue(
      createMockResponse(200, { token: "abc123", username: "tester" })
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "tester" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    // Wait for success message to appear
    await waitFor(() => {
      expect(
        screen.getByText("Login successful. Redirecting to homepage...")
      ).toBeInTheDocument();
    });

    // Advance timers to trigger redirect
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
    });

    const stored = sessionStorage.getItem("loggedInUser");
    expect(stored).toBeTruthy();
    // assert exact stored shape
    expect(JSON.parse(stored as string)).toEqual({
      token: "abc123",
      username: "tester",
    });

    // restore timers to real
    jest.useRealTimers();
  });

  it("shows server-provided error message on 401", async () => {
    mockLoginUser.mockResolvedValue(
      createMockResponse(401, { errorMessage: "Bad credentials" })
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "bad" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "bad" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Bad credentials")).toBeInTheDocument();
    });

    // ensure sessionStorage not set
    expect(sessionStorage.getItem("loggedInUser")).toBeNull();
  });

  it("shows fallback error when 401 response cannot be parsed as JSON", async () => {
    mockLoginUser.mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => {
        throw new Error("invalid json");
      },
      headers: new Headers(),
      redirected: false,
      statusText: "Error",
      type: "basic",
      url: "",
      clone: jest.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      text: jest.fn(),
      bytes: jest.fn(),
    } as unknown as Response);

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "bad" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "bad" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(
        screen.getByText("Invalid username or password")
      ).toBeInTheDocument();
    });

    expect(sessionStorage.getItem("loggedInUser")).toBeNull();
  });

  it("shows generic error message for non-200 non-401 responses", async () => {
    mockLoginUser.mockResolvedValue(
      createMockResponse(500, { message: "oh no" })
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "x" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "x" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("oh no")).toBeInTheDocument();
    });

    expect(sessionStorage.getItem("loggedInUser")).toBeNull();
  });

  it("shows connection error on request failure", async () => {
    mockLoginUser.mockRejectedValue(new Error("Network failure"));

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "tester" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Unable to connect to server. Please check if the backend is running."
        )
      ).toBeInTheDocument();
    });

    expect(sessionStorage.getItem("loggedInUser")).toBeNull();
  });

  it("shows recaptcha error when executeRecaptcha is not available", async () => {
    // Clear existing mocks and set up null executeRecaptcha
    jest.clearAllMocks();
    mockUseGoogleReCaptcha.mockReturnValue({ executeRecaptcha: null });

    const { rerender } = render(<LoginForm />);

    // Force re-render with new mock
    rerender(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "tester" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(
        screen.getByText("reCAPTCHA not loaded. Please refresh the page.")
      ).toBeInTheDocument();
    });

    expect(sessionStorage.getItem("loggedInUser")).toBeNull();

    // Reset mock for subsequent tests
    mockUseGoogleReCaptcha.mockReturnValue({
      executeRecaptcha: mockExecuteRecaptcha,
    });
  });

  it("shows error message for 400 status with errorMessage", async () => {
    mockLoginUser.mockResolvedValue(
      createMockResponse(400, { errorMessage: "Bad request error" })
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "test" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "test" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Bad request error")).toBeInTheDocument();
    });

    expect(sessionStorage.getItem("loggedInUser")).toBeNull();
  });

  it("shows fallback error when 400 response cannot be parsed as JSON", async () => {
    mockLoginUser.mockResolvedValue({
      status: 400,
      ok: false,
      json: async () => {
        throw new Error("invalid json");
      },
      headers: new Headers(),
      redirected: false,
      statusText: "Error",
      type: "basic",
      url: "",
      clone: jest.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      text: jest.fn(),
      bytes: jest.fn(),
    } as unknown as Response);

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "test" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "test" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred. Please try again.")
      ).toBeInTheDocument();
    });

    expect(sessionStorage.getItem("loggedInUser")).toBeNull();
  });

  it("shows fallback error when other status response cannot be parsed as JSON", async () => {
    mockLoginUser.mockResolvedValue({
      status: 500,
      ok: false,
      json: async () => {
        throw new Error("invalid json");
      },
      headers: new Headers(),
      redirected: false,
      statusText: "Error",
      type: "basic",
      url: "",
      clone: jest.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      text: jest.fn(),
      bytes: jest.fn(),
    } as unknown as Response);

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "test" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "test" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(
        screen.getByText("An error has occurred. Please try again later.")
      ).toBeInTheDocument();
    });

    expect(sessionStorage.getItem("loggedInUser")).toBeNull();
  });
});
