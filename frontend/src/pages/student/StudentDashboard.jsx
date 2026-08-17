import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { PlayCircle, CheckCircle2, Trophy, Clock, XCircle, LogOut, Sparkles, BookOpen } from 'lucide-react';

const StudentDashboard = () => {
    const { user, logoutState } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = () => {
        logoutState();
        navigate('/login', { replace: true });
    };
    
    const [quizzes, setQuizzes] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dashboardError, setDashboardError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch published quizzes and attempt history in parallel
                const [quizRes, historyRes] = await Promise.all([
                    axiosInstance.get('/quizzes'),
                    axiosInstance.get('/attempts/history')
                ]);
                setQuizzes(quizRes.data?.data?.quizzes || []);
                setHistory(historyRes.data?.data?.attempts || []);
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStartQuiz = async (quizId) => {
        try {
            const res = await axiosInstance.post('/attempts/start', { quiz_id: quizId });
            navigate(`/student/quiz/${quizId}`, { state: { attempt: res.data.data } });
        } catch (err) {
            setDashboardError(err.response?.data?.message || 'Error starting quiz');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-8">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
                <p className="text-lg font-medium text-slate-400">Loading Student Dashboard...</p>
            </div>
        );
    }

    const attemptsList = Array.isArray(history) ? history : [];
    const totalAttemptsCount = attemptsList.length;
    const totalPassedCount = attemptsList.filter(a => a?.status === 'PASSED' || a?.passed === true).length;
    const validHistory = attemptsList.filter(a => a?.percentage !== undefined && a?.percentage !== null && a?.status !== 'IN_PROGRESS');
    const avgScoreDisplay = validHistory.length > 0 
        ? (validHistory.reduce((acc, curr) => acc + parseFloat(curr?.percentage || 0), 0) / validHistory.length).toFixed(1) 
        : "0";

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
            {/* Top Navigation */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-20 shadow-md">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⚡</span>
                        <h1 className="text-xl font-bold text-indigo-400">
                            Quizverse <span className="text-slate-400 font-medium text-xs md:text-sm ml-1.5">Student Hub</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        <button 
                            onClick={() => navigate('/student/leaderboard')} 
                            className="text-xs md:text-sm flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl transition cursor-pointer font-bold shadow-md"
                        >
                            <Trophy className="w-4 h-4 fill-yellow-400 text-yellow-400" /> Leaderboard
                        </button>
                        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs border border-indigo-500/30">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <span className="text-xs md:text-sm font-semibold text-slate-200 hidden sm:inline">{user?.name || 'Student'}</span>
                        </div>
                        <button 
                            onClick={handleSignOut} 
                            className="flex items-center gap-1.5 text-xs md:text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition cursor-pointer border border-slate-700 font-medium"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-10">
                {/* Stats Overview */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" /> Your Performance Overview
                        </h2>
                        {totalAttemptsCount === 0 && (
                            <span className="text-xs text-indigo-400 font-medium bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                                ✨ New Student Profile Active
                            </span>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
                            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total Attempts</p>
                            <p className="text-4xl font-black text-slate-100 mt-2">{totalAttemptsCount}</p>
                            <p className="text-xs text-slate-500 mt-1">Total quizzes initiated</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
                            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Quizzes Passed</p>
                            <p className="text-4xl font-black text-emerald-400 mt-2">{totalPassedCount}</p>
                            <p className="text-xs text-slate-500 mt-1">Successfully cleared benchmarks</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
                            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Average Score</p>
                            <p className="text-4xl font-black text-amber-400 mt-2">{avgScoreDisplay}%</p>
                            <p className="text-xs text-slate-500 mt-1">Cumulative performance percentage</p>
                        </div>
                    </div>
                </section>

                {/* Available Quizzes */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-indigo-400" /> Available Assessments
                        </h2>
                        <span className="text-xs text-slate-400 font-medium">{(quizzes || []).length} Available Quizzes</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(quizzes || []).length === 0 ? (
                            <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 space-y-3 shadow-lg">
                                <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
                                <p className="text-base font-semibold text-slate-300">No quizzes available at the moment.</p>
                                <p className="text-xs text-slate-500">Check back soon for newly published assessments.</p>
                            </div>
                        ) : (
                            (quizzes || []).map(quiz => {
                                const quizAttempts = attemptsList.filter(a => Number(a?.quiz_id) === Number(quiz?.id) && a?.status !== 'IN_PROGRESS');
                                const attemptsCount = quizAttempts.length;
                                const isMaxReached = attemptsCount >= (quiz?.max_attempts || 1);
                                const lastAttempt = quizAttempts[0];
                                const lastAttemptId = lastAttempt?.id;

                                return (
                                    <div key={quiz?.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-all flex flex-col group shadow-lg">
                                        <div className="mb-4">
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">{quiz?.title}</h3>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-bold border border-slate-700">
                                                        {quiz?.difficulty}
                                                    </span>
                                                    {Number(quiz?.negative_marks) > 0 && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                                                            -{quiz?.negative_marks} Neg Mark
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {quiz?.category_name && (
                                                <span className="text-xs text-purple-400 font-semibold block mb-2">{quiz?.category_name}</span>
                                            )}
                                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{quiz?.description}</p>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-slate-800/80 flex flex-col gap-4">
                                            <div className="flex justify-between text-xs text-slate-400 font-medium">
                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400" /> {quiz?.duration_minutes} mins</span>
                                                <span className="text-amber-400/90 font-bold">Pass: {quiz?.passing_score}%</span>
                                                <span>{quiz?.total_questions || 5} Qs</span>
                                            </div>

                                            {isMaxReached ? (
                                                <button 
                                                    onClick={() => navigate(`/student/result/${lastAttemptId}`)}
                                                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs shadow"
                                                >
                                                    <Trophy className="w-4 h-4 text-yellow-400" /> View Last Result
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleStartQuiz(quiz?.id)}
                                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs shadow-md hover:shadow-indigo-500/20"
                                                >
                                                    <PlayCircle className="w-4 h-4" /> Start Assessment
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* Attempt History */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Attempt History
                        </h2>
                    </div>

                    {attemptsList.length === 0 ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 space-y-3 shadow-lg">
                            <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
                            <p className="text-base font-semibold text-slate-200">You haven't attempted any quizzes yet.</p>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                Choose an assessment from the available quizzes above to test your skills and earn academic certificates!
                            </p>
                        </div>
                    ) : (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-800/60 text-xs uppercase font-bold text-slate-400 tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Quiz Title</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {attemptsList.map(attempt => (
                                        <tr key={attempt?.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-100">{attempt?.quiz_title}</td>
                                            <td className="px-6 py-4 text-xs text-slate-400">{new Date(attempt?.started_at || Date.now()).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-mono font-bold text-slate-200">{attempt?.percentage}%</td>
                                            <td className="px-6 py-4">
                                                {attempt?.status === 'PASSED' ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                                                    </span>
                                                ) : attempt?.status === 'IN_PROGRESS' ? (
                                                    <span className="inline-flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full text-xs font-bold border border-yellow-500/20">
                                                        <Clock className="w-3.5 h-3.5" /> In Progress
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-500/20">
                                                        <XCircle className="w-3.5 h-3.5" /> Failed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {attempt?.status !== 'IN_PROGRESS' && (
                                                    <button 
                                                        onClick={() => navigate(`/student/result/${attempt?.id}`)}
                                                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/20 cursor-pointer"
                                                    >
                                                        View Result
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            {dashboardError && (
                <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl space-y-4">
                        <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400 font-bold text-xl">
                            !
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{dashboardError}</p>
                        <button
                            onClick={() => setDashboardError('')}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
