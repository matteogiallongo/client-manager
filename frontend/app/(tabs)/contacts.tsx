import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, X, Mail, Phone, ChevronRight } from 'lucide-react-native';
import { useData } from '../../src/context/DataContext';
import { colors, fonts, spacing, radius } from '../../src/theme';
import { getInitials, hashColor } from '../../src/utils';
import { Contact } from '../../src/types';

interface ContactWithCompany extends Contact { company_name: string; company_id: string; }

export default function ContactsScreen() {
  const { data } = useData();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const allContacts = useMemo(() => {
    const contacts: ContactWithCompany[] = [];
    data.clients.forEach((c) => { c.contacts.forEach((ct) => { contacts.push({ ...ct, company_name: c.company_name, company_id: c.id }); }); });
    let result = contacts.sort((a, b) => a.name.localeCompare(b.name));
    if (search) { const q = search.toLowerCase(); result = result.filter((ct) => ct.name.toLowerCase().includes(q) || ct.role.toLowerCase().includes(q) || ct.email.toLowerCase().includes(q) || ct.company_name.toLowerCase().includes(q)); }
    return result;
  }, [data.clients, search]);

  const renderContact = ({ item: ct }: { item: ContactWithCompany }) => (
    <TouchableOpacity style={s.card} activeOpacity={0.7} onPress={() => router.push(`/contact/${ct.id}`)}>
      <View style={[s.avatar, { backgroundColor: hashColor(ct.name) }]}><Text style={s.avatarText}>{getInitials(ct.name)}</Text></View>
      <View style={s.info}>
        <View style={s.nameRow}>
          <Text style={s.name}>{ct.name}</Text>
          {ct.is_primary && <View style={s.primaryBadge}><Text style={s.primaryText}>PRIMARY</Text></View>}
        </View>
        <Text style={s.role}>{ct.role}</Text>
        <Text style={s.company}>{ct.company_name}</Text>
        <TouchableOpacity onPress={(e) => { e.stopPropagation(); Linking.openURL(`mailto:${ct.email}`); }} activeOpacity={0.7} style={s.emailRow}>
          <Mail size={11} color={colors.textTertiary} />
          <Text style={s.email} numberOfLines={1}>{ct.email}</Text>
        </TouchableOpacity>
      </View>
      <ChevronRight size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.pageTitle}>Contatti</Text>
        <Text style={s.subtitle}>{allContacts.length} persone</Text>
        <View style={s.searchBox}><Search size={16} color={colors.textSecondary} /><TextInput style={s.searchInput} placeholder="Cerca per nome, ruolo, email..." placeholderTextColor={colors.textTertiary} value={search} onChangeText={setSearch} />{search ? <TouchableOpacity onPress={() => setSearch('')}><X size={14} color={colors.textSecondary} /></TouchableOpacity> : null}</View>
      </View>
      <FlatList data={allContacts} keyExtractor={(item) => item.id} renderItem={renderContact} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: 100 }} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.emptyWrap}><Text style={s.emptyTitle}>Nessun contatto trovato.</Text><Text style={s.emptyDesc}>I contatti appariranno quando li aggiungi ai clienti.</Text></View>} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 12 }, pageTitle: { fontFamily: fonts.displayBold, fontSize: 30, color: colors.textPrimary }, subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginBottom: 12 }, searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: 14, gap: 8 }, searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary, paddingVertical: 12 }, card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 8, gap: 14 }, avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' }, avatarText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.textPrimary }, info: { flex: 1 }, nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }, name: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.textPrimary }, primaryBadge: { backgroundColor: colors.accentMuted, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 }, primaryText: { fontFamily: fonts.bodyMedium, fontSize: 8, color: colors.accent, letterSpacing: 1 }, role: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginBottom: 1 }, company: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.accent, marginBottom: 4 }, emailRow: { flexDirection: 'row', alignItems: 'center', gap: 5 }, email: { fontFamily: fonts.mono, fontSize: 10, color: colors.textTertiary }, emptyWrap: { padding: spacing.xl, alignItems: 'center' }, emptyTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.textPrimary, marginBottom: 4 }, emptyDesc: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, textAlign: 'center' } });
