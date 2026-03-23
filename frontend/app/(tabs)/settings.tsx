import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Share, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, Upload, RefreshCw, X, AlertTriangle, Shield } from 'lucide-react-native';
import { useData } from '../../src/context/DataContext';
import { colors, fonts, spacing, radius } from '../../src/theme';

export default function SettingsScreen() {
  const { data, exportDataJSON, importDataJSON, resetToDemo, showToast } = useData();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = async () => { try { const json = await exportDataJSON(); await Share.share({ message: json, title: 'Client Manager Backup' }); } catch { showToast('Errore durante l\'esportazione'); } };
  const handleImport = async () => { if (!importText.trim()) return; const ok = await importDataJSON(importText); if (ok) { setImportText(''); setShowImportModal(false); } else { showToast('Formato JSON non valido'); } };
  const handleReset = () => { resetToDemo(); setShowResetConfirm(false); };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.pageTitle}>Impostazioni</Text>
        <Text style={s.sub}>Gestione dati e preferenze</Text>

        <Text style={s.secTitle}>DATI</Text>
        <View style={s.infoCard}><Text style={s.infoLabel}>CLIENTI SALVATI</Text><Text style={s.infoVal}>{data.clients.length}</Text></View>

        <TouchableOpacity style={s.actCard} onPress={handleExport} activeOpacity={0.7}>
          <View style={s.actIcon}><Download size={20} color={colors.accent} strokeWidth={1.5} /></View>
          <View style={s.actContent}><Text style={s.actTitle}>Esporta Backup</Text><Text style={s.actDesc}>Esporta tutti i dati in formato JSON</Text></View>
        </TouchableOpacity>
        <TouchableOpacity style={s.actCard} onPress={() => setShowImportModal(true)} activeOpacity={0.7}>
          <View style={s.actIcon}><Upload size={20} color={colors.accent} strokeWidth={1.5} /></View>
          <View style={s.actContent}><Text style={s.actTitle}>Importa Backup</Text><Text style={s.actDesc}>Ripristina i dati da un backup JSON</Text></View>
        </TouchableOpacity>

        <Text style={[s.secTitle, { marginTop: spacing.xl }]}>ZONA PERICOLOSA</Text>
        <TouchableOpacity style={[s.actCard, { backgroundColor: 'rgba(255,92,92,0.05)' }]} onPress={() => setShowResetConfirm(true)} activeOpacity={0.7}>
          <View style={[s.actIcon, { backgroundColor: 'rgba(255,92,92,0.12)' }]}><RefreshCw size={20} color={colors.statusRed} strokeWidth={1.5} /></View>
          <View style={s.actContent}><Text style={[s.actTitle, { color: colors.statusRed }]}>Ripristina Dati Demo</Text><Text style={s.actDesc}>Cancella tutto e ripristina i dati demo</Text></View>
        </TouchableOpacity>

        <Text style={[s.secTitle, { marginTop: spacing.xl }]}>PRIVACY</Text>
        <View style={s.actCard}>
          <View style={[s.actIcon, { backgroundColor: 'rgba(74,223,111,0.1)' }]}><Shield size={20} color={colors.statusGreen} strokeWidth={1.5} /></View>
          <View style={s.actContent}><Text style={s.actTitle}>Dati protetti</Text><Text style={s.actDesc}>Tutti i dati sono salvati localmente sul dispositivo. Nessun dato viene inviato a server esterni.</Text></View>
        </View>

        <View style={s.infoCard}><Text style={s.infoLabel}>VERSIONE</Text><Text style={s.infoVal}>1.0.0</Text></View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showImportModal} animationType="slide" transparent>
        <View style={ms.ov}><View style={ms.m}>
          <View style={ms.handle} /><View style={ms.mh}><Text style={ms.mt}>Importa Dati</Text><TouchableOpacity onPress={() => setShowImportModal(false)}><X size={20} color={colors.textSecondary} /></TouchableOpacity></View>
          <Text style={ms.desc}>Incolla il JSON di backup. Sostituirà tutti i dati attuali.</Text>
          <TextInput style={ms.ta} value={importText} onChangeText={setImportText} placeholder='{"clients": [...]}' placeholderTextColor={colors.textTertiary} multiline />
          <TouchableOpacity style={ms.btn} onPress={handleImport} activeOpacity={0.7}><Text style={ms.btnText}>IMPORTA</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal visible={showResetConfirm} animationType="fade" transparent>
        <View style={ms.ov}><View style={[ms.m, { alignItems: 'center', paddingVertical: spacing.xl }]}>
          <AlertTriangle size={40} color={colors.statusRed} strokeWidth={1.5} />
          <Text style={[ms.mt, { textAlign: 'center', marginTop: 16 }]}>Sei sicuro?</Text>
          <Text style={[ms.desc, { textAlign: 'center' }]}>Questa azione cancellerà tutti i dati e ripristinerà i demo.</Text>
          <View style={ms.btnRow}>
            <TouchableOpacity style={ms.cancelBtn} onPress={() => setShowResetConfirm(false)} activeOpacity={0.7}><Text style={ms.cancelText}>ANNULLA</Text></TouchableOpacity>
            <TouchableOpacity style={ms.dangerBtn} onPress={handleReset} activeOpacity={0.7}><Text style={ms.dangerText}>RIPRISTINA</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const ms = StyleSheet.create({ ov: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.lg }, m: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg }, handle: { width: 40, height: 4, backgroundColor: colors.textTertiary, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }, mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }, mt: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.textPrimary }, desc: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md }, ta: { backgroundColor: colors.elevated, borderRadius: radius.md, padding: 14, fontFamily: fonts.mono, fontSize: 12, color: colors.textPrimary, height: 180, textAlignVertical: 'top', marginBottom: spacing.md }, btn: { backgroundColor: colors.accent, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center' }, btnText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.textOnBright, letterSpacing: 1.5 }, btnRow: { flexDirection: 'row', gap: 12, marginTop: spacing.lg, width: '100%' }, cancelBtn: { flex: 1, backgroundColor: colors.elevated, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' }, cancelText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary, letterSpacing: 1 }, dangerBtn: { flex: 1, backgroundColor: 'rgba(255,92,92,0.15)', borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.statusRed }, dangerText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.statusRed, letterSpacing: 1 } });
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, scroll: { flex: 1 }, content: { padding: spacing.lg }, pageTitle: { fontFamily: fonts.displayBold, fontSize: 30, color: colors.textPrimary }, sub: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xl }, secTitle: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.textSecondary, letterSpacing: 1.5, marginBottom: spacing.md }, infoCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, infoLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textSecondary, letterSpacing: 1.5 }, infoVal: { fontFamily: fonts.mono, fontSize: 14, color: colors.textPrimary }, actCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 16 }, actIcon: { width: 46, height: 46, backgroundColor: colors.accentDim, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' }, actContent: { flex: 1 }, actTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.textPrimary, marginBottom: 2 }, actDesc: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, lineHeight: 18 } });
