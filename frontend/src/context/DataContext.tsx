import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { storage } from '../storage';
import { demoData } from '../demoData';
import { AppData, Client, ClientStatus, Contact, Interaction, ClientFile, InteractionType, Outcome, FileType, Sector, ClientType, Priority, TimelineEvent } from '../types';

const STORAGE_KEY = 'clientmanager_data';

const uuid = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const now = () => new Date().toISOString();

interface AddClientPayload { company_name: string; sector: Sector; type: ClientType; city: string; website?: string; instagram_url?: string; priority: Priority; revenue?: string; has_vat: boolean; status: ClientStatus; notes?: string; concept_idea?: string; tags: string[]; }
interface AddContactPayload { name: string; role: string; email: string; phone?: string; linkedin_url?: string; instagram_url?: string; is_primary: boolean; notes?: string; }
interface AddInteractionPayload { date: string; type: InteractionType; contact_id?: string; subject: string; body: string; outcome: Outcome; next_action?: string; next_action_date?: string; }
interface AddFilePayload { name: string; description?: string; url?: string; file_data?: string; type: FileType; }

interface DataContextType {
  data: AppData;
  getClient: (id: string) => Client | undefined;
  addClient: (p: AddClientPayload) => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  deleteClient: (clientId: string) => void;
  addContact: (clientId: string, p: AddContactPayload) => void;
  updateContact: (clientId: string, contactId: string, updates: Partial<Contact>) => void;
  deleteContact: (clientId: string, contactId: string) => void;
  addInteraction: (clientId: string, p: AddInteractionPayload) => void;
  deleteInteraction: (clientId: string, interactionId: string) => void;
  addFile: (clientId: string, p: AddFilePayload) => void;
  deleteFile: (clientId: string, fileId: string) => void;
  exportDataJSON: () => Promise<string>;
  importDataJSON: (json: string) => Promise<boolean>;
  resetToDemo: () => void;
  showToast: (message: string) => void;
  toastMessage: string | null;
}

