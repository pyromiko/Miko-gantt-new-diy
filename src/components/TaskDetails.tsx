import React, { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '../store/projectStore';
import { Task, User } from '../types';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface TaskDetailsProps {
  taskId: string;
  onClose: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ taskId, onClose }) => {
  const { currentProject, updateTask, deleteTask, users } = useProjectStore();
  const [task, setTask] = useState<Task | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [assignees, setAssignees] = useState<string[]>([]); // Changed to array
  const [color, setColor] = useState('');
  const progressRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentProject && taskId) {
      const foundTask = currentProject.tasks.find(t => t.id === taskId);
      if (foundTask) {
        setTask(foundTask);
        setTitle(foundTask.title);
        setDescription(foundTask.description);
        setStartDate(format(new Date(foundTask.startDate), 'yyyy-MM-dd'));
        setEndDate(format(new Date(foundTask.endDate), 'yyyy-MM-dd'));
        setProgress(foundTask.progress);
        setDependencies(foundTask.dependencies);
        setAssignees(foundTask.assignees || []); // Initialize with empty array if undefined
        setColor(foundTask.color);
      }
    }
  }, [taskId, currentProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    const updatedTask = {
      ...task,
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      progress,
      dependencies,
      assignees, // Use the array of assignees
      color,
    };

    updateTask(taskId, updatedTask);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
      onClose();
    }
  };

  if (!task) {
    return <div className="p-4">Task not found</div>;
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(parseInt(e.target.value));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    const slider = progressRef.current;
    if (!slider) return;

    const startX = e.clientX;
    const startProgress = progress;
    const sliderRect = slider.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - sliderRect.left;
      const newProgress = Math.min(100, Math.max(0, Math.round((x / sliderRect.width) * 100)));
      setProgress(newProgress);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const toggleDependency = (dependencyId: string) => {
    if (dependencies.includes(dependencyId)) {
      setDependencies(dependencies.filter(id => id !== dependencyId));
    } else {
      setDependencies([...dependencies, dependencyId]);
    }
  };

  const toggleAssignee = (assigneeId: string) => {
    if (assignees.includes(assigneeId)) {
      setAssignees(assignees.filter(id => id !== assigneeId));
    } else {
      setAssignees([...assignees, assigneeId]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Task Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-6 w-6" />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
          <textarea
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Start Date:</label>
          <input
            type="date"
            id="startDate"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">End Date:</label>
          <input
            type="date"
            id="endDate"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="progress" className="block text-gray-700 text-sm font-bold mb-2">Progress:</label>
          <input
            type="range"
            id="progress"
            className="w-full"
            value={progress}
            onChange={handleProgressChange}
            onMouseDown={handleMouseDown}
            ref={progressRef}
          />
          <div className="text-center text-gray-600">{progress}%</div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Dependencies:</label>
          <div className="flex flex-wrap">
            {currentProject.tasks.map(otherTask => (
              otherTask.id !== task.id && (
                <label key={otherTask.id} className="mr-4">
                  <input
                    type="checkbox"
                    checked={dependencies.includes(otherTask.id)}
                    onChange={() => toggleDependency(otherTask.id)}
                    className="mr-2 leading-tight"
                  />
                  <span className="text-sm">{otherTask.title}</span>
                </label>
              )
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Assignees:</label>
          <div className="flex flex-wrap">
            {users.map(user => (
              <label key={user.id} className="mr-4">
                <input
                  type="checkbox"
                  checked={assignees.includes(user.id)}
                  onChange={() => toggleAssignee(user.id)}
                  className="mr-2 leading-tight"
                />
                <span className="text-sm">{user.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Update
          </button>
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskDetails;
