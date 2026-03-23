import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Linking, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Mail, Phone, Pencil, Check, X, Trash2, Building2, Star, ChevronRight } from 'lucide-react-native';
import { useData } from '../../src/context/DataContext';
import { colors, fonts, spacing, radius } from '../../src/theme';
import { getInitials, hashColor } from '../../src/utils';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, updateContact, deleteContact, showToast } = useData();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const found = useMemo(() => { for (const client of data.clients) { const contact = client.contacts.find((c) => c.id === id); if (contact) return { contact, client }; } return null; }, [data.clients, id]);
  if (!found) return <SafeAreaView style={s.safe}><View style={s.centered}><Text style={s.emptyTitle}>Contatto non trovato.</Text><TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}><Text style={s.backLink}>← Torna indietro</Text></TouchableOpacity></View></SafeAreaView>;

  const { contact, client } = found;

  const startEdit = (field: string, value: string) => { setDrafts((p) => ({ ...p, [field]: value })); setEditingField(field); };
  const saveField = (field: string) => { updateContact(client.id, contact.id, { [field]: drafts[field] }); setEditingField(null); showToast('Salvato'); };
  const cancelEdit = () => setEditingField(null);

  const Field = ({ label, field, value, placeholder, keyboardType = 'default' }: any) => (
    <View style={ef.wrap}>
      <Text style={ef.label}>{label}</Text>
      {editingField === field ? (
        <View style={ef.inputRow}>
          <TextInput style={ef.input} value={drafts[field]} onChangeText={(v) => setDrafts((p) => ({ ...p, [field]: v }))} placeholder={placeholder} placeholderTextColor={colors.textTertiary} keyboardType={keyboardType} autoFocus />
          <TouchableOpacity style={ef.iconBtn} onPress={() => saveField(field)} activeOpacity={0.7}><Check size={16} color={colors.accent} /></TouchableOpacity>
          <TouchableOpacity style={ef.iconBtn} onPress={cancelEdit} activeOpacity={0.7}><X size={16} color={colors.textTertiary} /></TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={ef.valueRow} onPress={() => startEdit(field, value || '')} activeOpacity={0.7}>
          <Text style={[ef.value, !value && { color: colors.textTertiary, fontStyle: 'italic' }]}>{value || placeholder}</Text>
          <Pencil size={13} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const handleDelete = () => { deleteContact(client.id, contact.id); setShowDeleteConfirm(false); router.back(); showToast('Contatto eliminato'); };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}><ArrowLeft size={20} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={s.topBarTitle}>CONTATTO</Text>
        <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} activeOpacity={0.7}><Trash2 size={18} color={colors.statusRed} /></TouchableOpacity>
      </View>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.heroSection}>
          <View style={[s.avatar, { backgroundColor: hashColor(contact.name) }]}><Text style={s.avatarText}>{getInitials(contact.name)}</Text></View>
          <Text style={s.contactName}>{contact.name}</Text>
          <Text style={s.contactRole}>{contact.role || '—'}</Text>
          {contact.is_primary && <View style={s.primaryBadge}><Star size={10} color={colors.accent} /><Text style={s.primaryText}>CONTATTO PRINCIPALE</Text></View>}
          <TouchableOpacity style={s.clientLink} onPress={() => router.push(`/client/${client.id}`)} activeOpacity={0.7}>
            <Building2 size={14} color={colors.accent} /><Text style={s.clientLinkText}>{client.company_name}</Text><ChevronRight size={13} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <Text style={s.sectionTitle}>AZIONI RAPIDE</Text>
        {contact.email && <TouchableOpacity style={s.actionRow} onPress={() => Linking.openURL(`mailto:${contact.email}`)} activeOpacity={0.7}><View style={s.actionIcon}><Mail size={16} color={colors.accent} /></View><View style={s.actionContent}><Text style={s.actionLabel}>EMAIL</Text><Text style={s.actionValue}>{contact.email}</Text></View><ChevronRight size={14} color={colors.textTertiary} /></TouchableOpacity>}
        {contact.phone && <TouchableOpacity style={s.actionRow} onPress={() => Linking.openURL(`tel:${contact.phone}`)} activeOpacity={0.7}><View style={s.actionIcon}><Phone size={16} color={colors.accent} /></View><View style={s.actionContent}><Text style={s.actionLabel}>TELEFONO</Text><Text style={s.actionValue}>{contact.phone}</Text></View><ChevronRight size={14} color={colors.textTertiary} /></TouchableOpacity>}

        <Text style={[s.sectionTitle, { marginTop: spacing.xl }]}>MODIFICA</Text>
        <Field label="Nome completo" field="name" value={contact.name} placeholder="Nome e cognome" />
        <Field label="Ruolo" field="role" value={contact.role} placeholder="Es. Marketing Director" />
        <Field label="Email" field="email" value={contact.email} placeholder="email@azienda.it" keyboardType="email-address" />
        <Field label="Telefono" field="phone" value={contact.phone} placeholder="+39 000 0000000" keyboardType="phone-pad" />
        <Field label="LinkedIn URL" field="linkedin_url" value={contact.linkedin_url} placeholder="https://linkedin.com/in/..." keyboardType="url" />
        <Field label="Instagram URL" field="instagram_url" value={contact.instagram_url} placeholder="https://instagram.com/..." keyboardType="url" />
        <Field label="Note" field="notes" value={contact.notes} placeholder="Note su questo contatto..." />

        <TouchableOpacity style={[s.primaryToggle, contact.is_primary && s.primaryToggleActive]} onPress={() => { updateContact(client.id, contact.id, { is_primary: !contact.is_primary }); showToast('Salvato'); }} activeOpacity={0.7}>
          <Star size={16} color={contact.is_primary ? colors.textOnBright : colors.accent} />
          <Text style={[s.primaryToggleText, contact.is_primary && { color: colors.textOnBright }]}>{contact.is_primary ? 'Contatto principale' : 'Imposta come principale'}</Text>
        </TouchableOpacity>
        <View style={{ height: 60 }} />
      </ScrollView>

      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={ms.overlay}><View style={ms.modal}>
          <Text style={ms.title}>Elimina contatto?</Text>
          <Text style={ms.desc}>Questa azione eliminerà "{contact.name}" da {client.company_name}.</Text>
          <View style={ms.btnRow}>
            <TouchableOpacity style={ms.cancelBtn} onPress={() => setShowDeleteConfirm(false)} activeOpacity={0.7}><Text style={ms.cancelText}>ANNULLA</Text></TouchableOpacity>
            <TouchableOpacity style={ms.dangerBtn} onPress={handleDelete} activeOpacity={0.7}><Text style={ms.dangerText}>ELIMINA</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const ef = StyleSheet.create({ wrap: { marginBottom: 16 }, label: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }, inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.elevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 14, gap: 8 }, input: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.textPrimary, paddingVertical: 14 }, iconBtn: { padding: 4 }, valueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: colors.border }, value: { fontFamily: fonts.body, fontSize: 15, color: colors.textPrimary, flex: 1, marginRight: 8 } });
