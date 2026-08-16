import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axiosInstance';
import { Plus, HelpCircle, Trash2, CheckCircle2 } from 'lucide-react';

const ManageQuestions = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuizId, setSelectedQuizId] = useState('');
    const [questions, setQuestions] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);

    // Form State
    const [questionText, setQuestionText] = useState('');
    const [marks, setMarks] = useState(1);
    const [explanation, setExplanation] = useState('');
    const [options, setOptions] = useState([
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
    ]);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const res = await axiosInstance.get('/quizzes');
                const quizList = res.data?.data?.quizzes || [];
                setQuizzes(quizList);
                if (quizList.length > 0) {
                    setSelectedQuizId(quizList[0].id);
                } else {
                    setPageLoading(false);
                }
            } catch (err) {
                console.error('Fetch quizzes error:', err);
                setPageLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    const fetchQuestions = async (quizId) => {
        if (!quizId) return;
        try {
            const res = await axiosInstance.get(`/questions/quiz/${quizId}`);
            setQuestions(res.data?.data?.questions || []);
        } catch (err) {
            console.error('Fetch questions error:', err);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        if (selectedQuizId) {
            fetchQuestions(selectedQuizId);
        }
    }, [selectedQuizId]);

    const handleOptionTextChange = (index, value) => {
        const newOpts = [...options];
        newOpts[index].option_text = value;
        setOptions(newOpts);
    };

    const handleCorrectOptionSelect = (selectedIndex) => {
        const newOpts = options.map((opt, idx) => ({
            ...opt,
            is_correct: idx === selectedIndex,
        }));
        setOptions(newOpts);
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        if (!selectedQuizId) return alert('Please select a quiz.');

        try {
            await axiosInstance.post('/questions', {
                quiz_id: selectedQuizId,
                question_text: questionText,
                marks: Number(marks),
                explanation,
                options,
            });

            setQuestionText('');
            setExplanation('');
            setOptions([
                { option_text: '', is_correct: true },
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false },
            ]);
            fetchQuestions(selectedQuizId);
        } catch (err) {
            alert('Failed to add question.');
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await axiosInstance.delete(`/questions/${id}`);
            fetchQuestions(selectedQuizId);
        } catch (err) {
            alert('Failed to delete question.');
        }
    };

    if (pageLoading) {
        return (
            <div className="flex min-h-screen bg-slate-950 text-slate-100">
                <Sidebar />
                <div className="ml-64 flex-1 p-8 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
                    <p className="text-lg font-medium text-slate-350">Loading Quiz Questions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 font-sans">
                <h1 className="text-2xl font-bold text-slate-100 mb-6">Manage Question Bank</h1>

                {(quizzes || []).length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 max-w-3xl">
                        No quizzes available. Please create a quiz under the "Quizzes" page before adding questions.
                    </div>
                ) : (
                    <>
                        {/* Quiz Selector Dropdown */}
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-8 max-w-xl">
                            <label className="block text-sm font-medium text-slate-300 mb-1">Select Quiz</label>
                            <select
                                value={selectedQuizId}
                                onChange={(e) => setSelectedQuizId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            >
                                {(quizzes || [])?.map((q) => (
                                    <option key={q?.id} value={q?.id}>{q?.title} ({q?.status})</option>
                                ))}
                            </select>
                        </div>

                        {/* Question & 4 Options Form */}
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8 max-w-3xl">
                            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-indigo-400" /> Add Question & 4 Options
                            </h2>

                            <form onSubmit={handleAddQuestion} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Question Text</label>
                                    <textarea
                                        required
                                        value={questionText}
                                        onChange={(e) => setQuestionText(e.target.value)}
                                        placeholder="e.g. Which keyword is used to declare a constant variable in JavaScript?"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm h-20"
                                    />
                                </div>

                                {/* 4 Options Grid */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-300">Options (Select radio for Correct Answer)</label>
                                    {(options || [])?.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="correct_option"
                                                checked={opt?.is_correct}
                                                onChange={() => handleCorrectOptionSelect(idx)}
                                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                required
                                                value={opt?.option_text}
                                                onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                                                placeholder={`Option ${idx + 1}`}
                                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                                            />
                                            {opt?.is_correct && (
                                                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-medium">
                                                    Correct Choice
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Explanation (Shown after test)</label>
                                    <input
                                        type="text"
                                        value={explanation}
                                        onChange={(e) => setExplanation(e.target.value)}
                                        placeholder="e.g. const is used for block-scoped read-only constants."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> Save Question to Quiz
                                </button>
                            </form>
                        </div>

                        {/* Existing Questions List */}
                        <div className="space-y-4 max-w-3xl">
                            <h3 className="text-lg font-semibold text-slate-200">Questions in this Quiz ({(questions || []).length})</h3>
                            {(questions || []).length === 0 ? (
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                                    No questions added to this quiz yet. Use the form above to add a question!
                                </div>
                            ) : (
                                (questions || [])?.map((q, idx) => (
                                    <div key={q?.id || idx} className="bg-slate-805 border border-slate-700 rounded-xl p-5 shadow-sm hover:border-indigo-500/10 transition-all">
                                        <div className="flex items-start justify-between mb-3">
                                            <h4 className="font-medium text-slate-100 text-sm">
                                                {idx + 1}. {q?.question_text}
                                            </h4>
                                            <button
                                                onClick={() => handleDeleteQuestion(q?.id)}
                                                className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {(q?.options || [])?.map((opt) => (
                                                <div
                                                    key={opt?.id}
                                                    className={`p-2 rounded border ${opt?.is_correct
                                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                                            : 'bg-slate-900 border-slate-700 text-slate-400'
                                                        }`}
                                                >
                                                    {opt?.option_text} {opt?.is_correct && '✓'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ManageQuestions;