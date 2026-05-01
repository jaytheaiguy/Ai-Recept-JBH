export interface Lead {
  id: string;
  name: string;
  phone: string;
  address: string;
  condition: string;
  askingPrice: string;
  timeline: string;
  qualificationScore: number;
  summary: string;
  transcript: Message[];
  status: 'new' | 'screened' | 'rejected' | 'investing';
  createdAt: Date;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface AppStats {
  totalLeads: number;
  hotLeads: number;
  totalCalls: number;
}
