import AuthService from "@services/AuthService"
import { NewUser } from "@types"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { useTranslation } from "next-i18next"

const RegisterForm: React.FC = () => {
    const { t } = useTranslation("common")
    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')
    const [username, setUsername] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [code, setCode] = useState<string>('')
    const [registerIsSuccessful, setRegisterIsSuccessful] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            alert(t("auth.register.error_fill_fields"))
            return
        }

        const newUser: NewUser = {
            firstName,
            lastName,
            username,
            email,
            password,
            code
        }

        try {
            const registrationResult = await AuthService.register(newUser)

            // Registration successful
            if (registrationResult.ok) {
                setRegisterIsSuccessful(true)
                setErrorMessage(null)
                ResetField()
                setTimeout(() => {
                    router.push('/login')
                }, 5000) // Redirect after 5 seconds
                return
            }

            // Read response body for error details
            const body = await registrationResult.json()

            if (body && (body.error || body.message)) {
                const serverMsg = body.error || body.message

                // Specific handling for invalid code
                if (serverMsg === 'Invalid code') {
                    setErrorMessage(t("auth.register.error_invalid_code"))
                    return
                }

                setErrorMessage(`${t("errors.generic")}: ${serverMsg}`)
                return
            }

            // Other errors
            setErrorMessage(`${t("errors.generic")}: ${registrationResult.statusText} (${registrationResult.status}).`)
        } catch (err) {
            console.error('Registration error:', err)
            setErrorMessage(t("errors.network"))
        }
    }

    const ResetField = () => {
        setFirstName('')
        setLastName('')
        setUsername('')
        setEmail('')
        setPassword('')
        setCode('')
    }

    const validateForm = () => {
        return firstName.length > 0 &&
            lastName.length > 0 &&
            username.length > 0 &&
            email.length > 0 &&
            password.length > 0 &&
            code.length > 0;
    }

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-lg border border-gray-200 dark:border-gray-800 transition-colors">
            <form onSubmit={handleSubmit}>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {t("auth.register.title")} <span className="text-brand-orange">{t("auth.register.title_highlight")}</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t("auth.register.subtitle")}</p>
                {/* first name */}
                <div className="mt-4">
                    <label htmlFor='firstName' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("auth.register.first_name")} <span className="text-brand-orange">{t("common.required")}</span>
                    </label>
                    <input 
                        id='firstName' 
                        required 
                        minLength={2} 
                        maxLength={24} 
                        pattern="[a-zA-Z]+" 
                        placeholder={t("auth.register.first_name_placeholder")} 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all" 
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("auth.register.first_name_hint")}</p>
                </div>
                {/* last name */}
                <div className="mt-4">
                    <label htmlFor='lastName' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("auth.register.last_name")} <span className="text-brand-orange">{t("common.required")}</span>
                    </label>
                    <input 
                        id='lastName' 
                        required 
                        minLength={2} 
                        maxLength={24} 
                        pattern="[a-zA-Z]+" 
                        placeholder={t("auth.register.last_name_placeholder")} 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all" 
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("auth.register.last_name_hint")}</p>
                </div>
                {/* username */}
                <div className="mt-4">
                    <label htmlFor='username' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("auth.register.username")} <span className="text-brand-orange">{t("common.required")}</span>
                    </label>
                    <input 
                        id='username' 
                        required 
                        minLength={2} 
                        maxLength={24} 
                        pattern="[a-zA-Z0-9-_]+" 
                        placeholder={t("auth.register.username_placeholder")} 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all" 
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("auth.register.username_hint")}</p>
                </div>
                {/* email */}
                <div className="mt-4">
                    <label htmlFor='email' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("auth.register.email")} <span className="text-brand-orange">{t("common.required")}</span>
                    </label>
                    <input 
                        id='email' 
                        required 
                        minLength={4} 
                        maxLength={100} 
                        placeholder={t("auth.register.email_placeholder")} 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all" 
                    />
                </div>
                {/* password */}
                <div className="mt-4">
                    <label htmlFor='password' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("auth.register.password")} <span className="text-brand-orange">{t("common.required")}</span>
                    </label>
                    <input 
                        id='password' 
                        required 
                        minLength={8} 
                        maxLength={30} 
                        placeholder={t("auth.register.password_placeholder")} 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all" 
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("auth.register.password_hint")}</p>
                </div>
                {/* code */}
                <div className="mt-4">
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("auth.register.code")} <span className="text-brand-orange">{t("common.required")}</span>
                    </label>
                    <input 
                        id='code' 
                        required 
                        minLength={2} 
                        maxLength={24} 
                        placeholder={t("auth.register.code_placeholder")} 
                        type="text" 
                        value={code} 
                        onChange={(e) => setCode(e.target.value)} 
                        className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all" 
                    />
                </div>

                <div className="mt-6">
                    <button 
                        type="submit" 
                        className="w-full rounded-lg bg-brand-orange px-4 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 transition-all shadow-lg"
                    >
                        {t("auth.register.submit")}
                    </button>
                </div>
                <div className="mt-4">
                    <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                        {t("auth.register.have_account")} <Link href="/login" className="font-semibold text-brand-green hover:text-brand-green-dark">{t("auth.register.login_link")}</Link>
                    </p>
                </div>
            </form >

            {errorMessage &&
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="wrap-normal font-medium">{errorMessage}</p>
                </div>
            }

            {registerIsSuccessful &&
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <p>{t("auth.register.success")}</p>
                </div>}
        </div>
    )
}

export default RegisterForm