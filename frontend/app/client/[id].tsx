import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Globe, Plus, X, ChevronDown, Trash2, FileText } from 'lucide-react-native';
import { useData } from '../../src/context/DataContext';
import { colors, fonts, spacing, radius, statusColors, priorityColors } from '../../src/theme';
import { formatDate, getInitials, hashColor, todayISO } from '../../src/utils';
import { CLIENT_STATUSES, INTERACTION_TYPES, OUTCOMES, FILE_TYPES, ClientStatus, InteractionType, Outcome } from '../../src/types';

function Badge({ text, color }: { text: string; color: string }) {
  return <View style={{ borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', borderColor: color }}><Text style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color }}>{text}</Text></View>;
}

function Picker({ label, value, options, onSelect }: { label: string; value: string; options: string[]; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={pk.label}>{label}</Text>
      <TouchableOpacity style={pk.input} onPress={() => setOpen(!open)} activeOpacity={0.7}>
        <Text style={[pk.text, !value && { color: colors.textTertiary }]}>{value || 'Seleziona...'}</Text>
        <ChevronDown size={14} color={colors.textSecondary} />
      </TouchableOpacity>
      {open && <View style={pk.dd}><ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>{options.map((o) => <TouchableOpacity key={o} style={pk.opt} onPress={() => { onSelect(o); setOpen(false); }} activeOpacity={0.7}><Text style={[pk.text, o === value && { color: colors.accent }]}>{o}</Text></TouchableOpacity>)}</ScrollView></View>}
    </View>
  );
}
const pk = StyleSheet.create({ label: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }, input: { backgroundColor: colors.elevated, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, text: { fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary }, dd: { backgroundColor: colors.elevated, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: radius.md, marginTop: 2 }, opt: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border } });

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getClient, updateClient, deleteClient, addContact, deleteContact, addInteraction, deleteInteraction, addFile, deleteFile } = useData();
  const client = getClient(id);
  const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'files' | 'timeline'>('overview');
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [showAddFile, setShowAddFile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editingConcept, setEditingConcept] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [conceptText, setConceptText] = useState('');

  if (!client) return <SafeAreaView style={s.safe}><View style={s.centered}><Text style={s.emptyTitle}>Cliente non trovato.</Text><TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}><Text style={s.backText}>← Torna indietro</Text></TouchableOpacity></View></SafeAreaView>;

  const sortedInteractions = [...client.interactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const sortedTimeline = [...client.timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleStatusChange = (status: string) => { updateClient(client.id, { status: status as ClientStatus }); setShowStatusPicker(false); };
  const handleDeleteClient = () => { deleteClient(client.id); setShowDeleteConfirm(false); router.back(); };

  const tabs = [{ key: 'overview', label: 'OVERVIEW' }, { key: 'interactions', label: 'INTERAZIONI' }, { key: 'files', label: 'FILE' }, { key: 'timeline', label: 'TIMELINE' }] as const;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}><ArrowLeft size={20} color={colors.textPrimary} /></TouchableOpacity>
        <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} activeOpacity={0.7}><Trash2 size={18} color={colors.statusRed} /></TouchableOpacity>
      </View>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.companyName}>{client.company_name}</Text>
        <View style={s.badgeRow}>
          <TouchableOpacity onPress={() => setShowStatusPicker(true)} activeOpacity={0.7}><Badge text={client.status} color={statusColors[client.status] || colors.textTertiary} /></TouchableOpacity>
          <Badge text={client.priority} color={priorityColors[client.priority] || colors.textTertiary} />
          <Text style={s.metaText}>{client.city} · {client.sector}</Text>
        </View>
        <View style={s.linksRow}>
          {client.website && <TouchableOpacity onPress={() => Linking.openURL(client.website!)} activeOpacity={0.7}><Globe size={16} color={colors.textSecondary} /></TouchableOpacity>}
        </View>
        <Text style={s.updatedText}>Aggiornato: {formatDate(client.updated_at)}</Text>
        <View style={s.tabBar}>
          {tabs.map((t) => <TouchableOpacity key={t.key} style={[s.tab, activeTab === t.key && s.tabActive]} onPress={() => setActiveTab(t.key)} activeOpacity={0.7}><Text style={[s.tabText, activeTab === t.key && s.tabTextActive]}>{t.label}</Text></TouchableOpacity>)}
        </View>

        {activeTab === 'overview' && (
          <View>
            <View style={s.section}>
              <View style={s.sectionHead}><Text style={s.sectionTitle}>NOTE STRATEGICHE</Text>{!editingNotes && <TouchableOpacity onPress={() => { setNotesText(client.notes || ''); setEditingNotes(true); }} activeOpacity={0.7}><Text style={s.editLink}>Modifica</Text></TouchableOpacity>}</View>
              {editingNotes ? <View><TextInput style={s.textArea} value={notesText} onChangeText={setNotesText} multiline /><TouchableOpacity style={s.saveBtn} onPress={() => { updateClient(client.id, { notes: notesText }); setEditingNotes(false); }} activeOpacity={0.7}><Text style={s.saveBtnText}>SALVA</Text></TouchableOpacity></View> : <Text style={s.bodyText}>{client.notes || 'Nessuna nota.'}</Text>}
            </View>
            <View style={s.section}>
              <View style={s.sectionHead}><Text style={s.sectionTitle}>CONCEPT IDEA</Text>{!editingConcept && <TouchableOpacity onPress={() => { setConceptText(client.concept_idea || ''); setEditingConcept(true); }} activeOpacity={0.7}><Text style={s.editLink}>Modifica</Text></TouchableOpacity>}</View>
              {editingConcept ? <View><TextInput style={s.textArea} value={conceptText} onChangeText={setConceptText} multiline /><TouchableOpacity style={s.saveBtn} onPress={() => { updateClient(client.id, { concept_idea: conceptText }); setEditingConcept(false); }} activeOpacity={0.7}><Text style={s.saveBtnText}>SALVA</Text></TouchableOpacity></View> : <Text style={s.bodyText}>{client.concept_idea || 'Nessun concept.'}</Text>}
            </View>
            <View style={s.section}>
              <View style={s.sectionHead}><Text style={s.sectionTitle}>CONTATTI ({client.contacts.length})</Text><TouchableOpacity onPress={() => setShowAddContact(true)} activeOpacity={0.7}><Text style={s.editLink}>+ Aggiungi</Text></TouchableOpacity></View>
              {client.contacts.map((ct) => (
                <TouchableOpacity key={ct.id} style={s.contactRow} onPress={() => router.push(`/contact/${ct.id}`)} activeOpacity={0.7}>
                  <View style={[s.avatar, { backgroundColor: hashColor(ct.name) }]}><Text style={s.avatarText}>{getInitials(ct.name)}</Text></View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Text style={s.contactName}>{ct.name}</Text>{ct.is_primary && <Badge text="PRIMARY" color={colors.accent} />}</View>
                    <Text style={s.contactRole}>{ct.role}</Text>
                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); Linking.openURL(`mailto:${ct.email}`); }} activeOpacity={0.7}><Text style={s.contactEmail}>{ct.email}</Text></TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => deleteContact(client.id, ct.id)} activeOpacity={0.7}><X size={14} color={colors.textTertiary} /></TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'interactions' && (
          <View>
            <TouchableOpacity style={s.addBtn} onPress={() => setShowAddInteraction(true)} activeOpacity={0.7}><Plus size={16} color={colors.textOnBright} /><Text style={s.addBtnText}>NUOVA INTERAZIONE</Text></TouchableOpacity>
            {sortedInteractions.length === 0 ? <View style={s.emptySection}><Text style={s.emptyTitle}>Nessuna interazione.</Text></View> : (
              <View style={{ paddingLeft: 12 }}>
                {sortedInteractions.map((inter, idx) => {
                  const contact = inter.contact_id ? client.contacts.find((c) => c.id === inter.contact_id) : null;
                  return (
                    <View key={inter.id} style={{ flexDirection: 'row', marginBottom: 0, minHeight: 40 }}>
                      <View style={{ width: 20, alignItems: 'center', position: 'relative' }}>{idx < sortedInteractions.length - 1 && <View style={{ position: 'absolute', top: 8, bottom: -8, width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />}</View>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, position: 'absolute', left: 6, top: 8 }} />
                      <View style={s.interCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <Text style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textSecondary }}>{formatDate(inter.date)}</Text>
                          <Badge text={inter.type} color={colors.accent} />
                        </View>
                        {contact && <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>{contact.name}</Text>}
                        <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textPrimary, marginBottom: 4 }}>{inter.subject}</Text>
                        <Text style={{ fontFamily: fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8, lineHeight: 20 }} numberOfLines={3}>{inter.body}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <Badge text={inter.outcome} color={inter.outcome === 'Risposta positiva' ? colors.statusGreen : inter.outcome === 'Risposta negativa' ? colors.statusRed : colors.textSecondary} />
                          {inter.next_action && <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.accent }}>{inter.next_action}</Text>}
                        </View>
                        <TouchableOpacity onPress={() => deleteInteraction(client.id, inter.id)} style={{ position: 'absolute', top: 10, right: 10 }} activeOpacity={0.7}><Trash2 size={12} color={colors.textTertiary} /></TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {activeTab === 'files' && (
          <View>
            <TouchableOpacity style={s.addBtn} onPress={() => setShowAddFile(true)} activeOpacity={0.7}><Plus size={16} color={colors.textOnBright} /><Text style={s.addBtnText}>AGGIUNGI FILE</Text></TouchableOpacity>
            {client.files.length === 0 ? <View style={s.emptySection}><Text style={s.emptyTitle}>Nessun file.</Text><Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary }}>Aggiungi proposte, moodboard e documenti.</Text></View> : (
              client.files.map((f) => (
                <View key={f.id} style={s.fileCard}>
                  <FileText size={20} color={colors.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textPrimary }}>{f.name}</Text>
                    {f.description && <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{f.description}</Text>}
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}><Badge text={f.type} color={colors.accent} /><Text style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textSecondary }}>{formatDate(f.created_at)}</Text></View>
                    {f.url && <TouchableOpacity onPress={() => Linking.openURL(f.url!)} activeOpacity={0.7}><Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.accent, marginTop: 4 }}>Apri link →</Text></TouchableOpacity>}
                  </View>
                  <TouchableOpacity onPress={() => deleteFile(client.id, f.id)} activeOpacity={0.7}><Trash2 size={14} color={colors.textTertiary} /></TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'timeline' && (
          <View>
            {sortedTimeline.length === 0 ? <View style={s.emptySection}><Text style={s.emptyTitle}>Nessun evento.</Text></View> : (
              sortedTimeline.map((ev, idx) => (
                <View key={ev.id} style={{ flexDirection: 'row', minHeight: 40 }}>
                  <View style={{ width: 28, alignItems: 'center' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, marginTop: 4, backgroundColor: ev.type === 'status_change' ? colors.statusPurple : ev.type === 'file' ? colors.statusBlue : colors.accent }} />
                    {idx < sortedTimeline.length - 1 && <View style={{ flex: 1, width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 }} />}
                  </View>
                  <View style={{ flex: 1, paddingBottom: 16, paddingLeft: 8 }}>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textSecondary, marginBottom: 2 }}>{formatDate(ev.date)}</Text>
                    <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textPrimary }}>{ev.description}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>

      <Modal visible={showStatusPicker} transparent animationType="fade">
        <TouchableOpacity style={ms.overlay} activeOpacity={1} onPress={() => setShowStatusPicker(false)}>
          <View style={ms.pickerModal}>
            <Text style={ms.pickerTitle}>Cambia Status</Text>
            {CLIENT_STATUSES.map((st) => <TouchableOpacity key={st} style={[ms.pickerOpt, client.status === st && ms.pickerOptActive]} onPress={() => handleStatusChange(st)} activeOpacity={0.7}><View style={[ms.statusDot, { backgroundColor: statusColors[st] }]} /><Text style={[ms.pickerOptText, client.status === st && { color: colors.accent }]}>{st}</Text></TouchableOpacity>)}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={ms.overlay}><View style={ms.confirmModal}>
          <Text style={ms.pickerTitle}>Elimina cliente?</Text>
          <Text style={ms.confirmDesc}>Questa azione eliminerà "{client.company_name}" e tutti i dati associati.</Text>
          <View style={ms.btnRow}>
            <TouchableOpacity style={ms.cancelBtn} onPress={() => setShowDeleteConfirm(false)} activeOpacity={0.7}><Text style={ms.cancelText}>ANNULLA</Text></TouchableOpacity>
            <TouchableOpacity style={ms.dangerBtn} onPress={handleDeleteClient} activeOpacity={0.7}><Text style={ms.dangerText}>ELIMINA</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>

      <AddContactModal visible={showAddContact} onClose={() => setShowAddContact(false)} clientId={client.id} addContact={addContact} />
      <AddInteractionModal visible={showAddInteraction} onClose={() => setShowAddInteraction(false)} clientId={client.id} contacts={client.contacts} addInteraction={addInteraction} />
      <AddFileModal visible={showAddFile} onClose={() => setShowAddFile(false)} clientId={client.id} addFile={addFile} />
    </SafeAreaView>
  );
}

