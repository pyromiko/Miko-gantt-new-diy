import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import AddTaskModal from './AddTaskModal';
import { Plus } from 'lucide-react';

const Header: React.FC = () => {
  const { currentProject } = useProjectStore();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  
  const handleAddTaskClick = () => {
    setIsAddTaskModalOpen(true);
  };
  
  const handleCloseAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {currentProject ? currentProject.name : 'No Project Selected'}
        </h1>
        
        <div className="flex space-x-4">
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded flex items-center space-x-2"
            onClick={handleAddTaskClick}
            disabled={!currentProject}
          >
            <Plus className="h-5 w-5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>
      
      {isAddTaskModalOpen && (
        <AddTaskModal onClose={handleCloseAddTaskModal} />
      )}
    </header>
  );
};

export default Header;
