import { useState, useEffect } from 'react';
import { getProfile, updateProfile, getUserProjects } from '../api/profile';
import { changePassword } from '../api/auth';
import { User, Mail, MapPin, Link as LinkIcon, Github, Linkedin, Calendar, Edit2, Check, X, Code, Briefcase, Lock } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_new_password: '' });
    const [formData, setFormData] = useState({});
    const [githubData, setGithubData] = useState(null);

    // Fetch Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await getProfile();
                setUser(userData);
                setFormData(userData);

                if (userData.id) {
                    const projectsData = await getUserProjects(userData.id);
                    setProjects(projectsData);
                }

                if (userData.github_username) {
                    fetchGithubDetails(userData.github_username);
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const fetchGithubDetails = async (username) => {
        if (!username) return;
        try {
            const res = await fetch(`https://api.github.com/users/${username}`);
            if (res.ok) {
                const data = await res.json();
                setGithubData(data);
            }
        } catch (err) {
            console.error("Failed to fetch github data", err);
        }
    };

    // Handle Form Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Skills Change (Comma separated)
    const handleSkillsChange = (e) => {
        const skillsString = e.target.value;
        setFormData({ ...formData, tech_skills: skillsString.split(',').map(s => s.trim()) });
    };

    // Helper to ensure URL has protocol
    const fixUrl = (url) => {
        if (!url) return null;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`;
        }
        return url;
    };

    // Save Profile
    const handleSave = async () => {
        try {
            const updatedUser = await updateProfile({
                bio: formData.bio,
                github_username: formData.github_username,
                linkedin_url: fixUrl(formData.linkedin_url),
                portfolio_url: fixUrl(formData.portfolio_url),
                tech_skills: Array.isArray(formData.tech_skills) ? formData.tech_skills.filter(s => s.trim()) : [],
            });
            setUser(updatedUser);
            if (updatedUser.github_username && updatedUser.github_username !== user.github_username) {
                fetchGithubDetails(updatedUser.github_username);
            }
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            // safe error parsing
            let errorMessage = "Failed to update profile.";
            if (error.response && error.response.data) {
                // If data is object, try to join values
                const data = error.response.data;
                if (typeof data === 'object') {
                    const messages = Object.entries(data).map(([key, value]) => {
                        const valStr = Array.isArray(value) ? value.join(' ') : String(value);
                        return `${key}: ${valStr}`;
                    });
                    errorMessage = messages.join('\n');
                } else {
                    errorMessage = String(data);
                }
            }
            alert(errorMessage);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_new_password) {
            alert("New passwords do not match!");
            return;
        }

        try {
            await changePassword(passwordData);
            alert("Password updated successfully!");
            setIsChangingPassword(false);
            setPasswordData({ old_password: '', new_password: '', confirm_new_password: '' });
        } catch (error) {
            console.error("Failed to change password", error);
            alert(error.response?.data?.old_password?.[0] || error.response?.data?.new_password?.[0] || "Failed to change password.");
        }
    };

    if (loading) return <div className="p-8">Loading profile...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header / Banner */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex flex-col md:flex-row gap-6 items-start relative">

                {/* Avatar */}
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md flex-shrink-0">
                    <img
                        src={user.avatar || (user.github_username ? `https://github.com/${user.github_username}.png` : `https://ui-avatars.com/api/?name=${user.full_name}&background=random`)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{user.full_name}</h1>
                            <p className="text-gray-500 font-medium">@{user.username} • {user.is_club_admin ? 'Club Admin' : 'Member'}</p>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            {isEditing ? <X size={18} /> : <Edit2 size={18} />}
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                        {!isEditing && (
                            <button
                                onClick={() => setIsChangingPassword(true)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ml-2"
                            >
                                <Lock size={18} /> Change Password
                            </button>
                        )}
                    </div>

                    {/* Password Change Modal */}
                    {isChangingPassword && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                                <h3 className="text-xl font-bold mb-4">Change Password</h3>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <input
                                        type="password"
                                        placeholder="Old Password"
                                        value={passwordData.old_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                        minLength={8}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirm New Password"
                                        value={passwordData.confirm_new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm_new_password: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                        minLength={8}
                                    />
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsChangingPassword(false)}
                                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded">
                            <Mail size={16} /> {user.email}
                        </div>
                        {user.student_id && (
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded">
                                <User size={16} /> ID: {user.student_id}
                            </div>
                        )}
                        {user.batch_year && (
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded">
                                <Calendar size={16} /> Batch of {user.batch_year}
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <textarea
                            name="bio"
                            value={formData.bio || ''}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                            className="w-full mt-4 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows="3"
                        />
                    ) : (
                        <p className="mt-4 text-gray-700 leading-relaxed max-w-3xl">
                            {user.bio || "No bio added yet."}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Socials, Skills, Stats */}
                <div className="md:col-span-1 space-y-6">

                    {/* Social Links */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><LinkIcon size={20} /> Socials</h3>
                        <div className="space-y-3">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <input name="linkedin_url" value={formData.linkedin_url || ''} onChange={handleChange} placeholder="LinkedIn URL" className="w-full p-2 border rounded text-sm" />
                                    <input name="github_username" value={formData.github_username || ''} onChange={handleChange} placeholder="GitHub Username" className="w-full p-2 border rounded text-sm" />
                                    <input name="portfolio_url" value={formData.portfolio_url || ''} onChange={handleChange} placeholder="Portfolio URL" className="w-full p-2 border rounded text-sm" />
                                </div>
                            ) : (
                                <>
                                    {user.linkedin_url && (
                                        <a href={user.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-blue-700 hover:underline p-2 rounded hover:bg-blue-50 transition-colors">
                                            <Linkedin size={20} /> LinkedIn
                                        </a>
                                    )}
                                    {user.github_username && (
                                        <a href={`https://github.com/${user.github_username}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-900 hover:underline p-2 rounded hover:bg-gray-100 transition-colors">
                                            <Github size={20} /> GitHub
                                        </a>
                                    )}
                                    {user.portfolio_url && (
                                        <a href={user.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-emerald-600 hover:underline p-2 rounded hover:bg-emerald-50 transition-colors">
                                            <LinkIcon size={20} /> Portfolio
                                        </a>
                                    )}
                                    {!user.linkedin_url && !user.github_username && !user.portfolio_url && (
                                        <p className="text-gray-400 text-sm italic">No links added.</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tech Skills */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Code size={20} /> Skills</h3>

                        {isEditing ? (
                            <input
                                name="tech_skills"
                                value={formData.tech_skills ? formData.tech_skills.join(', ') : ''}
                                onChange={handleSkillsChange}
                                placeholder="Python, React, etc. (comma separated)"
                                className="w-full p-2 border rounded text-sm"
                            />
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {user.tech_skills && user.tech_skills.length > 0 ? (
                                    user.tech_skills.map((skill, index) => (
                                        <span key={index} className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm italic">No skills added.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* GitHub Stats */}
                    {user.github_username && !isEditing && (
                        <div className="bg-white rounded-lg shadow-sm p-6 overflow-hidden">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Github size={20} /> GitHub Profile</h3>

                            {githubData ? (
                                <div className="space-y-4">
                                    {/* GitHub Bio */}
                                    {githubData.bio && (
                                        <p className="text-gray-600 text-sm italic">"{githubData.bio}"</p>
                                    )}

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <div className="text-lg font-bold text-gray-800">{githubData.public_repos}</div>
                                            <div className="text-xs text-gray-500">Repos</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-gray-800">{githubData.followers}</div>
                                            <div className="text-xs text-gray-500">Followers</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-gray-800">{githubData.following}</div>
                                            <div className="text-xs text-gray-500">Following</div>
                                        </div>
                                    </div>

                                    {/* Additional Details */}
                                    <div className="space-y-2 text-sm text-gray-600">
                                        {githubData.company && (
                                            <div className="flex items-center gap-2">
                                                <Briefcase size={14} /> {githubData.company}
                                            </div>
                                        )}
                                        {githubData.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} /> {githubData.location}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} /> Joined {new Date(githubData.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <a
                                        href={githubData.html_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block text-center mt-2 text-blue-600 text-sm hover:underline"
                                    >
                                        View on GitHub
                                    </a>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    Loading GitHub data...
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Projects */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm p-6 h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase /> Projects</h2>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                                {projects.length} Assigned
                            </span>
                        </div>

                        {projects.length > 0 ? (
                            <div className="space-y-4">
                                {projects.map(project => (
                                    <div key={project.id} className="border border-gray-100 rounded-lg p-5 hover:shadow-md transition-shadow group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                {project.name}
                                            </h3>
                                            <span className={`px-2 py-1 text-xs rounded-full uppercase font-bold tracking-wider ${project.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 line-clamp-2 mb-4">{project.description}</p>

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>Start: {new Date(project.created_at).toLocaleDateString()}</span>
                                            {project.lead && (
                                                <div className="flex items-center gap-1">
                                                    <span>Lead:</span>
                                                    <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden">
                                                        <img
                                                            src={project.lead.avatar || `https://ui-avatars.com/api/?name=${project.lead.full_name}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg">
                                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No projects assigned yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Save Button for Edit Mode */}
            {isEditing && (
                <div className="fixed bottom-6 right-6 flex gap-4 animate-in slide-in-from-bottom-5">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="bg-white text-gray-700 px-6 py-3 rounded-full shadow-lg font-bold border border-gray-200 hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-blue-700 font-bold transition-all flex items-center gap-2"
                    >
                        <Check size={20} /> Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default Profile;
