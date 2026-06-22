import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Camera, AlertCircle } from 'lucide-react-native';
import { Theme } from '../constants/dashboardTheme';
import { Button } from './DashboardComponents';

interface SelfieCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

export const SelfieCameraModal: React.FC<SelfieCameraModalProps> = ({ visible, onClose, onCapture }) => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const handleCapture = async () => {
    if (!cameraRef.current || !cameraReady) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) setPreviewUri(photo.uri);
    } catch (e) {
      console.error('Failed to capture selfie', e);
    }
  };

  const handleConfirm = () => {
    if (previewUri) {
      onCapture(previewUri);
      setPreviewUri(null);
      onClose();
    }
  };

  const handleRetake = () => setPreviewUri(null);

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
          <Text style={styles.permissionText}>Live selfie verification requires camera access.</Text>
          <Button title="Grant Camera Permission" variant="primary" onPress={requestPermission} style={{ marginTop: 16 }} />
        </View>
      );
    }
    return null;
  };

  const permissionBlock = renderPermissionState();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Take Live Selfie</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color={Theme.colors.textPrimary} size={22} />
          </TouchableOpacity>
        </View>

        {permissionBlock ? (
          permissionBlock
        ) : (
          <View style={styles.cameraSection}>
            {previewUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: previewUri }} style={styles.previewImage} />
                <View style={styles.previewActions}>
                  <Button title="Retake" variant="outline" onPress={handleRetake} style={styles.previewBtn} />
                  <Button title="Use Photo" variant="primary" onPress={handleConfirm} style={styles.previewBtn} />
                </View>
              </View>
            ) : (
              <View style={styles.cameraWrapper}>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="front"
                  onCameraReady={() => setCameraReady(true)}
                />
                <TouchableOpacity style={styles.shutterBtn} onPress={handleCapture} activeOpacity={0.85}>
                  <Camera color="#FFFFFF" size={28} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
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
  headerTitle: { fontFamily: Theme.typography.sans, fontSize: 18, fontWeight: '700', color: Theme.colors.textPrimary },
  closeBtn: { padding: Theme.spacing.xs },
  cameraSection: { flex: 1, backgroundColor: '#000000' },
  cameraWrapper: { flex: 1, position: 'relative' },
  camera: { flex: 1 },
  shutterBtn: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -36,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  previewContainer: { flex: 1, position: 'relative' },
  previewImage: { flex: 1, resizeMode: 'cover' },
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
  previewBtn: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Theme.spacing.xxxl },
  permissionTitle: { fontFamily: Theme.typography.sans, fontSize: 16, fontWeight: '700', color: Theme.colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  permissionText: { fontFamily: Theme.typography.sans, fontSize: 13, color: Theme.colors.textSecondary, textAlign: 'center', lineHeight: 18 },
});
