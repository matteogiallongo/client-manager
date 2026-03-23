import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Users, User, CalendarClock, Settings } from 'lucide-react-native';
import { colors, fonts } from '../../src/theme';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: 'rgba(255,255,255,0.06)', borderTopWidth: 1, height: Platform.OS === 'ios' ? 88 : 68, paddingBottom: Platform.OS === 'ios' ? 28 : 8, paddingTop: 8 },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textTertiary,
      tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 9, letterSpacing: 1.2, marginTop: 2, textTransform: 'uppercase' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: ({ color, size }) => <LayoutDashboard size={size - 4} color={color} strokeWidth={1.5} /> }} />
      <Tabs.Screen name="clients" options={{ title: 'Clienti', tabBarIcon: ({ color, size }) => <Users size={size - 4} color={color} strokeWidth={1.5} /> }} />
      <Tabs.Screen name="contacts" options={{ title: 'Contatti', tabBarIcon: ({ color, size }) => <User size={size - 4} color={color} strokeWidth={1.5} /> }} />
      <Tabs.Screen name="followup" options={{ title: 'Follow-up', tabBarIcon: ({ color, size }) => <CalendarClock size={size - 4} color={color} strokeWidth={1.5} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Settings size={size - 4} color={color} strokeWidth={1.5} /> }} />
    </Tabs>
  );
}
