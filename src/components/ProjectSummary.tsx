import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { formatDate } from '../utils/dateUtils';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const ProjectSummary: React.FC = () => {
  const { currentProject } = useProjectStore();
  
  if (!currentProject) {
    return null;
  }
  
  // Calculate project stats
  const totalTasks = currentProject.tasks.length;
  const completedTasks = currentProject.tasks.filter(task => task.progress === 100).length;
  const inProgressTasks = currentProject.tasks.filter(task => task.progress > 0 && task.progress < 100).length;
  const notStartedTasks = currentProject.tasks.filter(task => task.progress === 0).length;
  
  // Calculate overall progress
  const overallProgress = totalTasks > 0
    ? Math.round(currentProject.tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks)
    : 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-700">Timeline</p>
              <p className="text-sm text-gray-600">
                {formatDate(currentProject.startDate)} - {formatDate(currentProject.endDate)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-700">Duration</p>
              <p className="text-sm text-gray-600">
                {Math.ceil((currentProject.endDate.getTime() - currentProject.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="mb-2 flex justify-between">
            <p className="text-sm font-medium text-gray-700">Overall Progress</p>
            <p className="text-sm font-medium text-gray-700">{overallProgress}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-50 p-2 rounded">
              <div className="flex justify-center mb-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-xl font-semibold text-gray-800">{completedTasks}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="flex justify-center mb-1">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-xl font-semibold text-gray-800">{inProgressTasks}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="flex justify-center mb-1">
                <AlertCircle className="h-4 w-4 text-gray-500" />
              </div>
              <p className="text-xl font-semibold text-gray-800">{notStartedTasks}</p>
              <p className="text-xs text-gray-500">Not Started</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSummary;