function AddContactModal({ visible, onClose, clientId, addContact }: any) {
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', is_primary: false });
  const save = () => { if (!form.name || !form.email) return; addContact(clientId, { name: form.name, role: form.role, email: form.email, phone: form.phone || undefined, is_primary: form.is_primary }); setForm({ name: '', role: '', email: '', phone: '', is_primary: false }); onClose(); };
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={ms.overlay}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={ms.formModal}>
          <View style={ms.formHeader}><Text style={ms.pickerTitle}>Nuovo Contatto</Text><TouchableOpacity onPress={onClose}><X size={20} color={colors.textSecondary} /></TouchableOpacity></View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {[['NOME *', 'name', 'Nome e cognome'], ['RUOLO', 'role', 'Es. Marketing Director'], ['EMAIL *', 'email', 'email@azienda.it'], ['TELEFONO', 'phone', '+39...']].map(([lbl, field, ph]) => (
              <View key={field}><Text style={fi.label}>{lbl}</Text><TextInput style={fi.input} value={(form as any)[field]} onChangeText={(v) => setForm((p) => ({ ...p, [field]: v }))} placeholder={ph} placeholderTextColor={colors.textTertiary} keyboardType={field === 'email' ? 'email-address' : field === 'phone' ? 'phone-pad' : 'default'} /></View>
            ))}
          </ScrollView>
          <TouchableOpacity style={fi.saveBtn} onPress={save} activeOpacity={0.7}><Text style={fi.saveBtnText}>AGGIUNGI CONTATTO</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView></View>
    </Modal>
  );
}

