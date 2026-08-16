import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { PlayCircle, CheckCircle2, Trophy, Clock, XCircle } from 'lucide-react';

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
                console.log("res.data.data.quizzes:", quizRes.data.data.quizzes);
                setQuizzes(quizRes.data.data.quizzes);
                setHistory(historyRes.data.data.attempts);
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
                <p className="text-lg font-medium text-slate-350">Loading Student Dashboard...</p>
            </div>
        );
    }

    const totalPassed = (history || []).filter(a => a?.status === 'PASSED').length;
    const validHistory = (history || []).filter(a => a?.percentage !== undefined && a?.percentage !== null);
    const avgScore = validHistory.length > 0 
        ? (validHistory.reduce((acc, curr) => acc + parseFloat(curr?.percentage || 0), 0) / validHistory.length).toFixed(1) 
        : 0;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            {/* Top Navigation */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-indigo-400">⚡ Quizverse <span className="text-slate-400 font-medium ml-2 text-sm">Student Portal</span></h1>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/student/leaderboard')} 
                            className="text-sm flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition cursor-pointer font-semibold"
                        >
                            <Trophy className="w-4 h-4 fill-yellow-400 text-yellow-400" /> View Leaderboard
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{user?.name}</span>
                        </div>
                        <button onClick={handleSignOut} className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition cursor-pointer">Sign Out</button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Stats Overview */}
                <section>
                    <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Your Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
                            <p className="text-slate-400 text-sm">Total Attempts</p>
                            <p className="text-3xl font-bold text-slate-100 mt-1">{(history || []).length}</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
                            <p className="text-slate-400 text-sm">Quizzes Passed</p>
                            <p className="text-3xl font-bold text-emerald-400 mt-1">{totalPassed}</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
                            <p className="text-slate-400 text-sm">Average Score</p>
                            <p className="text-3xl font-bold text-indigo-400 mt-1">{avgScore}%</p>
                        </div>
                    </div>
                </section>

                {/* Available Quizzes */}
                <section>
                    <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2"><PlayCircle className="w-5 h-5 text-indigo-400" /> Available Quizzes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(quizzes || []).length === 0 ? (
                            <div className="col-span-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                                No quizzes available right now.
                            </div>
                        ) : (
                            (quizzes || [])?.map(quiz => {
                                const quizAttempts = (history || []).filter(a => a?.quiz_id === quiz?.id && a?.status !== 'IN_PROGRESS');
                                const attemptsCount = quizAttempts.length;
                                const isMaxReached = attemptsCount >= (quiz?.max_attempts || 1);
                                const lastAttempt = quizAttempts[0];
                                const lastAttemptId = lastAttempt?.id;

                                return (
                                    <div key={quiz?.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-purple-500/50 transition-colors flex flex-col group shadow-lg">
                                        <div className="mb-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-slate-100 group-hover:text-purple-400 transition-colors">{quiz?.title}</h3>
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">{quiz?.difficulty}</span>
                                                    {Number(quiz?.negative_marks) > 0 && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                                                            -{quiz?.negative_marks} Neg
                                                        </span>
                                                    )}
                                                    {isMaxReached && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-bold whitespace-nowrap">
                                                            Attempt Completed (Max Reached)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {quiz?.category_name && (
                                                <span className="text-xs text-purple-400 font-medium block mb-2">{quiz?.category_name}</span>
                                            )}
                                            <p className="text-slate-400 text-sm line-clamp-2">{quiz?.description}</p>
                                        </div>
                                        <div className="mt-auto flex flex-col gap-4">
                                            <div className="flex justify-between text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {quiz?.duration_minutes} mins</span>
                                                <span>Pass: {quiz?.passing_score}%</span>
                                                <span>{quiz?.total_questions || 0} Questions</span>
                                            </div>
                                            {isMaxReached ? (
                                                <button 
                                                    onClick={() => navigate(`/student/result/${lastAttemptId}`)}
                                                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <Trophy className="w-4 h-4 text-yellow-400" /> View Last Result
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleStartQuiz(quiz?.id)}
                                                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <PlayCircle className="w-4 h-4" /> Start Quiz
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
                    <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Attempt History</h2>
                    {(history || []).length === 0 ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                            You haven't attempted any quizzes yet.
                        </div>
                    ) : (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">Quiz Title</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {(history || [])?.map(attempt => (
                                        <tr key={attempt?.id} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">{attempt?.quiz_title}</td>
                                            <td className="px-6 py-4">{new Date(attempt?.started_at || Date.now()).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-mono">{attempt?.percentage}%</td>
                                            <td className="px-6 py-4">
                                                {attempt?.status === 'PASSED' ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md text-xs font-medium"><CheckCircle2 className="w-3 h-3" /> Passed</span>
                                                ) : attempt?.status === 'IN_PROGRESS' ? (
                                                    <span className="inline-flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md text-xs font-medium"><Clock className="w-3 h-3" /> In Progress</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-md text-xs font-medium"><XCircle className="w-3 h-3" /> {attempt?.status}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {attempt?.status !== 'IN_PROGRESS' && (
                                                    <button 
                                                        onClick={() => navigate(`/student/result/${attempt?.id}`)}
                                                        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
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
                        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400 font-bold text-xl">
                            !
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{dashboardError}</p>
                        <button
                            onClick={() => setDashboardError('')}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition-colors cursor-pointer text-sm"
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
