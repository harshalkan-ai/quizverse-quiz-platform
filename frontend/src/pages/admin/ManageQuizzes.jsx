import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axiosInstance';
import { Plus, CheckCircle, XCircle, Trash2, FileText } from 'lucide-react';

const ManageQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [difficulty, setDifficulty] = useState('EASY');
    const [duration, setDuration] = useState(15);
    const [passingScore, setPassingScore] = useState(70);
    const [maxAttempts, setMaxAttempts] = useState(1);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [quizRes, catRes] = await Promise.all([
                axiosInstance.get('/quizzes'),
                axiosInstance.get('/categories')
            ]);
            setQuizzes(quizRes.data?.data?.quizzes);
            setCategories(catRes.data?.data?.categories);
        } catch (err) {
            console.error('Fetch data error:', err);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axiosInstance.post('/quizzes', {
                title,
                description,
                category_id: categoryId || null,
                difficulty,
                duration_minutes: Number(duration),
                passing_score: Number(passingScore),
                max_attempts: Number(maxAttempts)
            });
            setTitle('');
            setDescription('');
            fetchData(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create quiz.');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublish = async (id, currentStatus) => {
        const newStatus = currentStatus === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
        try {
            await axiosInstance.patch(`/quizzes/${id}/publish`, { status: newStatus });
            fetchData();
        } catch (err) {
            alert('Failed to update status.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this quiz? All questions will be removed.')) return;
        try {
            await axiosInstance.delete(`/quizzes/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete quiz.');
        }
    };

    if (pageLoading) {
        return (
            <div className="flex min-h-screen bg-slate-950 text-slate-100">
                <Sidebar />
                <div className="ml-64 flex-1 p-8 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
                    <p className="text-lg font-medium text-slate-350">Loading Quizzes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 font-sans">
                <h1 className="text-2xl font-bold text-slate-100 mb-6">Manage Quizzes</h1>

                {/* Create Quiz Form */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8 max-w-3xl">
                    <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-400" /> Create New Quiz (DRAFT)
                    </h2>

                    <form onSubmit={handleCreateQuiz} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-1">Quiz Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. JavaScript ES6 Fundamentals"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            >
                                <option value="">Select Category...</option>
                                {(categories || [])?.map((c) => (
                                    <option key={c?.id} value={c?.id}>{c?.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Difficulty</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            >
                                <option value="EASY">Easy</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Duration (Minutes)</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Passing Score (%)</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                required
                                value={passingScore}
                                onChange={(e) => setPassingScore(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" /> {loading ? 'Creating...' : 'Create Draft Quiz'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Quizzes Grid */}
                {(quizzes || []).length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 max-w-3xl">
                        No quizzes created yet. Create a draft quiz using the form above to get started.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                        {(quizzes || [])?.map((q) => (
                            <div key={q?.id} className="bg-slate-805 border border-slate-700 rounded-xl p-6 flex flex-col justify-between shadow-md hover:border-indigo-500/20 transition-all">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-medium">
                                            {q?.category_name || 'Uncategorized'}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${q?.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                            {q?.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-100 mb-1">{q?.title}</h3>
                                    <p className="text-slate-400 text-xs mb-4">
                                        {q?.duration_minutes} mins | Passing: {q?.passing_score}% | Questions: {q?.total_questions || 0}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-700/60 pt-4 mt-2">
                                    <button
                                        onClick={() => handleTogglePublish(q?.id, q?.status)}
                                        className={`text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${q?.status === 'PUBLISHED' ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                            }`}
                                    >
                                        {q?.status === 'PUBLISHED' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                        {q?.status === 'PUBLISHED' ? 'Unpublish' : 'Publish Quiz'}
                                    </button>

                                    <button
                                        onClick={() => handleDelete(q?.id)}
                                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageQuizzes;