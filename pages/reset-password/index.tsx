import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthService from '@services/AuthService';
import { StatusMessage } from '@types';
import Link from 'next/link';
import Header from '@components/header';
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";

const ResetPassword: React.FC = () => {
    const [token, setToken] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        // Get token from URL query parameter
        if (router.query.token) {
            setToken(router.query.token as string);
        }
    }, [router.query]);

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setStatusMessages([]);

        if (!token) {
            setStatusMessages([{ message: 'Invalid reset link. Please request a new password reset.', type: 'error' }]);
            return;
        }

        if (!newPassword || !confirmPassword) {
            setStatusMessages([{ message: 'Please fill in all fields', type: 'error' }]);
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setStatusMessages([{ message: passwordError, type: 'error' }]);
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatusMessages([{ message: 'Passwords do not match', type: 'error' }]);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await AuthService.resetPassword(token, newPassword);

            if (response.ok) {
                const data = await response.json();
                setStatusMessages([{ 
                    message: data.message || 'Password has been successfully reset. Redirecting to login...', 
                    type: 'success' 
                }]);
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                const errorData = await response.json().catch(() => ({ 
                    message: 'Failed to reset password' 
                }));
                setStatusMessages([{ 
                    message: errorData.message || errorData.errorMessage || 'An error occurred. Please try again.', 
                    type: 'error' 
                }]);
            }
        } catch (error) {
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
                        Reset <span className="text-brand-orange">Password</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Enter your new password below
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
                    <div className="mb-4">
                        <label 
                            htmlFor="newPassword" 
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                            />
                            <Link
                                href="#"
                                onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                )}
                            </Link>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Must be at least 8 characters long
                        </p>
                    </div>

                    <div className="mb-6">
                        <label 
                            htmlFor="confirmPassword" 
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                            />
                            <Link
                                href="#"
                                onClick={(e) => { e.preventDefault(); setShowConfirmPassword(!showConfirmPassword); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                            >
                                {showConfirmPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                )}
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-brand-orange px-4 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-orange"
                    >
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;


export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};
