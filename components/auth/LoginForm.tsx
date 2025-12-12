import AuthService from "@services/AuthService";
import { StatusMessage, User } from "@types";
import { useRouter } from "next/router";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Link from "next/link";

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      setStatusMessages([
        {
          message: "reCAPTCHA not loaded. Please refresh the page.",
          type: "error",
        },
      ]);
      console.error("executeRecaptcha is not available");
      return;
    }

    setIsSubmitting(true);
    setStatusMessages([]);

    try {
      const captchaToken = await executeRecaptcha("login");

      const user: User = {
        username,
        password,
        captchaToken,
      };

      const response = await AuthService.loginUser(user);

      if (response.status === 200) {
        setStatusMessages([
          {
            message: "Login successful. Redirecting to homepage...",
            type: "success",
          },
        ]);

        const user = await response.json();
        sessionStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            token: user.token,
            username: user.username,
            userId: user.id,
            role: user.role,
          })
        );
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else if (response.status === 401) {
        try {
          const errorData = await response.json();
          setStatusMessages([
            {
              message:
                errorData.errorMessage ||
                errorData.message ||
                "Invalid credentials",
              type: "error",
            },
          ]);
        } catch {
          setStatusMessages([
            { message: "Invalid username or password", type: "error" },
          ]);
        }
      } else if (response.status === 400) {
        try {
          const errorData = await response.json();
          setStatusMessages([
            {
              message:
                errorData.errorMessage || errorData.message || "Bad request",
              type: "error",
            },
          ]);
        } catch {
          setStatusMessages([
            { message: "Request failed. Please try again.", type: "error" },
          ]);
        }
      } else {
        try {
          const errorData = await response.json();
          setStatusMessages([
            {
              message:
                errorData.errorMessage ||
                errorData.message ||
                "An error occurred",
              type: "error",
            },
          ]);
        } catch {
          setStatusMessages([
            {
              message: "An error has occurred. Please try again later.",
              type: "error",
            },
          ]);
        }
      }
    } catch {
      setStatusMessages([
        {
          message:
            "Unable to connect to server. Please check if the backend is running.",
          type: "error",
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-lg border border-gray-200 dark:border-gray-800 transition-colors">
      <form onSubmit={handleSubmit}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome <span className="text-brand-orange">back</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Enter your credentials to access your account
        </p>

        {statusMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-4 p-3 rounded-lg ${
              msg.type === "error"
                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
            }`}
          >
            {msg.message}
          </div>
        ))}

        <div className="text-sm/6 mt-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
          />
        </div>
        <div className="text-sm/6 mt-4">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-brand-orange hover:text-brand-orange-dark font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
          />
        </div>
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand-orange px-4 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-orange"
          >
            {isSubmitting ? "Verifying..." : "Login"}
          </button>
        </div>
        {executeRecaptcha && (
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center flex items-center justify-center gap-1">
            <svg
              className="w-3 h-3 text-brand-orange"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Protected by reCAPTCHA v3</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
