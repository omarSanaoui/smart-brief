export type ProjectType = 'SITE_WEB' | 'SEO' | 'GOOGLE_ADS' | 'SOCIAL_MEDIA' | 'PHOTO_VIDEO' | 'EMAIL_MARKETING' | 'COMMUNITY_MANAGER' | 'BRANDING' | 'OTHER';
export type BriefStatus = 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  briefId: string;
  name: string;
  description: string;
  priority: TaskPriority;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Brief {
    id: string;
    clientId: string;
    assignedToIds: string[];
    assignedById: string | null;
    title: string;
    projectType: ProjectType;
    description: string;
    features: string[];
    budgetRange: string;
    deadline: string;
    status: BriefStatus;
    statusReason: string | null;
    attachments: string[];
    createdAt: string;
    updatedAt: string;
}

export interface BriefState {
    briefs: Brief[];
    currentBrief: Brief | null;
    employees: Employee[];
    tasks: Task[];
    tasksLoading: boolean;
    loading: boolean;
    error: string | null;
}

export interface CreateTaskPayload {
    briefId: string;
    name: string;
    description: string;
    priority: TaskPriority;
    startDate: string;
    endDate: string;
}

export interface UpdateTaskPayload {
    briefId: string;
    taskId: string;
    data: Partial<Omit<CreateTaskPayload, 'briefId'>>;
}

export interface UpdateTaskStatusPayload {
    briefId: string;
    taskId: string;
    status: TaskStatus;
}

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

export interface CreateBriefPayload {
    title: string;
    projectType: ProjectType;
    description: string;
    features: string[];
    budgetRange: string;
    deadline: string;
    attachments?: string[];
}

export interface UpdateBriefPayload {
    id: string;
    data: Partial<CreateBriefPayload> & {
        status?: BriefStatus;
        statusReason?: string;
    };
}
