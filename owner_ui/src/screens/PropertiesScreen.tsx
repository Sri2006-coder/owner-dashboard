import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Modal,
} from 'react-native';
import {
  Search,
  Eye,
  Heart,
  Calendar,
  Trash2,
  TrendingUp,
  Plus,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Camera,
  ShieldCheck,
  Activity,
} from 'lucide-react-native';
import { Theme } from '../constants/dashboardTheme';
import { useApp, Property } from '../context/AppContext';
import { Card, Button, Badge } from '../components/DashboardComponents';
import { PropertyReVerifyCamera } from '../components/PropertyReVerifyCamera';
import {
  AI_PIPELINE_STEPS,
  getPipelineStepIndex,
  normalizePipelineStatus,
} from '../utils/verificationHelpers';

const FILTER_OPTIONS = ['All', 'Published', 'Verified', 'AI Analysis', 'AI Fraud Detection', 'Expiring Soon', 'Expired'];

function getListingStatusBadgeType(status: Property['listingStatus']) {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Expiring Soon':
      return 'warning';
    case 'Expired':
    case 'Hidden':
      return 'danger';
    case 'Archived':
    default:
      return 'neutral';
  }
}

function getVerificationStateBadgeType(state: Property['verificationState']) {
  switch (state) {
    case 'Verified':
      return 'success';
    case 'AI Analysis':
      return 'primary';
    case 'Verification Pending':
      return 'warning';
    case 'Rejected':
      return 'danger';
    default:
      return 'neutral';
  }
}

