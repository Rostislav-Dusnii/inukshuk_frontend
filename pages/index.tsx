import Head from "next/head";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@styles/home.module.css";
import Header from "@components/header";

export default function Home() {
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
                <title>Treasure Hunt</title>
                <meta name="description" content="Treasure Hunt - find circles around Leuven and complete quests" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <Header />

            <main className={`${styles.main} flex-1 w-full overflow-hidden`}>
                <div className="center h-full flex items-center justify-center px-4 -mt-16">
                    <div className="description max-w-3xl mx-auto">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <div className="relative">
                                <img src="/images/new.png" alt="Treasure Hunt logo" width={72} height={72} className="w-18 h-18 object-contain" />
                                <div className="absolute inset-0 bg-brand-orange/20 rounded-full blur-2xl"></div>
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
                                Treasure Hunt
                            </h1>
                        </div>
                        
                        <h2 className="text-xl sm:text-2xl font-medium text-gray-600 dark:text-gray-400 mb-6 text-center">
                            Explore, discover, and complete quests 
                            <span className="text-brand-green"> around the world</span>
                        </h2>

                        <p className="mb-10 text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto text-lg">
                            A global location-based game where you find hidden circles on maps, complete challenges and compete with your team.
                        </p>

                        {isLoggedIn === false && (
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Link href="/login" 
                                      className="group relative px-8 py-3 rounded-lg bg-brand-orange text-white font-semibold 
                                                 hover:bg-brand-orange-dark active:scale-95 transition-all shadow-lg 
                                                 hover:shadow-xl overflow-hidden">
                                    <span className="relative z-10">Login</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-brand-orange-light to-brand-orange-dark opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </Link>
                                <Link href="/register" 
                                      className="px-8 py-3 rounded-lg border-2 border-brand-green text-brand-green 
                                                 hover:bg-brand-green hover:text-white font-semibold active:scale-95 
                                                 transition-all">
                                    Register
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