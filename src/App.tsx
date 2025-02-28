import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import GanttChart from './components/GanttChart';
import ProjectSummary from './components/ProjectSummary';
import TaskDetails from './components/TaskDetails';
import { useProjectStore } from './store/projectStore';

function App() {
  const selectedTaskId = useProjectStore(state => state.selectedTaskId);
  const setSelectedTaskId = useProjectStore(state => state.setSelectedTaskId);

  useEffect(() => {
    const handleOpenTaskDetails = (event: CustomEvent) => {
      setSelectedTaskId(event.detail);
    };

    window.addEventListener('openTaskDetails', handleOpenTaskDetails);

    return () => {
      window.removeEventListener('openTaskDetails', handleOpenTaskDetails);
    };
  }, [setSelectedTaskId]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-4">
            <ProjectSummary />
            
            <div className="bg-white rounded-lg shadow">
              <GanttChart />
            </div>
          </div>
        </main>
        
        {selectedTaskId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <TaskDetails taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