export const PropertiesScreen: React.FC = () => {
  const {
    properties,
    deleteProperty,
    setActiveScreen,
    getPropertyTrustCategory,
    getPropertyHealthCategory,
    ownerVerification,
  } = useApp();

  const isVerified = ownerVerification?.status === 'VERIFIED';
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [reVerifyPropertyId, setReVerifyPropertyId] = useState<string | null>(null);

  const selectedProperty = selectedPropertyId
    ? properties.find((p) => p.id === selectedPropertyId) ?? null
    : null;

  const reVerifyProperty = reVerifyPropertyId
    ? properties.find((p) => p.id === reVerifyPropertyId) ?? null
    : null;

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Expiring Soon') matchesFilter = p.listingStatus === 'Expiring Soon';
      else if (statusFilter === 'Expired')
        matchesFilter = p.listingStatus === 'Expired' || p.listingStatus === 'Hidden' || p.listingStatus === 'Archived';
      else matchesFilter = normalizePipelineStatus(p.status) === statusFilter || p.status === statusFilter;
    }

    return matchesSearch && matchesFilter;
  });

  const openReVerify = (propertyId: string) => {
    setReVerifyPropertyId(propertyId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterHeader}>
        <View style={styles.searchContainer}>
          <Search color={Theme.colors.textMuted} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, address, or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Theme.colors.textMuted}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          {FILTER_OPTIONS.map((filterVal) => {
            const isSelected = statusFilter === filterVal;
            return (
              <TouchableOpacity
                key={filterVal}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
                onPress={() => setStatusFilter(filterVal)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                  {filterVal}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {filteredProperties.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Search color={Theme.colors.textMuted} size={48} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No Properties Found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your filters or search query, or click the Add button to upload a new listing.
            </Text>
          </Card>
        ) : (
          <View style={styles.gridContainer}>
            {filteredProperties.map((property) => (
              <Card key={property.id} style={styles.propertyCard} className="card-tint-property">
                <TouchableOpacity
                  style={styles.propertyPressable}
                  onPress={() => setSelectedPropertyId(property.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: property.image }} style={styles.propertyImage} />
                    <View style={styles.statusBadgeOverlay}>
                      <Badge text={property.listingStatus} type={getListingStatusBadgeType(property.listingStatus)} />
                    </View>
                    <View style={styles.verificationBadgeOverlay}>
                      <Badge text={property.verificationState} type={getVerificationStateBadgeType(property.verificationState)} />
                    </View>
                  </View>

                  <View style={styles.propertyBody}>
                    <Text style={styles.propertyName} numberOfLines={1}>
                      {property.name}
                    </Text>
                    <Text style={styles.propertyLocation} numberOfLines={1}>
                      {property.location}
                    </Text>
                    <Text style={styles.propertyRent}>
                      {property.rent}
                      <Text style={{ fontSize: 13, fontWeight: 'normal', color: Theme.colors.textSecondary }}>
                        {' '}
                        / mo
                      </Text>
                    </Text>

                    <View style={styles.scoreRow}>
                      <View style={styles.scoreChip}>
                        <ShieldCheck color={Theme.colors.primary} size={12} />
                        <Text style={styles.scoreChipText}>Trust {property.trustScore}%</Text>
                        <Text style={styles.scoreChipSub}>{getPropertyTrustCategory(property.trustScore)}</Text>
                      </View>
                      <View style={styles.scoreChip}>
                        <Activity color={Theme.colors.success} size={12} />
                        <Text style={styles.scoreChipText}>Health {property.listingHealthScore}%</Text>
                        <Text style={styles.scoreChipSub}>{getPropertyHealthCategory(property.listingHealthScore)}</Text>
                      </View>
                    </View>

                    <View style={styles.daysRemainingRow}>
                      <Calendar color={Theme.colors.warning} size={14} />
                      <Text
                        style={[
                          styles.daysRemainingText,
                          property.daysRemaining <= 7 && { color: Theme.colors.warning },
                          property.listingStatus === 'Expired' && { color: Theme.colors.danger },
                        ]}
                      >
                        {property.listingStatus === 'Expired' ||
                        property.listingStatus === 'Hidden' ||
                        property.listingStatus === 'Archived'
                          ? 'Expired — re-verify to reactivate'
                          : `${property.daysRemaining} days remaining`}
                      </Text>
                    </View>

                    <View style={styles.metricsRow}>
                      <View style={styles.metricItem}>
                        <Eye color={Theme.colors.textSecondary} size={14} style={{ marginRight: 4 }} />
                        <Text style={styles.metricText}>{property.views} views</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Heart color={Theme.colors.textSecondary} size={14} style={{ marginRight: 4 }} />
                        <Text style={styles.metricText}>{property.favorites} saves</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Calendar color={Theme.colors.textSecondary} size={14} style={{ marginRight: 4 }} />
                        <Text style={styles.metricText}>{property.appointments} bookings</Text>
                      </View>
                    </View>

                    <View style={styles.actionsDivider} />
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, !isVerified && { opacity: 0.5 }]}
                        onPress={() => {
                          if (!isVerified) { alert('Complete verification to unlock this feature.'); return; }
                          setSelectedPropertyId(property.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <TrendingUp color={Theme.colors.primary} size={16} />
                        <Text style={[styles.actionBtnText, { color: Theme.colors.primary }]}>AI Pipeline</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, styles.reVerifyBtn, !isVerified && { opacity: 0.5 }]}
                        onPress={() => {
                          if (!isVerified) { alert('Complete verification to unlock this feature.'); return; }
                          openReVerify(property.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <Camera color="#FFFFFF" size={14} />
                        <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Re-Verify</Text>
                      </TouchableOpacity>

                      <View style={styles.rightActions}>
                        <TouchableOpacity
                          style={[styles.circleActionBtn, styles.deleteBtn, !isVerified && { opacity: 0.5 }]}
                          onPress={() => {
                            if (!isVerified) { alert('Complete verification to unlock this feature.'); return; }
                            deleteProperty(property.id);
                          }}
                          activeOpacity={0.7}
                        >
                          <Trash2 color={Theme.colors.danger} size={16} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {isVerified && (
        <TouchableOpacity style={styles.fab} onPress={() => setActiveScreen('add-property')} activeOpacity={0.8}>
          <Plus color="#FFFFFF" size={24} />
        </TouchableOpacity>
      )}

      <Modal
        visible={selectedProperty !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedPropertyId(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSelectedPropertyId(null)} />
          <View style={[styles.modalContent, isLargeScreen && styles.modalContentDesktop]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>AI Verification Pipeline</Text>
                <Text style={styles.modalSubtitle} numberOfLines={1}>
                  {selectedProperty?.name}
                </Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedPropertyId(null)}>
                <X color={Theme.colors.textPrimary} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollBody}>
              <View style={styles.trackerSummaryCard}>
                <Image source={{ uri: selectedProperty?.image }} style={styles.summaryImage} />
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryRent}>
                    {selectedProperty?.rent}
                    <Text style={{ fontSize: 11, fontWeight: 'normal', color: '#64748B' }}> / month</Text>
                  </Text>
                  <Text style={styles.summaryLoc} numberOfLines={1}>
                    {selectedProperty?.location}
                  </Text>
                  <View style={styles.summaryBadges}>
                    <Badge
                      text={selectedProperty?.listingStatus || 'Active'}
                      type={selectedProperty ? getListingStatusBadgeType(selectedProperty.listingStatus) : 'neutral'}
                    />
                    <Badge
                      text={selectedProperty?.verificationState || 'Pending'}
                      type={
                        selectedProperty
                          ? getVerificationStateBadgeType(selectedProperty.verificationState)
                          : 'neutral'
                      }
                    />
                  </View>
                  {selectedProperty ? (
                    <Text style={styles.summaryScores}>
                      Trust {selectedProperty.trustScore}% · Health {selectedProperty.listingHealthScore}% ·{' '}
                      {selectedProperty.daysRemaining}d left
                    </Text>
                  ) : null}
                </View>
              </View>

              <Text style={styles.trackerProcessHeader}>Automated AI Verification Pipeline</Text>

              <View style={styles.trackerTimeline}>
                {selectedProperty &&
                  AI_PIPELINE_STEPS.map((step, idx) => {
                    const activeIdx = getPipelineStepIndex(selectedProperty.status);
                    const isCompleted = idx < activeIdx;
                    const isActive = idx === activeIdx;
                    const isPending = idx > activeIdx;

                    let stepColor = '#CBD5E1';
                    let stepIcon = <Clock color={stepColor} size={14} />;
                    if (isCompleted) {
                      stepColor = Theme.colors.success;
                      stepIcon = <CheckCircle2 color="#FFFFFF" size={14} />;
                    } else if (isActive) {
                      stepColor = Theme.colors.primary;
                      stepIcon = <AlertCircle color="#FFFFFF" size={14} />;
                    }

                    return (
                      <View key={step.key} style={styles.trackerStepRow}>
                        <View style={styles.trackerStepLeft}>
                          <View
                            style={[
                              styles.trackerStepDot,
                              { backgroundColor: stepColor },
                              isCompleted && styles.trackerStepDotCompleted,
                              isActive && styles.trackerStepDotActive,
                              isPending && styles.trackerStepDotPending,
                            ]}
                          >
                            {stepIcon}
                          </View>
                          {idx < AI_PIPELINE_STEPS.length - 1 && (
                            <View
                              style={[
                                styles.trackerStepConnector,
                                { backgroundColor: idx < activeIdx ? Theme.colors.success : 'rgba(148, 163, 184, 0.15)' },
                              ]}
                            />
                          )}
                        </View>
                        <View style={styles.trackerStepRight}>
                          <Text
                            style={[
                              styles.trackerStepLabel,
                              isActive && styles.trackerStepLabelActive,
                              isCompleted && styles.trackerStepLabelCompleted,
                              isPending && styles.trackerStepLabelPending,
                            ]}
                          >
                            {step.label}
                          </Text>
                          <Text style={styles.trackerStepDesc}>{step.desc}</Text>
                        </View>
                      </View>
                    );
                  })}
              </View>

              {(selectedProperty?.status === 'Verification Failed' ||
                selectedProperty?.status === 'Risk Detected' ||
                selectedProperty?.duplicateRisk) && (
                <View style={[styles.alertBanner, { backgroundColor: Theme.colors.lightDanger }]}>
                  <AlertCircle color={Theme.colors.danger} size={18} style={{ marginRight: 8, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.alertTitle, { color: Theme.colors.danger }]}>AI Risk Detected</Text>
                    <Text style={[styles.alertText, { color: '#B91C1C' }]}>
                      Automated checks flagged this listing. Use live camera re-verification to restore trust and
                      visibility.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              {selectedProperty ? (
                <Button
                  title="Re-Verify Property"
                  icon={Camera}
                  variant="primary"
                  onPress={() => {
                    setSelectedPropertyId(null);
                    openReVerify(selectedProperty.id);
                  }}
                  style={{ width: '100%', marginBottom: Theme.spacing.sm }}
                />
              ) : null}
              <Button title="Done" variant="outline" onPress={() => setSelectedPropertyId(null)} style={{ width: '100%' }} />
            </View>
          </View>
        </View>
      </Modal>

      {reVerifyProperty ? (
        <PropertyReVerifyCamera
          visible={reVerifyPropertyId !== null}
          propertyId={reVerifyProperty.id}
          propertyName={reVerifyProperty.name}
          onClose={() => setReVerifyPropertyId(null)}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  filterHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.30)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      },
    }),
  } as any,
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.20)',
    borderRadius: Theme.radius.medium,
    paddingHorizontal: Theme.spacing.md,
    height: 44,
    marginBottom: Theme.spacing.md,
  },
  searchIcon: { marginRight: Theme.spacing.sm },
  searchInput: {
    flex: 1,
    fontFamily: Theme.typography.sans,
    fontSize: 14,
    color: Theme.colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: 'none' } as object }),
  },
  filterScroll: { flexDirection: 'row' },
  filterScrollContent: { gap: Theme.spacing.sm, paddingRight: Theme.spacing.lg },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  filterPillActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  filterPillText: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  filterPillTextActive: { color: '#FFFFFF' },
  listContent: { padding: Theme.spacing.lg, paddingBottom: 80 },
  emptyCard: { padding: Theme.spacing.xxxl, alignItems: 'center', justifyContent: 'center' },
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
    maxWidth: 260,
  },
  gridContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  propertyCard: {
    padding: 0,
    overflow: 'hidden',
    flex: 1,
    minWidth: Platform.OS === 'web' ? 320 : '100%',
    marginBottom: 0,
  },
  propertyPressable: { width: '100%' },
  imageContainer: { width: '100%', height: 180, backgroundColor: '#E2E8F0', position: 'relative' },
  propertyImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  statusBadgeOverlay: { position: 'absolute', top: 12, right: 12 },
  verificationBadgeOverlay: { position: 'absolute', top: 12, left: 12 },
  propertyBody: { padding: Theme.spacing.lg },
  propertyName: {
    fontFamily: Theme.typography.sans,
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  propertyLocation: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginBottom: 8,
  },
  propertyRent: {
    fontFamily: Theme.typography.sans,
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
  },
  scoreRow: { flexDirection: 'row', gap: Theme.spacing.sm, marginBottom: Theme.spacing.sm },
  scoreChip: {
    flex: 1,
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderRadius: Theme.radius.small,
    padding: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.10)',
  },
  scoreChipText: {
    fontFamily: Theme.typography.sans,
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginTop: 4,
  },
  scoreChipSub: {
    fontFamily: Theme.typography.sans,
    fontSize: 9,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  daysRemainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Theme.spacing.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Theme.colors.lightWarning,
    borderRadius: Theme.radius.small,
  },
  daysRemainingText: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  metricItem: { flexDirection: 'row', alignItems: 'center' },
  metricText: {
    fontFamily: Theme.typography.sans,
    fontSize: 11,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  actionsDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.20)', marginBottom: Theme.spacing.md },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Theme.radius.small,
  },
  reVerifyBtn: { backgroundColor: Theme.colors.primary, borderRadius: Theme.radius.small },
  actionBtnText: { fontFamily: Theme.typography.sans, fontSize: 12, fontWeight: '700', marginLeft: 4 },
  rightActions: { flexDirection: 'row', gap: 8 },
  circleActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: { backgroundColor: Theme.colors.lightDanger, borderColor: 'transparent' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: Theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows,
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  modalBackdrop: { ...StyleSheet.absoluteFill },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderTopLeftRadius: Theme.radius.large * 1.5,
    borderTopRightRadius: Theme.radius.large * 1.5,
    maxHeight: '85%',
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
    maxWidth: 550,
    alignSelf: 'center',
    width: '90%',
    marginBottom: 'auto',
    marginTop: 'auto',
    borderRadius: Theme.radius.large * 1.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.30)',
  },
  modalTitle: {
    fontFamily: Theme.typography.sans,
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  modalSubtitle: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginTop: 2,
    maxWidth: 240,
  },
  closeBtn: { padding: Theme.spacing.xs },
  modalScrollBody: { padding: Theme.spacing.xl },
  trackerSummaryCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderRadius: Theme.radius.medium,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.10)',
  },
  summaryImage: { width: 60, height: 60, borderRadius: Theme.radius.small, marginRight: Theme.spacing.md },
  summaryInfo: { flex: 1, justifyContent: 'center' },
  summaryRent: {
    fontFamily: Theme.typography.sans,
    fontSize: 15,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  summaryLoc: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  summaryBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  summaryScores: {
    fontFamily: Theme.typography.sans,
    fontSize: 10,
    color: Theme.colors.textMuted,
    marginTop: 6,
  },
  trackerProcessHeader: {
    fontFamily: Theme.typography.sans,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.lg,
  },
  trackerTimeline: { paddingLeft: 6, marginBottom: Theme.spacing.xl },
  trackerStepRow: { flexDirection: 'row', minHeight: 60 },
  trackerStepLeft: { alignItems: 'center', width: 24, marginRight: Theme.spacing.lg },
  trackerStepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  trackerStepDotCompleted: { backgroundColor: Theme.colors.success },
  trackerStepDotActive: {
    backgroundColor: Theme.colors.primary,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...Platform.select({ web: { boxShadow: '0 0 0 2px #2563EB' } as object }),
  },
  trackerStepDotPending: { backgroundColor: 'rgba(148, 163, 184, 0.3)' },
  trackerStepConnector: {
    width: 2,
    flexGrow: 1,
    position: 'absolute',
    top: 20,
    bottom: -10,
    zIndex: 1,
  },
  trackerStepLabel: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  trackerStepLabelCompleted: { color: Theme.colors.success },
  trackerStepLabelActive: { color: Theme.colors.primary },
  trackerStepLabelPending: { color: Theme.colors.textMuted },
  trackerStepRight: { flex: 1 },
  trackerStepDesc: {
    fontFamily: Theme.typography.sans,
    fontSize: 11,
    color: Theme.colors.textSecondary,
    lineHeight: 14,
  },
  alertBanner: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.medium,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  alertTitle: { fontFamily: Theme.typography.sans, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  alertText: { fontFamily: Theme.typography.sans, fontSize: 11, lineHeight: 15 },
  modalFooter: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.30)',
  },
});
