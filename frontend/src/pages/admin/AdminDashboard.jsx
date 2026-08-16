import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axiosInstance';
import { FolderPlus, FileText, HelpCircle, Users } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ categories: 0, quizzes: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [catRes, quizRes] = await Promise.all([
                    axiosInstance.get('/categories'),
                    axiosInstance.get('/quizzes')
                ]);
                setStats({
                    categories: (catRes?.data?.data?.categories || [])?.length,
                    quizzes: (quizRes?.data?.data?.quizzes || [])?.length,
                });
            } catch (err) {
                console.error('Failed to load dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { name: 'Total Categories', value: stats.categories, icon: FolderPlus, color: 'text-indigo-400' },
        { name: 'Total Quizzes', value: stats.quizzes, icon: FileText, color: 'text-emerald-400' },
        { name: 'Platform Status', value: 'Active', icon: Users, color: 'text-amber-400' },
    ];

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-950 text-slate-100">
                <Sidebar />
                <div className="ml-64 flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
                    <p className="text-lg font-medium text-slate-350">Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            <Sidebar />
            <div className="ml-64 flex-1 p-8">
                <h1 className="text-2xl font-bold text-slate-100 mb-2">Admin Control Dashboard</h1>
                <p className="text-slate-400 text-sm mb-8">Welcome back. Manage your platform content and quizzes.</p>

                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.name} className="bg-slate-800 border border-slate-700/60 rounded-xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm font-medium">{card.name}</p>
                                        <p className="text-3xl font-bold text-slate-100 mt-2">{card.value}</p>
                                    </div>
                                    <div className={`p-3 bg-slate-700/50 rounded-lg ${card.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;