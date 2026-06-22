import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  ShieldCheck,
  Building,
  Star,
  Zap,
  Upload,
  FileCheck,
  Settings,
  Lock,
  ChevronRight,
  EyeOff,
  Bot,
  CheckCircle2,
} from 'lucide-react-native';
import { Theme } from '../constants/dashboardTheme';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge, TrustScoreRing, ScoreBadge } from '../components/DashboardComponents';

type ProfileTab = 'documents' | 'settings';

export const ProfileScreen: React.FC = () => {
  const {
    properties,
    trustScore,
    reputationScore,
    reviews,
    ownerProfile,
    verificationStatus,
    getVerificationStats,
    getPropertyTrustCategory,
  } = useApp();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const [activeTab, setActiveTab] = useState<ProfileTab>('documents');
  const [deedUploaded, setDeedUploaded] = useState(true);
  const [businessLicenseUploaded, setBusinessLicenseUploaded] = useState(false);
  const [insuranceUploaded, setInsuranceUploaded] = useState(false);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [autoApproveShield, setAutoApproveShield] = useState(true);

  const stats = getVerificationStats();
  const totalProperties = properties.length;
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0;
  const avgPropertyTrust =
    properties.length > 0
      ? Math.round(properties.reduce((sum, p) => sum + p.trustScore, 0) / properties.length)
      : trustScore;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.headerCard} elevated className="card-tint-property">
        <View style={[styles.headerRow, isLargeScreen && styles.rowLayout]}>
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: ownerProfile.avatar }} style={styles.profileAvatar} />
              <View style={styles.verifiedCheckBadge}>
                <ShieldCheck color="#FFFFFF" size={14} />
              </View>
            </View>
            <View style={styles.infoCol}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{ownerProfile.name}</Text>
                <Badge text="AI VERIFIED OWNER" type="success" dot />
              </View>
              <Text style={styles.profileRole}>Property Owner · RentShield Platform</Text>
              <View style={styles.scoreBadgeRow}>
                <ScoreBadge label="Trust" score={trustScore} size="small" />
                <ScoreBadge label="Portfolio" score={avgPropertyTrust} size="small" />
              </View>
            </View>
          </View>

          <View style={styles.reputationBox}>
            <TrustScoreRing score={trustScore} size={100} sublabel={getPropertyTrustCategory(trustScore)} />
            <View style={styles.repIndicator}>
              <Zap color={Theme.colors.warning} size={12} style={{ marginRight: 4 }} />
              <Text style={styles.repIndicatorText}>{reputationScore} REP</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Building color={Theme.colors.primary} size={18} />
            <Text style={styles.statVal}>{totalProperties}</Text>
            <Text style={styles.statLabel}>Properties</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Star color={Theme.colors.warning} size={18} />
            <Text style={styles.statVal}>{avgRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <CheckCircle2 color={Theme.colors.success} size={18} />
            <Text style={styles.statVal}>{stats.verified}</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.summaryCard} className="card-tint-trust">
        <Text style={styles.sectionTitle}>Verification Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.verified}</Text>
            <Text style={styles.summaryLabel}>Verified</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Theme.colors.warning }]}>{stats.expiringSoon}</Text>
            <Text style={styles.summaryLabel}>Expiring</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Theme.colors.primary }]}>{stats.pendingVerification}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Theme.colors.danger }]}>{stats.rejected}</Text>
            <Text style={styles.summaryLabel}>Rejected</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.privacyCard}>
        <View style={styles.privacyHeader}>
          <EyeOff color={Theme.colors.primary} size={20} />
          <View style={styles.privacyHeaderText}>
            <Text style={styles.sectionTitle}>Contact Privacy</Text>
            <Text style={styles.privacyDesc}>
              Your contact details are private and never shown to tenants on listings, search, or recommendations.
            </Text>
          </View>
        </View>
        <View style={styles.privacyRows}>
          <View style={styles.privacyRow}>
            <Text style={styles.privacyLabel}>Email</Text>
            <Text style={styles.privacyMasked}>{ownerProfile.email.replace(/(.{2}).*(@.*)/, '$1••••••$2')}</Text>
            <Badge text="Owner Only" type="neutral" />
          </View>
          <View style={styles.privacyRow}>
            <Text style={styles.privacyLabel}>Phone</Text>
            <Text style={styles.privacyMasked}>{ownerProfile.phone.replace(/\d(?=\d{4})/g, '•')}</Text>
            <Badge text="Owner Only" type="neutral" />
          </View>
        </View>
        <Text style={styles.privacyFootnote}>Tenants can reach you via Chat and Book Appointment only.</Text>
      </Card>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'documents' && styles.tabBtnActive]}
          onPress={() => setActiveTab('documents')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'documents' && styles.tabBtnTextActive]}>Credentials</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'settings' && styles.tabBtnActive]}
          onPress={() => setActiveTab('settings')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'settings' && styles.tabBtnTextActive]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'documents' ? (
        <Card style={styles.tabContentCard} className="card-tint-statistics">
          <Text style={styles.tabHeader}>Verification Document Vault</Text>
          <Text style={styles.tabSubtitle}>AI-validated credentials for automated property verification.</Text>

          <View style={styles.aiOwnerRow}>
            <View style={[styles.aiOwnerIcon, { backgroundColor: verificationStatus.aiVerified ? 'rgba(16, 185, 129, 0.10)' : 'rgba(245, 158, 11, 0.10)' }]}>
              <Bot color={verificationStatus.aiVerified ? Theme.colors.success : Theme.colors.warning} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>AI Owner Verification</Text>
              <Text style={styles.docDesc}>Fully automated — no manual admin approval required.</Text>
            </View>
            <Badge text={verificationStatus.aiVerified ? 'VERIFIED' : 'PENDING'} type={verificationStatus.aiVerified ? 'success' : 'warning'} />
          </View>

          <View style={styles.documentList}>
            <View style={styles.documentRow}>
              <View style={styles.docLeft}>
                <FileCheck color={Theme.colors.success} size={20} style={{ marginRight: Theme.spacing.md }} />
                <View>
                  <Text style={styles.docTitle}>Government ID</Text>
                  <Text style={styles.docDesc}>AI-matched against credit profile.</Text>
                </View>
              </View>
              <Badge text="VERIFIED" type="success" />
            </View>

            <View style={styles.documentRow}>
              <View style={styles.docLeft}>
                <FileCheck color={deedUploaded ? Theme.colors.success : Theme.colors.textMuted} size={20} style={{ marginRight: Theme.spacing.md }} />
                <View>
                  <Text style={styles.docTitle}>Land Ownership Deeds</Text>
                  <Text style={styles.docDesc}>AI document authenticity scan.</Text>
                </View>
              </View>
              {deedUploaded ? (
                <Badge text="VERIFIED" type="success" />
              ) : (
                <Button title="Upload" icon={Upload} variant="primary" size="small" onPress={() => setDeedUploaded(true)} />
              )}
            </View>

            <View style={styles.documentRow}>
              <View style={styles.docLeft}>
                <FileCheck color={businessLicenseUploaded ? Theme.colors.success : Theme.colors.textMuted} size={20} style={{ marginRight: Theme.spacing.md }} />
                <View>
                  <Text style={styles.docTitle}>Commercial Housing License</Text>
                  <Text style={styles.docDesc}>Required for multi-unit buildings.</Text>
                </View>
              </View>
              {businessLicenseUploaded ? (
                <Badge text="VERIFIED" type="success" />
              ) : (
                <Button title="Upload" icon={Upload} variant="outline" size="small" onPress={() => setBusinessLicenseUploaded(true)} />
              )}
            </View>

            <View style={styles.documentRow}>
              <View style={styles.docLeft}>
                <FileCheck color={insuranceUploaded ? Theme.colors.success : Theme.colors.textMuted} size={20} style={{ marginRight: Theme.spacing.md }} />
                <View>
                  <Text style={styles.docTitle}>Property Insurance</Text>
                  <Text style={styles.docDesc}>Active fire insurance coverage.</Text>
                </View>
              </View>
              {insuranceUploaded ? (
                <Badge text="VERIFIED" type="success" />
              ) : (
                <Button title="Upload" icon={Upload} variant="outline" size="small" onPress={() => setInsuranceUploaded(true)} />
              )}
            </View>
          </View>
        </Card>
      ) : (
        <Card style={styles.tabContentCard} className="card-tint-statistics">
          <Text style={styles.tabHeader}>Account Settings</Text>
          <Text style={styles.tabSubtitle}>Manage notifications and automated AI workflows.</Text>

          <View style={styles.settingsList}>
            <View style={styles.settingsRow}>
              <View style={styles.settingsLabelCol}>
                <Text style={styles.settingTitle}>SMS Tenant Inquiries</Text>
                <Text style={styles.settingDesc}>Receive texts when tenants request booking slots.</Text>
              </View>
              <Switch
                value={notifySms}
                onValueChange={setNotifySms}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={notifySms ? Theme.colors.primary : '#94A3B8'}
              />
            </View>

            <View style={styles.settingsRow}>
              <View style={styles.settingsLabelCol}>
                <Text style={styles.settingTitle}>Email Summary Reports</Text>
                <Text style={styles.settingDesc}>Weekly analytics highlights on listing views.</Text>
              </View>
              <Switch
                value={notifyEmail}
                onValueChange={setNotifyEmail}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={notifyEmail ? Theme.colors.primary : '#94A3B8'}
              />
            </View>

            <View style={styles.settingsRow}>
              <View style={styles.settingsLabelCol}>
                <Text style={styles.settingTitle}>Automated AI Fraud Precheck</Text>
                <Text style={styles.settingDesc}>Let AI automatically validate listings against registry records.</Text>
              </View>
              <Switch
                value={autoApproveShield}
                onValueChange={setAutoApproveShield}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={autoApproveShield ? Theme.colors.primary : '#94A3B8'}
              />
            </View>

            <TouchableOpacity style={styles.settingsLinkRow} activeOpacity={0.7}>
              <View style={styles.settingsLinkLeft}>
                <Lock color={Theme.colors.textSecondary} size={18} style={{ marginRight: Theme.spacing.md }} />
                <Text style={styles.settingsLinkLabel}>Password & Security</Text>
              </View>
              <ChevronRight color={Theme.colors.textMuted} size={18} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsLinkRow} activeOpacity={0.7}>
              <View style={styles.settingsLinkLeft}>
                <Settings color={Theme.colors.textSecondary} size={18} style={{ marginRight: Theme.spacing.md }} />
                <Text style={styles.settingsLinkLabel}>Platform Integrations</Text>
              </View>
              <ChevronRight color={Theme.colors.textMuted} size={18} />
            </TouchableOpacity>
          </View>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  contentContainer: { padding: Theme.spacing.lg },
  headerCard: { padding: Theme.spacing.xl, marginBottom: Theme.spacing.lg },
  headerRow: { gap: Theme.spacing.lg, paddingBottom: Theme.spacing.xl, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.20)' },
  rowLayout: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarWrapper: { position: 'relative', marginRight: Theme.spacing.lg },
  profileAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: 'rgba(37, 99, 235, 0.20)' },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Theme.colors.success,
    borderRadius: Theme.radius.round,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.40)',
  },
  infoCol: { flex: 1 },
  nameRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 },
  profileName: { fontFamily: Theme.typography.sans, fontSize: 22, fontWeight: '800', color: Theme.colors.textPrimary, letterSpacing: -0.3 },
  profileRole: { fontFamily: Theme.typography.sans, fontSize: 13, color: Theme.colors.textSecondary, marginBottom: Theme.spacing.sm },
  scoreBadgeRow: { flexDirection: 'row', gap: Theme.spacing.sm },
  reputationBox: { alignItems: 'center', gap: Theme.spacing.sm },
  repIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.lightWarning,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Theme.radius.round,
  },
  repIndicatorText: { color: '#B45309', fontSize: 10, fontWeight: '800' },
  statsRow: { flexDirection: 'row', paddingTop: Theme.spacing.xl, alignItems: 'center' },
  statCol: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255, 255, 255, 0.20)' },
  statVal: { fontFamily: Theme.typography.sans, fontSize: 18, fontWeight: '800', color: Theme.colors.textPrimary, marginTop: 6 },
  statLabel: { fontFamily: Theme.typography.sans, fontSize: 11, color: Theme.colors.textSecondary, fontWeight: '500', marginTop: 2 },
  summaryCard: { padding: Theme.spacing.lg, marginBottom: Theme.spacing.lg },
  sectionTitle: { fontFamily: Theme.typography.sans, fontSize: 15, fontWeight: '700', color: Theme.colors.textPrimary, marginBottom: Theme.spacing.md },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { fontFamily: Theme.typography.sans, fontSize: 22, fontWeight: '800', color: Theme.colors.textPrimary },
  summaryLabel: { fontFamily: Theme.typography.sans, fontSize: 11, color: Theme.colors.textSecondary, marginTop: 4 },
  privacyCard: { padding: Theme.spacing.lg, marginBottom: Theme.spacing.lg, backgroundColor: 'rgba(37, 99, 235, 0.08)', borderColor: 'rgba(37, 99, 235, 0.20)', borderWidth: 1 },
  privacyHeader: { flexDirection: 'row', gap: Theme.spacing.md, marginBottom: Theme.spacing.md },
  privacyHeaderText: { flex: 1 },
  privacyDesc: { fontFamily: Theme.typography.sans, fontSize: 12, color: Theme.colors.textSecondary, lineHeight: 17, marginTop: 2 },
  privacyRows: { gap: Theme.spacing.sm, marginBottom: Theme.spacing.sm },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.medium,
    gap: Theme.spacing.sm,
  },
  privacyLabel: { fontFamily: Theme.typography.sans, fontSize: 12, fontWeight: '600', color: Theme.colors.textSecondary, width: 48 },
  privacyMasked: { fontFamily: Theme.typography.sans, fontSize: 13, fontWeight: '600', color: Theme.colors.textPrimary, flex: 1 },
  privacyFootnote: { fontFamily: Theme.typography.sans, fontSize: 11, color: Theme.colors.textMuted, fontStyle: 'italic' },
  tabsRow: { flexDirection: 'row', marginBottom: Theme.spacing.lg, gap: Theme.spacing.sm },
  tabBtn: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
    borderRadius: Theme.radius.medium,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    alignItems: 'center',
  },
  tabBtnActive: { borderColor: Theme.colors.primary, backgroundColor: 'rgba(37, 99, 235, 0.12)' },
  tabBtnText: { fontFamily: Theme.typography.sans, fontSize: 13, fontWeight: '600', color: Theme.colors.textSecondary },
  tabBtnTextActive: { color: Theme.colors.primary, fontWeight: '700' },
  tabContentCard: { padding: Theme.spacing.xl },
  tabHeader: { fontFamily: Theme.typography.sans, fontSize: 16, fontWeight: '700', color: Theme.colors.textPrimary, marginBottom: 4 },
  tabSubtitle: { fontFamily: Theme.typography.sans, fontSize: 12, color: Theme.colors.textSecondary, marginBottom: Theme.spacing.xl },
  aiOwnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.medium,
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  aiOwnerIcon: { width: 40, height: 40, borderRadius: Theme.radius.medium, justifyContent: 'center', alignItems: 'center' },
  documentList: { gap: Theme.spacing.xs },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.20)',
  },
  docLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 },
  docTitle: { fontFamily: Theme.typography.sans, fontSize: 13, fontWeight: '700', color: Theme.colors.textPrimary },
  docDesc: { fontFamily: Theme.typography.sans, fontSize: 11, color: Theme.colors.textSecondary, marginTop: 2, lineHeight: 14 },
  settingsList: { gap: Theme.spacing.xs },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.20)',
  },
  settingsLabelCol: { flex: 1, paddingRight: Theme.spacing.lg },
  settingTitle: { fontFamily: Theme.typography.sans, fontSize: 13, fontWeight: '700', color: Theme.colors.textPrimary },
  settingDesc: { fontFamily: Theme.typography.sans, fontSize: 11, color: Theme.colors.textSecondary, marginTop: 2, lineHeight: 15 },
  settingsLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.20)',
  },
  settingsLinkLeft: { flexDirection: 'row', alignItems: 'center' },
  settingsLinkLabel: { fontFamily: Theme.typography.sans, fontSize: 13, color: Theme.colors.textPrimary, fontWeight: '700' },
});
