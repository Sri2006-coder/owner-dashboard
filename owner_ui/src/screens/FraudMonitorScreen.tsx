import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, TouchableOpacity } from 'react-native';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Gauge,
  Activity,
  ImageOff,
  DollarSign,
  Clock,
  MapPin,
} from 'lucide-react-native';
import { Theme } from '../constants/dashboardTheme';
import { useApp, Property } from '../context/AppContext';
import { Card, MetricCard, Button, Badge } from '../components/DashboardComponents';

export const FraudMonitorScreen: React.FC = () => {
  const {
    fraudMetrics,
    updateFraudScore,
    properties,
    getPropertyHealthCategory,
    getPropertyTrustCategory,
  } = useApp();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id ?? '');

  const selectedProperty: Property | undefined = properties.find((p) => p.id === selectedPropertyId);

  const handleToggleSimulation = () => {
    if (fraudMetrics.score <= 10) {
      updateFraudScore(74);
    } else {
      updateFraudScore(4);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High':
        return Theme.colors.danger;
      case 'Medium':
        return Theme.colors.warning;
      case 'Low':
      default:
        return Theme.colors.success;
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'High':
        return Theme.colors.lightDanger;
      case 'Medium':
        return Theme.colors.lightWarning;
      case 'Low':
      default:
        return Theme.colors.lightSuccess;
    }
  };

  const duplicateRiskLabel = selectedProperty?.duplicateRisk ? 'High' : 'Low';
  const duplicateRiskColor = selectedProperty?.duplicateRisk ? Theme.colors.danger : Theme.colors.success;

  const avgHealth =
    properties.length > 0
      ? Math.round(properties.reduce((sum, p) => sum + p.listingHealthScore, 0) / properties.length)
      : 0;

  const propertyFraudScore = selectedProperty
    ? Math.min(100, Math.round(100 - selectedProperty.trustScore + (selectedProperty.duplicateRisk ? 30 : 0)))
    : fraudMetrics.score;

  const propertyRiskLevel: 'Low' | 'Medium' | 'High' =
    propertyFraudScore > 60 ? 'High' : propertyFraudScore > 30 ? 'Medium' : 'Low';

  const aiChecks = [
    {
      id: 'dup-images',
      label: 'Duplicate Images',
      icon: Copy,
      passed: !selectedProperty?.duplicateRisk,
      detail: selectedProperty?.duplicateRisk
        ? 'Similar image hashes detected across listings'
        : 'No duplicate image matches found',
    },
    {
      id: 'dup-address',
      label: 'Duplicate Addresses',
      icon: MapPin,
      passed: !selectedProperty?.duplicateRisk,
      detail: 'Address cross-reference against platform database',
    },
    {
      id: 'fake-images',
      label: 'Fake Images',
      icon: ImageOff,
      passed: selectedProperty?.verificationState === 'Verified',
      detail: 'Live camera watermark authenticity verification',
    },
    {
      id: 'pricing',
      label: 'Suspicious Pricing',
      icon: DollarSign,
      passed: (selectedProperty?.complaintCount ?? 0) === 0,
      detail: 'Rent value within acceptable market bounds',
    },
    {
      id: 'expired-photos',
      label: 'Expired Verification Photos',
      icon: Clock,
      passed: (selectedProperty?.daysRemaining ?? 0) > 0 && selectedProperty?.verificationState !== 'Rejected',
      detail: 'Verification capture freshness within 30-day window',
    },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={[styles.mainStatusCard, { borderLeftColor: getRiskColor(propertyRiskLevel) }]} className="card-tint-property">
        <View style={styles.statusHeader}>
          <View style={styles.statusTitleSection}>
            <Text style={styles.statusSubtitle}>AI Fraud Detection Dashboard</Text>
            <Text style={styles.statusTitle}>Automated Property Integrity Monitor</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: getRiskBg(propertyRiskLevel) }]}>
            <Text style={[styles.riskBadgeText, { color: getRiskColor(propertyRiskLevel) }]}>
              {propertyRiskLevel.toUpperCase()} RISK
            </Text>
          </View>
        </View>

        <View style={styles.gaugeContainer}>
          <Text style={styles.gaugeLabel}>Fraud Score (selected property)</Text>
          <View style={styles.gaugeBarBg}>
            <View
              style={[
                styles.gaugeBarFill,
                { width: `${propertyFraudScore}%`, backgroundColor: getRiskColor(propertyRiskLevel) },
              ]}
            />
          </View>
          <View style={styles.gaugeFooter}>
            <Text style={styles.gaugePercentage}>{propertyFraudScore}% Fraud Weight Index</Text>
            <Text style={styles.gaugeRating}>Safe threshold: &lt;15%</Text>
          </View>
        </View>
      </Card>

      {propertyRiskLevel === 'High' && (
        <View style={[styles.warningBanner, { backgroundColor: Theme.colors.lightDanger }]}>
          <ShieldAlert color={Theme.colors.danger} size={24} style={{ marginRight: Theme.spacing.md, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>AI RISK ALERT</Text>
            <Text style={styles.warningText}>
              Automated checks flagged {selectedProperty?.name ?? 'this property'}. Complete live camera re-verification
              in the Verification Center to restore listing trust.
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionHeader}>Property Selector</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.propertyPills}>
        {properties.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.propertyPill, selectedPropertyId === p.id && styles.propertyPillActive]}
            onPress={() => setSelectedPropertyId(p.id)}
          >
            <Text style={[styles.propertyPillText, selectedPropertyId === p.id && styles.propertyPillTextActive]}>
              {p.name.length > 20 ? `${p.name.slice(0, 18)}…` : p.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedProperty ? (
        <Card style={styles.propertyStatusCard} className="card-tint-statistics">
          <Text style={styles.propertyStatusTitle}>{selectedProperty.name}</Text>
          <View style={styles.propertyStatusBadges}>
            <Badge text={`Verification: ${selectedProperty.verificationState}`} type={selectedProperty.verificationState === 'Verified' ? 'success' : 'warning'} />
            <Badge text={`Listing: ${selectedProperty.listingStatus}`} type={selectedProperty.listingStatus === 'Active' ? 'success' : 'danger'} />
          </View>
        </Card>
      ) : null}

      <Text style={styles.sectionHeader}>AI Fraud Metrics</Text>
      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <MetricCard
            title="Fraud Score"
            value={`${propertyFraudScore}%`}
            change={propertyFraudScore > 15 ? 'Action Required' : 'Within limits'}
            changeType={propertyFraudScore > 15 ? 'negative' : 'positive'}
            icon={Gauge}
            iconColor={getRiskColor(propertyRiskLevel)}
            iconBg={getRiskBg(propertyRiskLevel)}
          />
          <MetricCard
            title="Duplicate Risk"
            value={duplicateRiskLabel}
            subtext={selectedProperty?.duplicateRisk ? 'Match detected' : 'No duplicates'}
            icon={Copy}
            iconColor={duplicateRiskColor}
            iconBg={selectedProperty?.duplicateRisk ? Theme.colors.lightDanger : Theme.colors.lightSuccess}
          />
        </View>
        <View style={styles.gridRow}>
          <MetricCard
            title="Listing Health"
            value={`${selectedProperty?.listingHealthScore ?? avgHealth}%`}
            change={getPropertyHealthCategory(selectedProperty?.listingHealthScore ?? avgHealth)}
            changeType={
              (selectedProperty?.listingHealthScore ?? avgHealth) >= 80
                ? 'positive'
                : (selectedProperty?.listingHealthScore ?? avgHealth) >= 60
                  ? 'warning'
                  : 'negative'
            }
            icon={Activity}
            iconColor={Theme.colors.primary}
            iconBg={Theme.colors.lightBlue}
          />
          <MetricCard
            title="Risk Level"
            value={propertyRiskLevel}
            subtext={`Trust ${selectedProperty?.trustScore ?? 0}% · ${getPropertyTrustCategory(selectedProperty?.trustScore ?? 0)}`}
            icon={ShieldCheck}
            iconColor={getRiskColor(propertyRiskLevel)}
            iconBg={getRiskBg(propertyRiskLevel)}
          />
        </View>
      </View>

      <Text style={styles.sectionHeader}>AI Detection Checks</Text>
      <Card style={styles.logsCard} className="card-tint-analytics">
        {aiChecks.map((check) => {
          const Icon = check.icon;
          return (
            <View key={check.id} style={styles.logRow}>
              {check.passed ? (
                <ShieldCheck color={Theme.colors.success} size={18} style={styles.logIcon} />
              ) : (
                <AlertTriangle color={Theme.colors.danger} size={18} style={styles.logIcon} />
              )}
              <View style={styles.logContent}>
                <Text style={[styles.logTitle, !check.passed && { color: Theme.colors.danger }]}>{check.label}</Text>
                <Text style={styles.logDesc}>{check.detail}</Text>
                <Text style={styles.logTime}>{check.passed ? 'Passed • AI automated' : 'Failed • AI automated'}</Text>
              </View>
              <Icon color={check.passed ? Theme.colors.textMuted : Theme.colors.danger} size={16} />
            </View>
          );
        })}
      </Card>

      <Card style={styles.simulationCard} className="card-tint-activity">
        <View style={styles.simTextCol}>
          <Text style={styles.simTitle}>Risk Simulation</Text>
          <Text style={styles.simDesc}>
            Toggle to simulate how the AI fraud dashboard responds when duplicate or high-risk signals are detected.
          </Text>
        </View>
        <Button
          title={fraudMetrics.score > 10 ? 'Reset to Safe Status' : 'Simulate High Risk'}
          variant={fraudMetrics.score > 10 ? 'success' : 'danger'}
          onPress={handleToggleSimulation}
          style={styles.simBtn}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  contentContainer: { padding: Theme.spacing.lg },
  mainStatusCard: { padding: Theme.spacing.xl, borderLeftWidth: 5, marginBottom: Theme.spacing.xl },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Theme.spacing.lg },
  statusTitleSection: { flex: 1, paddingRight: Theme.spacing.sm },
  statusSubtitle: { fontFamily: Theme.typography.sans, fontSize: 12, fontWeight: '600', color: Theme.colors.textSecondary, textTransform: 'uppercase' },
  statusTitle: { fontFamily: Theme.typography.sans, fontSize: 18, fontWeight: '700', color: Theme.colors.textPrimary, marginTop: 2 },
  riskBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: Theme.radius.round },
  riskBadgeText: { fontFamily: Theme.typography.sans, fontSize: 10, fontWeight: '700' },
  gaugeContainer: { borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.20)', paddingTop: Theme.spacing.lg },
  gaugeLabel: { fontFamily: Theme.typography.sans, fontSize: 13, fontWeight: '600', color: Theme.colors.textPrimary, marginBottom: Theme.spacing.sm },
  gaugeBarBg: { height: 10, backgroundColor: 'rgba(148, 163, 184, 0.15)', borderRadius: 5, overflow: 'hidden', marginBottom: Theme.spacing.sm },
  gaugeBarFill: { height: '100%', borderRadius: 5 },
  gaugeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gaugePercentage: { fontFamily: Theme.typography.sans, fontSize: 12, fontWeight: '700', color: Theme.colors.textPrimary },
  gaugeRating: { fontFamily: Theme.typography.sans, fontSize: 11, color: Theme.colors.textMuted },
  warningBanner: { flexDirection: 'row', padding: Theme.spacing.lg, borderRadius: Theme.radius.large, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', marginBottom: Theme.spacing.xl },
  warningTitle: { fontFamily: Theme.typography.sans, fontSize: 13, fontWeight: '800', color: '#991B1B', marginBottom: 4 },
  warningText: { fontFamily: Theme.typography.sans, fontSize: 12, color: '#B91C1C', lineHeight: 17 },
  sectionHeader: { fontFamily: Theme.typography.sans, fontSize: 16, fontWeight: '700', color: Theme.colors.textPrimary, marginBottom: Theme.spacing.md },
  propertyPills: { gap: Theme.spacing.sm, marginBottom: Theme.spacing.lg, paddingRight: Theme.spacing.lg },
  propertyPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  propertyPillActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  propertyPillText: { fontFamily: Theme.typography.sans, fontSize: 12, fontWeight: '600', color: Theme.colors.textSecondary },
  propertyPillTextActive: { color: '#FFFFFF' },
  propertyStatusCard: { padding: Theme.spacing.lg, marginBottom: Theme.spacing.lg },
  propertyStatusTitle: { fontFamily: Theme.typography.sans, fontSize: 15, fontWeight: '700', color: Theme.colors.textPrimary, marginBottom: Theme.spacing.sm },
  propertyStatusBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridContainer: { marginBottom: Theme.spacing.xl },
  gridRow: { flexDirection: 'row', marginHorizontal: -Theme.spacing.xs, marginBottom: Theme.spacing.sm },
  simulationCard: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  simTextCol: { flex: 1 },
  simTitle: { fontFamily: Theme.typography.sans, color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  simDesc: { fontFamily: Theme.typography.sans, color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 16 },
  simBtn: { minWidth: 160 },
  logsCard: { paddingVertical: Theme.spacing.sm, paddingHorizontal: Theme.spacing.lg, marginBottom: Theme.spacing.xl },
  logRow: { flexDirection: 'row', paddingVertical: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'flex-start' },
  logIcon: { marginRight: Theme.spacing.md, marginTop: 2 },
  logContent: { flex: 1 },
  logTitle: { fontFamily: Theme.typography.sans, fontSize: 13, fontWeight: '700', color: Theme.colors.textPrimary },
  logDesc: { fontFamily: Theme.typography.sans, fontSize: 12, color: Theme.colors.textSecondary, marginTop: 2, lineHeight: 16 },
  logTime: { fontFamily: Theme.typography.sans, fontSize: 10, color: Theme.colors.textMuted, marginTop: 4 },
});
