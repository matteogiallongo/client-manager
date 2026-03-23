import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { useData } from '../../src/context/DataContext';
import { colors, fonts, spacing, radius, statusColors } from '../../src/theme';
import { formatDate, isPastDate, isTodayDate, isWithinDays } from '../../src/utils';

export default function Dashboard() {
  const { data } = useData();
  const router = useRouter();
  const clients = data.clients;

  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === 'Cliente attivo').length;
    const proposals = clients.filter((c) => c.status === 'Proposta inviata').length;
    let overdue = 0;
    clients.forEach((c) => c.interactions.forEach((i) => { if (i.next_action_date && isPastDate(i.next_action_date)) overdue++; }));
    return { total, active, overdue, proposals };
  }, [clients]);

  const todayActions = useMemo(() => {
    const actions: any[] = [];
    clients.forEach((c) => c.interactions.forEach((i) => {
      if (i.next_action_date && (isTodayDate(i.next_action_date) || isPastDate(i.next_action_date)))
        actions.push({ clientId: c.id, clientName: c.company_name, action: i.next_action || i.subject, date: i.next_action_date });
    }));
    return actions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [clients]);

  const weekActions = useMemo(() => {
    const actions: any[] = [];
    clients.forEach((c) => c.interactions.forEach((i) => {
      if (i.next_action_date && isWithinDays(i.next_action_date, 7) && !isTodayDate(i.next_action_date) && !isPastDate(i.next_action_date))
        actions.push({ clientId: c.id, clientName: c.company_name, action: i.next_action || i.subject, date: i.next_action_date });
    }));
    return actions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [clients]);

  const recentInteractions = useMemo(() => {
    const all: any[] = [];
    clients.forEach((c) => c.interactions.forEach((i) => all.push({ clientId: c.id, clientName: c.company_name, date: i.date, type: i.type, subject: i.subject })));
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [clients]);

  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach((c) => { map[c.status] = (map[c.status] || 0) + 1; });
    return Object.entries(map).map(([label, value]) => ({ label, value, color: statusColors[label] || colors.textTertiary }));
  }, [clients]);

  const sectorData = useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach((c) => { map[c.sector] = (map[c.sector] || 0) + 1; });
    return Object.entries(map).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [clients]);
  const maxSector = Math.max(...sectorData.map((s) => s.value), 1);

  const DonutChart = () => {
    const size = 120; const sw = 14; const r = (size - sw) / 2; const circ = 2 * Math.PI * r;
    const total = statusData.reduce((s, d) => s + d.value, 0);
    if (total === 0) return null;
    let cum = 0;
    return (
      <Svg width={size} height={size}>
        {statusData.map((seg, i) => {
          const pct = seg.value / total; const dashArr = `${pct * circ} ${circ}`; const rot = cum * 360 - 90; cum += pct;
          return <SvgCircle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={seg.color} strokeWidth={sw} strokeDasharray={dashArr} transform={`rotate(${rot} ${size / 2} ${size / 2})`} />;
        })}
      </Svg>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.pageTitle}>Overview</Text>
        <Text style={s.pageSubtitle}>Freelance CRM</Text>

        <View style={s.heroCard}>
          <View style={s.heroRow}>
            {[{ n: stats.total, l: 'CLIENTI' }, { n: stats.active, l: 'ATTIVI' }, { n: stats.overdue, l: 'SCADUTI', red: stats.overdue > 0 }, { n: stats.proposals, l: 'PROPOSTE' }].map((item, i, arr) => (
              <React.Fragment key={item.l}>
                <View style={s.heroStat}>
                  <Text style={[s.heroNum, (item as any).red && { color: '#c62828' }]}>{item.n}</Text>
                  <Text style={s.heroLabel}>{item.l}</Text>
                </View>
                {i < arr.length - 1 && <View style={s.heroDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <Text style={s.sectionTitle}>DA FARE OGGI</Text>
        {todayActions.length === 0 ? (
          <View style={s.emptyCard}><Text style={s.emptyTitle}>Nessuna azione in scadenza.</Text><Text style={s.emptyDesc}>Ottimo — o cerca nuovi prospect.</Text></View>
        ) : todayActions.map((a, i) => (
          <TouchableOpacity key={i} style={s.actionCard} onPress={() => router.push(`/client/${a.clientId}`)} activeOpacity={0.7}>
            <View style={s.actionTop}>
              <Text style={[s.actionClient, isPastDate(a.date) && !isTodayDate(a.date) && { color: colors.statusRed }]}>{a.clientName}</Text>
              {isPastDate(a.date) && !isTodayDate(a.date) && <View style={s.overdueBadge}><Text style={s.overdueText}>SCADUTO</Text></View>}
            </View>
            <Text style={s.actionText} numberOfLines={1}>{a.action}</Text>
            <Text style={s.actionDate}>{formatDate(a.date)}</Text>
          </TouchableOpacity>
        ))}

        {weekActions.length > 0 && (<>
          <Text style={s.sectionTitle}>QUESTA SETTIMANA</Text>
          {weekActions.map((a, i) => (
            <TouchableOpacity key={i} style={s.actionCard} onPress={() => router.push(`/client/${a.clientId}`)} activeOpacity={0.7}>
              <Text style={s.actionClient}>{a.clientName}</Text>
              <Text style={s.actionText} numberOfLines={1}>{a.action}</Text>
              <Text style={s.actionDate}>{formatDate(a.date)}</Text>
            </TouchableOpacity>
          ))}
        </>)}

        <Text style={s.sectionTitle}>ULTIME INTERAZIONI</Text>
        {recentInteractions.map((r, i) => (
          <TouchableOpacity key={i} style={s.intRow} onPress={() => router.push(`/client/${r.clientId}`)} activeOpacity={0.7}>
            <Text style={s.intDate}>{formatDate(r.date)}</Text>
            <View style={s.intBadge}><Text style={s.intBadgeText}>{r.type}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.intClient} numberOfLines={1}>{r.clientName}</Text>
              <Text style={s.intSubject} numberOfLines={1}>{r.subject}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={s.sectionTitle}>STATUS</Text>
        <View style={s.chartRow}>
          <DonutChart />
          <View style={{ flex: 1 }}>
            {statusData.map((d, i) => (
              <View key={i} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: d.color }]} />
                <Text style={s.legendLabel} numberOfLines={1}>{d.label}</Text>
                <Text style={s.legendVal}>{d.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={s.sectionTitle}>PER SETTORE</Text>
        <View style={s.barsCard}>
          {sectorData.map((d, i) => (
            <View key={i} style={s.barRow}>
              <Text style={s.barLabel} numberOfLines={1}>{d.label}</Text>
              <View style={s.barTrack}><View style={[s.barFill, { width: `${(d.value / maxSector) * 100}%` as any }]} /></View>
              <Text style={s.barVal}>{d.value}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.lg },
  pageTitle: { fontFamily: fonts.displayBold, fontSize: 34, color: colors.textPrimary, marginBottom: 2 },
  pageSubtitle: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xl },
  heroCard: { backgroundColor: colors.accent, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.xl },
  heroRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  heroStat: { alignItems: 'center', flex: 1 },
  heroNum: { fontFamily: fonts.displayBold, fontSize: 30, color: colors.textOnBright },
  heroLabel: { fontFamily: fonts.bodyMedium, fontSize: 9, color: 'rgba(10,10,10,0.55)', letterSpacing: 1.5, marginTop: 2 },
  heroDivider: { width: 1, height: 32, backgroundColor: 'rgba(10,10,10,0.12)' },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.textSecondary, letterSpacing: 1.5, marginBottom: spacing.md, marginTop: spacing.lg },
  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  emptyTitle: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.textPrimary, marginBottom: 4 },
  emptyDesc: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  actionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: 8 },
  actionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  actionClient: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.accent },
  actionText: { fontFamily: fonts.body, fontSize: 13, color: colors.textPrimary, marginBottom: 4 },
  actionDate: { fontFamily: fonts.mono, fontSize: 11, color: colors.textSecondary },
  overdueBadge: { backgroundColor: 'rgba(255,92,92,0.15)', borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  overdueText: { fontFamily: fonts.mono, fontSize: 9, color: colors.statusRed, letterSpacing: 1 },
  intRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, marginBottom: 6 },
  intDate: { fontFamily: fonts.mono, fontSize: 10, color: colors.textSecondary, width: 68 },
  intBadge: { backgroundColor: colors.accentMuted, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  intBadgeText: { fontFamily: fonts.mono, fontSize: 9, color: colors.accent, letterSpacing: 0.5 },
  intClient: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textPrimary },
  intSubject: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  chartRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', gap: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, flex: 1 },
  legendVal: { fontFamily: fonts.mono, fontSize: 12, color: colors.textPrimary },
  barsCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  barLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, width: 70 },
  barTrack: { flex: 1, height: 20, backgroundColor: colors.elevated, borderRadius: radius.sm, overflow: 'hidden' },
  barFill: { height: 20, backgroundColor: colors.accent, borderRadius: radius.sm },
  barVal: { fontFamily: fonts.mono, fontSize: 12, color: colors.textPrimary, width: 20, textAlign: 'right' },
});
