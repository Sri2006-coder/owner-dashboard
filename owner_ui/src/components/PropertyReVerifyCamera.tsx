import React, { useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Camera, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react-native';
import { Theme } from '../constants/dashboardTheme';
import { useApp, ReVerifyImageInput } from '../context/AppContext';
import { formatWatermarkLabel, buildWatermarkMetadata } from '../utils/verificationHelpers';
import { Button } from './DashboardComponents';

type CaptureStep = 'front' | 'entrance' | 'interior';

const REQUIRED_STEPS: CaptureStep[] = ['front', 'entrance'];
const ALL_STEPS: CaptureStep[] = ['front', 'entrance', 'interior'];

const STEP_LABELS: Record<CaptureStep, string> = {
  front: 'Front View',
  entrance: 'Entrance View',
  interior: 'Interior View (Optional)',
};

interface CapturedShot {
  uri: string;
  type: CaptureStep;
  watermarkLabel: string;
}

export interface PropertyReVerifyCameraProps {
  visible: boolean;
  propertyId: string;
  propertyName: string;
  onClose: () => void;
  onComplete?: () => void;
}

export const PropertyReVerifyCamera: React.FC<PropertyReVerifyCameraProps> = ({
  visible,
  propertyId,
  propertyName,
  onClose,
  onComplete,
}) => {
  const { reVerifyProperty, isReVerifying } = useApp();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [captures, setCaptures] = useState<CapturedShot[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentStep = ALL_STEPS[currentStepIndex];
  const isOptionalStep = currentStep === 'interior';
  const requiredComplete = REQUIRED_STEPS.every((step) => captures.some((c) => c.type === step));

  const resetSession = useCallback(() => {
    setCurrentStepIndex(0);
    setCaptures([]);
    setPreviewUri(null);
    setError(null);
    setCameraReady(false);
  }, []);

  const handleClose = () => {
    if (isReVerifying) return;
    resetSession();
    onClose();
  };

  const handleCapture = async () => {
    if (!cameraRef.current || !cameraReady) {
      setError('Camera is not ready. Please wait a moment and try again.');
      return;
    }

    try {
      setError(null);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: Platform.OS === 'android',
      });

      if (!photo?.uri) {
        setError('Failed to capture photo. Please try again.');
        return;
      }

      const watermark = buildWatermarkMetadata(propertyId);
      setPreviewUri(photo.uri);
      setCaptures((prev) => {
        const filtered = prev.filter((c) => c.type !== currentStep);
        return [
          ...filtered,
          {
            uri: photo.uri,
            type: currentStep,
            watermarkLabel: formatWatermarkLabel(watermark),
          },
        ];
      });
    } catch {
      setError('Camera capture failed. Live camera capture is required — gallery uploads are not allowed.');
    }
  };

  const handleRetake = () => {
    setPreviewUri(null);
    setCaptures((prev) => prev.filter((c) => c.type !== currentStep));
  };

  const handleConfirmShot = () => {
    setPreviewUri(null);
    if (currentStepIndex < ALL_STEPS.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const handleSkipOptional = () => {
    if (isOptionalStep) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!requiredComplete) {
      setError('Front View and Entrance View are required before submitting.');
      return;
    }

    const payload: ReVerifyImageInput[] = captures.map((c) => ({
      uri: c.uri,
      type: c.type,
    }));

    try {
      await reVerifyProperty(propertyId, payload);
      resetSession();
      onComplete?.();
      onClose();
    } catch {
      setError('Verification submission failed. Please try again.');
    }
  };

  const renderPermissionState = () => {
    if (!permission) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={Theme.colors.primary} />
          <Text style={styles.permissionText}>Checking camera permissions…</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.centered}>
          <AlertCircle color={Theme.colors.warning} size={40} style={{ marginBottom: 12 }} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Live property re-verification requires camera access. Gallery uploads are not permitted.
          </Text>
          <Button title="Grant Camera Permission" variant="primary" onPress={requestPermission} style={{ marginTop: 16 }} />
        </View>
      );
    }

    return null;
  };

  const permissionBlock = renderPermissionState();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle}>Re-Verify Property</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{propertyName}</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} disabled={isReVerifying}>
            <X color={Theme.colors.textPrimary} size={22} />
          </TouchableOpacity>
        </View>

        <View style={styles.noticeBanner}>
          <ShieldCheck color={Theme.colors.primary} size={16} style={{ marginRight: 8 }} />
          <Text style={styles.noticeText}>
            Live camera only · Photos watermarked with date, time, and property ID
          </Text>
        </View>

        <View style={styles.stepIndicator}>
          {ALL_STEPS.map((step, idx) => {
            const done = captures.some((c) => c.type === step);
            const active = idx === currentStepIndex;
            return (
              <View key={step} style={styles.stepPillRow}>
                <View style={[styles.stepDot, done && styles.stepDotDone, active && styles.stepDotActive]}>
                  {done ? <CheckCircle2 color="#FFF" size={12} /> : <Text style={styles.stepDotText}>{idx + 1}</Text>}
                </View>
                <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{STEP_LABELS[step]}</Text>
              </View>
            );
          })}
        </View>

        {permissionBlock ? (
          permissionBlock
        ) : (
          <View style={styles.cameraSection}>
            {previewUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: previewUri }} style={styles.previewImage} />
                <View style={styles.watermarkOverlay}>
                  <Text style={styles.watermarkText}>
                    {formatWatermarkLabel(buildWatermarkMetadata(propertyId))}
                  </Text>
                </View>
                <View style={styles.previewActions}>
                  <Button title="Retake" variant="outline" onPress={handleRetake} style={styles.previewBtn} />
                  <Button title="Use Photo" variant="primary" onPress={handleConfirmShot} style={styles.previewBtn} />
                </View>
              </View>
            ) : (
              <View style={styles.cameraWrapper}>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="back"
                  onCameraReady={() => setCameraReady(true)}
                />
                <View style={styles.cameraOverlay}>
                  <Text style={styles.captureHint}>Capture: {STEP_LABELS[currentStep]}</Text>
                  <View style={styles.watermarkPreview}>
                    <Text style={styles.watermarkPreviewText}>
                      {formatWatermarkLabel(buildWatermarkMetadata(propertyId))}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.shutterBtn} onPress={handleCapture} activeOpacity={0.85}>
                  <Camera color="#FFFFFF" size={28} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
          {captures.map((shot) => (
            <View key={`${shot.type}-${shot.uri}`} style={styles.thumbItem}>
              <Image source={{ uri: shot.uri }} style={styles.thumbImage} />
              <Text style={styles.thumbLabel}>{STEP_LABELS[shot.type]}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          {isOptionalStep && !previewUri ? (
            <Button
              title="Skip Interior & Submit"
              variant="outline"
              onPress={handleSkipOptional}
              disabled={!requiredComplete || isReVerifying}
              loading={isReVerifying}
              style={styles.footerBtn}
            />
          ) : null}
          <Button
            title={isReVerifying ? 'Submitting…' : 'Submit Verification'}
            variant="primary"
            onPress={handleSubmit}
            disabled={!requiredComplete || isReVerifying || !!previewUri}
            loading={isReVerifying}
            style={styles.footerBtn}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTextCol: {
    flex: 1,
    paddingRight: Theme.spacing.md,
  },
  headerTitle: {
    fontFamily: Theme.typography.sans,
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: Theme.spacing.xs,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.lightBlue,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  stepPillRow: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepDotDone: {
    backgroundColor: Theme.colors.success,
  },
  stepDotActive: {
    backgroundColor: Theme.colors.primary,
  },
  stepDotText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  stepLabel: {
    fontFamily: Theme.typography.sans,
    fontSize: 9,
    color: Theme.colors.textMuted,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  cameraSection: {
    flex: 1,
    minHeight: 280,
    backgroundColor: '#0F172A',
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: Theme.spacing.lg,
    left: Theme.spacing.lg,
    right: Theme.spacing.lg,
  },
  captureHint: {
    fontFamily: Theme.typography.sans,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  watermarkPreview: {
    marginTop: Theme.spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  watermarkPreviewText: {
    fontFamily: Theme.typography.sans,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  shutterBtn: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  watermarkOverlay: {
    position: 'absolute',
    bottom: 80,
    left: Theme.spacing.lg,
    right: Theme.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.small,
  },
  watermarkText: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  previewActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  previewBtn: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xxxl,
  },
  permissionTitle: {
    fontFamily: Theme.typography.sans,
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: Theme.colors.lightDanger,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
  },
  errorText: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    color: Theme.colors.danger,
    fontWeight: '600',
  },
  thumbRow: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  thumbItem: {
    width: 72,
    marginRight: Theme.spacing.sm,
  },
  thumbImage: {
    width: 72,
    height: 72,
    borderRadius: Theme.radius.small,
    backgroundColor: Theme.colors.border,
  },
  thumbLabel: {
    fontFamily: Theme.typography.sans,
    fontSize: 9,
    color: Theme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  footerBtn: {
    flex: 1,
  },
});

export default PropertyReVerifyCamera;
