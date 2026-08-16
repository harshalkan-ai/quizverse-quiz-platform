import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Trophy, CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft, Circle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const QuizResult = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCertificate, setShowCertificate] = useState(false);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await axiosInstance.get(`/attempts/${attemptId}`);
                setResult(res.data?.data);
            } catch (err) {
                console.error("Error fetching result", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [attemptId, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-105 p-8">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
                <p className="text-lg font-medium text-slate-350">Loading and evaluating quiz results...</p>
            </div>
        );
    }

    if (!result || !result.attempt) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 p-8">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl space-y-6">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">Failed to Load Quiz Result</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            We couldn't retrieve or evaluate the details for this quiz attempt.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer text-sm shadow-md"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const { attempt, questions } = result;
    const isPassed = attempt?.status === 'PASSED';
    const statusColor = isPassed ? 'text-emerald-400' : (attempt?.status === 'TIMED_OUT' ? 'text-yellow-400' : 'text-red-400');
    const statusBg = isPassed ? 'bg-emerald-500/10' : (attempt?.status === 'TIMED_OUT' ? 'bg-yellow-500/10' : 'bg-red-500/10');
    const statusBorder = isPassed ? 'border-emerald-500/30' : (attempt?.status === 'TIMED_OUT' ? 'border-yellow-500/30' : 'border-red-500/30');

    const formatTime = (seconds) => {
        const totalSecs = seconds || 0;
        const m = Math.floor(totalSecs / 60);
        const s = totalSecs % 60;
        return `${m}m ${s}s`;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8 pb-12">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 rounded-xl mb-6 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <button 
                        onClick={() => navigate('/student/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                    </button>
                    <h1 className="text-lg font-semibold text-slate-100">{attempt?.quiz_title || 'Quiz'} - Result</h1>
                </div>
            </header>

            <main className="max-w-5xl mx-auto mt-4 space-y-8">
                {/* Score Banner */}
                <div className={`rounded-2xl p-8 border ${statusBorder} ${statusBg} flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl`}>
                    <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isPassed ? 'bg-emerald-500/20' : 'bg-red-500/20'} border-4 ${statusBorder}`}>
                            {isPassed ? <Trophy className={`w-10 h-10 ${statusColor}`} /> : <XCircle className={`w-10 h-10 ${statusColor}`} />}
                        </div>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">Final Result</p>
                            <h2 className={`text-4xl font-black ${statusColor}`}>{attempt?.status || 'UNKNOWN'}</h2>
                            <p className="text-slate-400 mt-2 text-sm">Required to pass: {attempt?.passing_score || 0}%</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <div className="text-center bg-slate-950/40 p-6 rounded-xl border border-slate-800/50 backdrop-blur-sm min-w-[200px]">
                            <p className="text-sm font-medium text-slate-400 mb-1">Obtained Score</p>
                            <p className="text-5xl font-black text-white">{attempt?.percentage || 0}<span className="text-2xl text-slate-500">%</span></p>
                            <p className="text-xs text-slate-500 mt-2">{attempt?.score || 0} Marks</p>
                        </div>
                        {isPassed && (
                            <button
                                onClick={() => setShowCertificate(true)}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer hover:scale-[1.02]"
                            >
                                🎓 Download Certificate
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><CheckCircle className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Correct</p>
                            <p className="text-xl font-bold text-slate-100">{attempt?.correct_answers || 0}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400"><XCircle className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Incorrect</p>
                            <p className="text-xl font-bold text-slate-100">{attempt?.incorrect_answers || 0}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400"><AlertCircle className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Negative Deductions</p>
                            <p className="text-xl font-bold text-rose-400">-{attempt?.negative_deductions || '0.00'}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400"><AlertCircle className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Unanswered</p>
                            <p className="text-xl font-bold text-slate-100">{attempt?.unanswered || 0}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Clock className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Time Taken</p>
                            <p className="text-lg font-bold text-slate-100">{formatTime(attempt?.time_taken_seconds)}</p>
                        </div>
                    </div>
                </div>

                {/* Detailed Review */}
                <div className="space-y-6 mt-12">
                    <h3 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-4">Detailed Question Review</h3>
                    {(questions || [])?.map((q, idx) => {
                        const selectedOptionId = q?.user_selected_option_id || q?.user_answer?.selected_option_id;
                        const userSelected = (q?.options || [])?.find(o => o?.id === selectedOptionId);
                        const isQCorrect = userSelected && userSelected?.is_correct;
                        const isUnanswered = !selectedOptionId;

                        return (
                            <div key={q?.id || idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                                <div className="flex gap-4 mb-6">
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                        isQCorrect ? 'bg-emerald-500 text-white' : (isUnanswered ? 'bg-slate-700 text-slate-300' : 'bg-red-500 text-white')
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-medium text-slate-200">{q?.question_text}</h4>
                                        <span className="text-xs text-slate-500 font-medium bg-slate-800 px-2 py-1 rounded mt-2 inline-block">{q?.marks} Marks</span>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6 ml-12">
                                    {(q?.options || [])?.map(opt => {
                                        const isSelectedHere = opt?.id === selectedOptionId;
                                        const isCorrectHere = opt?.is_correct;
                                        
                                        let optClass = "border-slate-800 bg-slate-800/30 text-slate-400"; // default
                                        let icon = <Circle className="w-4 h-4 text-slate-600" />;

                                        if (isCorrectHere && isSelectedHere) {
                                            optClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-medium";
                                            icon = <CheckCircle className="w-5 h-5 text-emerald-500" />;
                                        } else if (isCorrectHere && !isSelectedHere) {
                                            optClass = "border-emerald-500/30 bg-emerald-500/5 text-emerald-400";
                                            icon = <CheckCircle className="w-5 h-5 text-emerald-500 opacity-70" />;
                                        } else if (!isCorrectHere && isSelectedHere) {
                                            optClass = "border-red-500/50 bg-red-500/10 text-red-300";
                                            icon = <XCircle className="w-5 h-5 text-red-500" />;
                                        }

                                        return (
                                            <div key={opt?.id} className={`p-4 rounded-lg border-2 flex items-center gap-3 ${optClass}`}>
                                                {icon}
                                                <span>{opt?.option_text}</span>
                                                {isSelectedHere && <span className="ml-auto text-xs uppercase font-bold tracking-wider opacity-60">Your Answer</span>}
                                            </div>
                                        );
                                    })}
                                </div>

                                {q?.explanation && (
                                    <div className="ml-12 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Explanation</p>
                                        <p className="text-sm text-indigo-200/80 leading-relaxed">{q?.explanation}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            {showCertificate && (
                <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border-4 border-double border-amber-500/40 rounded-2xl p-8 max-w-2xl w-full text-center relative shadow-2xl overflow-hidden">
                        {/* Golden Decorative Ornaments */}
                        <div className="absolute -top-12 -left-12 w-28 h-28 bg-amber-500/10 rounded-full blur-xl"></div>
                        <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-xl"></div>

                        <div className="border border-slate-800 p-6 rounded-xl relative">
                            {/* Certificate Header */}
                            <div className="mb-6">
                                <span className="text-amber-500 font-bold tracking-widest text-xs uppercase block mb-1">Quizverse Assessment System</span>
                                <h3 className="text-3xl font-serif font-black text-slate-100 tracking-wide">Certificate of Completion</h3>
                                <div className="w-24 h-0.5 bg-amber-500/30 mx-auto mt-3"></div>
                            </div>

                            {/* Presentation Statement */}
                            <p className="text-slate-400 text-sm font-medium italic mb-2">This is proudly presented to</p>
                            <h4 className="text-2xl font-bold text-white font-serif mb-4 decoration-amber-500/50 underline underline-offset-8 decoration-wavy">{user?.name}</h4>
                            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-6">
                                for successfully completing and passing the standard assessment criteria for the exam
                            </p>

                            {/* Quiz Title */}
                            <h5 className="text-xl font-bold text-indigo-400 mb-2">{attempt?.quiz_title}</h5>
                            
                            {/* Score & Passing Metrics */}
                            <div className="flex justify-center gap-8 text-sm text-slate-300 mb-8 border-t border-b border-slate-800 py-3 max-w-sm mx-auto">
                                <div>
                                    <span className="text-slate-500 block text-xs uppercase font-medium">Final Score</span>
                                    <span className="text-lg font-bold text-amber-500">{attempt?.percentage}%</span>
                                </div>
                                <div className="w-px bg-slate-800"></div>
                                <div>
                                    <span className="text-slate-500 block text-xs uppercase font-medium">Date Issued</span>
                                    <span className="text-lg font-bold">{new Date(attempt?.completed_at || attempt?.started_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Footer Seals & Authorized Signatures */}
                            <div className="flex justify-between items-center mt-8 px-4">
                                <div className="text-left">
                                    <div className="font-serif italic text-sm text-slate-300 mb-1 border-b border-slate-800 pb-1">Quizverse Certification</div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Board of Examiners</span>
                                </div>
                                
                                {/* Seal Badge */}
                                <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-dashed border-amber-500/50 flex items-center justify-center shadow-lg relative transform rotate-12">
                                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-serif font-black text-xs text-center">SEAL</div>
                                </div>

                                <div className="text-right">
                                    <div className="font-serif italic text-sm text-slate-300 mb-1 border-b border-slate-800 pb-1">AI Verified Core</div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Credential Status</span>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="mt-8 flex justify-center gap-4">
                            <button
                                onClick={() => window.print()}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-2 rounded-lg transition-colors text-sm cursor-pointer"
                            >
                                Print Certificate
                            </button>
                            <button
                                onClick={() => setShowCertificate(false)}
                                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors text-sm cursor-pointer"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizResult;
