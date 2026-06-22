import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  useWindowDimensions
} from 'react-native';
import {
  Calendar,
  Clock,
  User,
  Building,
  CheckCircle,
  XCircle,
  CalendarClock,
  Info,
  CalendarRange,
  X
} from 'lucide-react-native';
import { Theme } from '../constants/dashboardTheme';
import { useApp, Appointment } from '../context/AppContext';
import { Card, Button, Badge, Input } from '../components/DashboardComponents';

type TabStatus = 'Upcoming' | 'Pending' | 'Completed' | 'Cancelled';

export const AppointmentsScreen: React.FC = () => {
  const { appointments, updateAppointmentStatus } = useApp();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // Tabs status selection
  const [activeTab, setActiveTab] = useState<TabStatus>('Pending');

  // Reschedule state management
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('2026-06-10');
  const [newTime, setNewTime] = useState('11:30 AM');

  // Filtered list
  const filteredAppointments = appointments.filter(a => a.status === activeTab);

  const getStatusType = (status: Appointment['status']) => {
    switch (status) {
      case 'Upcoming': return 'success';
      case 'Pending': return 'warning';
      case 'Completed': return 'primary';
      case 'Cancelled': return 'danger';
      default: return 'neutral';
    }
  };

  const handleRescheduleSubmit = () => {
    if (reschedulingAppt) {
      // Modify appointment time and trigger rescheduled state
      updateAppointmentStatus(reschedulingAppt.id, 'Pending');
      // In a real database we would change date/time, but for this presentation we will mock it
      reschedulingAppt.date = newDate;
      reschedulingAppt.time = newTime;
      setReschedulingAppt(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Horizonal Tab Header */}
      <View style={styles.tabHeader}>
        {(['Pending', 'Upcoming', 'Completed', 'Cancelled'] as TabStatus[]).map(tab => {
          const isSelected = activeTab === tab;
          const count = appointments.filter(a => a.status === tab).length;
          
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn,
                isSelected && styles.tabBtnActive
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabBtnText,
                isSelected && styles.tabBtnTextActive
              ]}>
                {tab}
              </Text>
              {count > 0 && (
                <View style={[
                  styles.tabCounter,
                  isSelected ? styles.tabCounterActive : styles.tabCounterInactive
                ]}>
                  <Text style={[
                    styles.tabCounterText,
                    isSelected ? styles.tabCounterTextActive : styles.tabCounterTextInactive
                  ]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Appointment Cards list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {filteredAppointments.length === 0 ? (
          <Card style={styles.emptyCard} className="card-tint-statistics">
            <CalendarRange color={Theme.colors.textMuted} size={48} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No Tour Bookings</Text>
            <Text style={styles.emptyText}>
              There are no appointments registered under the "{activeTab.toLowerCase()}" tab.
            </Text>
          </Card>
        ) : (
          <View style={styles.gridContainer}>
            {filteredAppointments.map(appt => (
              <Card key={appt.id} style={styles.apptCard} className="card-tint-statistics">
                <View style={styles.apptHeader}>
                  <View style={styles.userSection}>
                    <View style={styles.avatarPlaceholder}>
                      <User color={Theme.colors.primary} size={18} />
                    </View>
                    <View>
                      <Text style={styles.userName}>{appt.userName}</Text>
                      <Text style={styles.userType}>Tenant Prospect</Text>
                    </View>
                  </View>
                  <Badge text={appt.status} type={getStatusType(appt.status)} />
                </View>

                {/* Property / Schedule Details */}
                <View style={styles.apptInfoBox}>
                  <View style={styles.infoRow}>
                    <Building color={Theme.colors.textSecondary} size={14} style={styles.infoIcon} />
                    <Text style={styles.infoText} numberOfLines={1}>{appt.propertyName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Calendar color={Theme.colors.textSecondary} size={14} style={styles.infoIcon} />
                    <Text style={styles.infoText}>{appt.date}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Clock color={Theme.colors.textSecondary} size={14} style={styles.infoIcon} />
                    <Text style={styles.infoText}>{appt.time}</Text>
                  </View>
                </View>

                {/* Contextual Action Bars */}
                {appt.status === 'Pending' && (
                  <View style={styles.actionsPanel}>
                    <Button
                      title="Approve"
                      variant="success"
                      icon={CheckCircle}
                      size="small"
                      onPress={() => updateAppointmentStatus(appt.id, 'Upcoming')}
                      style={styles.actionBtn}
                    />
                    <Button
                      title="Reschedule"
                      variant="outline"
                      icon={CalendarClock}
                      size="small"
                      onPress={() => {
                        setReschedulingAppt(appt);
                        setNewDate(appt.date);
                        setNewTime(appt.time);
                      }}
                      style={styles.actionBtn}
                    />
                    <Button
                      title="Reject"
                      variant="danger"
                      icon={XCircle}
                      size="small"
                      onPress={() => updateAppointmentStatus(appt.id, 'Cancelled')}
                      style={styles.actionBtn}
                    />
                  </View>
                )}

                {appt.status === 'Upcoming' && (
                  <View style={styles.actionsPanel}>
                    <Button
                      title="Mark Completed"
                      variant="success"
                      size="small"
                      onPress={() => updateAppointmentStatus(appt.id, 'Completed')}
                      style={styles.actionBtn}
                    />
                    <Button
                      title="Cancel Booking"
                      variant="outline"
                      size="small"
                      onPress={() => updateAppointmentStatus(appt.id, 'Cancelled')}
                      style={[styles.actionBtn, { borderColor: Theme.colors.danger }]}
                      textStyle={{ color: Theme.colors.danger }}
                    />
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Rescheduling Modal dialog */}
      <Modal
        visible={reschedulingAppt !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setReschedulingAppt(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setReschedulingAppt(null)}
          />
          <View style={[styles.modalContent, isLargeScreen && styles.modalContentDesktop]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reschedule Booking Tour</Text>
              <TouchableOpacity onPress={() => setReschedulingAppt(null)}>
                <X color={Theme.colors.textPrimary} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Prospect:</Text>
                <Text style={styles.summaryValue}>{reschedulingAppt?.userName}</Text>
                <Text style={styles.summaryLabel}>Property:</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>{reschedulingAppt?.propertyName}</Text>
              </View>

              <Input
                label="New Requested Date"
                value={newDate}
                onChangeText={setNewDate}
                placeholder="YYYY-MM-DD"
              />

              <Input
                label="New Tour Slot Time"
                value={newTime}
                onChangeText={setNewTime}
                placeholder="e.g. 10:00 AM"
              />

              <View style={[styles.infoBox, { backgroundColor: 'rgba(37, 99, 235, 0.10)' }]}>
                <Info color={Theme.colors.primary} size={16} style={{ marginRight: 8 }} />
                <Text style={styles.infoBoxText}>
                  Rescheduling will notify the tenant via email. The booking returns to 'Pending' until they confirm.
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setReschedulingAppt(null)}
                style={styles.modalFooterBtn}
              />
              <View style={{ width: 12 }} />
              <Button
                title="Propose Date"
                variant="primary"
                onPress={handleRescheduleSubmit}
                style={styles.modalFooterBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.30)',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      },
    }),
  } as any,
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: Theme.colors.primary,
  },
  tabBtnText: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  tabCounter: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tabCounterActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  tabCounterInactive: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  tabCounterText: {
    fontSize: 9,
    fontWeight: '700',
  },
  tabCounterTextActive: {
    color: Theme.colors.primary,
  },
  tabCounterTextInactive: {
    color: Theme.colors.textSecondary,
  },
  scrollBody: {
    padding: Theme.spacing.lg,
  },
  emptyCard: {
    padding: Theme.spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: Theme.typography.sans,
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
  },
  gridContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  apptCard: {
    padding: Theme.spacing.lg,
    flex: 1,
    minWidth: Platform.OS === 'web' ? 340 : '100%',
    marginBottom: 0,
  },
  apptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  userName: {
    fontFamily: Theme.typography.sans,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  userType: {
    fontFamily: Theme.typography.sans,
    fontSize: 11,
    color: Theme.colors.textMuted,
  },
  apptInfoBox: {
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderRadius: Theme.radius.medium,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.10)',
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: Theme.spacing.sm,
  },
  infoText: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    color: Theme.colors.textPrimary,
    fontWeight: '500',
  },
  actionsPanel: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.20)',
    paddingTop: Theme.spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: Theme.radius.large,
    width: '90%',
    padding: Theme.spacing.xl,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.40)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
      },
    }),
  } as any,
  modalContentDesktop: {
    maxWidth: 450,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.30)',
    paddingBottom: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  modalTitle: {
    fontFamily: Theme.typography.sans,
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  modalBody: {
    gap: Theme.spacing.md,
  },
  summaryBox: {
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.10)',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.medium,
    marginBottom: Theme.spacing.xs,
  },
  summaryLabel: {
    fontFamily: Theme.typography.sans,
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  summaryValue: {
    fontFamily: Theme.typography.sans,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.medium,
  },
  infoBoxText: {
    fontFamily: Theme.typography.sans,
    fontSize: 11,
    color: '#0369A1',
    flex: 1,
    lineHeight: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.30)',
    paddingTop: Theme.spacing.lg,
    marginTop: Theme.spacing.xl,
  },
  modalFooterBtn: {
    flex: 1,
  },
});