function AddInteractionModal({ visible, onClose, clientId, contacts, addInteraction }: any) {
  const [form, setForm] = useState({ type: 'Email', contact_id: '', subject: '', body: '', outcome: 'In attesa', next_action: '', next_action_date: '' });
  const save = () => { if (!form.subject) return; addInteraction(clientId, { date: new Date().toISOString(), type: form.type as InteractionType, contact_id: form.contact_id || undefined, subject: form.subject, body: form.body, outcome: form.outcome as Outcome, next_action: form.next_action || undefined, next_action_date: form.next_action_date ? new Date(form.next_action_date).toISOString() : undefined }); setForm({ type: 'Email', contact_id: '', subject: '', body: '', outcome: 'In attesa', next_action: '', next_action_date: '' }); onClose(); };
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={ms.overlay}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={ms.formModal}>
          <View style={ms.formHeader}><Text style={ms.pickerTitle}>Nuova Interazione</Text><TouchableOpacity onPress={onClose}><X size={20} color={colors.textSecondary} /></TouchableOpacity></View>
          <ScrollView style={{ maxHeight: 450 }} showsVerticalScrollIndicator={false}>
            <Picker label="TIPO" value={form.type} options={[...INTERACTION_TYPES]} onSelect={(v) => setForm((p) => ({ ...p, type: v }))} />
            {contacts.length > 0 && <Picker label="CONTATTO" value={contacts.find((c: any) => c.id === form.contact_id)?.name || ''} options={contacts.map((c: any) => c.name)} onSelect={(v: string) => { const ct = contacts.find((c: any) => c.name === v); setForm((p) => ({ ...p, contact_id: ct?.id || '' })); }} />}
            <Text style={fi.label}>OGGETTO *</Text><TextInput style={fi.input} value={form.subject} onChangeText={(v) => setForm((p) => ({ ...p, subject: v }))} placeholder="Oggetto" placeholderTextColor={colors.textTertiary} />
            <Text style={fi.label}>DETTAGLI</Text><TextInput style={[fi.input, { height: 80, textAlignVertical: 'top' }]} value={form.body} onChangeText={(v) => setForm((p) => ({ ...p, body: v }))} multiline placeholder="Descrizione..." placeholderTextColor={colors.textTertiary} />
            <Picker label="ESITO" value={form.outcome} options={[...OUTCOMES]} onSelect={(v) => setForm((p) => ({ ...p, outcome: v }))} />
            <Text style={fi.label}>PROSSIMA AZIONE</Text><TextInput style={fi.input} value={form.next_action} onChangeText={(v) => setForm((p) => ({ ...p, next_action: v }))} placeholder="Es. Inviare proposta" placeholderTextColor={colors.textTertiary} />
            <Text style={fi.label}>DATA (YYYY-MM-DD)</Text><TextInput style={fi.input} value={form.next_action_date} onChangeText={(v) => setForm((p) => ({ ...p, next_action_date: v }))} placeholder={todayISO()} placeholderTextColor={colors.textTertiary} />
          </ScrollView>
          <TouchableOpacity style={fi.saveBtn} onPress={save} activeOpacity={0.7}><Text style={fi.saveBtnText}>AGGIUNGI INTERAZIONE</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView></View>
    </Modal>
  );
}

