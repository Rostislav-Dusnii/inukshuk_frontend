import Header from "@components/header";
import "@styles/globals.css";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { ThemeProvider } from "../contexts/ThemeContext";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <ThemeProvider>
      <GoogleReCaptchaProvider
        reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
        scriptProps={{
          async: false,
          defer: false,
          appendTo: "head",
        }}
      >
        <div className="flex flex-col h-screen">

          <div className="flex-1 overflow-auto">
            <Component {...pageProps} />
          </div>
        </div>
      </GoogleReCaptchaProvider>
    </ThemeProvider>
  );
};

export default appWithTranslation(App);
