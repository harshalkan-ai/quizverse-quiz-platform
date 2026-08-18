import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axiosInstance';
import { Users, FileText, CheckCircle, BarChart3, TrendingUp, Award } from 'lucide-react';

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axiosInstance.get('/analytics/admin');
                setAnalytics(res.data.data);
            } catch (err) {
                console.error('Error fetching admin analytics:', err);
                setError('Failed to fetch analytics data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-950 text-slate-100">
                <Sidebar />
                <div className="ml-64 flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
                    <p className="text-lg font-medium text-slate-350">Loading Analytics Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-slate-950 text-slate-100">
                <Sidebar />
                <div className="ml-64 flex-1 flex flex-col items-center justify-center p-8">
                    <p className="text-lg text-rose-500 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    const {
        totalStudents = 0,
        totalRegisteredStudents = 0,
        totalQuizzes = 0,
        totalAttempts = 0,
        avgScore = 0,
        totalPassed = 0,
        totalFailed = 0,
        categoryBreakdown = []
    } = analytics || {};

    const passRate = (totalAttempts || 0) > 0 ? (((totalPassed || 0) / (totalAttempts || 1)) * 100).toFixed(1) : 0;
    const failRate = (totalAttempts || 0) > 0 ? (((totalFailed || 0) / (totalAttempts || 1)) * 100).toFixed(1) : 0;

    const cards = [
        { name: 'Active Students', value: totalStudents, sub: `out of ${totalRegisteredStudents} registered`, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
        { name: 'Total Quizzes', value: totalQuizzes, sub: 'Published assessments', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        { name: 'Total Attempts', value: totalAttempts, sub: `${totalPassed} Passed, ${totalFailed} Failed`, icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        { name: 'Average Score', value: `${avgScore}%`, sub: 'Overall platform percentage', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    ];

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 space-y-8 overflow-y-auto font-sans">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Award className="w-8 h-8 text-indigo-500" /> Admin Analytics
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Real-time statistics, performance breakdowns, and platform health metrics.</p>
                </div>

                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.name} className={`bg-slate-900 border rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl ${card.bg}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{card.name}</p>
                                        <p className="text-3xl font-bold mt-2 text-white">{card.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl bg-slate-800 ${card.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <span className="text-xs text-slate-400">{card.sub}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Graphs / Ratio section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Pass Fail Ratio Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1 shadow-lg">
                        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-400" /> Pass vs Fail Ratio
                        </h2>
                        {(totalAttempts || 0) === 0 ? (
                            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                                No attempts recorded yet.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between text-xs font-semibold">
                                        <span className="text-emerald-400 uppercase">Passed ({passRate}%)</span>
                                        <span className="text-rose-400 uppercase">Failed ({failRate}%)</span>
                                    </div>
                                    <div className="overflow-hidden h-4 text-xs flex rounded-full bg-slate-800">
                                        <div style={{ width: `${passRate}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-500"></div>
                                        <div style={{ width: `${failRate}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-rose-500 transition-all duration-500"></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-center mt-4">
                                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                        <p className="text-xs text-slate-400">Total Passed</p>
                                        <p className="text-2xl font-bold text-emerald-400 mt-1">{totalPassed}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                                        <p className="text-xs text-slate-400">Total Failed</p>
                                        <p className="text-2xl font-bold text-rose-400 mt-1">{totalFailed}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Popular Categories Performance */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 shadow-lg">
                        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-400" /> Category Breakdown
                        </h2>
                        {(categoryBreakdown || []).length === 0 ? (
                            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                                No attempts registered in any category.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
                                    <thead className="bg-slate-800/40 text-xs font-semibold uppercase text-slate-400">
                                        <tr>
                                            <th className="px-6 py-3.5">Category Name</th>
                                            <th className="px-6 py-3.5">Attempts Count</th>
                                            <th className="px-6 py-3.5">Average Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {(categoryBreakdown || [])?.map((cat, idx) => (
                                            <tr key={idx} className="hover:bg-slate-850 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-slate-200">{cat?.name}</td>
                                                <td className="px-6 py-4 font-mono">{cat?.attempts_count || 0}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-mono font-bold ${
                                                        parseFloat(cat?.avg_score || 0) >= 70 ? 'text-emerald-400' :
                                                        parseFloat(cat?.avg_score || 0) >= 50 ? 'text-amber-400' : 'text-rose-400'
                                                    }`}>
                                                        {cat?.avg_score || '0.00'}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