function AddFileModal({ visible, onClose, clientId, addFile }: any) {
  const [form, setForm] = useState({ name: '', description: '', url: '', type: 'Altro' });
  const save = () => { if (!form.name) return; addFile(clientId, { name: form.name, description: form.description || undefined, url: form.url || undefined, type: form.type as any }); setForm({ name: '', description: '', url: '', type: 'Altro' }); onClose(); };
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={ms.overlay}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={ms.formModal}>
          <View style={ms.formHeader}><Text style={ms.pickerTitle}>Aggiungi File</Text><TouchableOpacity onPress={onClose}><X size={20} color={colors.textSecondary} /></TouchableOpacity></View>
          <Text style={fi.label}>NOME *</Text><TextInput style={fi.input} value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="Nome file" placeholderTextColor={colors.textTertiary} />
          <Text style={fi.label}>DESCRIZIONE</Text><TextInput style={fi.input} value={form.description} onChangeText={(v) => setForm((p) => ({ ...p, description: v }))} placeholder="Descrizione..." placeholderTextColor={colors.textTertiary} />
          <Text style={fi.label}>URL (link esterno)</Text><TextInput style={fi.input} value={form.url} onChangeText={(v) => setForm((p) => ({ ...p, url: v }))} placeholder="https://..." placeholderTextColor={colors.textTertiary} keyboardType="url" />
          <Picker label="TIPO" value={form.type} options={[...FILE_TYPES]} onSelect={(v) => setForm((p) => ({ ...p, type: v }))} />
          <TouchableOpacity style={fi.saveBtn} onPress={save} activeOpacity={0.7}><Text style={fi.saveBtnText}>AGGIUNGI FILE</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView></View>
    </Modal>
  );
}

