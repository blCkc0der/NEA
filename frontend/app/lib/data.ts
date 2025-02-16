import { InventoryItem } from "./type";
import { InventoryRequest } from "./type";
import { Notification } from "./type";

export const mockInventoryItems: InventoryItem[] = [
    { id: 1, name: 'Laptop', category: 'Electronics', quantity: 25, status: 'In Stock' },
    { id: 2, name: 'Desk chair', category: 'Furniture', quantity: 8, status: 'Low Stock' },
    { id: 3, name: 'Printer', category: 'Office Equipment', quantity: 0, status: 'Out of Stock' },
];

export const mockRequests: InventoryRequest[] = [
    { id: 1, teacher: 'Ms. Johnson', item: 'Whiteboard Markers', quantity: 20, dataRequested: '2024-03-15', status:'Pending'},
    { id: 2, teacher: 'Ms. Thompson', item: 'Lab Microscope', quantity: 5, dataRequested: '2024-03-15', status:'Approved'},
    { id: 3, teacher: 'Mrs. Davis', item: 'Projector Screen', quantity: 2, dataRequested: '2024-03-15', status:'Completed', notes: 'Urget request'},
    { id: 4, teacher: 'Dr. Wilson', item: 'Chemistry Kits', quantity: 8, dataRequested: '2024-03-15', status:'Rejected'},
];

export const mockNotifications: Notification[] = [
    { id: 1, type: 'low-stock', message: 'Whiteboard marker stock below miminum (15 remaining)', date: '2021-01-01', read: false, relatedItem: ' Whiteboard marker'},
    { id: 2, type: 'new-request', message: 'New request from Mrs Johnson: 20 lab Microscope', date: '2021-04-01', read: false, relatedRequest: 123},
    { id: 3, type: 'action-needed', message: 'Pending approval for Chemistry Lab equipment', date: '2021-07-03', read: true},
    { id: 4, type: 'system-alert', message: 'Sceduled maintainance on March 20th', date: '2021-07-05', read: true},
]