export const projects = [
    {
        id: 1,
        name: "Project Name",
        teamLead: {
            name: "Team lead Name",
            github: "https://github.com/teamlead"
        },
        recentCommit: {
            hash: "commit1",
            author: {
                name: "memb1",
                github: "https://github.com/memb1"
            }
        },
        members: [
            { name: "memb1", github: "https://github.com/memb1" },
            { name: "memb2", github: "https://github.com/memb2" },
            { name: "memb3", github: "https://github.com/memb3" }
        ],
        role: "contributor",
        githubUrl: "https://github.com/project-repo"
    },
    {
        id: 2,
        name: "Project Name",
        teamLead: {
            name: "Team lead Name",
            github: "https://github.com/teamlead"
        },
        recentCommit: {
            hash: "commit1",
            author: {
                name: "memb1",
                github: "https://github.com/memb1"
            }
        },
        members: [
            { name: "memb1", github: "https://github.com/memb1" },
            { name: "memb2", github: "https://github.com/memb2" },
            { name: "memb3", github: "https://github.com/memb3" }
        ],
        role: "maintainer",
        githubUrl: "https://github.com/project-repo"
    }
];

export const meetings = [
    {
        id: 1,
        title: "Weekly Team Sync",
        date: new Date(2025, 11, 28), // Dec 28, 2025
        startTime: "10:00 AM",
        endTime: "11:00 AM",
        type: "team",
        description: "Weekly sync with the development team to discuss progress and blockers."
    },
    {
        id: 2,
        title: "Project Kickoff",
        date: new Date(2025, 11, 29),
        startTime: "2:00 PM",
        endTime: "3:30 PM",
        type: "client",
        description: "Initial kickoff meeting for the new client project."
    },
    {
        id: 3,
        title: "Code Review",
        date: new Date(2025, 11, 30),
        startTime: "11:00 AM",
        endTime: "12:00 PM",
        type: "dev",
        description: "Reviewing pull requests for the backend API."
    },
    {
        id: 4,
        title: "Design Huddle",
        date: new Date(2025, 11, 30),
        startTime: "4:00 PM",
        endTime: "5:00 PM",
        type: "design",
        description: "Sync with design team on new UI components."
    },
    {
        id: 5,
        title: "Sprint Planning",
        date: new Date(2026, 0, 5), // Jan 5, 2026
        startTime: "9:00 AM",
        endTime: "10:30 AM",
        type: "team",
        description: "Planning upcoming sprint tasks and goals."
    }
];
