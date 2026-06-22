import React from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, useWindowDimensions, ImageBackground } from 'react-native';
import {
  ShieldAlert,
  Building,
  Eye,
  CalendarDays,
  PlusCircle,
  BarChart3,
  MessageSquare,
  ClipboardList,
  ShieldCheck,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Timer,
} from 'lucide-react-native';
import { Theme } from '../constants/dashboardTheme';
import { useApp } from '../context/AppContext';
import { Card, MetricCard, BarChart, LineTrendChart, ActivityTimeline, Button, TrustScoreRing } from '../components/DashboardComponents';

export const DashboardScreen: React.FC = () => {
  const {
    properties,
    appointments,
    trustScore,
    setActiveScreen,
    reviews,
    getVerificationStats,
    getPropertyTrustCategory,
    getPropertyHealthCategory,
    ownerProfile,
    ownerVerification,
    notifications,
  } = useApp();

  const isVerified = ownerVerification?.status === 'VERIFIED';

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const verificationStats = getVerificationStats();

  const avgPropertyTrust =
    properties.length > 0
      ? Math.round(properties.reduce((sum, p) => sum + p.trustScore, 0) / properties.length)
      : 0;

  const avgListingHealth =
    properties.length > 0
      ? Math.round(properties.reduce((sum, p) => sum + p.listingHealthScore, 0) / properties.length)
      : 0;

  const expiringCount = properties.filter((p) => p.listingStatus === 'Expiring Soon').length;
  const soonestExpiry = properties
    .filter((p) => p.listingStatus === 'Active' || p.listingStatus === 'Expiring Soon')
    .sort((a, b) => a.daysRemaining - b.daysRemaining)[0];

  const totalProperties = properties.length;
  const activeListings = properties.filter((p) => p.status === 'Published' && p.visibility === 'public').length;
  const totalViews = properties.reduce((sum, p) => sum + p.views, 0);
  const pendingAppointments = appointments.filter((a) => a.status === 'Pending').length;

  const viewsChartData = [
    { label: 'Mon', value: 140 },
    { label: 'Tue', value: 220 },
    { label: 'Wed', value: 310 },
    { label: 'Thu', value: 290 },
    { label: 'Fri', value: 410 },
    { label: 'Sat', value: 550 },
    { label: 'Sun', value: 480 },
  ];

  const appointmentTrendData = [
    { label: 'Wk 1', value: 3 },
    { label: 'Wk 2', value: 8 },
    { label: 'Wk 3', value: 5 },
    { label: 'Wk 4', value: 12 },
    { label: 'Wk 5', value: 9 },
  ];

  const recentActivities = notifications.slice(0, 4).map((n) => {
    let icon = CheckCircle;
    let iconColor = Theme.colors.primary;
    let iconBg = Theme.colors.lightBlue;

    if (n.type.includes('Warning') || n.type === 'trustScoreChange') {
      icon = AlertTriangle;
      iconColor = Theme.colors.warning;
      iconBg = Theme.colors.lightWarning;
    } else if (n.type === 'expired' || n.type === 'verificationFailed') {
      icon = XCircle;
      iconColor = Theme.colors.danger;
      iconBg = Theme.colors.lightDanger;
    } else if (n.type === 'verificationSuccess') {
      iconColor = Theme.colors.success;
      iconBg = Theme.colors.lightSuccess;
    }

    return {
      id: n.id,
      icon,
      iconColor,
      iconBg,
      title: n.title,
      description: n.description,
      time: n.time,
    };
  });

  const statCards = [
    { label: 'Verified', value: verificationStats.verified, icon: CheckCircle, color: Theme.colors.success, bg: Theme.colors.lightSuccess },
    { label: 'Expiring Soon', value: verificationStats.expiringSoon, icon: AlertTriangle, color: Theme.colors.warning, bg: Theme.colors.lightWarning },
    { label: 'Expired', value: verificationStats.expired, icon: Clock, color: Theme.colors.danger, bg: Theme.colors.lightDanger },
    { label: 'Pending', value: verificationStats.pendingVerification, icon: Timer, color: Theme.colors.primary, bg: Theme.colors.lightBlue },
    { label: 'Rejected', value: verificationStats.rejected, icon: XCircle, color: Theme.colors.danger, bg: Theme.colors.lightDanger },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View
        style={styles.heroContainer}
        {...(Platform.OS === 'web' ? { className: 'hero-container' } : {})}
      >
        <ImageBackground
          source={require('../../assets/images/luxury_villa.png')}
          style={styles.heroBg}
          imageStyle={Platform.OS === 'web' ? ({ className: 'hero-image-bg' } as any) : undefined}
          resizeMode="cover"
        >
          {/* Dual Gradient Overlay */}
          <View style={styles.heroOverlay} />

          <View style={styles.heroContentRow}>
            {/* Left Column */}
            <View style={styles.heroLeft}>
              <Text style={styles.heroSubtitle}>Welcome Back,</Text>
              <Text style={[styles.heroTitle, Platform.OS === 'web' && ({ className: 'luxury-title-glow' } as any)]}>
                {ownerProfile.name}
              </Text>
              
              <View style={styles.heroBadgeRow}>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck color="#FFFFFF" size={13} style={{ marginRight: 4 }} />
                  <Text style={styles.verifiedBadgeText}>AI Verified Owner</Text>
                </View>
                <View style={styles.luxeBadge}>
                  <Star color="#F59E0B" fill="#F59E0B" size={11} style={{ marginRight: 4 }} />
                  <Text style={styles.luxeBadgeText}>Premium Partner</Text>
                </View>
              </View>

              {/* Stats Highlights */}
              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>{totalProperties}</Text>
                  <Text style={styles.heroStatLabel}>Properties</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>95.8%</Text>
                  <Text style={styles.heroStatLabel}>Occupancy</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>$42.5K</Text>
                  <Text style={styles.heroStatLabel}>Monthly Rev</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.heroBtnRow}>
                <Button
                  title="Add Property"
                  icon={PlusCircle}
                  onPress={() => setActiveScreen('add-property')}
                  variant="primary"
                  style={styles.heroBtn}
                  disabled={!isVerified}
                />
                <Button
                  title="Verification"
                  icon={ShieldCheck}
                  onPress={() => setActiveScreen('verification')}
                  variant="outline"
                  style={[styles.heroBtn, styles.heroBtnOutline]}
                  textStyle={styles.heroBtnOutlineText}
                />
              </View>
            </View>

            {/* Right Column */}
            {isLargeScreen && (
              <View style={styles.heroRight}>
                <View style={styles.trustScoreCard} {...(Platform.OS === 'web' ? { className: 'luxury-card' } : {})}>
                  <Text style={styles.trustCardLabel}>Trust Rating</Text>
                  <Text style={styles.trustCardScore}>{trustScore}%</Text>
                  <View
                    style={[
                      styles.trustCardIndicator,
                      { backgroundColor: trustScore >= 90 ? Theme.colors.success : Theme.colors.warning },
                    ]}
                  >
                    <Text style={styles.trustCardIndicatorText}>
                      {trustScore >= 95 ? 'Excellent' : trustScore >= 80 ? 'Very Good' : 'Good'}
                    </Text>
                  </View>
                  <Text style={styles.trustCardDesc}>
                    {verificationStats.pendingVerification > 0
                      ? `${verificationStats.pendingVerification} verification pending`
                      : 'All listings verified'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ImageBackground>
      </View>

      {!isVerified && (
        <Card style={styles.lockOverlay}>
          <ShieldAlert color={Theme.colors.danger} size={40} style={{ marginBottom: 12 }} />
          <Text style={styles.lockTitle}>Verification Required</Text>
          <Text style={styles.lockText}>Complete verification to unlock owner features.</Text>
          <Button 
            title="Go to Verification Center" 
            onPress={() => setActiveScreen('verification')} 
            variant="primary" 
            style={{ marginTop: 16 }} 
          />
        </Card>
      )}

      {isVerified && (
        <>
          <Text style={styles.sectionHeader}>Verification Overview</Text>
          <Card
            style={styles.verificationWidget}
            {...(Platform.OS === 'web' ? { className: 'luxury-card card-tint-verification' } : {})}
          >
            <View style={styles.verificationStatsRow}>
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <View key={stat.label} style={styles.verificationStatItem}>
                    <View
                      style={[
                        styles.verificationStatIcon,
                        {
                          backgroundColor: stat.bg,
                          borderWidth: 1,
                          borderColor: `${stat.color}22`,
                          ...Platform.select({
                            web: { boxShadow: `0 4px 10px ${stat.color}15` },
                          }),
                        },
                      ]}
                    >
                      <Icon color={stat.color} size={16} />
                    </View>
                    <Text style={styles.verificationStatValue}>{stat.value}</Text>
                    <Text style={styles.verificationStatLabel}>{stat.label}</Text>
                  </View>
                );
              })}
            </View>
            <Button
              title="Open Verification Center"
              variant="outline"
              onPress={() => setActiveScreen('verification')}
              style={{ marginTop: Theme.spacing.lg }}
            />
          </Card>

          <Text style={styles.sectionHeader}>Trust & Listing Health</Text>
          <View style={[styles.healthTrustRow, isLargeScreen && styles.healthTrustRowDesktop]}>
            <Card
              style={[styles.healthTrustCard, { backgroundColor: 'rgba(37, 99, 235, 0.08)' }]}
              {...(Platform.OS === 'web' ? { className: 'luxury-card card-tint-trust' } : {})}
            >
              <Text style={styles.widgetTitle}>Property Trust Score</Text>
              <View style={styles.ringRow}>
                <TrustScoreRing
                  score={avgPropertyTrust}
                  size={96}
                  sublabel={getPropertyTrustCategory(avgPropertyTrust)}
                />
                <View style={styles.ringDetails}>
                  <Text style={styles.ringDetailTitle}>Portfolio Average</Text>
                  <Text style={styles.ringDetailText}>
                    Based on recent verification, active listings, AI validation, and duplicate detection across{' '}
                    {totalProperties} properties.
                  </Text>
                </View>
              </View>
            </Card>

            <Card
              style={[styles.healthTrustCard, { backgroundColor: 'rgba(37, 99, 235, 0.08)' }]}
              {...(Platform.OS === 'web' ? { className: 'luxury-card card-tint-trust' } : {})}
            >
              <Text style={styles.widgetTitle}>Listing Health Score</Text>
              <View style={styles.ringRow}>
                <TrustScoreRing
                  score={avgListingHealth}
                  size={96}
                  sublabel={getPropertyHealthCategory(avgListingHealth)}
                />
                <View style={styles.ringDetails}>
                  <Text style={styles.ringDetailTitle}>Portfolio Average</Text>
                  <Text style={styles.ringDetailText}>
                    Combines description completeness, image count, verification freshness, trust score, and complaint
                    signals.
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          <Text style={styles.sectionHeader}>Expiry Overview</Text>
          <Card
            style={styles.expiryWidget}
            {...(Platform.OS === 'web' ? { className: 'luxury-card card-tint-statistics' } : {})}
          >
            <View style={styles.expiryRow}>
              <View style={[styles.expiryIconBox, { backgroundColor: Theme.colors.lightWarning }]}>
                <Timer color={Theme.colors.warning} size={22} />
              </View>
              <View style={styles.expiryContent}>
                <Text style={styles.expiryTitle}>{expiringCount} listings expiring soon</Text>
                <Text style={styles.expiryDesc}>
                  {soonestExpiry
                    ? `Next expiry: ${soonestExpiry.name} in ${soonestExpiry.daysRemaining} days. Listings auto-expire after 30 days.`
                    : 'No active listings approaching expiry.'}
                </Text>
              </View>
              <View style={styles.expiryCountBox}>
                <Text style={styles.expiryCountNum}>{verificationStats.expired}</Text>
                <Text style={styles.expiryCountLabel}>Expired</Text>
              </View>
            </View>
            <Button
              title="Manage Properties"
              variant="primary"
              onPress={() => setActiveScreen('properties')}
              style={{ marginTop: Theme.spacing.md }}
            />
          </Card>

          <Text style={styles.sectionHeader}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <Button title="Add Property" icon={PlusCircle} onPress={() => setActiveScreen('add-property')} variant="primary" style={styles.quickActionBtn} />
            <Button title="Analytics" icon={BarChart3} onPress={() => setActiveScreen('analytics')} variant="outline" style={styles.quickActionBtn} />
            <Button title="Appointments" icon={ClipboardList} onPress={() => setActiveScreen('appointments')} variant="outline" style={styles.quickActionBtn} />
            <Button title="Messages" icon={MessageSquare} onPress={() => setActiveScreen('messages')} variant="outline" style={styles.quickActionBtn} />
          </View>

          <Text style={styles.sectionHeader}>Performance Highlights</Text>
          <View style={styles.widgetsGrid}>
            <View style={styles.widgetsRow}>
              <MetricCard title="Total Properties" value={totalProperties} change="+1 this month" changeType="positive" icon={Building} iconColor={Theme.colors.primary} iconBg={Theme.colors.lightBlue} />
              <MetricCard title="Active Listings" value={activeListings} subtext="AI verified & live" icon={Building} iconColor={Theme.colors.success} iconBg={Theme.colors.lightSuccess} />
            </View>
            <View style={styles.widgetsRow}>
              <MetricCard title="Property Views" value={totalViews.toLocaleString()} change="+14.2%" changeType="positive" icon={Eye} iconColor="#0284C7" iconBg="#F0F9FF" />
              <MetricCard title="Appt. Requests" value={pendingAppointments} change={`${pendingAppointments} action items`} changeType={pendingAppointments > 0 ? 'warning' : 'neutral'} icon={CalendarDays} iconColor={Theme.colors.warning} iconBg={Theme.colors.lightWarning} onPress={() => setActiveScreen('appointments')} />
            </View>
          </View>

          <View style={[styles.chartsTimelineLayout, isLargeScreen && styles.rowLayout]}>
            <View style={[styles.chartsColumn, isLargeScreen && styles.flex2]}>
              <BarChart title="Property Views Trend (Weekly)" data={viewsChartData} color={Theme.colors.primary} />
              <LineTrendChart title="Appointment Bookings Rate" data={appointmentTrendData} color={Theme.colors.success} />
            </View>
            <View style={[styles.timelineColumn, isLargeScreen && styles.flex1]}>
              <ActivityTimeline activities={recentActivities} />
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  contentContainer: { padding: Theme.spacing.xxl },
  heroContainer: {
    height: 380,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: Theme.spacing.xl,
    backgroundColor: '#0C1E50',
    ...Theme.elevatedShadow,
  },
  heroBg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(12, 30, 80, 0.55)',
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(135deg, rgba(12, 30, 80, 0.82) 0%, rgba(12, 30, 80, 0.50) 100%)',
      } as any,
    }),
  },
  heroContentRow: {
    flex: 1,
    flexDirection: 'row',
    padding: Theme.spacing.xxl,
    alignItems: 'center',
  },
  heroLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  heroRight: {
    width: 250,
    marginLeft: Theme.spacing.xxl,
    alignItems: 'center',
  },
  heroSubtitle: {
    fontFamily: Theme.typography.sans,
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontFamily: Theme.typography.sans,
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: Theme.spacing.sm,
    letterSpacing: -1,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.success,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 9999,
  },
  verifiedBadgeText: {
    fontFamily: Theme.typography.sans,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  luxeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 9999,
  },
  luxeBadgeText: {
    fontFamily: Theme.typography.sans,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: Theme.spacing.lg,
    width: Platform.OS === 'web' ? '70%' : '100%',
    minWidth: 280,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontFamily: Theme.typography.sans,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontFamily: Theme.typography.sans,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.55)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroBtn: {
    minWidth: 140,
  },
  heroBtnOutline: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  heroBtnOutlineText: {
    color: '#FFFFFF',
  },
  trustScoreCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: Theme.spacing.xl,
    borderRadius: 24,
    alignItems: 'center',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      },
    }),
  },
  trustCardLabel: {
    fontFamily: Theme.typography.sans,
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  trustCardScore: {
    fontFamily: Theme.typography.sans,
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    marginVertical: 4,
  },
  trustCardIndicator: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 9999,
    marginBottom: 6,
  },
  trustCardIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  trustCardDesc: {
    fontFamily: Theme.typography.sans,
    color: 'rgba(255, 255, 255, 0.50)',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionHeader: {
    fontFamily: Theme.typography.sans,
    fontSize: 19,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: Theme.spacing.lg,
    marginTop: Theme.spacing.xxl,
    letterSpacing: -0.4,
  },
  verificationWidget: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(37, 99, 235, 0.10) 100%)',
      },
    }),
  },
  verificationStatsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Theme.spacing.sm },
  verificationStatItem: { alignItems: 'center', width: Platform.OS === 'web' ? '18%' : '30%', minWidth: 72, paddingVertical: Theme.spacing.sm },
  verificationStatIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  verificationStatValue: { fontFamily: Theme.typography.sans, fontSize: 20, fontWeight: '800', color: Theme.colors.textPrimary },
  verificationStatLabel: { fontFamily: Theme.typography.sans, fontSize: 10, fontWeight: '600', color: Theme.colors.textSecondary, textAlign: 'center', marginTop: 2 },
  healthTrustRow: { gap: Theme.spacing.md, marginBottom: Theme.spacing.lg },
  healthTrustRowDesktop: { flexDirection: 'row' },
  healthTrustCard: {
    flex: 1,
    padding: Theme.spacing.lg,
    marginBottom: 0,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(99, 102, 241, 0.08) 100%)',
      },
    }),
  },
  widgetTitle: { fontFamily: Theme.typography.sans, fontSize: 14, fontWeight: '700', color: Theme.colors.textPrimary, marginBottom: Theme.spacing.md },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.lg },
  ringDetails: { flex: 1 },
  ringDetailTitle: { fontFamily: Theme.typography.sans, fontSize: 13, fontWeight: '700', color: Theme.colors.textPrimary, marginBottom: 4 },
  ringDetailText: { fontFamily: Theme.typography.sans, fontSize: 12, color: Theme.colors.textSecondary, lineHeight: 17 },
  expiryWidget: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(59, 130, 246, 0.06) 100%)',
      },
    }),
  },
  expiryRow: { flexDirection: 'row', alignItems: 'center' },
  expiryIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: Theme.spacing.md },
  expiryContent: { flex: 1, paddingRight: Theme.spacing.sm },
  expiryTitle: { fontFamily: Theme.typography.sans, fontSize: 14, fontWeight: '700', color: Theme.colors.textPrimary, marginBottom: 4 },
  expiryDesc: { fontFamily: Theme.typography.sans, fontSize: 12, color: Theme.colors.textSecondary, lineHeight: 16 },
  expiryCountBox: { alignItems: 'center', backgroundColor: Theme.colors.lightDanger, paddingVertical: 8, paddingHorizontal: 12, borderRadius: Theme.radius.medium },
  expiryCountNum: { fontFamily: Theme.typography.sans, fontSize: 20, fontWeight: '800', color: Theme.colors.danger },
  expiryCountLabel: { fontFamily: Theme.typography.sans, fontSize: 9, fontWeight: '700', color: Theme.colors.danger },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.sm, marginBottom: Theme.spacing.xl },
  quickActionBtn: { flex: 1, minWidth: Platform.OS === 'web' ? 140 : '45%' },
  widgetsGrid: { marginBottom: Theme.spacing.xl },
  widgetsRow: { flexDirection: 'row', marginHorizontal: -Theme.spacing.xs, marginBottom: Theme.spacing.sm },
  chartsTimelineLayout: { gap: Theme.spacing.lg },
  rowLayout: { flexDirection: 'row' },
  chartsColumn: { gap: Theme.spacing.sm },
  timelineColumn: {},
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  lockOverlay: {
    padding: Theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderRadius: 24,
    marginTop: Theme.spacing.lg,
  },
  lockTitle: {
    fontFamily: Theme.typography.sans,
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.danger,
    marginBottom: 8,
  },
  lockText: {
    fontFamily: Theme.typography.sans,
    fontSize: 14,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
});