const DataContext = createContext<DataContextType | null>(null);
export const useData = () => { const ctx = useContext(DataContext); if (!ctx) throw new Error('useData must be used within DataProvider'); return ctx; };

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>({ clients: [], version: '1.0' });
  const [loaded, setLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await storage.getItem(STORAGE_KEY);
        if (raw) { const parsed = JSON.parse(raw) as AppData; if (parsed?.clients && Array.isArray(parsed.clients)) { setData(parsed); setLoaded(true); return; } }
      } catch (e) { console.warn('[CM] Load error:', e); }
      setData({ clients: demoData, version: '1.0' });
      setLoaded(true);
    };
    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    storage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((e) => console.warn('[CM] Save error:', e));
  }, [data, loaded]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 2200);
  }, []);

  const appendTimeline = (client: Client, type: TimelineEvent['type'], description: string): Client => ({
    ...client,
    timeline: [...client.timeline, { id: uuid(), client_id: client.id, date: now(), type, description }],
  });

  const getClient = useCallback((id: string) => data.clients.find((c) => c.id === id), [data.clients]);

  const addClient = useCallback((payload: AddClientPayload) => {
    const newClient: Client = { id: uuid(), ...payload, contacts: [], interactions: [], files: [], timeline: [], created_at: now(), updated_at: now() };
    setData((prev) => ({ ...prev, clients: [...prev.clients, newClient] }));
    showToast('Cliente aggiunto');
  }, [showToast]);

  const updateClient = useCallback((clientId: string, updates: Partial<Client>) => {
    setData((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => {
        if (c.id !== clientId) return c;
        const updated = { ...c, ...updates, updated_at: now() };
        if (updates.status && updates.status !== c.status) return appendTimeline(updated, 'status_change', `Status: "${c.status}" → "${updates.status}"`);
        return updated;
      }),
    }));
  }, []);

  const deleteClient = useCallback((clientId: string) => { setData((prev) => ({ ...prev, clients: prev.clients.filter((c) => c.id !== clientId) })); showToast('Cliente eliminato'); }, [showToast]);

  const addContact = useCallback((clientId: string, payload: AddContactPayload) => {
    const newContact: Contact = { id: uuid(), client_id: clientId, role: '', is_primary: false, ...payload };
    setData((prev) => ({ ...prev, clients: prev.clients.map((c) => c.id !== clientId ? c : { ...c, contacts: [...c.contacts, newContact], updated_at: now() }) }));
    showToast('Contatto aggiunto');
  }, [showToast]);

  const updateContact = useCallback((clientId: string, contactId: string, updates: Partial<Contact>) => {
    setData((prev) => ({ ...prev, clients: prev.clients.map((c) => c.id !== clientId ? c : { ...c, contacts: c.contacts.map((ct) => ct.id !== contactId ? ct : { ...ct, ...updates }), updated_at: now() }) }));
  }, []);

  const deleteContact = useCallback((clientId: string, contactId: string) => {
    setData((prev) => ({ ...prev, clients: prev.clients.map((c) => c.id !== clientId ? c : { ...c, contacts: c.contacts.filter((ct) => ct.id !== contactId), updated_at: now() }) }));
    showToast('Contatto eliminato');
  }, [showToast]);

  const addInteraction = useCallback((clientId: string, payload: AddInteractionPayload) => {
    const newInter: Interaction = { id: uuid(), client_id: clientId, ...payload };
    setData((prev) => ({ ...prev, clients: prev.clients.map((c) => { if (c.id !== clientId) return c; const w = { ...c, interactions: [...c.interactions, newInter], updated_at: now() }; return appendTimeline(w, 'interaction', `${payload.type}: ${payload.subject}`); }) }));
    showToast('Interazione aggiunta');
  }, [showToast]);

  const deleteInteraction = useCallback((clientId: string, interactionId: string) => {
    setData((prev) => ({ ...prev, clients: prev.clients.map((c) => c.id !== clientId ? c : { ...c, interactions: c.interactions.filter((i) => i.id !== interactionId), updated_at: now() }) }));
    showToast('Interazione eliminata');
  }, [showToast]);

  const addFile = useCallback((clientId: string, payload: AddFilePayload) => {
    const newFile: ClientFile = { id: uuid(), client_id: clientId, created_at: now(), ...payload };
    setData((prev) => ({ ...prev, clients: prev.clients.map((c) => { if (c.id !== clientId) return c; const w = { ...c, files: [...c.files, newFile], updated_at: now() }; return appendTimeline(w, 'file', `File: ${payload.name}`); }) }));
    showToast('File aggiunto');
  }, [showToast]);

  const deleteFile = useCallback((clientId: string, fileId: string) => {
    setData((prev) => ({ ...prev, clients: prev.clients.map((c) => c.id !== clientId ? c : { ...c, files: c.files.filter((f) => f.id !== fileId), updated_at: now() }) }));
    showToast('File eliminato');
  }, [showToast]);

  const exportDataJSON = useCallback(async () => JSON.stringify(data, null, 2), [data]);
  const importDataJSON = useCallback(async (json: string): Promise<boolean> => { try { const parsed = JSON.parse(json) as AppData; if (!parsed?.clients || !Array.isArray(parsed.clients)) return false; setData(parsed); showToast('Dati importati'); return true; } catch { return false; } }, [showToast]);
  const resetToDemo = useCallback(() => { setData({ clients: demoData, version: '1.0' }); showToast('Dati demo ripristinati'); }, [showToast]);

  return (
    <DataContext.Provider value={{ data, getClient, addClient, updateClient, deleteClient, addContact, updateContact, deleteContact, addInteraction, deleteInteraction, addFile, deleteFile, exportDataJSON, importDataJSON, resetToDemo, showToast, toastMessage }}>
      {children}
    </DataContext.Provider>
  );
};
