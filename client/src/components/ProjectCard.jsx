import { Github } from 'lucide-react';

const ProjectCard = ({ project }) => {
    const badgeColors = {
        contributor: 'bg-[#7FFF7F] text-gray-800',
        maintainer: 'bg-[#FFD700] text-gray-800'
    };

    return (
        <div className="bg-gray-50 rounded-lg border-t-4 border-t-[#00CED1] shadow-sm p-5 hover:shadow-md transition-all">
            {/* Header: Project Name and Badge */}
            <div className="flex justify-between items-start mb-3">
                <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>

                {/* Role Badge */}
                <span className={`px-5 py-2 rounded-full text-base font-bold border-2 border-black shadow-lg ${badgeColors[project.role]}`}>
                    {project.role}
                </span>
            </div>

            {/* Team Lead */}
            <div className="mb-1.5">
                <span className="text-gray-400 text-sm font-bold">Team lead: </span>
                <a
                    href={project.teamLead.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00CED1] hover:underline text-sm font-bold"
                >
                    {project.teamLead.name}
                </a>
            </div>

            {/* Recent Commit */}
            <div className="mb-1.5">
                <span className="text-gray-400 text-sm font-bold">Recent commit: </span>
                <span className="text-[#32CD32] text-sm font-bold">{project.recentCommit.hash}</span>
                <span className="text-gray-400 text-sm font-bold"> by </span>
                <a
                    href={project.recentCommit.author.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00CED1] hover:underline text-sm font-bold"
                >
                    {project.recentCommit.author.name}
                </a>
            </div>

            {/* Members */}
            <div className="mb-4">
                <span className="text-gray-400 text-sm font-bold">Members: </span>
                {project.members.map((member, index) => (
                    <span key={index}>
                        <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00CED1] hover:underline text-sm font-bold"
                        >
                            {member.name}
                        </a>
                        {index < project.members.length - 1 && <span className="text-gray-400 text-sm font-bold"> </span>}
                    </span>
                ))}
            </div>

            {/* GitHub Link */}
            <div className="text-right pt-2 border-t border-gray-200">
                <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 text-sm font-bold inline-block"
                >
                    Visit on Github
                </a>
            </div>
        </div>
    );
};

export default ProjectCard;
