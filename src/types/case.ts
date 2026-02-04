export type CaseCategory = 
  | 'exportacion' 
  | 'camaras' 
  | 'cumplimiento' 
  | 'finanzas' 
  | 'operaciones' 
  | 'gobierno';

export type CaseStatus = 'draft' | 'published';

export interface Case {
  id: string;
  created_at: string;
  updated_at: string;
  owner_id: string | null;
  title: string;
  category: CaseCategory;
  summary: string;
  body: string;
  status: CaseStatus;
}
