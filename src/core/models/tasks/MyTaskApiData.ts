export interface MyTaskApiData {
  id?: string;
  title: string;
  notes?: string;
  status?: 'needsAction' | 'completed';
  parent?: string;
  due?: string; // RFC3339 timestamp
}
