import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Timer from '../../components/Timer';
import {
    ChevronLeft, ChevronRight, CheckCircle, Circle,
    AlertTriangle, Trophy, XCircle, Clock, Award,
    BarChart2, BookOpen, ArrowRight
} from 'lucide-react';

const TakeQuiz = () => {
    const { quizId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState(location.state?.attempt || null);
    const [answers, setAnswers] = useState({});
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(!attempt);
    const [showConfirm, setShowConfirm] = useState(false);

    // Instant result state shown immediately after submit
    const [resultData, setResultData] = useState(null);

    useEffect(() => {
        if (!attempt) {
            const start = async () => {
                try {
                    const res = await axiosInstance.post('/attempts/start', { quiz_id: quizId });
                    setAttempt(res.data.data);
                } catch (err) {
                    const msg = err.response?.data?.message || 'Error starting quiz';
                    setErrorMessage(msg);
                } finally {
                    setLoading(false);
                }
            };
            start();
        }
    }, [attempt, quizId, navigate]);

    const handleSelectOption = (questionId, optionId) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = async () => {
        if (submitting || submitted) return;
        setShowConfirm(false);
        setSubmitting(true);
        try {
            const answersPayload = Object.keys(answers).map(qId => ({
                question_id: qId,
                selected_option_id: answers[qId]
            }));

            const res = await axiosInstance.post('/attempts/submit', {
                attempt_id: attempt.attempt_id,
                answers: answersPayload
            });

            const data = res.data?.data;
            setResultData(data?.attempt || null);
            setSubmitted(true);
            setSubmitting(false);
        } catch (err) {
            console.error('Submit error:', err);
            setSubmitting(false);
            const msg = err.response?.data?.message || '';

            // If attempt was already submitted navigate to results instead of error
            if (msg.toLowerCase().includes('already submitted') || msg.toLowerCase().includes('invalid')) {
                navigate(`/student/result/${attempt.attempt_id}`);
                return;
            }
            setErrorMessage(msg || 'Error submitting quiz. Please try again.');
        }
    };

    const scrollToQuestion = (idx) => {
        const el = document.getElementById(`question-card-${idx}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const formatTime = (seconds) => {
        const s = Math.max(0, parseInt(seconds, 10) || 0);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}m ${sec}s`;
    };

    if (loading || !attempt) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-8">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
                <p className="text-lg font-medium text-slate-400">Preparing Exam...</p>
            </div>
        );
    }

    const questions = attempt?.questions || [];
    const answeredCount = Object.keys(answers || {}).length;
    const unansweredCount = questions.length - answeredCount;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
            {/* Sticky Header */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-20 shadow-md">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-100">Quiz Assessment</h1>
                        <p className="text-sm text-slate-400">Answer all questions before time runs out</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-400">Progress:</span>
                            <span className="text-sm font-bold text-emerald-400">{answeredCount} / {questions.length}</span>
                        </div>
                        <Timer expiresAt={attempt?.expires_at} onTimeUp={handleSubmit} />
                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                        >
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col md:flex-row gap-8 flex-1">
                {/* Main scrollable list of all questions */}
                <div className="flex-1 space-y-6">
                    {(questions || []).map((q, idx) => (
                        <div 
                            key={q.id || idx} 
                            id={`question-card-${idx}`}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-xl flex flex-col"
                        >
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-indigo-400 font-bold tracking-wider text-sm uppercase">
                                        Question {idx + 1} of {questions.length}
                                    </span>
                                    <span className="text-slate-400 font-medium bg-slate-800 px-3 py-1 rounded-full text-xs">
                                        {q.marks} Marks
                                    </span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-medium leading-relaxed text-slate-100">
                                    {q.question_text}
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {(q.options || [])?.map((opt) => {
                                    const isSelected = answers[q.id] === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleSelectOption(q.id, opt.id)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 cursor-pointer ${
                                                isSelected
                                                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-lg shadow-indigo-500/10'
                                                    : 'border-slate-800 bg-slate-800/30 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                                                isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-500'
                                            }`}>
                                                {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                            </div>
                                            <span className="text-lg">{opt.option_text}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Question Palette */}
                <div className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl h-fit sticky top-28">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Question Navigator</h3>

                    <div className="grid grid-cols-5 gap-3">
                        {(questions || [])?.map((q, idx) => {
                            const isAnswered = !!answers[q?.id];
                            return (
                                <button
                                    key={q?.id || idx}
                                    onClick={() => scrollToQuestion(idx)}
                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all flex items-center justify-center cursor-pointer ${
                                        isAnswered
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                                    }`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-8 space-y-3 border-t border-slate-800 pt-6">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/30"></div>
                            <span>Answered</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700"></div>
                            <span>Unanswered</span>
                        </div>
                    </div>

                    {unansweredCount > 0 && (
                        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-200/70 leading-relaxed">
                                You have <strong className="text-yellow-300">{unansweredCount}</strong> unanswered question{unansweredCount > 1 ? 's' : ''}.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Submitting Spinner Overlay */}
            {submitting && (
                <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-10 rounded-2xl max-w-md w-full text-center shadow-2xl space-y-6">
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto shadow-lg"></div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">Evaluating Your Answers...</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Please do not close or refresh this page. Your performance is being calculated.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Instant Result Overlay shown immediately after submit */}
            {submitted && resultData && (
                <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-8">

                        {/* Status Banner */}
                        <div className={`p-6 text-center ${
                            resultData.status === 'PASSED'
                                ? 'bg-gradient-to-br from-emerald-950 to-slate-900 border-b border-emerald-500/30'
                                : 'bg-gradient-to-br from-rose-950 to-slate-900 border-b border-rose-500/30'
                        }`}>
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                resultData.status === 'PASSED'
                                    ? 'bg-emerald-500/20 border-2 border-emerald-500/40'
                                    : 'bg-rose-500/20 border-2 border-rose-500/40'
                            }`}>
                                {resultData.status === 'PASSED'
                                    ? <Trophy className="w-10 h-10 text-emerald-400" />
                                    : <XCircle className="w-10 h-10 text-rose-400" />
                                }
                            </div>
                            <div className={`inline-block text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-2 ${
                                resultData.status === 'PASSED'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/20 text-rose-400'
                            }`}>
                                Official Result: {resultData.status === 'PASSED' ? 'Passed' : 'Failed'}
                            </div>
                            <h2 className={`text-3xl font-black mt-1 ${
                                resultData.status === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                                {resultData.status === 'PASSED' ? 'QUIZ PASSED! 🎉' : 'QUIZ FAILED'}
                            </h2>
                        </div>

                        {/* Score Big Number */}
                        <div className="px-8 py-6 text-center border-b border-slate-800">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Score Obtained</p>
                            <p className="text-6xl font-black text-white">
                                {resultData.percentage ?? 0}
                                <span className="text-3xl text-slate-400">%</span>
                            </p>
                            <p className="text-sm text-slate-400 mt-2">
                                <span className="text-indigo-400 font-bold">{resultData.score ?? 0} marks</span>
                                {' '}out of total &middot; Passing required:{' '}
                                <span className="text-amber-400 font-bold">{resultData.passing_score ?? 70}%</span>
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-px bg-slate-800 border-b border-slate-800">
                            {[
                                {
                                    label: 'Correct',
                                    value: resultData.correct_answers ?? 0,
                                    color: 'text-emerald-400',
                                    bg: 'bg-emerald-500/10',
                                    icon: <CheckCircle className="w-5 h-5 text-emerald-400" />
                                },
                                {
                                    label: 'Incorrect',
                                    value: resultData.incorrect_answers ?? 0,
                                    color: 'text-rose-400',
                                    bg: 'bg-rose-500/10',
                                    icon: <XCircle className="w-5 h-5 text-rose-400" />
                                },
                                {
                                    label: 'Unanswered',
                                    value: resultData.unanswered ?? 0,
                                    color: 'text-slate-300',
                                    bg: 'bg-slate-800/80',
                                    icon: <Circle className="w-5 h-5 text-slate-400" />
                                },
                                {
                                    label: 'Time Taken',
                                    value: formatTime(resultData.time_taken_seconds),
                                    color: 'text-indigo-300',
                                    bg: 'bg-indigo-500/10',
                                    icon: <Clock className="w-5 h-5 text-indigo-400" />
                                },
                            ].map((stat, i) => (
                                <div key={i} className="bg-slate-900 p-5 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                                        <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Negative deductions row if any */}
                        {Number(resultData.negative_deductions) > 0 && (
                            <div className="px-6 py-3 bg-amber-500/5 border-b border-slate-800 flex items-center justify-between">
                                <span className="text-xs text-amber-300/70 font-medium uppercase tracking-wider flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Negative Deductions Applied
                                </span>
                                <span className="text-amber-400 font-black text-sm">-{resultData.negative_deductions}</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="p-6 space-y-3">
                            <button
                                onClick={() => navigate(`/student/result/${attempt.attempt_id}`)}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer hover:scale-[1.01]"
                            >
                                <BarChart2 className="w-4 h-4" />
                                View Full Question Review
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            {resultData.status === 'PASSED' && (
                                <button
                                    onClick={() => navigate(`/student/result/${attempt.attempt_id}`, { state: { openCertificate: true } })}
                                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer hover:scale-[1.01]"
                                >
                                    <Award className="w-4 h-4" />
                                    View Certificate of Completion
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/student/dashboard')}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-6 py-3 rounded-xl transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Submit Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl space-y-6">
                        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-400">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">Submit Quiz?</h3>
                            {unansweredCount > 0 ? (
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    You have <strong className="text-amber-400">{unansweredCount} unanswered</strong> question{unansweredCount > 1 ? 's' : ''}.
                                    Unanswered questions will be marked as skipped.
                                </p>
                            ) : (
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    All {questions.length} questions answered. Ready to submit?
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition cursor-pointer text-sm"
                            >
                                Continue Quiz
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer text-sm shadow-lg"
                            >
                                Yes, Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {errorMessage && (
                <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-red-500/20 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl space-y-6">
                        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-white">Error</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{errorMessage}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setErrorMessage('')}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition cursor-pointer text-sm"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => { setErrorMessage(''); navigate('/student/dashboard'); }}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
                            >
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TakeQuiz;