const fi = StyleSheet.create({ label: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }, input: { backgroundColor: colors.elevated, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 14, fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary, marginBottom: 16 }, saveBtn: { backgroundColor: colors.accent, borderRadius: radius.lg, paddingVertical: 16, alignItems: 'center', marginTop: 8 }, saveBtnText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.textOnBright, letterSpacing: 1.5 } });
const ms = StyleSheet.create({ overlay: { flex: 1, backgroundColor: colors.overlay }, pickerModal: { backgroundColor: colors.surface, margin: spacing.lg, borderRadius: radius.lg, padding: spacing.lg }, pickerTitle: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.textPrimary, marginBottom: spacing.md }, pickerOpt: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }, pickerOptActive: { backgroundColor: 'rgba(255,237,67,0.05)' }, pickerOptText: { fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary }, statusDot: { width: 8, height: 8, borderRadius: 4 }, confirmModal: { backgroundColor: colors.surface, margin: spacing.lg, borderRadius: radius.lg, padding: spacing.lg }, confirmDesc: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginBottom: spacing.lg }, btnRow: { flexDirection: 'row', gap: 12 }, cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.textSecondary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' }, cancelText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary, letterSpacing: 1 }, dangerBtn: { flex: 1, borderWidth: 1, borderColor: colors.statusRed, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' }, dangerText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.statusRed, letterSpacing: 1 }, formModal: { backgroundColor: colors.surface, padding: spacing.lg, maxHeight: '85%', borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }, formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg } });
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }, topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: 12 }, backBtn: { width: 44, height: 44, justifyContent: 'center' }, scroll: { flex: 1 }, content: { paddingHorizontal: spacing.lg }, companyName: { fontFamily: fonts.displayBold, fontSize: 30, color: colors.textPrimary, marginBottom: 8 }, badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }, metaText: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary }, linksRow: { flexDirection: 'row', gap: 16, marginBottom: 8 }, updatedText: { fontFamily: fonts.mono, fontSize: 10, color: colors.textTertiary, marginBottom: spacing.lg }, tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.lg }, tab: { paddingVertical: 12, paddingHorizontal: 4, marginRight: 20 }, tabActive: { borderBottomWidth: 2, borderBottomColor: colors.accent }, tabText: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textTertiary, letterSpacing: 1.5, textTransform: 'uppercase' }, tabTextActive: { color: colors.accent }, section: { marginBottom: spacing.xl }, sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, sectionTitle: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textSecondary, letterSpacing: 2, textTransform: 'uppercase' }, editLink: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.accent }, bodyText: { fontFamily: fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 22 }, textArea: { backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.borderFocus, borderRadius: radius.md, padding: 14, fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary, height: 100, textAlignVertical: 'top', marginBottom: 8 }, saveBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 10, alignItems: 'center' }, saveBtnText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.textOnBright, letterSpacing: 1 }, contactRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, marginBottom: 8 }, avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }, avatarText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.textPrimary }, contactName: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textPrimary }, contactRole: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary }, contactEmail: { fontFamily: fonts.mono, fontSize: 11, color: colors.accent, marginTop: 2 }, addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 14, marginBottom: spacing.lg }, addBtnText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.textOnBright, letterSpacing: 1 }, emptySection: { alignItems: 'center', padding: spacing.xl }, emptyTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.textPrimary, marginBottom: 4 }, backText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.accent, marginTop: 12 }, interCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, marginBottom: 8, marginLeft: 8 }, fileCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, marginBottom: 8 } });
