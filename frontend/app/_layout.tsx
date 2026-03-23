import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import * as SplashScreen from 'expo-splash-screen';
import { DataProvider, useData } from '../src/context/DataContext';
import { colors, fonts, radius } from '../src/theme';

SplashScreen.preventAutoHideAsync();

function ToastOverlay() {
  const { toastMessage } = useData();
  if (!toastMessage) return null;
  return (
    <View style={ts.container}>
      <View style={ts.toast}><Text style={ts.text}>{toastMessage}</Text></View>
    </View>
  );
}

const ts = StyleSheet.create({
  container: { position: 'absolute', bottom: 110, left: 0, right: 0, alignItems: 'center', zIndex: 100, pointerEvents: 'none' } as any,
  toast: { backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: 24, paddingVertical: 10 },
  text: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textOnBright, letterSpacing: 0.3 },
});

function InnerLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="client/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="contact/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <ToastOverlay />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, JetBrainsMono_400Regular });
  useEffect(() => { if (fontsLoaded || fontError) SplashScreen.hideAsync(); }, [fontsLoaded, fontError]);
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={colors.accent} size="large" /></View>;
  return <DataProvider><InnerLayout /></DataProvider>;
}
