import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Trophy, CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft, Circle, Award, Printer, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const QuizResult = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCertificate, setShowCertificate] = useState(false);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await axiosInstance.get(`/attempts/${attemptId}`);
                const data = res.data?.data;
                setResult(data);
                if (data?.attempt?.status === 'PASSED' && location.state?.openCertificate) {
                    setShowCertificate(true);
                }
            } catch (err) {
                console.error("Error fetching result", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [attemptId, navigate, location.state]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-8">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
                <p className="text-lg font-medium text-slate-400">Loading and evaluating quiz results...</p>
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
    const passingScore = Number(attempt?.passing_score) || 75;
    const percentage = Number(attempt?.percentage) || 0;
    const isPassed = attempt?.status === 'PASSED' || Number(attempt?.percentage || 0) >= 75;

    const statusColor = isPassed ? 'text-emerald-400' : 'text-rose-400';
    const statusBg = isPassed ? 'bg-emerald-500/10' : 'bg-rose-500/10';
    const statusBorder = isPassed ? 'border-emerald-500/30' : 'border-rose-500/30';

    const formatTime = (seconds) => {
        const totalSecs = Math.max(0, parseInt(seconds, 10) || 0);
        const m = Math.floor(totalSecs / 60);
        const s = totalSecs % 60;
        return `${m}m ${s}s`;
    };

    const studentDisplayName = user?.name || attempt?.user_name || 'Accomplished Scholar';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-8 pb-16">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 rounded-xl mb-6 sticky top-0 z-20 shadow-md">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <button 
                        onClick={() => navigate('/student/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors font-medium text-sm cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <h1 className="text-base md:text-lg font-semibold text-slate-100">{attempt?.quiz_title || 'Quiz'} - Evaluation</h1>
                </div>
            </header>

            <main className="max-w-5xl mx-auto space-y-8">
                {/* Result Evaluation Banner */}
                <div className={`rounded-2xl p-8 border ${statusBorder} ${statusBg} flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl backdrop-blur-sm`}>
                    <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'} border-2 ${statusBorder} shadow-inner`}>
                            {isPassed ? <CheckCircle className="w-12 h-12 stroke-[2.5]" /> : <XCircle className="w-12 h-12 stroke-[2.5]" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    {isPassed ? 'Official Result: Passed' : 'Official Result: Needs Improvement'}
                                </span>
                            </div>
                            <h2 className={`text-3xl md:text-4xl font-black ${statusColor}`}>
                                {isPassed ? 'QUIZ PASSED! 🎉' : 'QUIZ FAILED'}
                            </h2>
                            <p className="text-slate-400 mt-1.5 text-sm">
                                {isPassed 
                                    ? `Congratulations! You scored ${percentage}% (Required to pass: ${passingScore}%).`
                                    : `You scored ${percentage}%. You need at least ${passingScore}% to pass this quiz.`
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3 w-full md:w-auto">
                        <div className="text-center bg-slate-950/60 p-5 rounded-xl border border-slate-800 backdrop-blur-sm min-w-[200px] w-full">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Score Obtained</p>
                            <p className="text-4xl md:text-5xl font-black text-white">{percentage}<span className="text-2xl text-slate-400">%</span></p>
                            <p className="text-xs text-indigo-400 font-medium mt-1.5">{attempt?.score || 0} Total Marks</p>
                        </div>
                        {isPassed && (
                            <button
                                onClick={() => setShowCertificate(true)}
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer hover:scale-[1.02]"
                            >
                                <Award className="w-4 h-4" /> Download / View Certificate
                            </button>
                        )}
                    </div>
                </div>

                {/* Performance Metrics Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0"><CheckCircle className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Correct</p>
                            <p className="text-2xl font-black text-emerald-400">{attempt?.correct_answers ?? 0}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0"><XCircle className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Incorrect</p>
                            <p className="text-2xl font-black text-rose-400">{attempt?.incorrect_answers ?? 0}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0"><AlertCircle className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Negative Deductions</p>
                            <p className="text-2xl font-black text-amber-400">-{attempt?.negative_deductions || '0.00'}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0"><AlertCircle className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Unanswered</p>
                            <p className="text-2xl font-black text-slate-200">{attempt?.unanswered ?? 0}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4 col-span-2 md:col-span-1">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0"><Clock className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Time Taken</p>
                            <p className="text-xl font-black text-slate-100">{formatTime(attempt?.time_taken_seconds)}</p>
                        </div>
                    </div>
                </div>

                {/* Detailed Question Review */}
                <div className="space-y-6 mt-8">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <h3 className="text-xl font-bold text-slate-100">Detailed Question Review</h3>
                        <span className="text-xs text-slate-400 font-medium">{(questions || []).length} Total Questions</span>
                    </div>

                    {(questions || [])?.map((q, idx) => {
                        const selectedOptionId = q?.user_selected_option_id || q?.user_answer?.selected_option_id;
                        const userSelected = (q?.options || [])?.find(o => o?.id === selectedOptionId);
                        const isQCorrect = userSelected && userSelected?.is_correct;
                        const isUnanswered = !selectedOptionId;

                        return (
                            <div key={q?.id || idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                                <div className="flex gap-4 mb-5">
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                        isQCorrect ? 'bg-emerald-500 text-white' : (isUnanswered ? 'bg-slate-700 text-slate-300' : 'bg-rose-500 text-white')
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-base md:text-lg font-medium text-slate-200">{q?.question_text}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs text-slate-400 font-medium bg-slate-800 px-2.5 py-0.5 rounded-full">{q?.marks || 5} Marks</span>
                                            {isQCorrect && <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">✓ Correct</span>}
                                            {!isQCorrect && !isUnanswered && <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full">✗ Incorrect</span>}
                                            {isUnanswered && <span className="text-xs text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded-full">○ Skipped</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2.5 mb-5 ml-0 md:ml-12">
                                    {(q?.options || [])?.map(opt => {
                                        const isSelectedHere = String(opt?.id) === String(selectedOptionId);
                                        const isCorrectHere  = opt?.is_correct;

                                        // ── Determine styling based on correctness + selection ──
                                        let optClass, icon, badge;

                                        if (isCorrectHere && isSelectedHere) {
                                            // ✅ User chose the right answer → full green
                                            optClass = 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm';
                                            icon     = <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
                                            badge    = <span className="ml-auto text-[11px] font-black tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 whitespace-nowrap">Your Answer (Correct) ✓</span>;
                                        } else if (!isCorrectHere && isSelectedHere) {
                                            // ❌ User chose the wrong answer → full red
                                            optClass = 'border-red-500/40 bg-red-500/20 text-red-300 font-semibold shadow-sm';
                                            icon     = <XCircle className="w-5 h-5 text-red-400 shrink-0" />;
                                            badge    = <span className="ml-auto text-[11px] font-black tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 whitespace-nowrap">Your Answer (Incorrect) ✗</span>;
                                        } else if (isCorrectHere && !isSelectedHere) {
                                            // ℹ️ This was the right answer but user didn't pick it → green outline
                                            optClass = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400';
                                            icon     = <CheckCircle className="w-5 h-5 text-emerald-400/80 shrink-0" />;
                                            badge    = <span className="ml-auto text-[11px] font-black tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-400 whitespace-nowrap">Correct Answer ✓</span>;
                                        } else {
                                            // Unselected, incorrect → muted slate
                                            optClass = 'border-slate-800 bg-slate-800/30 text-slate-400';
                                            icon     = <Circle className="w-4 h-4 text-slate-600 shrink-0" />;
                                            badge    = null;
                                        }

                                        return (
                                            <div key={opt?.id} className={`p-3.5 rounded-xl border-2 flex items-center gap-3 transition-all ${optClass}`}>
                                                {icon}
                                                <span className="text-sm flex-1">{opt?.option_text}</span>
                                                {badge}
                                            </div>
                                        );
                                    })}
                                </div>

                                {q?.explanation && (
                                    <div className="ml-0 md:ml-12 bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                            💡 Explanation
                                        </p>
                                        <p className="text-sm text-indigo-200/90 leading-relaxed">{q?.explanation}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Certificate of Completion Modal */}
            {showCertificate && (
                <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border-4 border-double border-amber-500/50 rounded-3xl p-6 md:p-10 max-w-3xl w-full text-center relative shadow-2xl my-8">
                        {/* Close button */}
                        <button
                            onClick={() => setShowCertificate(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Certificate Box */}
                        <div id="certificate-print-area" className="border-2 border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-8 md:p-12 rounded-2xl relative shadow-inner">
                            {/* Watermark/Seal Background */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                                <Award className="w-96 h-96 text-amber-400" />
                            </div>

                            {/* Header */}
                            <div className="mb-8">
                                <div className="inline-flex items-center justify-center gap-2 text-amber-400 font-extrabold tracking-widest text-xs uppercase mb-2">
                                    <Award className="w-4 h-4" /> Quizverse Academic Accreditation
                                </div>
                                <h3 className="text-2xl md:text-4xl font-serif font-black text-amber-200 tracking-wide">
                                    Quizverse Certificate of Academic Excellence
                                </h3>
                                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-4"></div>
                            </div>

                            {/* Body */}
                            <div className="space-y-4 my-8">
                                <p className="text-slate-400 text-sm italic font-serif">This is to officially certify that</p>
                                <h4 className="text-3xl md:text-4xl font-bold text-white font-serif tracking-wide text-amber-300">
                                    {studentDisplayName}
                                </h4>
                                <p className="text-slate-300 text-sm md:text-base max-w-lg mx-auto leading-relaxed pt-2">
                                    has successfully passed the comprehensive assessment for
                                </p>
                                <p className="text-xl md:text-2xl font-bold text-indigo-400 font-sans tracking-wide">
                                    {attempt?.quiz_title || 'Quiz Assessment'}
                                </p>
                                <p className="text-slate-300 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                                    with an outstanding score of <strong className="text-amber-400 font-black text-lg">{percentage}%</strong>.
                                </p>
                            </div>

                            {/* Metrics & Date */}
                            <div className="flex justify-center gap-6 text-sm text-slate-300 my-8 border-t border-b border-amber-500/20 py-4 max-w-md mx-auto">
                                <div>
                                    <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Passing Score</span>
                                    <span className="text-base font-bold text-emerald-400">{passingScore}%</span>
                                </div>
                                <div className="w-px bg-amber-500/20"></div>
                                <div>
                                    <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Score Achieved</span>
                                    <span className="text-base font-bold text-amber-400">{percentage}%</span>
                                </div>
                                <div className="w-px bg-amber-500/20"></div>
                                <div>
                                    <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Date Issued</span>
                                    <span className="text-base font-bold text-slate-200">
                                        {new Date(attempt?.completed_at || attempt?.started_at || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {/* Digital Stamp & Signatures */}
                            <div className="flex justify-between items-end mt-10 px-2 md:px-6">
                                <div className="text-left">
                                    <div className="font-serif italic text-base text-amber-300 font-bold border-b border-slate-700 pb-1 mb-1">
                                        Dr. Aris Vance
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                                        Chief Academic Dean
                                    </span>
                                </div>

                                {/* Authorized Digital Stamp */}
                                <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-400 flex flex-col items-center justify-center text-amber-400 font-serif shadow-lg rotate-[-8deg] bg-amber-500/10">
                                    <Award className="w-5 h-5 text-amber-400 mb-0.5" />
                                    <span className="text-[9px] font-black tracking-widest uppercase">VERIFIED</span>
                                    <span className="text-[7px] text-amber-300">STAMP</span>
                                </div>

                                <div className="text-right">
                                    <div className="font-mono text-xs text-indigo-400 border-b border-slate-700 pb-1 mb-1">
                                        QV-{attempt?.id?.toString().padStart(6, '0') || 'AUTH-01'}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                                        Digital Verification ID
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Controls */}
                        <div className="mt-6 flex justify-center gap-4">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl transition cursor-pointer text-sm shadow-md"
                            >
                                <Printer className="w-4 h-4" /> Print / Save PDF
                            </button>
                            <button
                                onClick={() => setShowCertificate(false)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizResult;
