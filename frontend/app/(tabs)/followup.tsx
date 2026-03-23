import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AlertCircle, Clock, Calendar, ChevronRight } from 'lucide-react-native';
import { useData } from '../../src/context/DataContext';
import { colors, fonts, spacing, radius } from '../../src/theme';
import { formatDate, isPastDate, isTodayDate, isWithinDays } from '../../src/utils';

interface FUI { clientId: string; clientName: string; action: string; date: string; interactionId: string; contactName?: string; type: string; }

export default function FollowUpScreen() {
  const { data } = useData();
  const router = useRouter();

  const items = useMemo(() => {
    const all: FUI[] = [];
    data.clients.forEach((c) => c.interactions.forEach((i) => {
      if (i.next_action_date && i.next_action) {
        const contact = i.contact_id ? c.contacts.find((ct) => ct.id === i.contact_id) : null;
        all.push({ clientId: c.id, clientName: c.company_name, action: i.next_action, date: i.next_action_date, interactionId: i.id, contactName: contact?.name, type: i.type });
      }
    }));
    return all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data.clients]);

  const overdue = items.filter((i) => isPastDate(i.date) && !isTodayDate(i.date));
  const today = items.filter((i) => isTodayDate(i.date));
  const thisWeek = items.filter((i) => isWithinDays(i.date, 7) && !isTodayDate(i.date) && !isPastDate(i.date));
  const upcoming = items.filter((i) => !isPastDate(i.date) && !isTodayDate(i.date) && !isWithinDays(i.date, 7));

  const Item = ({ item, isOv }: { item: FUI; isOv?: boolean }) => (
    <TouchableOpacity style={[s.itemCard, isOv && s.itemOv]} onPress={() => router.push(`/client/${item.clientId}`)} activeOpacity={0.7}>
      <View style={s.itemTop}><Text style={s.itemDate}>{formatDate(item.date)}</Text><View style={[s.typeBadge, isOv && { backgroundColor: 'rgba(255,92,92,0.15)' }]}><Text style={[s.typeText, isOv && { color: colors.statusRed }]}>{item.type}</Text></View></View>
      <Text style={s.clientName}>{item.clientName}</Text>
      <Text style={s.actionText}>{item.action}</Text>
      {item.contactName && <Text style={s.contactText}>{item.contactName}</Text>}
      <View style={s.itemFoot}><ChevronRight size={14} color={colors.accent} /></View>
    </TouchableOpacity>
  );

  const Section = ({ title, icon, data: d, ov }: { title: string; icon: React.ReactNode; data: FUI[]; ov?: boolean }) => {
    if (!d.length) return null;
    return (
      <View style={{ marginBottom: spacing.xl }}>
        <View style={s.secHead}>{icon}<Text style={[s.secTitle, ov && { color: colors.statusRed }]}>{title}</Text><View style={[s.secCount, ov && { backgroundColor: 'rgba(255,92,92,0.15)' }]}><Text style={[s.secCountText, ov && { color: colors.statusRed }]}>{d.length}</Text></View></View>
        {d.map((i) => <Item key={i.interactionId} item={i} isOv={ov} />)}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}><Text style={s.pageTitle}>Follow-up</Text>{overdue.length > 0 && <View style={s.ovBadge}><Text style={s.ovText}>{overdue.length} SCADUT{overdue.length === 1 ? 'O' : 'I'}</Text></View>}</View>
        {items.length === 0 ? <View style={s.emptyW}><Text style={s.emptyT}>Nessun follow-up pianificato.</Text><Text style={s.emptyD}>Aggiungi interazioni con azioni future per vederle qui.</Text></View> : (<>
          <Section title="SCADUTI" icon={<AlertCircle size={16} color={colors.statusRed} />} data={overdue} ov />
          <Section title="OGGI" icon={<Clock size={16} color={colors.accent} />} data={today} />
          <Section title="QUESTA SETTIMANA" icon={<Calendar size={16} color={colors.statusBlue} />} data={thisWeek} />
          <Section title="PROSSIMAMENTE" icon={<Calendar size={16} color={colors.textSecondary} />} data={upcoming} />
        </>)}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, scroll: { flex: 1 }, content: { padding: spacing.lg }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.xl }, pageTitle: { fontFamily: fonts.displayBold, fontSize: 30, color: colors.textPrimary }, ovBadge: { backgroundColor: 'rgba(255,92,92,0.15)', borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 4 }, ovText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.statusRed, letterSpacing: 1 }, secHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md }, secTitle: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.textSecondary, letterSpacing: 1.5, flex: 1 }, secCount: { backgroundColor: colors.accentMuted, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 }, secCountText: { fontFamily: fonts.mono, fontSize: 11, color: colors.accent }, itemCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: 8 }, itemOv: { backgroundColor: 'rgba(255,92,92,0.04)' }, itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }, itemDate: { fontFamily: fonts.mono, fontSize: 11, color: colors.textSecondary }, typeBadge: { backgroundColor: colors.accentMuted, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 }, typeText: { fontFamily: fonts.bodyMedium, fontSize: 9, color: colors.accent, letterSpacing: 0.5 }, clientName: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.accent, marginBottom: 4 }, actionText: { fontFamily: fonts.body, fontSize: 13, color: colors.textPrimary, marginBottom: 4 }, contactText: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary }, itemFoot: { alignItems: 'flex-end', marginTop: 4 }, emptyW: { padding: spacing.xl, alignItems: 'center' }, emptyT: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.textPrimary, marginBottom: 4 }, emptyD: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, textAlign: 'center' } });
