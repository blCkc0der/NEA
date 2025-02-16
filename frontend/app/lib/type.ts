
export interface InventoryItem {
    id: number;
    name: string;
    category: string;
    quantity: number;
    status: "In Stock" | "Low Stock" | "Out of Stock";
}

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed';

export interface InventoryRequest {
    id: number;
    teacher: string;
    item: string;
    quantity: number;
    dataRequested: string;
    status: RequestStatus;
    notes?: string;
}

export type NotificationType = 'low-stock' | 'new-request' | 'action-needed' | 'system-alert';

export interface Notification {
    id: number;
    type: NotificationType;
    message: string;
    date: string;
    read: boolean;
    relatedItem?: string;
    relatedRequest?: number;
}