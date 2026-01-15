import ProjectCard from '../components/ProjectCard';
import { projects } from '../data/mockData';

const Projects = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Project</h1>

            {projects.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                    <p className="text-xl">No projects active now</p>
                </div>
            )}
        </div>
    );
};

export default Projects;
