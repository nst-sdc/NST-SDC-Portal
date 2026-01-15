import React, { useState } from 'react';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MoreHorizontal,
    X, MapPin, Users, AlignLeft, Search, HelpCircle, Settings, Menu
} from 'lucide-react';
import { meetings as initialMeetings } from '../data/mockData';

// --- Modal Components ---

const EventModal = ({ event, onClose }) => {
    if (!event) return null;

    const styleColors = {
        team: 'bg-blue-600',
        client: 'bg-green-600',
        dev: 'bg-purple-600',
        design: 'bg-pink-600',
        default: 'bg-blue-600'
    };

    const headerColor = styleColors[event.type] || styleColors.default;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className={`${headerColor} px-6 py-4 flex justify-between items-start`}>
                    <h3 className="text-white text-lg font-medium tracking-wide">Event Details</h3>
                    <div className="flex items-center space-x-2">
                        {/* Mock Actions */}
                        <button className="text-white/80 hover:text-white"><Settings className="w-4 h-4" /></button>
                        <button onClick={onClose} className="text-white/80 hover:text-white rounded-full hover:bg-white/20 p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    <h2 className="text-2xl font-normal text-gray-800 mb-4">{event.title}</h2>

                    <div className="space-y-4">
                        <div className="flex items-start">
                            <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-4" />
                            <div>
                                <p className="text-gray-800 font-medium">
                                    {event.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                                <p className="text-gray-500 text-sm">{event.startTime} - {event.endTime}</p>
                            </div>
                        </div>

                        {event.description && (
                            <div className="flex items-start">
                                <AlignLeft className="w-5 h-5 text-gray-400 mt-0.5 mr-4" />
                                <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
                            </div>
                        )}

                        <div className="flex items-center">
                            <Users className="w-5 h-5 text-gray-400 mr-4" />
                            <p className="text-gray-600 text-sm">2 guests</p>
                        </div>

                        <div className="flex items-center">
                            <MapPin className="w-5 h-5 text-gray-400 mr-4" />
                            <p className="text-gray-600 text-sm">Google Meet</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const Calendar = () => {
    // State
    const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 27)); // Main Calendar State
    const [miniCurrentDate, setMiniCurrentDate] = useState(new Date(2025, 11, 27)); // Mini Calendar State (Independent)
    const [meetings, setMeetings] = useState([]); // Start with empty events as per user request
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [view, setView] = useState('month'); // month, week, day, list
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    };

    const getWeekDays = (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const isSameDay = (d1, d2) => {
        if (!d1 || !d2) return false;
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    // Filter Logic
    const filteredMeetings = meetings.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const miniDays = getDaysInMonth(miniCurrentDate);
    const days = getDaysInMonth(currentDate);
    const weekDaysList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Render Views
    const renderMonthView = () => (
        <div className="flex-1 flex flex-col h-full bg-white">
            <div className="grid grid-cols-7 border-b border-gray-200">
                {weekDaysList.map(day => (
                    <div key={day} className="py-2 text-[11px] font-bold text-center text-gray-600 uppercase border-r border-gray-100 last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(100px,_1fr)] overflow-y-auto">
                {days.map((day, index) => {
                    const isToday = isSameDay(day, new Date());
                    const dayEvents = day ? filteredMeetings.filter(m => isSameDay(m.date, day)) : [];
                    return (
                        <div key={index} className={`border-b border-r border-gray-100 min-h-[100px] p-2 transition-colors duration-200 ${!day ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50'}`}>
                            {day && (
                                <>
                                    <div className="flex justify-center mt-1 mb-2">
                                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300 ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105' : 'text-gray-700 hover:bg-gray-100'}`}>
                                            {day.getDate()}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {dayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                onClick={() => setSelectedEvent(event)}
                                                className={`text-[10px] px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${event.type === 'team' ? 'bg-blue-100 text-blue-700 border-l-2 border-blue-500' :
                                                    event.type === 'client' ? 'bg-green-100 text-green-700 border-l-2 border-green-500' :
                                                        'bg-purple-100 text-purple-700 border-l-2 border-purple-500'
                                                    }`}
                                            >
                                                {event.startTime} {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderWeekView = () => {
        const weekDates = getWeekDays(currentDate);
        return (
            <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {weekDates.map((date, i) => (
                        <div key={i} className={`py-4 text-center border-r border-gray-100 last:border-r-0 ${isSameDay(date, new Date()) ? 'bg-blue-50/30' : ''}`}>
                            <div className={`text-[11px] font-bold uppercase ${isSameDay(date, new Date()) ? 'text-blue-600' : 'text-gray-500'}`}>{weekDaysList[i]}</div>
                            <div className={`text-2xl font-light mt-1 ${isSameDay(date, new Date()) ? 'text-blue-600' : 'text-gray-800'}`}>{date.getDate()}</div>
                        </div>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-7 min-h-full">
                        {weekDates.map((date, i) => {
                            const dayEvents = filteredMeetings.filter(m => isSameDay(m.date, date));
                            return (
                                <div key={i} className="border-r border-gray-100 last:border-r-0 min-h-[500px] p-2 space-y-2 relative group hover:bg-gray-50/50 transition-colors">
                                    {/* Mock time grid lines */}
                                    {Array.from({ length: 12 }).map((_, idx) => (
                                        <div key={idx} className="absolute w-full border-b border-gray-50 h-[50px] top-0 left-0 pointer-events-none" style={{ top: `${idx * 50}px` }} />
                                    ))}

                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={() => setSelectedEvent(event)}
                                            className="relative z-10 bg-white border border-gray-200 p-2 rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                                        >
                                            <div className="text-xs font-semibold text-gray-800 truncate">{event.title}</div>
                                            <div className="text-[10px] text-gray-500">{event.startTime} - {event.endTime}</div>
                                        </div>
                                    ))}
                                    {dayEvents.length === 0 && (
                                        <div className="h-full flex items-center justify-center">
                                            <span className="text-xs text-gray-300 opacity-0 group-hover:opacity-100">No events</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const dayEvents = filteredMeetings.filter(m => isSameDay(m.date, currentDate));
        return (
            <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto">
                <div className="p-8 max-w-4xl mx-auto w-full">
                    <div className="flex items-center mb-8 pb-4 border-b border-gray-100">
                        <div className="text-4xl font-light text-gray-800 mr-4">{currentDate.getDate()}</div>
                        <div>
                            <div className="text-gray-500 uppercase font-bold text-sm">{currentDate.toLocaleDateString('default', { weekday: 'long' })}</div>
                            <div className="text-gray-400 text-sm">{currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {dayEvents.length > 0 ? (
                            dayEvents.map(event => (
                                <div key={event.id} onClick={() => setSelectedEvent(event)} className="flex group cursor-pointer">
                                    <div className="w-24 pt-2 text-right text-sm text-gray-500 font-medium mr-6">
                                        {event.startTime}
                                    </div>
                                    <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all border-l-4 border-l-purple-500">
                                        <h3 className="font-semibold text-gray-800 text-lg mb-1">{event.title}</h3>
                                        <div className="flex items-center text-sm text-gray-500 mb-2">
                                            <Clock className="w-4 h-4 mr-2" />
                                            {event.startTime} - {event.endTime}
                                        </div>
                                        {event.description && <p className="text-gray-600 text-sm">{event.description}</p>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No events scheduled for this day.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderListView = () => {
        // Sort all future meetings
        const sortedMeetings = [...filteredMeetings].sort((a, b) => a.date - b.date);

        return (
            <div className="flex-1 bg-white overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Agenda</h3>
                    {sortedMeetings.map((event, index) => {
                        const showDateHeader = index === 0 || !isSameDay(sortedMeetings[index - 1].date, event.date);
                        return (
                            <div key={event.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                {showDateHeader && (
                                    <div className="sticky top-0 bg-white/95 backdrop-blur py-2 z-10 mb-3 mt-6 first:mt-0 flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-blue-600 mr-3"></div>
                                        <h4 className="font-bold text-gray-800">
                                            {event.date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </h4>
                                    </div>
                                )}
                                <div onClick={() => setSelectedEvent(event)} className="ml-6 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-md rounded-lg p-4 cursor-pointer transition-all duration-200 flex items-center justify-between group">
                                    <div>
                                        <div className="flex items-center space-x-3 mb-1">
                                            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{event.startTime}</span>
                                            <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{event.title}</h4>
                                        </div>
                                        <p className="text-sm text-gray-500 pl-[4.5rem] truncate max-w-md">{event.description || 'No description'}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                </div>
                            </div>
                        );
                    })}
                    {sortedMeetings.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            No events found matching your search.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm transition-all">
                <div className="flex items-center space-x-6">


                    <button
                        onClick={() => {
                            const now = new Date();
                            setCurrentDate(now);
                            setMiniCurrentDate(now);
                        }}
                        className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm active:scale-95 transition-all duration-200"
                    >
                        Today
                    </button>

                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - (view === 'week' ? 7 : view === 'day' ? 1 : 30)))}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (view === 'week' ? 7 : view === 'day' ? 1 : 30)))}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 min-w-[200px] pl-2">
                        {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                    </h2>
                </div>

                <div className="flex items-center space-x-3 pr-2">
                    {/* View Switcher */}
                    <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1 mr-4">
                        {['month', 'week', 'day', 'list'].map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-3 py-1.5 text-xs font-semibold capitalize rounded-md transition-all ${view === v
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    {/* Search Actions */}
                    <div className="flex items-center space-x-2 border-l border-gray-200 pl-4 relative">
                        {isSearchOpen ? (
                            <div className="w-64 animate-in slide-in-from-right-10 fade-in duration-200 relative">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onBlur={() => !searchQuery && setIsSearchOpen(false)}
                                    className="w-full pl-3 pr-8 py-1.5 text-sm border border-blue-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-100"
                                />
                                <X
                                    className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-600"
                                    onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                                />
                            </div>
                        ) : (
                            <div className="relative group" onClick={() => setIsSearchOpen(true)}>
                                <Search className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors cursor-pointer" />
                            </div>
                        )}

                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}


                {/* Main Content Area */}
                {view === 'month' && renderMonthView()}
                {view === 'week' && renderWeekView()}
                {view === 'day' && renderDayView()}
                {view === 'list' && renderListView()}

            </div>

            {/* Modals */}
            {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
        </div>
    );
};

export default Calendar;
