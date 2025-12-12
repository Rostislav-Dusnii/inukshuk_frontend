import Head from "next/head";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@styles/home.module.css";
import Header from "@components/header";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";

export default function Home() {
    const { t } = useTranslation("common");
    const isLoggedIn = useAuthStatus();

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="h-screen flex flex-col">
            <Head>
                <title>{t("app.name")}</title>
                <meta name="description" content={t("app.description")} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <Header />

            <main className={`${styles.main} flex-1 w-full overflow-hidden`}>
                <div className="center h-full flex items-center justify-center px-4 -mt-16">
                    <div className="description max-w-3xl mx-auto">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <div className="relative">
                                <img src="/images/new.png" alt={t("app.name")} width={72} height={72} className="w-18 h-18 object-contain" />
                                <div className="absolute inset-0 bg-brand-orange/20 rounded-full blur-2xl"></div>
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
                                {t("app.name")}
                            </h1>
                        </div>
                        
                        <h2 className="text-xl sm:text-2xl font-medium text-gray-600 dark:text-gray-400 mb-6 text-center">
                            {t("app.tagline")} 
                            <span className="text-brand-green"> {t("app.around_world")}</span>
                        </h2>

                        <p className="mb-10 text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto text-lg">
                            {t("app.description")}
                        </p>

                        {isLoggedIn === false && (
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Link href="/login" 
                                      className="group relative px-8 py-3 rounded-lg bg-brand-orange text-white font-semibold 
                                                 hover:bg-brand-orange-dark active:scale-95 transition-all shadow-lg 
                                                 hover:shadow-xl overflow-hidden">
                                    <span className="relative z-10">{t("nav.login")}</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-brand-orange-light to-brand-orange-dark opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </Link>
                                <Link href="/register" 
                                      className="px-8 py-3 rounded-lg border-2 border-brand-green text-brand-green 
                                                 hover:bg-brand-green hover:text-white font-semibold active:scale-95 
                                                 transition-all">
                                    {t("nav.register")}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Client-only check for sessionStorage so we don't attempt to access window on the server
function useAuthStatus() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        try {
            const stored = sessionStorage.getItem("loggedInUser");
            setIsLoggedIn(!!stored);
        } catch (e) {
            setIsLoggedIn(false);
        }
    }, []);

    return isLoggedIn;
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};

