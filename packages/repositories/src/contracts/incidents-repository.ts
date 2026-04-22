// ============================================================
// Contrato: IncidentsRepository
// ============================================================

export interface Incident {
  id?: string;
  type: string;
  status: 'open' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
}

export interface IncidentsRepository {
  create(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  getById(id: string): Promise<Incident | null>;
  list(filters?: any): Promise<Incident[]>;
}
