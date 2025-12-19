import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AuthService from "@services/AuthService";
import { StatusMessage } from "@types";
import Link from "next/link";
import Header from "@components/header";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();
  const { t } = useTranslation("common");
  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatusMessages([
        {
          message: t("auth.forgot_password.status_message1"), //"Please enter your email address",
          type: "error",
        },
      ]);
      return;
    }

    setIsSubmitting(true);
    setStatusMessages([]);

    try {
      const response = await AuthService.requestPasswordReset(email);
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("Success response data:", data);
        setStatusMessages([
          {
            message:
              data.message ||
              t("auth.forgot_password.status_message1"),
            type: "success",
          },
        ]);
        setEmail("");
      } else {
        const errorText = await response.text();
        console.log("Error response text:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || "Failed to send reset email" };
        }
        console.log("Error response data:", errorData);
        setStatusMessages([
          {
            message:
              errorData.message || t("error.generic"), //"An error occurred. Please try again.",
            type: "error",
          },
        ]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setStatusMessages([
        {
          message:
            t("auth.login.error_connection"),
          type: "error",
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <div className="fixed inset-0 top-[64px] overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl w-full max-w-md mx-4 max-h-[calc(100vh-120px)] overflow-y-auto shadow-lg border border-gray-200 dark:border-gray-800 transition-colors">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("auth.forgot_password.title1")}  <span className="text-brand-orange">{t("auth.forgot_password.title2")}</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("auth.forgot_password.subtitle")}
            </p>
          </div>

          {statusMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 p-3 rounded-lg ${msg.type === "error"
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                  : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                }`}
            >
              {msg.message}
            </div>
          ))}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t("auth.forgot_password.email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.forgot_password.email_placeholder")} //"Enter your email"
                required
                className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-brand-orange px-4 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-orange"
            >
              {isSubmitting ? t("auth.forgot_password.send_status1") : t("auth.forgot_password.send_status2")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-brand-orange hover:text-brand-orange-dark font-medium transition-colors"
            >
              ← {t("auth.forgot_password.back_to_login")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;


export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
