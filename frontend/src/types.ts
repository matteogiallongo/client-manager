export type Sector = 'Food' | 'Beverage' | 'Vino' | 'Cosmesi' | 'Arredo' | 'Caffè' | 'Liquori' | 'Agenzia' | 'Altro';
export type ClientType = 'Azienda' | 'Agenzia/Studio';
export type Priority = 'Alta' | 'Media' | 'Bassa';
export type ClientStatus = 'Da contattare' | 'Contattato' | 'In trattativa' | 'Proposta inviata' | 'Cliente attivo' | 'In pausa' | 'Archiviato';
export type InteractionType = 'Email' | 'LinkedIn' | 'Instagram DM' | 'Chiamata' | 'Incontro' | 'Proposta' | 'Follow-up' | 'Altro';
export type Outcome = 'In attesa' | 'Risposta positiva' | 'Risposta negativa' | 'Nessuna risposta' | 'Da seguire';
export type FileType = 'Proposta' | 'Moodboard' | 'Contratto' | 'Brief' | 'Concept Deck' | 'Altro';

export const SECTORS: Sector[] = ['Food', 'Beverage', 'Vino', 'Cosmesi', 'Arredo', 'Caffè', 'Liquori', 'Agenzia', 'Altro'];
export const CLIENT_TYPES: ClientType[] = ['Azienda', 'Agenzia/Studio'];
export const PRIORITIES: Priority[] = ['Alta', 'Media', 'Bassa'];
export const CLIENT_STATUSES: ClientStatus[] = ['Da contattare', 'Contattato', 'In trattativa', 'Proposta inviata', 'Cliente attivo', 'In pausa', 'Archiviato'];
export const INTERACTION_TYPES: InteractionType[] = ['Email', 'LinkedIn', 'Instagram DM', 'Chiamata', 'Incontro', 'Proposta', 'Follow-up', 'Altro'];
export const OUTCOMES: Outcome[] = ['In attesa', 'Risposta positiva', 'Risposta negativa', 'Nessuna risposta', 'Da seguire'];
export const FILE_TYPES: FileType[] = ['Proposta', 'Moodboard', 'Contratto', 'Brief', 'Concept Deck', 'Altro'];

export interface Contact {
  id: string;
  client_id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  instagram_url?: string;
  is_primary: boolean;
  notes?: string;
}

export interface Interaction {
  id: string;
  client_id: string;
  date: string;
  type: InteractionType;
  contact_id?: string;
  subject: string;
  body: string;
  outcome: Outcome;
  next_action?: string;
  next_action_date?: string;
}

export interface ClientFile {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  url?: string;
  file_data?: string;
  type: FileType;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  client_id: string;
  date: string;
  type: 'interaction' | 'file' | 'status_change';
  description: string;
  details?: string;
}

export interface Client {
  id: string;
  company_name: string;
  sector: Sector;
  type: ClientType;
  city: string;
  website?: string;
  instagram_url?: string;
  priority: Priority;
  revenue?: string;
  has_vat: boolean;
  status: ClientStatus;
  notes?: string;
  concept_idea?: string;
  tags: string[];
  contacts: Contact[];
  interactions: Interaction[];
  files: ClientFile[];
  timeline: TimelineEvent[];
  created_at: string;
  updated_at: string;
}

export interface AppData {
  clients: Client[];
  version: string;
}
