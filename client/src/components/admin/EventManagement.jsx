import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Edit, Trash2, Plus, Calendar, MapPin, Users } from 'lucide-react';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [users, setUsers] = useState([]); // For attendance marking

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_type: 'meetup',
        event_date: '',
        location: '',
        meeting_link: ''
    });

    const [attendanceData, setAttendanceData] = useState({
        user_id: '',
        status: 'present'
    });

    useEffect(() => {
        fetchEvents();
        fetchUsers();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/events/');
            setEvents(response.data.results || response.data);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/');
            setUsers(response.data.results || response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const handleCreate = () => {
        setSelectedEvent(null);
        setFormData({
            title: '',
            description: '',
            event_type: 'meetup',
            event_date: '',
            location: '',
            meeting_link: ''
        });
        setIsEventModalOpen(true);
    };

    const handleEdit = (event) => {
        setSelectedEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            event_type: event.event_type,
            event_date: event.event_date.slice(0, 16), // Format for datetime-local
            location: event.location,
            meeting_link: event.meeting_link
        });
        setIsEventModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            await api.delete(`/events/${id}/`);
            fetchEvents();
        } catch (error) {
            alert("Failed to delete event");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedEvent) {
                await api.patch(`/events/${selectedEvent.id}/`, formData);
            } else {
                await api.post('/events/', formData);
            }
            setIsEventModalOpen(false);
            fetchEvents();
        } catch (error) {
            alert("Operation failed");
        }
    };

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        if (!selectedEvent) return;

        try {
            await api.post('/attendance/', {
                event: selectedEvent.id,
                user: attendanceData.user_id,
                status: attendanceData.status
            });
            alert("Attendance marked");
            // Optional: reset user selection
        } catch (error) {
            alert("Failed to mark attendance (already marked?)");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Events</h2>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={18} /> Add Event
                </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid gap-4">
                    {events.map(event => (
                        <div key={event.id} className="bg-white border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{event.title}</h3>
                                <div className="text-sm text-gray-500 flex gap-4 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {new Date(event.event_date).toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} />
                                        {event.location}
                                    </span>
                                    <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs border">
                                        {event.event_type}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        setIsAttendanceModalOpen(true);
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded border border-green-200"
                                >
                                    <Users size={16} /> Attendance
                                </button>
                                <button
                                    onClick={() => handleEdit(event)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isEventModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-bold mb-4">{selectedEvent ? 'Edit Event' : 'Add Event'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text" placeholder="Title" value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-2 border rounded" required
                            />
                            <textarea
                                placeholder="Description" value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-2 border rounded" required
                            />
                            <select
                                value={formData.event_type}
                                onChange={e => setFormData({ ...formData, event_type: e.target.value })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="meetup">Meetup</option>
                                <option value="workshop">Workshop</option>
                                <option value="hackathon">Hackathon</option>
                                <option value="webinar">Webinar</option>
                            </select>
                            <input
                                type="datetime-local" value={formData.event_date}
                                onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                                className="w-full p-2 border rounded" required
                            />
                            <input
                                type="text" placeholder="Location" value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="w-full p-2 border rounded" required
                            />
                            <input
                                type="url" placeholder="Meeting Link (Optional)" value={formData.meeting_link}
                                onChange={e => setFormData({ ...formData, meeting_link: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsEventModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isAttendanceModalOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Mark Attendance for {selectedEvent.title}</h2>
                        <form onSubmit={handleMarkAttendance} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Select User</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={attendanceData.user_id}
                                    onChange={e => setAttendanceData({ ...attendanceData, user_id: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select User --</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={attendanceData.status}
                                    onChange={e => setAttendanceData({ ...attendanceData, status: e.target.value })}
                                >
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="excused">Excused</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsAttendanceModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Close</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Mark</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventManagement;
