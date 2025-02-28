import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import AddProjectModal from './AddProjectModal';
import UserManagementModal from '../components/UserManagementModal';
import { Plus, ListChecks, Users } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { projects, currentProject, setCurrentProject } = useProjectStore();
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);

  const handleProjectClick = (projectId: string) => {
    setCurrentProject(projectId);
  };

  const handleAddProjectClick = () => {
    setIsAddProjectModalOpen(true);
  };

  const handleCloseAddProjectModal = () => {
    setIsAddProjectModalOpen(false);
  };

  const handleOpenUserManagementModal = () => {
    setIsUserManagementModalOpen(true);
  };

  const handleCloseUserManagementModal = () => {
    setIsUserManagementModalOpen(false);
  };

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Projects</h2>

        <ul>
          {projects.map(project => (
            <li
              key={project.id}
              className={`py-2 px-4 rounded hover:bg-gray-700 cursor-pointer ${currentProject?.id === project.id ? 'bg-gray-700' : ''}`}
              onClick={() => handleProjectClick(project.id)}
            >
              {project.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto p-4">
        <button
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded font-medium flex items-center justify-center space-x-2 mb-2"
          onClick={handleOpenUserManagementModal}
        >
          <Users className="h-5 w-5" />
          <span>Manage Users</span>
        </button>
        <button
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded font-medium flex items-center justify-center space-x-2"
          onClick={handleAddProjectClick}
        >
          <Plus className="h-5 w-5" />
          <span>New Project</span>
        </button>
      </div>

      {isAddProjectModalOpen && (
        <AddProjectModal onClose={handleCloseAddProjectModal} />
      )}
      {isUserManagementModalOpen && (
        <UserManagementModal onClose={handleCloseUserManagementModal} />
      )}
    </aside>
  );
};

export default Sidebar;
