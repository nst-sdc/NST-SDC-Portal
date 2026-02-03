import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Edit, Trash2, Plus, CheckCircle } from 'lucide-react';

const TaskManagement = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [users, setUsers] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        points: 10,
        due_date: ''
    });

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tasks/');
            setTasks(response.data.results || response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/');
            setUsers(response.data.results || response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = () => {
        setSelectedTask(null);
        setFormData({ title: '', description: '', assigned_to: '', points: 10, due_date: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (task) => {
        setSelectedTask(task);
        setFormData({
            title: task.title,
            description: task.description,
            assigned_to: task.assigned_to?.id || task.assigned_to, // Handle expand vs id
            points: task.points,
            due_date: task.due_date ? task.due_date.slice(0, 16) : ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete task?")) return;
        try {
            await api.delete(`/tasks/${id}/`);
            fetchTasks();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    const handleVerify = async (id) => {
        try {
            await api.post(`/tasks/${id}/verify/`);
            fetchTasks();
        } catch (error) {
            alert("Verification failed");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedTask) {
                await api.patch(`/tasks/${selectedTask.id}/`, formData);
            } else {
                await api.post('/tasks/', formData);
            }
            setIsModalOpen(false);
            fetchTasks();
        } catch (error) {
            alert("Operation failed");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Tasks</h2>
                <button onClick={handleCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">
                    <Plus size={18} /> Assign Task
                </button>
            </div>

            <div className="grid gap-4">
                {tasks.map(task => (
                    <div key={task.id} className="bg-white border rounded p-4 flex justify-between items-center hover:shadow-sm">
                        <div>
                            <h3 className="font-bold">{task.title}</h3>
                            <p className="text-sm text-gray-500">Assigned to: {task.assigned_to?.username || 'Unknown'}</p>
                            <div className="flex gap-4 mt-1 text-xs">
                                <span className={`px-2 py-0.5 rounded capitalize ${task.status === 'verified' ? 'bg-green-100 text-green-700' :
                                        task.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                                    }`}>
                                    {task.status}
                                </span>
                                <span>{task.points} pts</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {task.status === 'submitted' && (
                                <button onClick={() => handleVerify(task.id)} className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200">
                                    <CheckCircle size={16} /> Verify
                                </button>
                            )}
                            <button onClick={() => handleEdit(task)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                            <button onClick={() => handleDelete(task.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-bold mb-4">{selectedTask ? 'Edit Task' : 'New Task'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded" required />
                            <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded" required />
                            <select value={formData.assigned_to} onChange={e => setFormData({ ...formData, assigned_to: e.target.value })} className="w-full p-2 border rounded" required>
                                <option value="">Select Member</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                            </select>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Points" value={formData.points} onChange={e => setFormData({ ...formData, points: e.target.value })} className="w-full p-2 border rounded" required />
                                <input type="datetime-local" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="w-full p-2 border rounded" />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskManagement;
