import RegisterForm from '@components/auth/RegisterForm'
import Header from '@components/header'
import Head from 'next/head'
import Link from 'next/link'

const Register: React.FC = () => {
    return (
        <>
            <Head>
                <title>Register</title>
            </Head>

            <Header />
            
            <div className="page-root bg-gray-50 dark:bg-gray-950">
                <main className="page-main p-6 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                    <section className="w-full max-w-md">
                        <RegisterForm />
                    </section>
                    <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                        Already have an account? {' '}
                        <Link href='/login' className="text-brand-orange hover:text-brand-orange-dark font-semibold transition-colors">
                            Login here
                        </Link>
                    </p>
                </main>
            </div>
        </>
    )
}

export default Register
