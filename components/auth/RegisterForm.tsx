import AuthService from "@services/AuthService"
import { NewUser } from "@types"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"

const RegisterForm: React.FC = () => {
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
            alert("Please fill in all fields correctly.")
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
                    setErrorMessage('The registration code is invalid. \nPlease check the code and try again.')
                    return
                }

                setErrorMessage(`Registration failed: ${serverMsg}`)
                return
            }

            // Other errors
            setErrorMessage(`Registration failed: ${registrationResult.statusText} (${registrationResult.status}). \nPlease try again later.`)
        } catch (err) {
            console.error('Registration error:', err)
            setErrorMessage('Registration failed. \nNetwork error or server unreachable.')
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
                    Create <span className="text-brand-orange">Account</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Join us to access all features</p>
                {/* first name */}
                <div className="mt-4">
                    <label htmlFor='firstName' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First name <span className="text-brand-orange">*</span>
                    </label>
                    <input 
                        id='firstName' 
                        required 
                        minLength={2} 
                        maxLength={24} 
                        pattern="[a-zA-Z]+" 
                        placeholder="Enter your first name" 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all" 
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Use 2–24 letters only.</p>
                </div>
                {/* last name */}
                <div className="mt-4">
                    <label htmlFor='lastName' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last name <span className="text-brand-orange">*</span>
                    </label>
                    <input 
                        id='lastName' 
                        required 
                        minLength={2} 
                        maxLength={24} 
                        pattern="[a-zA-Z]+" 
                        placeholder="Enter your last name" 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all" 
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Use 2–24 letters only.</p>
                </div>
                {/* username */}
                <div className="mt-4">
                    <label htmlFor='username' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username <span className="text-brand-orange">*</span>
                    </label>
                    <input 
                        id='username' 
                        required 
                        minLength={2} 
                        maxLength={24} 
                        pattern="[a-zA-Z0-9-_]+" 
                        placeholder="Enter your username" 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all" 
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">2–24 characters; letters, numbers, hyphens and underscores allowed.</p>
                </div>
                {/* email */}
                <div className="mt-4">
                    <label htmlFor='email' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email <span className="text-brand-orange">*</span>
                    </label>
                    <input 
                        id='email' 
                        required 
                        minLength={4} 
                        maxLength={100} 
                        placeholder="Enter your email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all" 
                    />
                </div>
                {/* password */}
                <div className="mt-4">
                    <label htmlFor='password' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password <span className="text-brand-orange">*</span>
                    </label>
                    <input 
                        id='password' 
                        required 
                        minLength={8} 
                        maxLength={30} 
                        placeholder="Enter your password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all" 
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum 8 characters. Mix letters, numbers and symbols for strength.</p>
                </div>
                {/* code */}
                <div className="mt-4">
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Code <span className="text-brand-orange">*</span>
                    </label>
                    <input 
                        id='code' 
                        required 
                        minLength={2} 
                        maxLength={24} 
                        placeholder="Enter your code" 
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
                        Register
                    </button>
                </div>
                <div className="mt-4">
                    <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                        Already have an account? <Link href="/login" className="font-semibold text-brand-green hover:text-brand-green-dark">Log in</Link>
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
                    <p>Registration successful! You can now <Link href="/login" className="underline font-semibold text-brand-green hover:text-brand-green-dark">log in</Link>.</p>
                    <p className="mt-1">Redirecting to login in 5 seconds...</p>
                </div>}
        </div>
    )
}

export default RegisterForm