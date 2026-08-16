import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Trophy, ChevronLeft, Award, Medal } from 'lucide-react';

const Leaderboard = () => {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axiosInstance.get('/categories');
                setCategories(res.data.data.categories);
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const url = selectedCategory 
                    ? `/analytics/leaderboard?category_id=${selectedCategory}` 
                    : '/analytics/leaderboard';
                const res = await axiosInstance.get(url);
                setLeaderboard(res.data.data.leaderboard);
            } catch (err) {
                console.error('Failed to load leaderboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [selectedCategory]);

    const getRankBadge = (index) => {
        if (index === 0) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <Trophy className="w-3.5 h-3.5 fill-amber-300" /> 🥇 Rank #1 (Gold)
                </span>
            );
        }
        if (index === 1) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-300/20 text-slate-300 border border-slate-300/30">
                    <Medal className="w-3.5 h-3.5 fill-slate-300" /> 🥈 Rank #2 (Silver)
                </span>
            );
        }
        if (index === 2) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-600/20 text-amber-500 border border-amber-600/30">
                    <Medal className="w-3.5 h-3.5 fill-amber-500" /> 🥉 Rank #3 (Bronze)
                </span>
            );
        }
        return <span className="text-slate-400 font-semibold pl-4">Rank #{index + 1}</span>;
    };

    const getStatusBadge = (avgScore) => {
        const avg = parseFloat(avgScore);
        if (avg >= 90) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                    Elite
                </span>
            );
        }
        if (avg >= 75) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Expert
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                Competitor
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
            {/* Top Navigation */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <button 
                        onClick={() => navigate('/student/dashboard')}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <h1 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-400" /> Global Leaderboard
                    </h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 space-y-8 mt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
                            <Trophy className="w-7 h-7 text-yellow-500" /> Student Leaderboards
                        </h2>
                        <p className="text-slate-400 text-xs mt-1">Ranks are based on average score percentage and total completed attempts.</p>
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-3">
                        <label htmlFor="category" className="text-xs text-slate-400 font-medium whitespace-nowrap">Filter by Category:</label>
                        <select 
                            id="category"
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="">All Categories</option>
                            {(categories || [])?.map((cat) => (
                                <option key={cat?.id} value={cat?.id}>{cat?.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-100">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-medium text-slate-400">Loading rankings...</p>
                    </div>
                ) : (leaderboard || []).length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-550">
                        No students have completed attempts for this category yet.
                    </div>
                ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left text-sm text-slate-300">
                             <thead className="bg-slate-805 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Rank</th>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4 text-center">Quizzes Taken</th>
                                    <th className="px-6 py-4 text-center">Average Score %</th>
                                    <th className="px-6 py-4 text-center">Highest Score %</th>
                                    <th className="px-6 py-4 text-center">Status Badge</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-800/60">
                                {(leaderboard || [])?.map((student, idx) => (
                                    <tr 
                                        key={student?.id || idx} 
                                        className={`hover:bg-slate-850 transition-colors ${
                                            idx < 3 ? 'bg-indigo-500/[0.02]' : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getRankBadge(idx)}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-200">
                                            {student?.name}
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono font-medium">
                                            {student?.total_taken}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono font-bold text-indigo-400">
                                                {student?.avg_score}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono font-bold text-emerald-400">
                                                {student?.highest_score}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(student?.avg_score)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Leaderboard;
