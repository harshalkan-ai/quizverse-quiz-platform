import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderPlus, FileText, HelpCircle, LogOut, BarChart3, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation(); // Gets current active browser URL
    const navigate = useNavigate();
    const { logoutState, user } = useAuth(); // Gets user info and logout function

    const handleSignOut = () => {
        logoutState();
        navigate('/login', { replace: true });
    };

    // Navigation menu items list
    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Categories', path: '/admin/categories', icon: FolderPlus },
        { name: 'Quizzes', path: '/admin/quizzes', icon: FileText },
        { name: 'Questions', path: '/admin/questions', icon: HelpCircle },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
        { name: 'AI Generator', path: '/admin/ai-generator', icon: Sparkles },
    ];

    return (
        <div className="w-64 bg-slate-800 border-r border-slate-700 h-screen flex flex-col justify-between p-4 fixed left-0 top-0">
            <div>
                {/* App Brand Header */}
                <div className="text-2xl font-bold text-indigo-400 mb-8 px-2 flex items-center justify-between">
                    <span>⚡ Quizverse</span>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                        ADMIN
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path; // Highlight active page
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer Profile & Logout Button */}
            <div className="border-t border-slate-700 pt-4">
                <div className="px-2 mb-3">
                    <p className="text-sm font-medium text-slate-200">{user?.name}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;