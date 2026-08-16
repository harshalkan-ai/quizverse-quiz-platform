import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Forgot password modal state
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter OTP & password
    const [forgotError, setForgotError] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);

    const navigate = useNavigate();
    const { loginState } = useAuth(); // Global login context helper

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page refresh on form submission
        setError('');
        setLoading(true);

        try {
            // Send POST request to backend login endpoint
            const response = await axiosInstance.post('/auth/login', { email, password });
            const { user, token } = response.data.data;

            // Save user & token into global state and localStorage
            loginState(user, token);

            // Redirect based on role
            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotSuccess('');
        setForgotLoading(true);
        try {
            const res = await axiosInstance.post('/auth/forgot-password', { email: forgotEmail });
            // Expose generated code for local testing and validation ease
            const returnedOtp = res.data.otp;
            setForgotSuccess(`OTP Code generated: ${returnedOtp || 'Check inbox'}. Enter it below.`);
            setForgotStep(2);
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Failed to request OTP code.');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotSuccess('');
        setForgotLoading(true);
        try {
            await axiosInstance.post('/auth/reset-password', {
                email: forgotEmail,
                otp: otpCode,
                newPassword: newPassword
            });
            setForgotSuccess('Password reset successfully! You can now sign in.');
            setTimeout(() => {
                setShowForgotModal(false);
                setForgotEmail('');
                setOtpCode('');
                setNewPassword('');
                setForgotStep(1);
            }, 2500);
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Failed to reset password. Verify your OTP.');
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-indigo-400">⚡ Quizverse</h1>
                    <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            placeholder="admin@quizverse.com"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-300">Password</label>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForgotModal(true);
                                    setForgotStep(1);
                                    setForgotError('');
                                    setForgotSuccess('');
                                }}
                                className="text-xs text-indigo-400 hover:underline cursor-pointer"
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                    >
                        <LogIn className="w-4 h-4" /> {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-400 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-400 hover:underline">
                        Register
                    </Link>
                </p>
            </div>

            {/* Forgot Password Modal Dialog */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
                        <button
                            onClick={() => setShowForgotModal(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 font-bold cursor-pointer"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold text-slate-100">Reset Password</h2>
                        
                        {forgotError && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg">
                                {forgotError}
                            </div>
                        )}
                        {forgotSuccess && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-lg">
                                {forgotSuccess}
                            </div>
                        )}

                        {forgotStep === 1 ? (
                            <form onSubmit={handleRequestOtp} className="space-y-4">
                                <p className="text-xs text-slate-400 leading-relaxed">Enter your email address to request a 6-digit security OTP code.</p>
                                <div>
                                    <label htmlFor="forgotEmail" className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Email Address</label>
                                    <input
                                        id="forgotEmail"
                                        type="email"
                                        required
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-sm transition cursor-pointer disabled:opacity-50"
                                >
                                    {forgotLoading ? 'Requesting OTP...' : 'Send OTP Code'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <p className="text-xs text-slate-400 leading-relaxed">Enter the 6-digit OTP and select your new account password.</p>
                                <div>
                                    <label htmlFor="otpCode" className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">6-Digit OTP</label>
                                    <input
                                        id="otpCode"
                                        type="text"
                                        required
                                        maxLength="6"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm font-mono text-center tracking-widest text-lg font-bold"
                                        placeholder="123456"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newPassword" className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">New Password</label>
                                    <input
                                        id="newPassword"
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-sm transition cursor-pointer disabled:opacity-50"
                                >
                                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForgotStep(1)}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 rounded-lg text-sm transition cursor-pointer"
                                >
                                    Back
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;