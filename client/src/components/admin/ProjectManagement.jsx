import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Edit, Trash2, Plus, Github, ExternalLink } from 'lucide-react';

const ProjectManagement = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [users, setUsers] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'planning',
        repo_url: '',
        demo_url: '',
        lead_id: ''
    });

    useEffect(() => {
        fetchProjects();
        fetchUsers();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await api.get('/projects/');
            setProjects(response.data.results || response.data);
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
        setSelectedProject(null);
        setFormData({
            name: '',
            description: '',
            status: 'planning',
            repo_url: '',
            demo_url: '',
            lead_id: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (project) => {
        setSelectedProject(project);
        setFormData({
            name: project.name,
            description: project.description,
            status: project.status,
            repo_url: project.github_repo || '',
            demo_url: project.demo_url || '',
            lead_id: project.lead || '' // Adjust based on serializer (id vs object)
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this project?")) return;
        try {
            await api.delete(`/projects/${id}/`);
            fetchProjects();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                status: formData.status,
                github_repo: formData.repo_url,
                demo_url: formData.demo_url,
                lead: formData.lead_id ? formData.lead_id : null
            };

            if (selectedProject) {
                await api.patch(`/projects/${selectedProject.id}/`, payload);
            } else {
                await api.post('/projects/', payload);
            }
            setIsModalOpen(false);
            fetchProjects();
        } catch (error) {
            alert("Operation failed");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Projects</h2>
                <button onClick={handleCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">
                    <Plus size={18} /> Add Project
                </button>
            </div>

            <div className="grid gap-4">
                {projects.map(project => (
                    <div key={project.id} className="bg-white border rounded p-4 flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg">{project.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                            <div className="flex gap-4 mt-2 text-sm">
                                <span className={`px-2 py-0.5 rounded border capitalize ${project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                                    }`}>
                                    {project.status.replace('_', ' ')}
                                </span>
                                {project.github_repo && (
                                    <a href={project.github_repo} target="_blank" className="flex items-center gap-1 text-blue-600">
                                        <Github size={14} /> Repo
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(project)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                            <button onClick={() => handleDelete(project.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-bold mb-4">{selectedProject ? 'Edit Project' : 'Add Project'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded" required />
                            <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded" required />
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full p-2 border rounded">
                                <option value="planning">Planning</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="archived">Archived</option>
                            </select>
                            <select value={formData.lead_id} onChange={e => setFormData({ ...formData, lead_id: e.target.value })} className="w-full p-2 border rounded">
                                <option value="">Select Project Lead</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                            </select>
                            <input type="url" placeholder="GitHub Repo URL" value={formData.repo_url} onChange={e => setFormData({ ...formData, repo_url: e.target.value })} className="w-full p-2 border rounded" />
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

export default ProjectManagement;
