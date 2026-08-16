import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [adminSecret, setAdminSecret] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { loginState } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Send POST request to backend registration endpoint
            const payload = { name, email, password, role };
            if (role === 'ADMIN') {
                payload.adminSecret = adminSecret;
            }
            const response = await axiosInstance.post('/auth/register', payload);
            const { user, token } = response.data.data;

            loginState(user, token);

            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            console.error('Registration Error:', err);
            // Show exact backend error message or network error
            const serverMsg = err.response?.data?.message || err.message || 'Network error';
            setError(serverMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-indigo-400">⚡ Quizverse</h1>
                    <p className="text-slate-400 text-sm mt-1">Create a new account</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            placeholder="Rahul Student"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            placeholder="rahul@gmail.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Account Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                        >
                            <option value="STUDENT">Student</option>
                            <option value="ADMIN">Admin / Teacher</option>
                        </select>
                    </div>

                    {role === 'ADMIN' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Admin Security Passcode</label>
                            <input
                                type="password"
                                required
                                value={adminSecret}
                                onChange={(e) => setAdminSecret(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                                placeholder="Enter admin code"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                    >
                        <UserPlus className="w-4 h-4" /> {loading ? 'Creating Account...' : 'Register Account'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-400 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-400 hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;