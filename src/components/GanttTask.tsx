import React from 'react';
import { Task } from '../types';
import { getDaysBetween, isDateInRange } from '../utils/dateUtils';

interface GanttTaskProps {
  task: Task;
  dateRange: Date[];
  projectStartDate: Date;
  cellWidth: number;
  viewMode: 'day' | 'week' | 'month';
  onTaskClick: (taskId: string) => void;
}

const GanttTask: React.FC<GanttTaskProps> = ({ 
  task, 
  dateRange, 
  projectStartDate, 
  cellWidth,
  viewMode,
  onTaskClick
}) => {
  // Check if task is in the visible range
  const taskStartVisible = dateRange.some(date => 
    date.getTime() === task.startDate.getTime() || 
    (date.getTime() < task.startDate.getTime() && 
     date.getTime() + 86400000 > task.startDate.getTime())
  );
  
  const taskEndVisible = dateRange.some(date => 
    date.getTime() === task.endDate.getTime() || 
    (date.getTime() < task.endDate.getTime() && 
     date.getTime() + 86400000 > task.endDate.getTime())
  );
  
  const taskInRange = dateRange.some(date => 
    isDateInRange(date, task.startDate, task.endDate)
  );
  
  if (!taskStartVisible && !taskEndVisible && !taskInRange) {
    return (
      <div className="h-16 relative border-b border-gray-200">
        {/* Background grid */}
        <div className="absolute inset-0 flex">
          {dateRange.map((_, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 border-r border-gray-200"
              style={{ width: `${cellWidth}px` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }
  
  // Calculate position and width
  let taskStartOffset = 0;
  let taskWidth = 0;
  
  // Find the index of the first visible date that's on or after the task start date
  const startDateIndex = dateRange.findIndex(date => 
    date.getTime() >= task.startDate.getTime()
  );
  
  // If task starts before the visible range
  if (startDateIndex === -1 || !taskStartVisible) {
    taskStartOffset = 0;
    
    // Find the index of the first date that's on or after the task end date
    const endDateIndex = dateRange.findIndex(date => 
      date.getTime() >= task.endDate.getTime()
    );
    
    if (endDateIndex === -1) {
      // Task ends after the visible range
      taskWidth = dateRange.length * cellWidth;
    } else {
      // Task ends within the visible range
      taskWidth = (endDateIndex + 1) * cellWidth;
    }
  } else {
    // Task starts within the visible range
    taskStartOffset = startDateIndex * cellWidth;
    
    // Find the index of the first date that's on or after the task end date
    const endDateIndex = dateRange.findIndex(date => 
      date.getTime() >= task.endDate.getTime()
    );
    
    if (endDateIndex === -1) {
      // Task ends after the visible range
      taskWidth = (dateRange.length - startDateIndex) * cellWidth;
    } else {
      // Task ends within the visible range
      taskWidth = (endDateIndex - startDateIndex + 1) * cellWidth;
    }
  }
  
  // Calculate progress width
  const progressWidth = `${task.progress}%`;
  
  return (
    <div className="h-16 relative border-b border-gray-200">
      {/* Background grid */}
      <div className="absolute inset-0 flex">
        {dateRange.map((_, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 border-r border-gray-200"
            style={{ width: `${cellWidth}px` }}
          ></div>
        ))}
      </div>
      
      {/* Task bar */}
      <div 
        className="absolute h-8 rounded-md top-4 shadow-sm cursor-pointer hover:opacity-100 transition-opacity"
        style={{ 
          left: `${taskStartOffset}px`, 
          width: `${taskWidth - 4}px`,
          backgroundColor: task.color,
          opacity: 0.9
        }}
        onClick={() => onTaskClick(task.id)}
      >
        {/* Progress overlay */}
        <div 
          className="h-full rounded-l-md bg-white bg-opacity-30"
          style={{ width: progressWidth }}
        ></div>
        
        {/* Task label (only show if there's enough space) */}
        {taskWidth > cellWidth && (
          <div className="absolute inset-0 flex items-center px-3 text-white text-sm font-medium truncate">
            {task.title}
          </div>
        )}
      </div>
      
      {/* Dependency lines */}
      {task.dependencies.map(depId => {
        // Find the dependent task
        const dependentTask = document.querySelector(`[data-task-id="${depId}"]`);
        if (!dependentTask) return null;
        
        return (
          <div 
            key={`dep-${depId}-${task.id}`}
            className="absolute border-t-2 border-gray-400 border-dashed"
            style={{
              // This is a simplified version - in a real app, you'd calculate the exact positions
              left: `0px`,
              top: '8px',
              width: `${taskStartOffset}px`,
              zIndex: 5
            }}
          ></div>
        );
      })}
    </div>
  );
};

export default GanttTask;
