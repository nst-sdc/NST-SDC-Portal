import { useEffect, useState } from 'react';
import { getAllEvents } from '../api/events';
import { Calendar, MapPin, Clock } from 'lucide-react';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'all'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getAllEvents();
                // Sort by date (descending for past, ascending for upcoming usually better, but let's just sort descending overall first)
                // Actually, backend orders by -event_date usually.
                setEvents(data);
            } catch (err) {
                console.error("Failed to fetch events:", err);
                setError("Failed to load events.");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const now = new Date();

    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.event_date);
        if (filter === 'upcoming') {
            return eventDate >= now;
        }
        if (filter === 'past') {
            return eventDate < now;
        }
        return true;
    });

    // Sort: Upcoming -> Ascending (Nearest first), Past -> Descending (Most recent first)
    const sortedEvents = [...filteredEvents].sort((a, b) => {
        const dateA = new Date(a.event_date);
        const dateB = new Date(b.event_date);
        if (filter === 'upcoming') {
            return dateA - dateB;
        }
        return dateB - dateA;
    });

    const getEventTypeColor = (type) => {
        switch (type) {
            case 'workshop': return 'bg-purple-100 text-purple-700';
            case 'hackathon': return 'bg-orange-100 text-orange-700';
            case 'meetup': return 'bg-blue-100 text-blue-700';
            case 'webinar': return 'bg-indigo-100 text-indigo-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading events...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Events</h1>

                {/* Filter Tabs */}
                <div className="flex bg-gray-200 p-1 rounded-lg">
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${filter === 'upcoming'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${filter === 'past'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Past
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${filter === 'all'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        All Events
                    </button>
                </div>
            </div>

            {sortedEvents.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No events found for this filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedEvents.map((event) => (
                        <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                            {event.banner && (
                                <div className="h-48 overflow-hidden bg-gray-100 relative group">
                                    <img
                                        src={event.banner}
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getEventTypeColor(event.event_type)}`}>
                                            {event.event_type}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {!event.banner && (
                                <div className="h-6 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                                    <div className="absolute -bottom-3 right-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm border border-white ${getEventTypeColor(event.event_type)}`}>
                                            {event.event_type}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                                    <div className="flex items-center text-gray-500 text-sm mb-1">
                                        <Calendar size={16} className="mr-2 text-blue-500" />
                                        {new Date(event.event_date).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <Clock size={16} className="mr-2 text-blue-500" />
                                        {new Date(event.event_date).toLocaleTimeString(undefined, {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                                    {event.description}
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <MapPin size={16} className="mr-1 text-gray-400" />
                                        <span className="truncate max-w-[150px]">{event.location}</span>
                                    </div>
                                    {event.meeting_link && (
                                        <a
                                            href={event.meeting_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Join Link &rarr;
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Events;
