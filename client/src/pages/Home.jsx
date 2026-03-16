import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardData } from '../api/dashboard';
import ProjectCard from '../components/ProjectCard'; // We might reuse this or create a mini version

const Home = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashboardData = await getDashboardData();
                setData(dashboardData);
            } catch (err) {
                console.error("Failed to fetch dashboard:", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError("Please log in to view your dashboard.");
                } else {
                    setError("Failed to load dashboard data.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    // If not logged in, show a friendly message (maybe moving towards a Login page later)
    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center h-full">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to NST-SDC Portal</h1>
                <p className="text-red-500 mb-4">{error}</p>
                {/* Placeholder for login button */}
                <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Log in
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-mono tracking-wide text-[#E0E0E0]">
                    <span className="text-[#00E0FF] text-4xl mr-2">{`>`}</span>
                    HELLO, <span className="text-white">{data?.user?.name || data?.user?.username || 'GUEST'}</span>
                </h1>
                <div className="bg-[#121212] border border-[#00E0FF]/30 text-[#00E0FF] px-6 py-2 rounded-lg font-bold font-mono shadow-[0_0_10px_rgba(0,224,255,0.1)]">
                    POINTS: <span className="text-white ml-2">{data?.user?.points ?? 0}</span>
                </div>
            </div>

            <div className="h-full grid grid-cols-3 grid-rows-2 gap-6 p-1">
                {/* Notices / Upcoming Events */}
                <div className="glass-panel rounded-xl p-6 col-span-2 row-span-1 overflow-y-auto">
                    <h2 className="text-xl mb-3 font-mono text-[#00E0FF] tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#00E0FF] rounded-full animate-pulse"></span>
                        UPCOMING EVENTS
                    </h2>
                    <div className="w-full border-t border-[#1f1f1f] mb-4"></div>

                    {data.upcoming_events.length > 0 ? (
                        <div className="space-y-4">
                            {data.upcoming_events.map(event => (
                                <div key={event.id} className="bg-[#1a1a1a] border border-[#333] p-4 rounded-lg flex justify-between items-center hover:border-[#00E0FF]/50 transition-colors group">
                                    <div>
                                        <h3 className="font-bold text-gray-200 group-hover:text-white transition-colors">{event.title}</h3>
                                        <p className="text-sm text-gray-500 font-mono">{new Date(event.event_date).toLocaleDateString()} @ {event.location}</p>
                                    </div>
                                    <span className="bg-[#00E0FF]/10 text-[#00E0FF] border border-[#00E0FF]/20 text-xs px-3 py-1 rounded font-mono uppercase tracking-wider">
                                        {event.event_type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 font-mono text-sm border border-dashed border-gray-800 p-4 rounded text-center">NO UPCOMING EVENTS DETECTED.</p>
                    )}
                </div>

                {/* Assigned Issues / Tasks */}
                <div className="glass-panel rounded-xl p-6 col-span-2 row-start-2 overflow-y-auto">
                    <h2 className="text-xl mb-3 font-mono text-yellow-400 tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        ASSIGNED TASKS
                    </h2>
                    <div className="w-full border-t border-[#1f1f1f] mb-4"></div>

                    {data.active_tasks.length > 0 ? (
                        <div className="space-y-4">
                            {data.active_tasks.map(task => (
                                <div key={task.id} className="bg-[#1a1a1a] border border-[#333] p-4 rounded-lg flex justify-between items-center hover:border-yellow-400/50 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-gray-200">{task.title}</h3>
                                        <p className="text-sm text-gray-500 font-mono">DUE: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'NO DEADLINE'}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-mono uppercase ${task.status === 'in_progress' ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20' : 'text-gray-400 bg-gray-800'}`}>
                                        {task.status_display}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 font-mono text-sm border border-dashed border-gray-800 p-4 rounded text-center">NO ACTIVE TASKS.</p>
                    )}
                </div>

                {/* Recent Works / Projects */}
                <div className="glass-panel rounded-xl p-6 row-span-2 col-start-3 overflow-y-auto">
                    <h2 className="text-xl mb-3 font-mono text-green-400 tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        RECENT PROJECTS
                    </h2>
                    <div className="w-full border-t border-[#1f1f1f] mb-4"></div>

                    {data.recent_projects.length > 0 ? (
                        <div className="space-y-4">
                            {data.recent_projects.map(project => (
                                <div key={project.id} className="bg-[#1a1a1a] border border-[#333] p-4 rounded-lg pb-4 hover:translate-x-1 transition-transform cursor-pointer">
                                    <h3 className="font-bold mb-1 text-white">{project.name}</h3>
                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                                    <div className="flex justify-end">
                                        <span className={`text-[10px] px-2 py-1 rounded border font-mono uppercase ${project.status === 'completed' ? 'text-green-400 border-green-400/30' :
                                                project.status === 'active' ? 'text-[#00E0FF] border-[#00E0FF]/30' : 'text-gray-400 border-gray-700'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 font-mono text-sm border border-dashed border-gray-800 p-4 rounded text-center">NO RECENT PROJECTS.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