const ms = StyleSheet.create({ overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.lg }, modal: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg }, title: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.textPrimary, textAlign: 'center', marginBottom: 8 }, desc: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 20 }, btnRow: { flexDirection: 'row', gap: 12 }, cancelBtn: { flex: 1, backgroundColor: colors.elevated, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' }, cancelText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary, letterSpacing: 1 }, dangerBtn: { flex: 1, backgroundColor: 'rgba(255,92,92,0.15)', borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.statusRed }, dangerText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.statusRed, letterSpacing: 1 } });
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }, topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: 12 }, backBtn: { width: 44, height: 44, justifyContent: 'center' }, topBarTitle: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textSecondary, letterSpacing: 2 }, scroll: { flex: 1 }, content: { paddingHorizontal: spacing.lg, paddingTop: 8 }, heroSection: { alignItems: 'center', paddingVertical: spacing.xl }, avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 14 }, avatarText: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.textPrimary }, contactName: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.textPrimary, marginBottom: 4, textAlign: 'center' }, contactRole: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginBottom: 12, textAlign: 'center' }, primaryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accentMuted, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 14 }, primaryText: { fontFamily: fonts.bodyMedium, fontSize: 9, color: colors.accent, letterSpacing: 1.2 }, clientLink: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accentDim, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7 }, clientLinkText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.accent }, sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.textSecondary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: spacing.md }, actionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, marginBottom: 8, gap: 14, borderWidth: 1, borderColor: colors.border }, actionIcon: { width: 36, height: 36, backgroundColor: colors.accentDim, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center' }, actionContent: { flex: 1 }, actionLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }, actionValue: { fontFamily: fonts.mono, fontSize: 13, color: colors.textPrimary }, primaryToggle: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.accent, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, marginTop: 8 }, primaryToggleActive: { backgroundColor: colors.accent }, primaryToggleText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.accent }, emptyTitle: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.textPrimary, marginBottom: 8 }, backLink: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.accent } });
