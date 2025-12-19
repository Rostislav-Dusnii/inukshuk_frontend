import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterForm from "../../../components/auth/RegisterForm";
import AuthService from "@services/AuthService";
import enTranslations from "../../../public/locales/en/common.json";

// Mock the AuthService module
jest.mock("@services/AuthService");
const mockRegister = AuthService.register as jest.MockedFunction<
  typeof AuthService.register
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

// create push mock; we'll spy on next/router.useRouter in beforeEach
const pushMock = jest.fn();

// Mock alert
const mockAlert = jest.fn();
global.alert = mockAlert;

// Helper function to create mock Response objects
const createMockResponse = (
  status: number,
  data: unknown,
  ok: boolean = status >= 200 && status < 300
): Response => {
  return {
    status,
    ok,
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

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();

    // spy on next/router.useRouter to return our push mock
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nextRouter = require("next/router");
    jest.spyOn(nextRouter, "useRouter").mockReturnValue({ push: pushMock });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    pushMock.mockReset();
    mockAlert.mockReset();
  });

  const fillFormFields = () => {
    fireEvent.change(screen.getByLabelText(/First name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.change(screen.getByLabelText(/Registration Code/i), {
      target: { value: "TESTCODE" },
    });
  };

  it("renders all form fields and the register button", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/First name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Registration Code/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register" })
    ).toBeInTheDocument();
  });

  it("shows alert when submitting with empty fields", async () => {
    render(<RegisterForm />);

    // Remove required attributes to bypass HTML5 validation
    const firstNameInput = screen.getByLabelText(/First name/i);
    const lastNameInput = screen.getByLabelText(/Last name/i);
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const codeInput = screen.getByLabelText(/Registration Code/i);

    firstNameInput.removeAttribute("required");
    lastNameInput.removeAttribute("required");
    usernameInput.removeAttribute("required");
    emailInput.removeAttribute("required");
    passwordInput.removeAttribute("required");
    codeInput.removeAttribute("required");

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(mockAlert).toHaveBeenCalledWith(
      "Please fill in all fields correctly."
    );
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("successful registration shows success message and redirects", async () => {
    jest.useFakeTimers();

    mockRegister.mockResolvedValue(createMockResponse(200, {}, true));

    render(<RegisterForm />);

    fillFormFields();
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(
        screen.getByText("Registration successful! Redirecting to login...")
      ).toBeInTheDocument();
    });

    // Check that the form was reset
    expect(screen.getByLabelText(/First name/i)).toHaveValue("");
    expect(screen.getByLabelText(/Last name/i)).toHaveValue("");

    // Advance timers to trigger redirect
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });

    jest.useRealTimers();
  });

  it("shows error message for invalid registration code", async () => {
    mockRegister.mockResolvedValue(
      createMockResponse(400, { error: "Invalid code" }, false)
    );

    render(<RegisterForm />);

    fillFormFields();
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "The registration code is invalid. Please check the code and try again."
        )
      ).toBeInTheDocument();
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows generic error message for server errors", async () => {
    mockRegister.mockResolvedValue(
      createMockResponse(400, { message: "Username already exists" }, false)
    );

    render(<RegisterForm />);

    fillFormFields();
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "An error occurred. Please try again.: Username already exists"
        )
      ).toBeInTheDocument();
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows error message when no error details in response", async () => {
    mockRegister.mockResolvedValue(createMockResponse(500, {}, false));

    render(<RegisterForm />);

    fillFormFields();
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred. Please try again.: Error (500).")
      ).toBeInTheDocument();
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows network error message on request failure", async () => {
    mockRegister.mockRejectedValue(new Error("Network failure"));

    render(<RegisterForm />);

    fillFormFields();
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(
        screen.getByText("Network error. Please check your connection.")
      ).toBeInTheDocument();
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("validates that all fields must have values", () => {
    render(<RegisterForm />);

    // Remove required attributes to bypass HTML5 validation
    const firstNameInput = screen.getByLabelText(/First name/i);
    const lastNameInput = screen.getByLabelText(/Last name/i);
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const codeInput = screen.getByLabelText(/Registration Code/i);

    firstNameInput.removeAttribute("required");
    lastNameInput.removeAttribute("required");
    usernameInput.removeAttribute("required");
    emailInput.removeAttribute("required");
    passwordInput.removeAttribute("required");
    codeInput.removeAttribute("required");

    // Fill only some fields
    fireEvent.change(firstNameInput, {
      target: { value: "John" },
    });
    fireEvent.change(lastNameInput, {
      target: { value: "Doe" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(mockAlert).toHaveBeenCalledWith(
      "Please fill in all fields correctly."
    );
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("has a link to the login page", () => {
    render(<RegisterForm />);

    const loginLink = screen.getByText("Login here");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
  });
});
