import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, Modal, StyleSheet, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Plus, X, ChevronDown, Globe, Filter } from 'lucide-react-native';
import { useData } from '../../src/context/DataContext';
import { colors, fonts, spacing, radius, statusColors, priorityColors } from '../../src/theme';
import { formatDate, isPastDate } from '../../src/utils';
import { Client, SECTORS, CLIENT_TYPES, PRIORITIES, CLIENT_STATUSES } from '../../src/types';

const screenW = Dimensions.get('window').width;

function Badge({ text, color }: { text: string; color: string }) {
  return <View style={{ borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', backgroundColor: color + '22', borderWidth: 1, borderColor: color }}><Text style={{ fontFamily: fonts.bodyMedium, fontSize: 9, letterSpacing: 1, color, textTransform: 'uppercase' }}>{text}</Text></View>;
}

function SimplePicker({ label, value, options, onSelect, testId }: any) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={pk.label}>{label}</Text>
      <TouchableOpacity style={pk.input} onPress={() => setOpen(!open)} activeOpacity={0.7}>
        <Text style={[pk.text, !value && { color: colors.textTertiary }]}>{value || 'Seleziona...'}</Text>
        <ChevronDown size={14} color={colors.textSecondary} />
      </TouchableOpacity>
      {open && <View style={pk.dd}><ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>{options.map((o: string) => <TouchableOpacity key={o} style={pk.opt} onPress={() => { onSelect(o); setOpen(false); }} activeOpacity={0.7}><Text style={[pk.text, o === value && { color: colors.accent }]}>{o}</Text></TouchableOpacity>)}</ScrollView></View>}
    </View>
  );
}
const pk = StyleSheet.create({ label: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textSecondary, letterSpacing: 1.5, marginBottom: 6 }, input: { backgroundColor: colors.elevated, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, text: { fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary }, dd: { backgroundColor: colors.elevated, borderRadius: radius.md, marginTop: 4 }, opt: { paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border } });

