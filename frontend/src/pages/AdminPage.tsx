import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    _id: string;
    name: string;
    email: string;
    createdAt: number;
}

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/users');
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data.users);
            setError('');
        } catch (err) {
            setError('Failed to load user data');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">User Database</h1>
                    <div className="flex gap-4">
                        <button onClick={fetchUsers} className="btn bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
                            🔄 Refresh
                        </button>
                        <button onClick={() => navigate('/')} className="btn btn-secondary">
                            Back to Home
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-slate-600">Loading users...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                        {error}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 font-semibold text-slate-700">Name</th>
                                        <th className="p-4 font-semibold text-slate-700">Email</th>
                                        <th className="p-4 font-semibold text-slate-700">User ID</th>
                                        <th className="p-4 font-semibold text-slate-700">Joined At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-500">
                                                No users found yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 font-medium text-slate-900">{user.name}</td>
                                                <td className="p-4 text-slate-600">{user.email}</td>
                                                <td className="p-4 text-slate-400 font-mono text-sm">{user._id}</td>
                                                <td className="p-4 text-slate-600">{formatDate(user.createdAt)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
