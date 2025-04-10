{/* Stock Manager*/}
export interface InventoryItem {
    id: number;
    name: string;
    category: string;
    quantity: number;
    lowStockQuantity: number;
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

export interface StockData {
    id: number;
    item: string;
    category: string;
    startStock: number;
    endStock: number;
    usage: number;
  }
  
  {/*shouldn't there be a notes area here*/}
export interface RequestData {
    id: number;
    teacher: string;
    item: string;
    status: 'Completed' | 'Pending' | 'Rejected';
    date: string;
  }
  

{/* Teacher */}
export interface TeacherInventoryItem {
    id: number;
    name: string;
    quantity: number;
}

export interface TeacherRequestData {
    id: number;
    date: string;
    item: string;
    quantity: number;
    status: 'Approved' | 'Pending' | 'Rejected';
}