export default function ClientsScreen() {
  const { data, addClient } = useData();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterSector, setFilterSector] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    let list = data.clients;
    if (search) { const q = search.toLowerCase(); list = list.filter((c) => c.company_name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q)); }
    if (filterStatus.length) list = list.filter((c) => filterStatus.includes(c.status));
    if (filterSector.length) list = list.filter((c) => filterSector.includes(c.sector));
    if (filterPriority.length) list = list.filter((c) => filterPriority.includes(c.priority));
    return list;
  }, [data.clients, search, filterStatus, filterSector, filterPriority]);

  const toggle = (arr: string[], setArr: any, val: string) => setArr((p: string[]) => p.includes(val) ? p.filter((v: string) => v !== val) : [...p, val]);
  const activeFilters = filterStatus.length + filterSector.length + filterPriority.length;
  const getLastInt = (c: Client) => c.interactions.length ? [...c.interactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const getNextAct = (c: Client) => { const w = c.interactions.filter((i) => i.next_action_date); return w.length ? w.sort((a, b) => new Date(a.next_action_date!).getTime() - new Date(b.next_action_date!).getTime())[0] : null; };

  const renderCard = ({ item: c }: { item: Client }) => {
    const last = getLastInt(c); const next = getNextAct(c);
    return (
      <TouchableOpacity style={s.card} onPress={() => router.push(`/client/${c.id}`)} activeOpacity={0.7}>
        <View style={s.cardHeader}><Text style={s.cardName} numberOfLines={1}>{c.company_name}</Text><Badge text={c.priority} color={priorityColors[c.priority] || colors.textTertiary} /></View>
        <Text style={s.cardMeta}>{c.city} · {c.sector}</Text>
        <View style={{ alignSelf: 'flex-start', marginVertical: 8 }}><Badge text={c.status} color={statusColors[c.status] || colors.textTertiary} /></View>
        {last && <Text style={s.cardLastInt}>{formatDate(last.date)} — {last.type}</Text>}
        {next?.next_action_date && <Text style={[s.cardNext, isPastDate(next.next_action_date) && { color: colors.statusRed }]} numberOfLines={1}>{next.next_action}</Text>}
        <View style={s.cardFooter}>{c.website && <Globe size={14} color={colors.textTertiary} />}</View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View style={s.headerTop}><Text style={s.pageTitle}>Clienti</Text><Text style={s.counter}>{filtered.length}</Text></View>
        <View style={s.searchRow}>
          <View style={s.searchBox}><Search size={16} color={colors.textSecondary} /><TextInput style={s.searchInput} placeholder="Cerca clienti..." placeholderTextColor={colors.textTertiary} value={search} onChangeText={setSearch} />{search ? <TouchableOpacity onPress={() => setSearch('')}><X size={14} color={colors.textSecondary} /></TouchableOpacity> : null}</View>
          <TouchableOpacity style={[s.filterBtn, activeFilters > 0 && s.filterActive]} onPress={() => setShowFilters(!showFilters)} activeOpacity={0.7}><Filter size={16} color={activeFilters > 0 ? colors.textOnBright : colors.textSecondary} /></TouchableOpacity>
        </View>
        {showFilters && <ScrollView horizontal style={{ paddingVertical: 8 }} showsHorizontalScrollIndicator={false}>{[...CLIENT_STATUSES, ...SECTORS, ...PRIORITIES].map((v, i) => { const active = filterStatus.includes(v) || filterSector.includes(v) || filterPriority.includes(v); const handler = () => { if ((CLIENT_STATUSES as readonly string[]).includes(v)) toggle(filterStatus, setFilterStatus, v); else if ((SECTORS as readonly string[]).includes(v)) toggle(filterSector, setFilterSector, v); else toggle(filterPriority, setFilterPriority, v); }; return <TouchableOpacity key={v + i} style={[s.chip, active && s.chipActive]} onPress={handler} activeOpacity={0.7}><Text style={[s.chipText, active && s.chipTextActive]}>{v}</Text></TouchableOpacity>; })}</ScrollView>}
      </View>
      <FlatList data={filtered} keyExtractor={(i) => i.id} renderItem={renderCard} numColumns={2} columnWrapperStyle={{ gap: 10, paddingHorizontal: spacing.lg }} contentContainerStyle={{ paddingTop: 10, paddingBottom: 100, gap: 10 }} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.emptyW}><Text style={s.emptyT}>Nessun cliente trovato.</Text><Text style={s.emptyD}>Aggiungi il tuo primo prospect.</Text></View>} />
      <TouchableOpacity style={s.fab} onPress={() => setShowAddModal(true)} activeOpacity={0.7}><Plus size={24} color={colors.textOnBright} /></TouchableOpacity>
      <AddClientModal visible={showAddModal} onClose={() => setShowAddModal(false)} onSave={addClient} />
    </SafeAreaView>
  );
}

function AddClientModal({ visible, onClose, onSave }: any) {
  const [form, setForm] = useState({ company_name: '', sector: '', type: 'Azienda', city: '', website: '', instagram_url: '', priority: 'Media', revenue: '', has_vat: true, status: 'Da contattare', notes: '', concept_idea: '', tags: '' });
  const save = () => { if (!form.company_name.trim()) return; onSave({ company_name: form.company_name, sector: (form.sector || 'Altro') as any, type: form.type as any, city: form.city, website: form.website, instagram_url: form.instagram_url, priority: form.priority as any, revenue: form.revenue, has_vat: form.has_vat, status: form.status as any, notes: form.notes, concept_idea: form.concept_idea, tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()) : [] }); setForm({ company_name: '', sector: '', type: 'Azienda', city: '', website: '', instagram_url: '', priority: 'Media', revenue: '', has_vat: true, status: 'Da contattare', notes: '', concept_idea: '', tags: '' }); onClose(); };
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={ms.overlay}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={ms.modal}>
          <View style={ms.handle} /><View style={ms.mh}><Text style={ms.mt}>Nuovo Cliente</Text><TouchableOpacity onPress={onClose}><X size={20} color={colors.textSecondary} /></TouchableOpacity></View>
          <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
            <Text style={ms.label}>NOME AZIENDA *</Text><TextInput style={ms.input} value={form.company_name} onChangeText={(v) => setForm((p) => ({ ...p, company_name: v }))} placeholder="Es. Ferraro Conserve" placeholderTextColor={colors.textTertiary} />
            <SimplePicker label="SETTORE" value={form.sector} options={[...SECTORS]} onSelect={(v: string) => setForm((p) => ({ ...p, sector: v }))} />
            <Text style={ms.label}>CITTÀ</Text><TextInput style={ms.input} value={form.city} onChangeText={(v) => setForm((p) => ({ ...p, city: v }))} placeholder="Es. Catania" placeholderTextColor={colors.textTertiary} />
            <SimplePicker label="PRIORITÀ" value={form.priority} options={[...PRIORITIES]} onSelect={(v: string) => setForm((p) => ({ ...p, priority: v }))} />
            <SimplePicker label="STATUS" value={form.status} options={[...CLIENT_STATUSES]} onSelect={(v: string) => setForm((p) => ({ ...p, status: v }))} />
            <Text style={ms.label}>NOTE</Text><TextInput style={[ms.input, { height: 80, textAlignVertical: 'top' }]} value={form.notes} onChangeText={(v) => setForm((p) => ({ ...p, notes: v }))} multiline placeholder="Note strategiche..." placeholderTextColor={colors.textTertiary} />
            <Text style={ms.label}>CONCEPT IDEA</Text><TextInput style={[ms.input, { height: 60, textAlignVertical: 'top' }]} value={form.concept_idea} onChangeText={(v) => setForm((p) => ({ ...p, concept_idea: v }))} multiline placeholder="Idea creativa da proporre..." placeholderTextColor={colors.textTertiary} />
          </ScrollView>
          <TouchableOpacity style={ms.saveBtn} onPress={save} activeOpacity={0.7}><Text style={ms.saveBtnText}>AGGIUNGI CLIENTE</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView></View>
    </Modal>
  );
}

const ms = StyleSheet.create({ overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }, modal: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '90%' }, handle: { width: 40, height: 4, backgroundColor: colors.textTertiary, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }, mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }, mt: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.textPrimary }, label: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textSecondary, letterSpacing: 1.5, marginBottom: 6 }, input: { backgroundColor: colors.elevated, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary, marginBottom: 16 }, saveBtn: { backgroundColor: colors.accent, borderRadius: radius.lg, paddingVertical: 16, alignItems: 'center', marginTop: 8 }, saveBtnText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.textOnBright, letterSpacing: 1.5 } });
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 8 }, headerTop: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 12 }, pageTitle: { fontFamily: fonts.displayBold, fontSize: 30, color: colors.textPrimary }, counter: { fontFamily: fonts.mono, fontSize: 14, color: colors.accent }, searchRow: { flexDirection: 'row', gap: 8, marginBottom: 4 }, searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: 14, gap: 8 }, searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary, paddingVertical: 12 }, filterBtn: { width: 48, height: 48, backgroundColor: colors.surface, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' }, filterActive: { backgroundColor: colors.accent }, chip: { backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7, marginRight: 6 }, chipActive: { backgroundColor: colors.accentMuted }, chipText: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textSecondary }, chipTextActive: { color: colors.accent }, card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, maxWidth: (screenW - spacing.lg * 2 - 10) / 2 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 4 }, cardName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.textPrimary, flex: 1 }, cardMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, marginBottom: 4 }, cardLastInt: { fontFamily: fonts.mono, fontSize: 10, color: colors.textTertiary, marginBottom: 4 }, cardNext: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.accent, marginBottom: 6 }, cardFooter: { flexDirection: 'row', gap: 12, marginTop: 'auto', paddingTop: 8 }, emptyW: { padding: spacing.xl, alignItems: 'center' }, emptyT: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.textPrimary, marginBottom: 4 }, emptyD: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, textAlign: 'center' }, fab: { position: 'absolute', bottom: 24, right: spacing.lg, width: 56, height: 56, backgroundColor: colors.accent, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' } });
