import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axiosInstance';
import { Plus, Trash2, FolderPlus } from 'lucide-react';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCategories = async () => {
        try {
            const res = await axiosInstance.get('/categories');
            setCategories(res.data?.data?.categories);
        } catch (err) {
            console.error('Fetch categories error:', err);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axiosInstance.post('/categories', { name, description });
            setName('');
            setDescription('');
            fetchCategories(); // Refresh categories list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create category.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await axiosInstance.delete(`/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert('Failed to delete category.');
        }
    };

    if (pageLoading) {
        return (
            <div className="flex min-h-screen bg-slate-950 text-slate-100">
                <Sidebar />
                <div className="ml-64 flex-1 p-8 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
                    <p className="text-lg font-medium text-slate-350">Loading Quiz Categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            <Sidebar />
            <div className="ml-64 flex-1 p-8">
                <h1 className="text-2xl font-bold text-slate-100 mb-6">Manage Quiz Categories</h1>

                {/* Create Form */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8 max-w-2xl">
                    <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                        <FolderPlus className="w-5 h-5 text-indigo-400" /> Create New Category
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Category Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. JavaScript, Python, PostgreSQL"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of the category..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm h-20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" /> {loading ? 'Creating...' : 'Add Category'}
                        </button>
                    </form>
                </div>

                {/* Categories Data Table */}
                {(categories || []).length === 0 ? (
                    <div className="bg-slate-905 border border-slate-800 rounded-xl p-8 text-center text-slate-400 max-w-5xl">
                        No categories created yet. Use the form above to add a new category.
                    </div>
                ) : (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden max-w-5xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Category Name</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {(categories || [])?.map((cat) => (
                                    <tr key={cat?.id} className="hover:bg-slate-700/30">
                                        <td className="px-6 py-4 font-medium text-slate-200">{cat?.name}</td>
                                        <td className="px-6 py-4 text-slate-400">{cat?.description || 'No description'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(cat?.id)}
                                                className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageCategories;