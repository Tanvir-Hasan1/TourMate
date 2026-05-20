import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, useColorScheme } from 'react-native';
import { Colors } from '../src/constants/Colors';
import { Info, Shield, User, ExternalLink } from 'lucide-react-native';
import Constants from 'expo-constants';

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const handleOpenPortfolio = () => {
    // Redirect to developer portfolio
    Linking.openURL('https://protfolio-eight-ruddy.vercel.app/').catch(() => {
      // Fallback if the above fails
      Linking.openURL('https://github.com/Tanvir-Hasan1');
    });
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Info size={40} color={colors.primary} />
        </View>
        <Text style={[styles.appName, { color: colors.text }]}>TourMate</Text>
        <Text style={[styles.appVersion, { color: colors.subtext }]}>Version {appVersion}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.description, { color: colors.text }]}>
            TourMate is your ultimate companion for organizing trips, tracking expenses, and managing trip members all in one place. Plan your adventures effortlessly and keep everyone in the loop!
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Developer</Text>
        <TouchableOpacity 
          style={[styles.card, styles.row, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={handleOpenPortfolio}
        >
          <View style={styles.rowLeft}>
            <User size={24} color={colors.primary} />
            <Text style={[styles.rowText, { color: colors.text }]}>Tanvir Hasan</Text>
          </View>
          <ExternalLink size={20} color={colors.subtext} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy Policy</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.rowLeft, { marginBottom: 12 }]}>
            <Shield size={24} color={colors.primary} />
            <Text style={[styles.rowText, { color: colors.text, fontWeight: 'bold' }]}>Data Privacy</Text>
          </View>
          <Text style={[styles.privacyText, { color: colors.subtext }]}>
            We respect your privacy. TourMate stores your data locally on your device. We do not collect, share, or sell any of your personal information, trip data, or expenses to third parties. All of your trip details and member information remain strictly on your phone.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
  },
  section: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 16,
    marginLeft: 12,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
