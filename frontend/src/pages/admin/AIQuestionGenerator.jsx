import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axiosInstance';
import { Sparkles, Save, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

const AIQuestionGenerator = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('EASY');
    const [questionCount, setQuestionCount] = useState(5);
    const [selectedQuizId, setSelectedQuizId] = useState('');

    const [previewQuestions, setPreviewQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const res = await axiosInstance.get('/quizzes');
                const quizList = res.data?.data?.quizzes || [];
                setQuizzes(quizList);
                if (quizList.length > 0) {
                    setSelectedQuizId(quizList[0].id);
                }
            } catch (err) {
                console.error('Failed to load quizzes', err);
                setErrorMsg('Failed to load quizzes list.');
            } finally {
                setPageLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic.trim()) {
            setErrorMsg('Please specify a topic.');
            return;
        }
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        setPreviewQuestions([]);

        try {
            const res = await axiosInstance.post('/ai/generate-questions', {
                topic: topic.trim(),
                difficulty,
                questionCount: parseInt(questionCount)
            });
            setPreviewQuestions(res.data?.data?.questions || []);
            setSuccessMsg('Questions generated successfully for preview!');
        } catch (err) {
            console.error('Generation error', err);
            setErrorMsg(err.response?.data?.message || 'Failed to generate questions.');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!selectedQuizId) {
            setErrorMsg('Please select a target quiz first.');
            return;
        }
        if ((previewQuestions || []).length === 0) {
            setErrorMsg('No questions to import.');
            return;
        }

        setImporting(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            await axiosInstance.post('/ai/generate-questions', {
                quiz_id: selectedQuizId,
                questions: previewQuestions
            });
            setSuccessMsg(`Successfully imported ${previewQuestions.length} questions into target quiz!`);
            setPreviewQuestions([]); // Clear preview after successful import
        } catch (err) {
            console.error('Import error', err);
            setErrorMsg(err.response?.data?.message || 'Failed to import questions to quiz.');
        } finally {
            setImporting(false);
        }
    };

    const handleRemovePreviewItem = (index) => {
        setPreviewQuestions(prev => (prev || []).filter((_, idx) => idx !== index));
    };

    if (pageLoading) {
        return (
            <div className="flex min-h-screen bg-slate-950 text-slate-100">
                <Sidebar />
                <div className="ml-64 flex-1 p-8 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
                    <p className="text-lg font-medium text-slate-350">Loading AI Question Generator...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 space-y-8 overflow-y-auto">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
                        <Sparkles className="w-8 h-8 text-indigo-400" /> AI Question Generator
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Generate high-quality multiple choice questions instantly using AI model reasoning.</p>
                </div>

                {/* Main Generator Form */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <form onSubmit={handleGenerate} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 lg:col-span-1 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-100 mb-2">Generation Criteria</h2>
                        
                        <div>
                            <label htmlFor="topic" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Topic / Subject</label>
                            <input 
                                id="topic"
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. React Hooks, PostgreSQL Joins"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="difficulty" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Difficulty</label>
                                <select 
                                    id="difficulty"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="EASY">Easy</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="count" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Count</label>
                                <input 
                                    id="count"
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="quiz" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Quiz Destination</label>
                            <select 
                                id="quiz"
                                value={selectedQuizId}
                                onChange={(e) => setSelectedQuizId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                                required
                            >
                                <option value="" disabled>Select target quiz</option>
                                {(quizzes || [])?.map(quiz => (
                                    <option key={quiz?.id} value={quiz?.id}>{quiz?.title} ({quiz?.difficulty})</option>
                                ))}
                            </select>
                            {(quizzes || []).length === 0 && (
                                <p className="text-xs text-amber-400 mt-2">No quizzes available. Please create a quiz first.</p>
                            )}
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || (quizzes || []).length === 0}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                        >
                            <Sparkles className="w-4 h-4" /> 
                            {loading ? 'Generating with AI...' : 'Generate Questions with AI'}
                        </button>
                    </form>

                    {/* Preview Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {successMsg && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                <span>{successMsg}</span>
                            </div>
                        )}
                        {errorMsg && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-2 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {(previewQuestions || []).length > 0 && (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-100">Questions Preview ({(previewQuestions || []).length})</h2>
                                        <p className="text-slate-400 text-xs mt-0.5">Review, refine, or drop questions before saving to database.</p>
                                    </div>
                                    <button 
                                        onClick={handleImport}
                                        disabled={importing}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg disabled:opacity-50 cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" />
                                        {importing ? 'Importing...' : 'Import to Quiz'}
                                    </button>
                                </div>

                                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                                    {(previewQuestions || [])?.map((q, idx) => (
                                        <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 space-y-4 relative group">
                                            <button 
                                                onClick={() => handleRemovePreviewItem(idx)}
                                                className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition"
                                                title="Remove this question"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            
                                            <div>
                                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Question {idx + 1}</span>
                                                <p className="text-slate-100 font-medium mt-1">{q?.question_text}</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {(q?.options || [])?.map((opt, oIdx) => (
                                                    <div 
                                                        key={oIdx} 
                                                        className={`p-3 rounded-lg border text-sm flex justify-between items-center ${
                                                            opt?.is_correct 
                                                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' 
                                                                : 'bg-slate-900 border-slate-800 text-slate-400'
                                                        }`}
                                                    >
                                                        <span>{opt?.option_text}</span>
                                                        {opt?.is_correct && <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Correct</span>}
                                                    </div>
                                                ))}
                                            </div>

                                            {q?.explanation && (
                                                <div className="bg-slate-900/50 border border-slate-800/40 p-3 rounded-lg text-xs text-slate-400">
                                                    <span className="font-semibold text-slate-300 block mb-1">Explanation:</span>
                                                    {q?.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(previewQuestions || []).length === 0 && !loading && (
                            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                                <Sparkles className="w-12 h-12 text-slate-700" />
                                <div>
                                    <p className="text-slate-400 font-semibold">No questions generated yet</p>
                                    <p className="text-slate-500 text-xs mt-1">Configure criteria on the left and start the AI engine.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIQuestionGenerator;
