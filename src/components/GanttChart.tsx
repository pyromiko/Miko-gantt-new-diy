import React, { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '../store/projectStore';
import { formatShortDate, generateDateRange, formatLongDate } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import GanttTask from './GanttTask';

const GanttChart: React.FC = () => {
  const { currentProject, users } = useProjectStore();
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [visibleStartDate, setVisibleStartDate] = useState<Date | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const numberOfDaysBase = 20; // Base number of days

  const calculateNumberOfDays = () => {
    switch (viewMode) {
      case 'day':
        return numberOfDaysBase;
      case 'week':
        return numberOfDaysBase * 7; // 20 weeks
      case 'month':
        return numberOfDaysBase * 30; // Approximate 20 months
      default:
        return numberOfDaysBase;
    }
  };

  // Initialize visibleStartDate only once when the component mounts
  useEffect(() => {
    if (currentProject) {
      setVisibleStartDate(new Date(currentProject.startDate));
    }
  }, [currentProject]);
  
  useEffect(() => {
    if (currentProject && visibleStartDate) {
      // Ensure visibleStartDate is always a Date object
      const startDate = new Date(visibleStartDate);
      let endDate = new Date(startDate);
      const numberOfDays = calculateNumberOfDays();
  
      endDate.setDate(startDate.getDate() + numberOfDays);
  
      const dates = generateDateRange(startDate, endDate, viewMode);
      setDateRange(dates);
    } else {
      // Initialize with an empty array to ensure consistent hook calls
      setDateRange([]);
    }
  }, [currentProject, visibleStartDate, viewMode]);
  
  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };
  
  const handlePrevious = () => {
    if (visibleStartDate) {
      const numberOfDays = calculateNumberOfDays();
      const newDate = new Date(visibleStartDate);
      newDate.setDate(newDate.getDate() - numberOfDays / 2);
      setVisibleStartDate(newDate);
    }
  };
  
  const handleNext = () => {
    if (visibleStartDate) {
      const numberOfDays = calculateNumberOfDays();
      const newDate = new Date(visibleStartDate);
      newDate.setDate(newDate.getDate() + numberOfDays / 2);
      setVisibleStartDate(newDate);
    }
  };

  const handleReset = () => {
    if (currentProject) {
      setVisibleStartDate(new Date(currentProject.startDate));
    }
  };
  
  const getCellWidth = () => {
    if (viewMode === 'day') return 48;
    if (viewMode === 'week') return 64;
    return 120; // month
  };
  
  const calculateTaskPosition = (taskStartDate: Date, projectStartDate: Date) => {
    const diffInDays = (taskStartDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays * getCellWidth();
  };
  
  const calculateTaskWidth = (startDate: Date, endDate: Date) => {
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return duration * getCellWidth();
  };

  const getConnectionPoints = (taskId: string) => {
    const taskElement = document.getElementById(`task-${taskId}`);
    if (!taskElement) return null;

    const rect = taskElement.getBoundingClientRect();
    const chartRect = chartRef.current?.getBoundingClientRect();

    if (!chartRect) return null;

    const relativeLeft = rect.left - chartRect.left + window.scrollX;
    const relativeRight = rect.right - chartRect.left + window.scrollX;
    const relativeTop = rect.top - chartRect.top + window.scrollY;
    const relativeBottom = rect.bottom - chartRect.top + window.scrollY;

    const centerX = (relativeLeft + relativeRight) / 2;
    const centerY = (relativeTop + relativeBottom) / 2;

    return {
      left: relativeLeft,
      right: relativeRight,
      top: relativeTop,
      bottom: relativeBottom,
      centerX,
      centerY,
    };
  };

  const drawDependencies = () => {
    const svg = document.getElementById('dependency-lines');
    if (!svg) return;

    // Clear existing lines
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    if (!currentProject) return;

    currentProject.tasks.forEach(task => {
      if (!task.dependencies || task.dependencies.length === 0) return;

      const targetPoints = getConnectionPoints(task.id);
      if (!targetPoints) return;

      task.dependencies.forEach(dependencyId => {
        const dependencyPoints = getConnectionPoints(dependencyId);
        if (!dependencyPoints) return;

        // Calculate the angle for the arrowhead
        const angle = Math.atan2(targetPoints.centerY - dependencyPoints.centerY, targetPoints.left - dependencyPoints.right);
        const arrowSize = 10;

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(dependencyPoints.right));
        line.setAttribute("y1", String(dependencyPoints.centerY));
        line.setAttribute("x2", String(targetPoints.left));
        line.setAttribute("y2", String(targetPoints.centerY));
        line.setAttribute("stroke", "#777");
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);

        // Create arrowhead
        const arrowX = targetPoints.left;
        const arrowY = targetPoints.centerY;

        const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        arrowPath.setAttribute("d", `M${arrowX},${arrowY} L${arrowX - arrowSize * Math.cos(angle - Math.PI / 6)},${arrowY - arrowSize * Math.sin(angle - Math.PI / 6)} L${arrowX - arrowSize * Math.cos(angle + Math.PI / 6)},${arrowY - arrowSize * Math.sin(angle + Math.PI / 6)} z`);
        arrowPath.setAttribute("fill", "#777");
        svg.appendChild(arrowPath);
      });
    });
  };

  useEffect(() => {
    const debouncedDrawDependencies = () => {
      // Delay the drawing of dependencies to ensure the Gantt chart is fully rendered
      setTimeout(drawDependencies, 100);
    };

    debouncedDrawDependencies();

    // Redraw dependencies on window resize
    window.addEventListener('resize', debouncedDrawDependencies);

    return () => {
      window.removeEventListener('resize', debouncedDrawDependencies);
    };
  }, [currentProject, viewMode]);
  
  // Ensure visibleStartDate is initialized only once when the component mounts and currentProject is available
  useEffect(() => {
    if (currentProject && !visibleStartDate) {
      setVisibleStartDate(new Date(currentProject.startDate));
    }
  }, [currentProject, visibleStartDate]);
  
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <button 
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={handleNext}
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={handleReset}
          >
            <RotateCw className="h-5 w-5 text-gray-600" />
          </button>
          <span className="py-2 font-medium">
            {visibleStartDate && dateRange.length > 0 ? 
              `${formatLongDate(visibleStartDate)} - ${formatLongDate(dateRange[dateRange.length - 1])}` : 
              'No date range'
            }
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 text-sm ${viewMode === 'day' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300 hover:bg-gray-50'} border rounded-md`}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
          <button 
            className={`px-3 py-1 text-sm ${viewMode === 'week' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300 hover:bg-gray-50'} border rounded-md`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button 
            className={`px-3 py-1 text-sm ${viewMode === 'month' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300 hover:bg-gray-50'} border rounded-md`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
        </div>
      </div>
      
      <div className="relative overflow-x-auto">
        <div className="flex">
          {/* Task info column */}
          <div className="sticky left-0 z-10 bg-white border-r border-gray-200 w-64">
            <div className="h-10 border-b border-gray-200 flex items-center px-4 font-medium text-gray-700 bg-gray-50">
              Task
            </div>
            {currentProject?.tasks?.map(task => (
              <div 
                key={task.id} 
                className="h-16 border-b border-gray-200 px-4 py-2 bg-white hover:bg-gray-50 cursor-pointer"
                onClick={() => window.dispatchEvent(new CustomEvent('openTaskDetails', { detail: task.id }))}
              >
                <div className="font-medium text-gray-800 truncate">{task.title}</div>
                <div className="flex items-center mt-1">
                  {task.assignees && task.assignees.length > 0 ? (
                    task.assignees.map(assigneeId => {
                      const user = getUserById(assigneeId);
                      return user ? (
                        <img 
                          key={assigneeId}
                          src={user.avatar} 
                          alt={user.name}
                          className="h-6 w-6 rounded-full mr-2"
                        />
                      ) : null;
                    })
                  ) : null}
                  <div className="text-xs text-gray-500 truncate">
                    {task.assignees && task.assignees.length > 0 ?
                      task.assignees.map(assigneeId => getUserById(assigneeId)?.name).join(', ')
                      : 'Unassigned'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Timeline */}
          <div className="flex-1" ref={chartRef}>
            {/* Date headers */}
            <div className="flex h-10 border-b border-gray-200">
              {dateRange.map((date, index) => (
                <div 
                  key={index} 
                  className={`flex-shrink-0 text-center text-xs font-medium text-gray-500 py-2 border-r border-gray-200 bg-gray-50`}
                  style={{ width: `${getCellWidth()}px` }}
                >
                  {formatShortDate(date)}
                </div>
              ))}
            </div>
            
            {/* Task bars */}
            <div style={{ position: 'relative' }}>
              <svg id="dependency-lines" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></svg>
              {currentProject?.tasks?.map(task => (
                <GanttTask 
                  key={task.id} 
                  task={task} 
                  dateRange={dateRange} 
                  projectStartDate={visibleStartDate || currentProject.startDate}
                  cellWidth={getCellWidth()}
                  viewMode={viewMode}
                  onTaskClick={(taskId) => window.dispatchEvent(new CustomEvent('openTaskDetails', { detail: taskId }))}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
