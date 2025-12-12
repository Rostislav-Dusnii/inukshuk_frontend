import LoginForm from "@components/auth/LoginForm"
import Header from "@components/header"
import Head from "next/head"
import Link from "next/link"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { GetStaticProps } from "next"

const Login: React.FC = () => {
    const { t } = useTranslation("common")
    
    return (
        <>
            <Head>
                <title>{t("nav.login")}</title>
            </Head>

            <Header />
            
            <div className="page-root bg-gray-50 dark:bg-gray-950">
                <main className="page-main p-6 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                    <section className="w-full max-w-md">
                        <LoginForm />
                    </section>
                    <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                        {t("auth.login.no_account")} {' '}
                        <Link href='/register' className="text-brand-green hover:text-brand-green-dark font-semibold transition-colors">
                            {t("auth.login.register_link")}
                        </Link>
                    </p>
                </main>
            </div>
        </>
    )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};

export default Login