import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import {
  Bell,
  Calendar,
  Star,
  ShieldCheck,
  Building,
  CheckCheck,
  Inbox,
  AlertCircle,
  Timer,
  Camera,
  TrendingUp,
  XCircle,
  CheckCircle2,
} from 'lucide-react-native';
import { Theme } from '../constants/dashboardTheme';
import { useApp, Notification } from '../context/AppContext';
import { Card } from '../components/DashboardComponents';

type FilterType =
  | 'all'
  | 'appointments'
  | 'reviews'
  | 'verification'
  | 'propertyUpdates'
  | 'expiry'
  | 'verificationEvents'
  | 'trustScore';

const EXPIRY_TYPES: Notification['type'][] = ['expiryWarning7', 'expiryWarning3', 'expired'];
const VERIFICATION_EVENT_TYPES: Notification['type'][] = [
  'verificationRequired',
  'verificationSuccess',
  'verificationFailed',
  'verification',
];
const TRUST_SCORE_TYPES: Notification['type'][] = ['trustScoreChange'];

export const NotificationsScreen: React.FC = () => {
  const { notifications, markAllNotificationsRead } = useApp();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'expiry') return EXPIRY_TYPES.includes(n.type);
    if (activeFilter === 'verificationEvents') return VERIFICATION_EVENT_TYPES.includes(n.type);
    if (activeFilter === 'trustScore') return TRUST_SCORE_TYPES.includes(n.type);
    return n.type === activeFilter;
  });

  const getNotificationMeta = (type: Notification['type']) => {
    switch (type) {
      case 'appointments':
        return { icon: Calendar, color: Theme.colors.primary, bg: Theme.colors.lightBlue, border: Theme.colors.primary };
      case 'reviews':
        return { icon: Star, color: Theme.colors.warning, bg: Theme.colors.lightWarning, border: Theme.colors.warning };
      case 'verification':
      case 'verificationRequired':
        return { icon: Camera, color: Theme.colors.primary, bg: Theme.colors.lightBlue, border: Theme.colors.primary };
      case 'verificationSuccess':
        return { icon: CheckCircle2, color: Theme.colors.success, bg: Theme.colors.lightSuccess, border: Theme.colors.success };
      case 'verificationFailed':
        return { icon: XCircle, color: Theme.colors.danger, bg: Theme.colors.lightDanger, border: Theme.colors.danger };
      case 'expiryWarning7':
      case 'expiryWarning3':
        return { icon: Timer, color: Theme.colors.warning, bg: Theme.colors.lightWarning, border: Theme.colors.warning };
      case 'expired':
        return { icon: AlertCircle, color: Theme.colors.danger, bg: Theme.colors.lightDanger, border: Theme.colors.danger };
      case 'trustScoreChange':
        return { icon: TrendingUp, color: '#0284C7', bg: '#F0F9FF', border: '#0284C7' };
      case 'propertyUpdates':
        return { icon: Building, color: '#0284C7', bg: '#F0F9FF', border: '#0284C7' };
      case 'all':
      default:
        return { icon: Bell, color: Theme.colors.textSecondary, bg: '#F1F5F9', border: Theme.colors.border };
    }
  };

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All Events' },
    { key: 'expiry', label: 'Expiry' },
    { key: 'verificationEvents', label: 'Verification' },
    { key: 'trustScore', label: 'Trust Score' },
    { key: 'appointments', label: 'Bookings' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'propertyUpdates', label: 'Properties' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Notification Center</Text>
        <TouchableOpacity style={styles.markReadBtn} onPress={markAllNotificationsRead} activeOpacity={0.7}>
          <CheckCheck color={Theme.colors.primary} size={16} style={{ marginRight: 6 }} />
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filterOptions.map((filter) => {
            const isSelected = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>{filter.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {filteredNotifications.length === 0 ? (
          <Card style={styles.emptyCard} className="card-tint-statistics">
            <Inbox color={Theme.colors.textMuted} size={48} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>Inbox Empty</Text>
            <Text style={styles.emptyText}>
              No notifications under &quot;{filterOptions.find((f) => f.key === activeFilter)?.label ?? 'All'}&quot;.
            </Text>
          </Card>
        ) : (
          <View style={styles.gridContainer}>
            {filteredNotifications.map((item) => {
              const meta = getNotificationMeta(item.type);
              const Icon = meta.icon;
              return (
                <Card
                  key={item.id}
                  style={[
                    styles.notifCard,
                    !item.read && styles.notifCardUnread,
                    { borderLeftColor: meta.border },
                  ]}
                  className={item.read ? "card-tint-statistics" : "card-tint-verification"}
                >
                  <View style={styles.cardInner}>
                    <View style={[styles.iconContainer, { backgroundColor: meta.bg }]}>
                      <Icon color={meta.color} size={18} />
                    </View>

                    <View style={styles.contentCol}>
                      <View style={styles.titleRow}>
                        <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>{item.title}</Text>
                        <Text style={styles.timestamp}>{item.time}</Text>
                      </View>
                      <Text style={styles.description}>{item.description}</Text>
                      <View style={[styles.typePill, { backgroundColor: meta.bg }]}>
                        <Text style={[styles.typePillText, { color: meta.color }]}>
                          {item.type.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                        </Text>
                      </View>
                    </View>

                    {!item.read && <View style={[styles.unreadIndicator, { backgroundColor: meta.color }]} />}
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontFamily: Theme.typography.sans,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  markReadBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  markReadText: { fontFamily: Theme.typography.sans, fontSize: 13, fontWeight: '700', color: Theme.colors.primary },
  filterContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.20)',
    paddingBottom: Theme.spacing.md,
  },
  filterScroll: { flexDirection: 'row' },
  filterScrollContent: { gap: Theme.spacing.sm, paddingHorizontal: Theme.spacing.lg },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  filterPillActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  filterPillText: { fontFamily: Theme.typography.sans, fontSize: 12, fontWeight: '600', color: Theme.colors.textSecondary },
  filterPillTextActive: { color: '#FFFFFF' },
  listContent: { padding: Theme.spacing.lg },
  emptyCard: { padding: Theme.spacing.xxxl, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: Theme.typography.sans, fontSize: 16, fontWeight: '700', color: Theme.colors.textPrimary, marginBottom: 6 },
  emptyText: { fontFamily: Theme.typography.sans, fontSize: 13, color: Theme.colors.textSecondary, textAlign: 'center', lineHeight: 18, maxWidth: 240 },
  gridContainer: { gap: Theme.spacing.sm },
  notifCard: { padding: Theme.spacing.md, borderLeftWidth: 4, marginBottom: 0 },
  notifCardUnread: { backgroundColor: 'rgba(37, 99, 235, 0.05)' },
  cardInner: { flexDirection: 'row', alignItems: 'flex-start' },
  iconContainer: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: Theme.spacing.md },
  contentCol: { flex: 1, paddingRight: 8 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  notifTitle: { fontFamily: Theme.typography.sans, fontSize: 13, fontWeight: '600', color: Theme.colors.textSecondary, flex: 1, paddingRight: Theme.spacing.sm },
  notifTitleUnread: { fontWeight: '700', color: Theme.colors.textPrimary },
  timestamp: { fontFamily: Theme.typography.sans, fontSize: 10, color: Theme.colors.textMuted },
  description: { fontFamily: Theme.typography.sans, fontSize: 12, color: Theme.colors.textSecondary, lineHeight: 16, marginBottom: 6 },
  typePill: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: Theme.radius.round },
  typePillText: { fontFamily: Theme.typography.sans, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  unreadIndicator: { width: 8, height: 8, borderRadius: 4, alignSelf: 'center' },
});
