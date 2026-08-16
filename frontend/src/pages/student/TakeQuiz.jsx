import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Timer from '../../components/Timer';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, AlertTriangle } from 'lucide-react';

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

    useEffect(() => {
        if (!attempt) {
            // If they navigated directly here, attempt to start or fetch existing IN_PROGRESS attempt
            // In a real app we might fetch in-progress attempt, but for now just start new if none.
            const start = async () => {
                try {
                    const res = await axiosInstance.post('/attempts/start', { quiz_id: quizId });
                    setAttempt(res.data.data);
                } catch (err) {
                    setErrorMessage(err.response?.data?.message || 'Error starting quiz');
                } finally {
                    setLoading(false);
                }
            };
            start();
        }
    }, [attempt, quizId, navigate]);

    const handleSelectOption = (questionId, optionId) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const handleSubmit = async () => {
        if (submitting || submitted) return;
        setSubmitting(true);
        try {
            const answersPayload = Object.keys(answers).map(qId => ({
                question_id: qId,
                selected_option_id: answers[qId]
            }));

            await axiosInstance.post('/attempts/submit', {
                attempt_id: attempt.attempt_id,
                answers: answersPayload
            });

            setSubmitted(true);
            setSubmitting(false);

            setTimeout(() => {
                navigate(`/student/result/${attempt.attempt_id}`);
            }, 1500);
        } catch (err) {
            console.error('Submit error:', err);
            setSubmitting(false);
            setErrorMessage(err.response?.data?.message || 'Error submitting quiz');
        }
    };

    if (loading || !attempt) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-8">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
                <p className="text-lg font-medium text-slate-355">Preparing Exam...</p>
            </div>
        );
    }

    const questions = attempt?.questions || [];
    const currentQuestion = questions[currentQIndex];
    const answeredCount = Object.keys(answers || {}).length;

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
                            onClick={handleSubmit} 
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col md:flex-row gap-8 flex-1">
                {/* Main Question Area */}
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-10 shadow-xl flex flex-col">
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-indigo-400 font-bold tracking-wider text-sm uppercase">Question {currentQIndex + 1} of {questions.length}</span>
                            <span className="text-slate-400 font-medium bg-slate-800 px-3 py-1 rounded-full text-xs">{currentQuestion?.marks} Marks</span>
                        </div>
                        <h2 className="text-2xl font-medium leading-relaxed text-slate-100">{currentQuestion?.question_text}</h2>
                    </div>

                    <div className="space-y-3 flex-1">
                        {(currentQuestion?.options || [])?.map((opt) => {
                            const isSelected = answers[currentQuestion?.id] === opt?.id;
                            return (
                                <button
                                    key={opt?.id}
                                    onClick={() => handleSelectOption(currentQuestion?.id, opt?.id)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                                        isSelected 
                                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' 
                                            : 'border-slate-800 bg-slate-800/30 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                                        isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-500'
                                    }`}>
                                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                    <span className="text-lg">{opt?.option_text}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-800">
                        <button 
                            onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQIndex === 0}
                            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" /> Previous
                        </button>
                        
                        {currentQIndex < questions.length - 1 ? (
                            <button 
                                onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors bg-indigo-500/10 px-6 py-2.5 rounded-lg hover:bg-indigo-500/20"
                            >
                                Next <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <span className="text-emerald-500 font-medium flex items-center gap-2 bg-emerald-500/10 px-6 py-2.5 rounded-lg border border-emerald-500/20">
                                <CheckCircle className="w-5 h-5" /> End of Quiz
                            </span>
                        )}
                    </div>
                </div>

                {/* Sidebar Question Palette */}
                <div className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl h-fit sticky top-28">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Question Navigator</h3>
                    
                    <div className="grid grid-cols-5 gap-3">
                        {(questions || [])?.map((q, idx) => {
                            const isAnswered = !!answers[q?.id];
                            const isCurrent = currentQIndex === idx;
                            return (
                                <button
                                    key={q?.id || idx}
                                    onClick={() => setCurrentQIndex(idx)}
                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${
                                        isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900' : ''
                                    } ${
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
                    
                    {answeredCount < questions.length && (
                        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-200/70 leading-relaxed">You have {questions.length - answeredCount} unanswered questions left.</p>
                        </div>
                    )}
                </div>
            </main>
            {(submitting || submitted) && (
                <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl space-y-6">
                        {submitted ? (
                            <>
                                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">Quiz Submitted Successfully! 🎉</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Your responses have been recorded and evaluated by the server. Loading your score breakdown...
                                    </p>
                                </div>
                                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto shadow-lg"></div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">Submitting Assessment...</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Please do not close or refresh this page. Your performance metrics are being finalized.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-red-500/20 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl space-y-6">
                        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-white">Action Denied</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{errorMessage}</p>
                        </div>
                        <button
                            onClick={() => {
                                setErrorMessage('');
                                navigate('/student/dashboard');
                            }}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TakeQuiz;
