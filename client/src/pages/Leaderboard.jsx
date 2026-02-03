import { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/leaderboard';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [period, setPeriod] = useState('all_time');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getLeaderboard(period);
                setUsers(data);
            } catch (err) {
                console.error("Failed to fetch leaderboard:", err);
                setError("Failed to load leaderboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [period]);

    const filters = [
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'all_time', label: 'All Time' },
    ];

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Leaderboard</h1>

            {/* Filter Tabs */}
            <div className="flex space-x-2 mb-8 bg-gray-200 p-1 rounded-lg w-fit">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => setPeriod(filter.id)}
                        className={`px-6 py-2 rounded-md font-medium transition-all ${period === filter.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading leaderboard...</div>
            ) : error ? (
                <div className="text-center py-20 text-red-500">{error}</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-500 w-20 text-center">Rank</th>
                                <th className="px-6 py-4 font-semibold text-gray-500">User</th>
                                <th className="px-6 py-4 font-semibold text-gray-500">Batch</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-right">Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user, index) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-center">
                                        {user.rank <= 3 ? (
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${user.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                user.rank === 2 ? 'bg-gray-200 text-gray-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {user.rank}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 font-medium">{user.rank}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3 overflow-hidden border border-blue-50">
                                                <img
                                                    src={user.avatar || (user.github_username ? `https://github.com/${user.github_username}.png` : `https://ui-avatars.com/api/?name=${user.full_name || user.username}&background=random`)}
                                                    alt={user.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{user.full_name || user.username}</div>
                                                <div className="text-sm text-gray-500">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {user.batch_year || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-blue-600 text-lg">{user.points}</span>
                                        <span className="text-gray-400 text-xs ml-1">pts</span>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-12 text-gray-500">
                                        No active users found for this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;

