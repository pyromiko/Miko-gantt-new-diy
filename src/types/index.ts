export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  dependencies: string[];
  assignee: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
}

export interface User {
  id: string;
  name: string;
  avatar: string;
}
