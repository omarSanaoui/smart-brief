export type ProjectType = 'WEB' | 'MOBILE' | 'DESKTOP' | 'UI_UX' | 'BRANDING' | 'OTHER';
export type BriefStatus = 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'IN_PROGRESS' | 'COMPLETED';

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
    loading: boolean;
    error: string | null;
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
