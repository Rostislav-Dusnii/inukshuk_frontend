import LoginForm from "@components/auth/LoginForm"
import Header from "@components/header"
import Head from "next/head"
import Link from "next/link"

const Login: React.FC = () => {
    return (
        <>
            <Head>
                <title>Login</title>
            </Head>

            <Header />
            
            <div className="page-root bg-gray-50 dark:bg-gray-950">
                <main className="page-main p-6 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                    <section className="w-full max-w-md">
                        <LoginForm />
                    </section>
                    <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                        Not a user yet? {' '}
                        <Link href='/register' className="text-brand-green hover:text-brand-green-dark font-semibold transition-colors">
                            Register here
                        </Link>
                    </p>
                </main>
            </div>
        </>
    )
}

export default Login