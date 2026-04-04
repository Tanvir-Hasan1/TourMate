import React from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useTripStore } from '../../src/store/useTripStore';
import { Colors, CategoryColors } from '../../src/constants/Colors';
import { calculateSettlements, getTotalSpent, getMemberBalance } from '../../src/utils/settlement';
import { Wallet, Users, ArrowRight, CreditCard, PieChart, Download, Share2, FileText } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { exportTripToCSV, exportTripSummary, exportTripToPDF } from '../../src/utils/export';
import { useRouter } from 'expo-router';
import { Edit2 } from 'lucide-react-native';
const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { getActiveTrip } = useTripStore();
  const trip = getActiveTrip();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!trip) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.subtext }}>Please select or create a trip first.</Text>
      </View>
    );
  }

  const totalSpent = getTotalSpent(trip);
  const settlements = calculateSettlements(trip);
  
  const categoryTotals = trip.expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>{trip.name} Dashboard</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>{trip.destination}</Text>
          </View>
          <TouchableOpacity 
            style={[{ padding: 8, borderRadius: 8, borderWidth: 1, backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/trip/edit')}
          >
            <Edit2 size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Animated.View entering={FadeInDown.delay(100)} style={[styles.statCard, { backgroundColor: colors.primary }]}>
          <Wallet color="white" size={24} />
          <Text style={styles.statLabel}>Total Spent</Text>
          <Text style={styles.statValue}>৳{totalSpent.toLocaleString()}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={[styles.statCard, { backgroundColor: colors.secondary }]}>
          <Users color="white" size={24} />
          <Text style={styles.statLabel}>Members</Text>
          <Text style={styles.statValue}>{trip.members.length}</Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Member Balances</Text>
        {trip.members.map((member) => {
          const balance = getMemberBalance(trip, member.id);
          const isPositive = balance >= 0;
          return (
            <View key={member.id} style={[styles.memberRow, { borderBottomColor: colors.border }]}>
              {member.profilePicture ? (
                <Image source={{ uri: member.profilePicture }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: member.avatarColor }]}>
                  <Text style={styles.avatarText}>{member.name[0].toUpperCase()}</Text>
                </View>
              )}
              <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
              <Text style={[styles.memberBalance, { color: isPositive ? colors.success : colors.danger }]}>
                {isPositive ? '+' : ''}৳{balance.toLocaleString()}
              </Text>
            </View>
          );
        })}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settlements</Text>
        {settlements.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.subtext }]}>All settled up! No transactions needed.</Text>
        ) : (
          settlements.map((s, idx) => (
            <View key={idx} style={[styles.settlementCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.settlementHeader}>
                <Text style={[styles.settlementName, { color: colors.text }]}>{s.fromName}</Text>
                <ArrowRight size={16} color={colors.primary} style={styles.arrow} />
                <Text style={[styles.settlementName, { color: colors.text }]}>{s.toName}</Text>
              </View>
              <Text style={[styles.settlementAmount, { color: colors.primary }]}>৳{s.amount.toLocaleString()}</Text>
            </View>
          ))
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending by Category</Text>
        <View style={styles.chartContainer}>
          {Object.entries(categoryTotals).map(([cat, amount], idx) => (
            <View key={cat} style={styles.categoryBarRow}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryColor, { backgroundColor: CategoryColors[cat] }]} />
                <Text style={[styles.categoryName, { color: colors.text }]}>{cat}</Text>
                <Text style={[styles.categoryAmount, { color: colors.subtext }]}>৳{amount.toLocaleString()}</Text>
              </View>
              <View style={styles.barBackground}>
                <Animated.View 
                  entering={FadeIn.delay(600 + idx * 50)} 
                  style={[
                    styles.barFill, 
                    { 
                      backgroundColor: CategoryColors[cat], 
                      width: `${(amount / totalSpent) * 100}%` 
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Export & Share</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <TouchableOpacity 
            style={[styles.exportButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => exportTripToCSV(trip)}
          >
            <Download size={20} color={colors.primary} />
            <Text style={[styles.exportButtonText, { color: colors.text }]}>Export CSV</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.exportButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => exportTripToPDF(trip)}
          >
            <FileText size={20} color={colors.danger} />
            <Text style={[styles.exportButtonText, { color: colors.text }]}>Export PDF</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.exportButton, { backgroundColor: colors.card, borderColor: colors.border, width: '100%' }]}
          onPress={() => exportTripSummary(trip)}
        >
          <Share2 size={20} color={colors.secondary} />
          <Text style={[styles.exportButtonText, { color: colors.text }]}>Share Text Summary</Text>
        </TouchableOpacity>
      </Animated.View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 12,
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  memberName: {
    flex: 1,
    fontSize: 16,
  },
  memberBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
  settlementCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  settlementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settlementName: {
    fontSize: 14,
    fontWeight: '500',
  },
  arrow: {
    marginHorizontal: 8,
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  chartContainer: {
    marginTop: 8,
  },
  categoryBarRow: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  barBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    width: (width - 64) / 2,
  },
  exportButtonText: {
    marginLeft: 8,
    fontWeight: '600',
  },
});
