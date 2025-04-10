import { InventoryItem, } from "./type";
import { InventoryRequest } from "./type";
import { Notification } from "./type";
import { TeacherInventoryItem } from "./type";
import { StockData, RequestData } from "./type";
import { TeacherRequestData } from "./type";

{/* Stock manager */}
export const mockInventoryItems: InventoryItem[] = [
    { id: 1, name: 'Laptop', category: 'Electronics', quantity: 25, lowStockQuantity: 5, status: 'In Stock' },
    { id: 2, name: 'Desk chair', category: 'Furniture', quantity: 8, lowStockQuantity: 5, status: 'Low Stock' },
    { id: 3, name: 'Printer', category: 'Office Equipment', quantity: 0, lowStockQuantity: 5, status: 'Out of Stock' },
    { id: 4, name: 'Laptop', category: 'Electronics', quantity: 25, lowStockQuantity: 5, status: 'In Stock' },
    { id: 5, name: 'Desk chair', category: 'Furniture', quantity: 8, lowStockQuantity: 5, status: 'Low Stock' },
    { id: 6, name: 'Printer', category: 'Office Equipment', quantity: 0, lowStockQuantity: 5, status: 'Out of Stock' },
    { id: 7, name: 'Laptop', category: 'Electronics', quantity: 25, lowStockQuantity: 5, status: 'In Stock' },
    { id: 8, name: 'Desk chair', category: 'Furniture', quantity: 8, lowStockQuantity: 5, status: 'Low Stock' },
    { id: 9, name: 'Printer', category: 'Office Equipment', quantity: 0, lowStockQuantity: 5, status: 'Out of Stock' },
    { id: 10, name: 'Laptop', category: 'Electronics', quantity: 25, lowStockQuantity: 5, status: 'In Stock' },
    { id: 11, name: 'Desk chair', category: 'Furniture', quantity: 8, lowStockQuantity: 5, status: 'Low Stock' },
    { id: 12, name: 'Printer', category: 'Office Equipment', quantity: 0, lowStockQuantity: 5, status: 'Out of Stock' },
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
    { id: 5, type: 'low-stock', message: 'Whiteboard marker stock below miminum (15 remaining)', date: '2021-01-01', read: false, relatedItem: ' Whiteboard marker'},
    { id: 6, type: 'new-request', message: 'New request from Mrs Johnson: 20 lab Microscope', date: '2021-04-01', read: false, relatedRequest: 123},
    { id: 7, type: 'action-needed', message: 'Pending approval for Chemistry Lab equipment', date: '2021-07-03', read: true},
    { id: 8, type: 'system-alert', message: 'Sceduled maintainance on March 20th', date: '2021-07-05', read: true},
    { id: 9, type: 'low-stock', message: 'Whiteboard marker stock below miminum (15 remaining)', date: '2021-01-01', read: false, relatedItem: ' Whiteboard marker'},
    { id: 10, type: 'new-request', message: 'New request from Mrs Johnson: 20 lab Microscope', date: '2021-04-01', read: false, relatedRequest: 123},
    { id: 11, type: 'action-needed', message: 'Pending approval for Chemistry Lab equipment', date: '2021-07-03', read: true},
    { id: 12, type: 'system-alert', message: 'Sceduled maintainance on March 20th', date: '2021-07-05', read: true},
    { id: 13, type: 'low-stock', message: 'Whiteboard marker stock below miminum (15 remaining)', date: '2021-01-01', read: false, relatedItem: ' Whiteboard marker'},
    { id: 14, type: 'new-request', message: 'New request from Mrs Johnson: 20 lab Microscope', date: '2021-04-01', read: false, relatedRequest: 123},
    { id: 15, type: 'action-needed', message: 'Pending approval for Chemistry Lab equipment', date: '2021-07-03', read: true},
    { id: 16, type: 'system-alert', message: 'Sceduled maintainance on March 20th', date: '2021-07-05', read: true},
];

export const mockStockData: StockData[]= [
    { id: 1, item: 'Whiteboard Markers', category: 'Stationery', startStock: 100, endStock: 25, usage: 75 },
    { id: 2, item: 'Lab Microscopes', category: 'Equipment', startStock: 50, endStock: 45, usage: 5 },
    { id: 3, item: 'Chemistry Kits', category: 'Lab', startStock: 30, endStock: 10, usage: 20 },
  ];

export const mockRequestData: RequestData[] = [
    { id: 1, teacher: 'Ms. Johnson', item: 'Projector', status: 'Completed', date: '2024-03-15' },
    { id: 2, teacher: 'Mr. Thompson', item: 'Lab Coats', status: 'Pending', date: '2024-03-14' },
    { id: 3, teacher: 'Mrs. Davis', item: 'Safety Goggles', status: 'Rejected', date: '2024-03-13' },
  ];

{/* Teacher */}
export const mockTeacherInventory: TeacherInventoryItem[] = [
    { id: 1, name: 'Whiteboard Markers', quantity: 25 },
    { id: 2, name: 'Lab Microscope', quantity: 8 },
    { id: 3, name: 'Projector Screen', quantity: 0 },
    { id: 4, name: 'Whiteboard Markers', quantity: 25 },
    { id: 5, name: 'Lab Microscope', quantity: 8 },
    { id: 6, name: 'Projector Screen', quantity: 0 },
    { id: 7, name: 'Whiteboard Markers', quantity: 25 },
    { id: 8, name: 'Lab Microscope', quantity: 8 },
    { id: 9, name: 'Projector Screen', quantity: 0 },
    { id: 10, name: 'Whiteboard Markers', quantity: 25 },
    { id: 11, name: 'Lab Microscope', quantity: 8 },
    { id: 12, name: 'Projector Screen', quantity: 0 },

];

export const mockTeacherRequests: TeacherRequestData[] = [
    { id: 1, item: 'Whiteboard Markers', status: 'Pending', date: '2024-03-15', quantity: 20 },
    { id: 2, item: 'Lab Microscope', status: 'Approved', date: '2024-03-15', quantity: 20 },
    { id: 3, item: 'Projector Screen', status: 'Rejected', date: '2024-03-15', quantity: 20 }, 

];