export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO string for simplicity and serialization
  updatedAt: string; // ISO string for simplicity and serialization
  tags?: string[];
}
