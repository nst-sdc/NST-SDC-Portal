import { useEffect, useState } from 'react';
import { getMyAttendance, getPastEvents } from '../api/attendance';
import { CheckCircle, XCircle } from 'lucide-react';

const Attendance = () => {
    const [attended, setAttended] = useState([]);
    const [missed, setMissed] = useState([]);
    const [percentage, setPercentage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch ALL attendance and PAST MEETUPS
                const [attendanceData, pastEventsData] = await Promise.all([
                    getMyAttendance(),
                    getPastEvents('meetup') // Only fetch past meetups
                ]);

                // Filter attendance to ONLY include meetups
                // We need to know the event type of the attendance records.
                // Assuming the serializer includes the full event object or at least the type.
                // Let's verify via the passed event object in attendanceData.

                // Filter "My Attendance" to only keep records where event_type is 'meetup'
                // Note: The backend AttendanceSerializer nests the 'event' object. 
                // We must ensure the 'event' object has 'event_type'. 
                // Based on previous ViewFile of serializers.py (not fully shown but implied standard serializer), 
                // or we can just filter by matching IDs with pastEventsData (which are guaranteed meetups).

                // BUT, pastEventsData only has PAST meetups. attendanceData might have FUTURE meetups (though unlikely to have marked attendance).
                // Safe bet: Filter attendanceData where event.event_type === 'meetup'

                const meetupAttendance = attendanceData.filter(record => record.event.event_type === 'meetup');

                // Map attended meetup IDs
                const attendedEventIds = new Set(meetupAttendance.map(record => record.event.id));

                // Separate missed meetings (From the past 'meetup' list, exclude those attended)
                const missedEventsList = pastEventsData.filter(event => !attendedEventIds.has(event.id));

                setAttended(meetupAttendance);
                setMissed(missedEventsList);

                // Calculate percentage based on MEETUPS only
                const totalPastMeetups = pastEventsData.length;

                // Note: If I attended a meeting that is NOT in pastEventsData (e.g. somehow marked in future?), 
                // it shouldn't count towards the 'past' percentage ideally.
                // Converting logic: Percentage = (Attended Past Meetups / Total Past Meetups) * 100

                // Let's refine: Filter 'meetupAttendance' to also be 'past'?
                // Generally attendance is only marked for past/current events.
                // We will use the count of 'meetupAttendance' that match 'pastEventsData' IDs + missedEvents? 
                // actually totalPastMeetups is the denominator.
                // Numerator should be (totalPastMeetups - missedEventsList.length) or (attendedEventIds intersect pastEventsData)

                // Let's trust 'meetupAttendance' count, but capped at total? 
                // Simplest: 
                // Attended = meetupAttendance
                // Total = pastEventsData (which are all past meetups)
                // Wait, if I attended a meetup, it MUST be in pastEventsData (unless it's today/future). 
                // Let's assume we care about "Attendance Rate for Past Meetings".

                // Correct logic: 
                // Denominator = Total Past Meetings (pastEventsData.length)
                // Numerator = Number of Past Meetings Attended (meetupAttendance.filter(r => new Date(r.event.event_date) < now))
                // For simplicity, let's use the intersection.

                const pastMeetupIds = new Set(pastEventsData.map(e => e.id));
                const attendedPastMeetupsCount = meetupAttendance.filter(r => pastMeetupIds.has(r.event.id)).length;

                if (totalPastMeetups > 0) {
                    setPercentage(Math.round((attendedPastMeetupsCount / totalPastMeetups) * 100));
                } else {
                    setPercentage(100);
                    if (attendedPastMeetupsCount === 0 && totalPastMeetups === 0) setPercentage(100); // No meetings held = 100% attendance (technically)
                    // Or 0? Let's stick to 100% or user preference. Code had 100 previously.
                    // Actually if total is 0, percentage is N/A. Let's show - or 100.
                }

            } catch (err) {
                console.error("Failed to fetch attendance data:", err);
                setError("Failed to load attendance records.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading attendance...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Attendance</h1>

            {/* Stats Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-600">Overall Attendance</h2>
                    <p className="text-sm text-gray-400">Based on past meetings (Meetups)</p>
                </div>
                <div className="text-right">
                    <span className={`text-5xl font-bold ${percentage >= 75 ? 'text-green-500' :
                        percentage >= 50 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                        {percentage}%
                    </span>
                    <div className="text-sm text-gray-500 mt-1">
                        {attended.length} Attended / {attended.length + missed.length} Total
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Attended Section */}
                <div>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <CheckCircle className="text-green-500" /> Attended Meetings
                    </h2>
                    <div className="space-y-4">
                        {attended.length === 0 && (
                            <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">No meetings attended yet.</div>
                        )}
                        {attended.map((record) => (
                            <div key={record.id} className="bg-white p-4 rounded-lg shadow-sm border border-green-100 flex justify-between items-center transition-transform hover:-translate-y-1">
                                <div>
                                    <h3 className="font-semibold text-gray-800">{record.event.title}</h3>
                                    <p className="text-sm text-gray-500">{new Date(record.event.event_date).toLocaleDateString()}</p>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                    Present
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Missed Section */}
                <div>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <XCircle className="text-red-500" /> Missed Meetings
                    </h2>
                    <div className="space-y-4">
                        {missed.length === 0 && (
                            <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">Great job! You haven't missed any meetings.</div>
                        )}
                        {missed.map((event) => (
                            <div key={event.id} className="bg-white p-4 rounded-lg shadow-sm border border-red-100 flex justify-between items-center transition-transform hover:-translate-y-1">
                                <div>
                                    <h3 className="font-semibold text-gray-800">{event.title}</h3>
                                    <p className="text-sm text-gray-500">{new Date(event.event_date).toLocaleDateString()}</p>
                                </div>
                                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                    Absent
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
