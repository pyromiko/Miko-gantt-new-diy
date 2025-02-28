import { create } from 'zustand';
import { Project, Task, User } from '../types';
import { addDays } from 'date-fns';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  users: User[];
  selectedTaskId: string | null;
  addProject: (project: Project) => void;
  setCurrentProject: (projectId: string) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  setSelectedTaskId: (taskId: string | null) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  users: [],
  selectedTaskId: null,
  
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),
  
  setCurrentProject: (projectId) => set((state) => {
    const project = state.projects.find(p => p.id === projectId) || null;
    return ({
      currentProject: project
    });
  }),
  
  addTask: (task) => set((state) => {
    if (!state.currentProject) return state;
    
    const updatedProject = {
      ...state.currentProject,
      tasks: [...state.currentProject.tasks, task]
    };
    
    return {
      ...state,
      currentProject: updatedProject,
      projects: state.projects.map(p =>
        p.id === updatedProject.id ? updatedProject : p
      )
    };
  }),
  
  updateTask: (taskId, updates) => set((state) => {
    if (!state.currentProject) return state;
    
    const updatedTasks = state.currentProject.tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    
    const updatedProject = {
      ...state.currentProject,
      tasks: updatedTasks
    };
    
    return {
      ...state,
      currentProject: updatedProject,
      projects: state.projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      )
    };
  }),
  
  deleteTask: (taskId) => set((state) => {
    if (!state.currentProject) return state;
    
    const updatedTasks = state.currentProject.tasks.filter(task => task.id !== taskId);
    
    const updatedProject = {
      ...state.currentProject,
      tasks: updatedTasks
    };
    
    return {
      ...state,
      currentProject: updatedProject,
      projects: state.projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      )
    };
  }),

  setSelectedTaskId: (taskId) => set({ selectedTaskId: taskId }),

  addUser: (user) => set(state => ({
    users: [...state.users, user],
  })),

  removeUser: (userId: string) => set(state => ({
    users: state.users.filter(user => user.id !== userId),
  })),
}));
