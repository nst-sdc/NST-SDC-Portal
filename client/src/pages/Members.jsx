import { useEffect, useState } from 'react';
import { getMembers } from '../api/members';
import { Github, Mail } from 'lucide-react';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const data = await getMembers();
                setMembers(data);
            } catch (err) {
                console.error("Failed to fetch members:", err);
                setError("Failed to load members.");
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const getRoleBadge = (user) => {
        if (user.is_club_admin) {
            return <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">Admin</span>;
        }
        if (user.is_staff) {
            return <span className="px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">Staff</span>;
        }
        if (user.is_member) {
            return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">Member</span>;
        }
        return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">User</span>;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading members...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Club Members</h1>
                <span className="text-gray-500">{members.length} members</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-500">Member</th>
                                <th className="px-6 py-4 font-semibold text-gray-500">Role & Position</th>
                                <th className="px-6 py-4 font-semibold text-gray-500">Batch</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-right">Links</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3 overflow-hidden">
                                                {member.avatar ? (
                                                    <img src={member.avatar} alt={member.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    (member.full_name || member.username).charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{member.full_name || member.username}</div>
                                                <div className="text-sm text-gray-500">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-start gap-1">
                                            {getRoleBadge(member)}
                                            {member.skill_level && (
                                                <span className="text-xs text-gray-500 capitalize">{member.skill_level} Dev</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {member.batch_year || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {member.github_username && (
                                                <a
                                                    href={`https://github.com/${member.github_username}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                                                    title={`GitHub: ${member.github_username}`}
                                                >
                                                    <Github size={18} />
                                                </a>
                                            )}
                                            <a
                                                href={`mailto:${member.email}`}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title={`Email: ${member.email}`}
                                            >
                                                <Mail size={18} />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Members;
