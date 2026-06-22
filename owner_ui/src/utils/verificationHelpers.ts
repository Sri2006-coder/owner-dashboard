/**
 * Core verification, expiry, trust score, and listing health utilities.
 * Used by AppContext and (in later phases) screen components.
 */

export const LISTING_VALIDITY_DAYS = 30;
export const HIDDEN_AFTER_EXPIRY_DAYS = 7; // Day 37
export const ARCHIVED_AFTER_EXPIRY_DAYS = 15; // Day 45
export const EXPIRY_WARNING_DAYS = [7, 3, 0] as const;

export type PropertyPipelineStatus =
  | 'Submitted'
  | 'AI Fraud Detection'
  | 'Duplicate Check'
  | 'Live Verification'
  | 'AI Analysis'
  | 'Trust Score Evaluation'
  | 'Verified'
  | 'Published'
  | 'Risk Detected'
  | 'Verification Failed'
  | 'Draft'
  /** @deprecated Legacy screen compat — maps to AI Fraud Detection */
  | 'Fraud Check'
  /** @deprecated Legacy screen compat — maps to AI Analysis */
  | 'Admin Review'
  /** @deprecated Legacy screen compat — maps to Verified */
  | 'Approved';

export type PropertyListingStatus =
  | 'Active'
  | 'Expiring Soon'
  | 'Expired'
  | 'Hidden'
  | 'Archived';

export type PropertyVerificationState =
  | 'Verification Pending'
  | 'AI Analysis'
  | 'Verified'
  | 'Rejected';

export type PropertyVisibility = 'public' | 'hidden' | 'archived';

export type VerificationImageType = 'front' | 'entrance' | 'interior';

export type ScoreCategory = 'Excellent' | 'Good' | 'Needs Attention' | 'High Risk' | 'Needs Review';

export interface WatermarkMetadata {
  date: string;
  time: string;
  propertyId: string;
  capturedAt: string;
}

export interface VerificationImage {
  uri: string;
  type: VerificationImageType;
  watermarked: boolean;
  watermark: WatermarkMetadata;
}

export interface VerificationStatusHistoryEntry {
  status: PropertyVerificationState | PropertyPipelineStatus;
  timestamp: string;
  note?: string;
}

export interface VerificationRecord {
  id: string;
  date: string;
  images: VerificationImage[];
  trustScore: number;
  listingHealthScore: number;
  statusHistory: VerificationStatusHistoryEntry[];
  aiChecks: AICheckResult[];
}

