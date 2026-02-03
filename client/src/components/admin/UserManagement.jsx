import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Edit, Trash2, UserPlus, Check, X } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        is_club_admin: false,
        is_member: true,
        password: ''
    });

    useEffect(() => {
        fetchUsers();
    }, [search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/', { params: { search } });
            setUsers(response.data.results || response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setFormData({
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            is_club_admin: false,
            is_member: true,
            password: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            is_club_admin: user.is_club_admin,
            is_member: user.is_member,
            password: '' // Don't fill password
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/users/${id}/`);
            fetchUsers();
            alert("User deleted successfully");
        } catch (error) {
            alert("Failed to delete user");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedUser) {
                // Remove password if empty to avoid updating it
                const data = { ...formData };
                if (!data.password) delete data.password;

                await api.patch(`/users/${selectedUser.id}/`, data);
                alert("User updated successfully");
            } else {
                await api.post('/users/', formData);
                alert("User created successfully");
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Operation failed", error);
            alert("Operation failed check console");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <UserPlus size={18} /> Add User
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-4 text-sm font-semibold text-gray-600">User</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-800">{user.username}</div>
                                        <div className="text-sm text-gray-500">{user.first_name} {user.last_name}</div>
                                    </td>
                                    <td className="p-4 text-gray-600">{user.email}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {user.is_club_admin && (
                                                <span className="px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
                                                    Admin
                                                </span>
                                            )}
                                            {user.is_member && (
                                                <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                                    Member
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{selectedUser ? 'Edit User' : 'Add User'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full p-2 border rounded mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-2 border rounded mt-1"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full p-2 border rounded mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full p-2 border rounded mt-1"
                                    />
                                </div>
                            </div>
                            {!selectedUser && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full p-2 border rounded mt-1"
                                        required={!selectedUser}
                                    />
                                </div>
                            )}
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_member}
                                        onChange={(e) => setFormData({ ...formData, is_member: e.target.checked })}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-sm">Is Member</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_club_admin}
                                        onChange={(e) => setFormData({ ...formData, is_club_admin: e.target.checked })}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-sm">Is Admin</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {selectedUser ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
