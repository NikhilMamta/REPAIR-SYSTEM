export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
  department: string;
}

export interface RepairTask {
  id: string;
  repairTaskNumber: string;
  machineName: string;
  serialNo: string;
  nameOfIndenter: string;
  department: string;
  machinePartName: string;
  problemWithMachine: string;
  imageOfTheMachine: string;
  enableReminders: boolean;
  requireAttachment: boolean;
  taskStartDate: string;
  endingDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  status: 'indent' | 'sent' | 'checked' | 'stored' | 'advanced' | 'completed';
  vendorName?: string;
  transporterName?: string;
  transportationCharges?: number;
  weighmentSlip?: string;
  transportingImage?: string;
  billImage?: string;
  billNo?: string;
  typeOfBill?: string;
  totalBillAmount?: number;
  paymentType?: string;
  toBePaidAmount?: number;
  receivedQuantity?: number;
  billMatch?: boolean;
  productImage?: string;
  totalAmount?: number;
  paymentDone?: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  totalIndents: number;
  repairsCompleted: number;
  totalRepairCost: number;
  repairStatusByDepartment: { department: string; count: number }[];
  repairTrendOverTime: { month: string; count: number }[];
  paymentTypeDistribution: { type: string; amount: number }[];
  vendorWiseRepairCosts: { vendor: string; cost: number }[];
}