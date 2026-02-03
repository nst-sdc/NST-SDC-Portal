import { useState } from 'react';
import UserManagement from '../../components/admin/UserManagement';
import EventManagement from '../../components/admin/EventManagement';
import ProjectManagement from '../../components/admin/ProjectManagement';
import TaskManagement from '../../components/admin/TaskManagement';
import { Users, Calendar, Briefcase, CheckSquare } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserManagement />;
            case 'events':
                return <EventManagement />;
            case 'projects':
                return <ProjectManagement />;
            case 'tasks':
                return <TaskManagement />;
            default:
                return <UserManagement />;
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

            {/* Navigation Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center pb-2 px-4 transition-colors ${activeTab === 'users'
                            ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Users size={18} className="mr-2" />
                    Users
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`flex items-center pb-2 px-4 transition-colors ${activeTab === 'events'
                            ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Calendar size={18} className="mr-2" />
                    Events
                </button>
                <button
                    onClick={() => setActiveTab('projects')}
                    className={`flex items-center pb-2 px-4 transition-colors ${activeTab === 'projects'
                            ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Briefcase size={18} className="mr-2" />
                    Projects
                </button>
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`flex items-center pb-2 px-4 transition-colors ${activeTab === 'tasks'
                            ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <CheckSquare size={18} className="mr-2" />
                    Tasks
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg shadow-sm p-6 min-h-[500px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;