export interface AICheckResult {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface VerificationStats {
  verified: number;
  expiringSoon: number;
  expired: number;
  pendingVerification: number;
  rejected: number;
}

export interface PropertyTrustFactors {
  recentVerification: boolean;
  activeListing: boolean;
  noComplaints: boolean;
  successfulAiValidation: boolean;
  verifiedOwner: boolean;
  noDuplicateDetection: boolean;
  daysSinceVerification: number;
}

export interface ListingHealthFactors {
  descriptionCompleteness: number; // 0–100
  imageCount: number;
  verificationFreshness: number; // 0–100
  trustScore: number;
  complaintCount: number;
}

export interface DelistingResult {
  listingStatus: PropertyListingStatus;
  visibility: PropertyVisibility;
  daysSincePublish: number;
}

export interface ExpiryNotificationFlags {
  expiryNotified7: boolean;
  expiryNotified3: boolean;
  expiryNotified0: boolean;
}

export const AI_PIPELINE_STEPS: { key: PropertyPipelineStatus; label: string; desc: string }[] = [
  { key: 'Submitted', label: 'Submitted', desc: 'Listing received and parsed by platform' },
  { key: 'AI Fraud Detection', label: 'AI Fraud Detection', desc: 'Automated fraud and anomaly scanning' },
  { key: 'Duplicate Check', label: 'Duplicate Listing Check', desc: 'Cross-checking images and addresses' },
  { key: 'Live Verification', label: 'Live Property Verification', desc: 'Owner live camera capture required' },
  { key: 'AI Analysis', label: 'AI Analysis', desc: 'Computer vision and listing consistency checks' },
  { key: 'Trust Score Evaluation', label: 'Trust Score Evaluation', desc: 'Composite trust score computed' },
  { key: 'Verified', label: 'Verified', desc: 'Property passed all automated checks' },
  { key: 'Published', label: 'Published', desc: 'Live on rental search for tenants' },
];

export function normalizePipelineStatus(status: PropertyPipelineStatus): PropertyPipelineStatus {
  switch (status) {
    case 'Fraud Check':
      return 'AI Fraud Detection';
    case 'Admin Review':
      return 'AI Analysis';
    case 'Approved':
      return 'Verified';
    default:
      return status;
  }
}

export function getPipelineStepIndex(status: PropertyPipelineStatus): number {
  const normalized = normalizePipelineStatus(status);
  const idx = AI_PIPELINE_STEPS.findIndex((s) => s.key === normalized);
  if (idx >= 0) return idx;
  if (normalized === 'Risk Detected' || normalized === 'Verification Failed') return 1;
  if (normalized === 'Draft') return -1;
  return 0;
}

export function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toISODate(date: Date): string {
  return date.toISOString();
}

export function calculateDaysRemaining(expiresAt: string, now: Date = new Date()): number {
  const expiry = new Date(expiresAt);
  return Math.max(0, daysBetween(now, expiry));
}

export function calculateExpiresAt(publishedAt: string): string {
  return addDays(new Date(publishedAt), LISTING_VALIDITY_DAYS).toISOString();
}

export function computeDelistingState(
  publishedAt: string,
  now: Date = new Date()
): DelistingResult {
  const published = new Date(publishedAt);
  const daysSincePublish = daysBetween(published, now);

  if (daysSincePublish >= LISTING_VALIDITY_DAYS + ARCHIVED_AFTER_EXPIRY_DAYS) {
    return { listingStatus: 'Archived', visibility: 'archived', daysSincePublish };
  }
  if (daysSincePublish >= LISTING_VALIDITY_DAYS + HIDDEN_AFTER_EXPIRY_DAYS) {
    return { listingStatus: 'Hidden', visibility: 'hidden', daysSincePublish };
  }
  if (daysSincePublish >= LISTING_VALIDITY_DAYS) {
    return { listingStatus: 'Expired', visibility: 'hidden', daysSincePublish };
  }

  const daysRemaining = LISTING_VALIDITY_DAYS - daysSincePublish;
  if (daysRemaining <= 7) {
    return { listingStatus: 'Expiring Soon', visibility: 'public', daysSincePublish };
  }
  return { listingStatus: 'Active', visibility: 'public', daysSincePublish };
}

export function isPropertyTenantVisible(
  listingStatus: PropertyListingStatus,
  visibility: PropertyVisibility,
  pipelineStatus: PropertyPipelineStatus
): boolean {
  if (visibility !== 'public') return false;
  if (listingStatus === 'Expired' || listingStatus === 'Hidden' || listingStatus === 'Archived') {
    return false;
  }
  const normalized = normalizePipelineStatus(pipelineStatus);
  return normalized === 'Published';
}

export function getTrustScoreCategory(score: number): ScoreCategory {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs Attention';
  return 'High Risk';
}

export function getHealthScoreCategory(score: number): ScoreCategory {
  if (score >= 95) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Needs Review';
  return 'High Risk';
}

export function calculatePropertyTrustScore(factors: PropertyTrustFactors): number {
  let score = 0;
  if (factors.recentVerification) score += 25;
  if (factors.activeListing) score += 15;
  if (factors.noComplaints) score += 15;
  if (factors.successfulAiValidation) score += 20;
  if (factors.verifiedOwner) score += 15;
  if (factors.noDuplicateDetection) score += 10;

  if (factors.daysSinceVerification <= 7) score = Math.min(100, score + 5);
  else if (factors.daysSinceVerification > 25) score = Math.max(0, score - 10);

  return Math.min(100, Math.max(0, score));
}

export function calculateListingHealthScore(factors: ListingHealthFactors): number {
  const descriptionWeight = factors.descriptionCompleteness * 0.2;
  const imageWeight = Math.min(factors.imageCount, 10) * 2;
  const freshnessWeight = factors.verificationFreshness * 0.25;
  const trustWeight = factors.trustScore * 0.35;
  const complaintPenalty = Math.min(factors.complaintCount * 8, 30);

  const raw = descriptionWeight + imageWeight + freshnessWeight + trustWeight - complaintPenalty;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

export function buildWatermarkMetadata(propertyId: string, capturedAt: Date = new Date()): WatermarkMetadata {
  return {
    date: capturedAt.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    time: capturedAt.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    propertyId,
    capturedAt: capturedAt.toISOString(),
  };
}

export function formatWatermarkLabel(watermark: WatermarkMetadata): string {
  return `${watermark.date} ${watermark.time} · ID ${watermark.propertyId}`;
}

export function computeVerificationFreshness(lastVerifiedAt: string | null, now: Date = new Date()): number {
  if (!lastVerifiedAt) return 0;
  const days = daysBetween(new Date(lastVerifiedAt), now);
  if (days <= 7) return 100;
  if (days <= 14) return 85;
  if (days <= 21) return 70;
  if (days <= 30) return 50;
  return 25;
}

export function computeDescriptionCompleteness(description: string): number {
  const len = description.trim().length;
  if (len >= 200) return 100;
  if (len >= 120) return 85;
  if (len >= 60) return 65;
  if (len >= 20) return 40;
  return 15;
}

export function daysSinceVerification(lastVerifiedAt: string | null, now: Date = new Date()): number {
  if (!lastVerifiedAt) return 999;
  return daysBetween(new Date(lastVerifiedAt), now);
}

export interface SimulateAIValidationInput {
  propertyId: string;
  images: VerificationImage[];
  previousVerifiedAt: string | null;
  complaintCount: number;
  duplicateRisk: boolean;
}

export interface SimulateAIValidationResult {
  passed: boolean;
  verificationState: PropertyVerificationState;
  pipelineStatus: PropertyPipelineStatus;
  checks: AICheckResult[];
  trustScore: number;
  listingHealthScore: number;
}

export function simulateAIValidation(
  input: SimulateAIValidationInput,
  factors: {
    verifiedOwner: boolean;
    descriptionCompleteness: number;
    imageCount: number;
    activeListing: boolean;
  }
): SimulateAIValidationResult {
  const now = new Date();
  const hasRequiredShots =
    input.images.some((i) => i.type === 'front') && input.images.some((i) => i.type === 'entrance');

  const freshnessDays = input.previousVerifiedAt
    ? daysBetween(new Date(input.previousVerifiedAt), now)
    : LISTING_VALIDITY_DAYS;

  const imageFresh = freshnessDays <= 30;
  const noDuplicateImages = !input.duplicateRisk;
  const listingConsistent = hasRequiredShots && input.images.every((i) => i.watermarked);
  const propertyExists = hasRequiredShots;
  const noSuspiciousModification = input.complaintCount === 0;

  const checks: AICheckResult[] = [
    {
      id: 'freshness',
      label: 'Image Freshness',
      passed: imageFresh,
      detail: imageFresh
        ? 'Capture timestamps within acceptable freshness window.'
        : 'Verification photos appear stale compared to previous capture.',
    },
    {
      id: 'duplicate',
      label: 'Duplicate Image Detection',
      passed: noDuplicateImages,
      detail: noDuplicateImages
        ? 'No duplicate image hashes detected across listings.'
        : 'Potential duplicate image match found in platform database.',
    },
    {
      id: 'consistency',
      label: 'Listing Consistency',
      passed: listingConsistent,
      detail: listingConsistent
        ? 'Live captures align with listing metadata and required views.'
        : 'Missing required views or watermark authenticity markers.',
    },
    {
      id: 'existence',
      label: 'Property Existence Validation',
      passed: propertyExists,
      detail: propertyExists
        ? 'Front and entrance views confirm physical property presence.'
        : 'Insufficient live capture evidence for property existence.',
    },
    {
      id: 'modification',
      label: 'Suspicious Modification Detection',
      passed: noSuspiciousModification,
      detail: noSuspiciousModification
        ? 'No suspicious listing modification patterns detected.'
        : 'Complaint signals suggest possible misleading modifications.',
    },
  ];

  const passed = checks.every((c) => c.passed);
  const trustScore = calculatePropertyTrustScore({
    recentVerification: passed,
    activeListing: factors.activeListing,
    noComplaints: input.complaintCount === 0,
    successfulAiValidation: passed,
    verifiedOwner: factors.verifiedOwner,
    noDuplicateDetection: noDuplicateImages,
    daysSinceVerification: 0,
  });

  const listingHealthScore = calculateListingHealthScore({
    descriptionCompleteness: factors.descriptionCompleteness,
    imageCount: factors.imageCount,
    verificationFreshness: passed ? 100 : computeVerificationFreshness(input.previousVerifiedAt, now),
    trustScore,
    complaintCount: input.complaintCount,
  });

  return {
    passed,
    verificationState: passed ? 'Verified' : 'Rejected',
    pipelineStatus: passed ? 'Verified' : 'Verification Failed',
    checks,
    trustScore,
    listingHealthScore,
  };
}

export function computeVerificationStats(
  properties: {
    verificationState: PropertyVerificationState;
    listingStatus: PropertyListingStatus;
  }[]
): VerificationStats {
  return {
    verified: properties.filter((p) => p.verificationState === 'Verified').length,
    expiringSoon: properties.filter((p) => p.listingStatus === 'Expiring Soon').length,
    expired: properties.filter(
      (p) => p.listingStatus === 'Expired' || p.listingStatus === 'Hidden' || p.listingStatus === 'Archived'
    ).length,
    pendingVerification: properties.filter(
      (p) => p.verificationState === 'Verification Pending' || p.verificationState === 'AI Analysis'
    ).length,
    rejected: properties.filter((p) => p.verificationState === 'Rejected').length,
  };
}

export function getExpiryNotificationType(
  daysRemaining: number
): 'expiryWarning7' | 'expiryWarning3' | 'expired' | null {
  if (daysRemaining === 7) return 'expiryWarning7';
  if (daysRemaining === 3) return 'expiryWarning3';
  if (daysRemaining === 0) return 'expired';
  return null;
}

export const AI_PIPELINE_SEQUENCE: PropertyPipelineStatus[] = [
  'Submitted',
  'AI Fraud Detection',
  'Duplicate Check',
  'Live Verification',
  'AI Analysis',
  'Trust Score Evaluation',
  'Verified',
  'Published',
];
