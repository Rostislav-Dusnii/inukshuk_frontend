import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthService from '@services/AuthService';
import { StatusMessage } from '@types';
import Link from 'next/link';
import Header from '@components/header';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            setStatusMessages([{ message: 'Please enter your email address', type: 'error' }]);
            return;
        }

        setIsSubmitting(true);
        setStatusMessages([]);

        try {
            const response = await AuthService.requestPasswordReset(email);
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('Success response data:', data);
                setStatusMessages([{ 
                    message: data.message || 'If an account with that email exists, a password reset link has been sent.', 
                    type: 'success' 
                }]);
                setEmail('');
            } else {
                const errorText = await response.text();
                console.log('Error response text:', errorText);
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText || 'Failed to send reset email' };
                }
                console.log('Error response data:', errorData);
                setStatusMessages([{ 
                    message: errorData.message || 'An error occurred. Please try again.', 
                    type: 'error' 
                }]);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setStatusMessages([{ 
                message: 'Unable to connect to server. Please check if the backend is running.', 
                type: 'error' 
            }]);
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
                        Forgot <span className="text-brand-orange">Password?</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {statusMessages.map((msg, idx) => (
                    <div 
                        key={idx} 
                        className={`mb-4 p-3 rounded-lg ${
                            msg.type === 'error' 
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' 
                                : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
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
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-brand-orange px-4 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-orange"
                    >
                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link 
                        href="/login" 
                        className="text-sm text-brand-orange hover:text-brand-orange-dark font-medium transition-colors"
                    >
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
        </>
    );
};

export default ForgotPassword;
