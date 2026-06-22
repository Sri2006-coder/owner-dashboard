import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import { ShieldCheck, FileText, UploadCloud, CheckCircle, AlertCircle, Trash2 } from 'lucide-react-native';
import { Theme } from '../constants/dashboardTheme';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge } from '../components/DashboardComponents';
import { SelfieCameraModal } from '../components/SelfieCameraModal';
import { api } from '../utils/api';

export const VerificationScreen: React.FC = () => {
  const { ownerVerification, refreshOwnerVerification, ownerProfile } = useApp();
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelfieModalVisible, setIsSelfieModalVisible] = useState(false);

  const isVerified = ownerVerification?.status === 'VERIFIED';
  const isPending = ownerVerification?.status === 'PENDING';
  const isRejected = ownerVerification?.status === 'REJECTED';

  const documents = [
    { id: 'aadhaar', label: 'Aadhaar Card', desc: 'Government issued identity card', required: true, value: ownerVerification?.aadhaarDocument },
    { id: 'tax_bill', label: 'Property Tax Bill', desc: 'Recent tax receipt', required: true, value: ownerVerification?.taxBillDocument },
    { id: 'deed', label: 'Property Deed', desc: 'Ownership document', required: true, value: ownerVerification?.propertyDeedDocument },
    { id: 'selfie', label: 'Live Selfie', desc: 'Clear photo of your face', required: true, value: ownerVerification?.selfieDocument },
  ];

  const canSubmit = documents.every(d => d.value) && !isVerified;

  const handleUpload = (type: string) => {
    if (type === 'selfie') {
      setIsSelfieModalVisible(true);
      return;
    }

    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.jpg,.jpeg,.png,.pdf';
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
          alert("Only JPG, PNG and PDF files are allowed.");
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert("Maximum file size is 5 MB.");
          return;
        }
        
        setIsUploading(type);
        try {
          await api.uploadVerificationDocument(1, type, file);
          await refreshOwnerVerification();
        } catch (error) {
          console.error(error);
          alert("Failed to upload document");
        } finally {
          setIsUploading(null);
        }
      };
      input.click();
    } else {
      alert("Mobile document upload is not implemented. Please use the web version.");
    }
  };

  const handleSelfieCapture = async (uri: string) => {
    setIsUploading('selfie');
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
      await api.uploadVerificationDocument(1, 'selfie', file);
      await refreshOwnerVerification();
    } catch (error) {
      console.error(error);
      alert("Failed to upload selfie");
    } finally {
      setIsUploading(null);
    }
  };

  const handleDelete = async (type: string) => {
    try {
      await api.deleteVerificationDocument(1, type);
      await refreshOwnerVerification();
    } catch (e) {
      console.error(e);
      alert("Failed to delete document");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.submitVerification(1);
      await refreshOwnerVerification();
    } catch (e) {
      console.error(e);
      alert("Failed to submit verification");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerified) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.verifiedContainer}>
          <ShieldCheck color={Theme.colors.success} size={80} style={{ marginBottom: Theme.spacing.lg }} />
          <Text style={styles.verifiedTitle}>Owner Verification Complete</Text>
          <Text style={styles.verifiedText}>
            Thank you, {ownerProfile.name}. Your identity and property ownership have been verified.
            All owner features are now unlocked.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.headerCard} className="card-tint-verification">
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Verification Center</Text>
            <Text style={styles.headerSubtitle}>Complete your verification to unlock owner features</Text>
          </View>
          <Badge text={isPending ? "PENDING" : isRejected ? "REJECTED" : "UNVERIFIED"} type={isPending ? "warning" : "danger"} />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Required Documents</Text>
      <Text style={styles.sectionDesc}>Please upload the following documents. Allowed formats: JPG, PNG, PDF. Max size: 5MB.</Text>

      <View style={styles.docsGrid}>
        {documents.map((doc) => (
          <Card key={doc.id} style={styles.docCard}>
            <View style={styles.docHeader}>
              <View style={styles.iconBg}><FileText color={Theme.colors.primary} size={20} /></View>
              <Text style={styles.docLabel}>{doc.label}</Text>
            </View>
            <Text style={styles.docDesc}>{doc.desc}</Text>

            {doc.value ? (
              <View style={styles.uploadedBox}>
                <CheckCircle color={Theme.colors.success} size={16} />
                <Text style={styles.fileName} numberOfLines={1}>{doc.value.split('_').pop()}</Text>
                <Button 
                  title="Remove" 
                  icon={Trash2} 
                  variant="outline" 
                  size="small" 
                  style={styles.deleteBtn} 
                  onPress={() => handleDelete(doc.id)} 
                />
              </View>
            ) : (
              <Button 
                title={isUploading === doc.id ? "Uploading..." : "Upload Document"} 
                icon={UploadCloud} 
                variant="outline" 
                onPress={() => handleUpload(doc.id)} 
                disabled={isUploading === doc.id}
              />
            )}
          </Card>
        ))}
      </View>

      <View style={styles.actionRow}>
        <Button 
          title={isSubmitting ? "Submitting..." : "Submit Verification"} 
          variant="primary" 
          disabled={!canSubmit || isSubmitting} 
          onPress={handleSubmit} 
          style={styles.submitBtn} 
        />
        {!canSubmit && (
          <Text style={styles.actionHint}>
            <AlertCircle color={Theme.colors.warning} size={14} style={{ marginRight: 6 }} />
            Please upload all required documents to submit.
          </Text>
        )}
      </View>

      <SelfieCameraModal
        visible={isSelfieModalVisible}
        onClose={() => setIsSelfieModalVisible(false)}
        onCapture={handleSelfieCapture}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  contentContainer: { padding: Theme.spacing.xxl },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Theme.spacing.xxl },
  verifiedContainer: { alignItems: 'center', maxWidth: 400, padding: Theme.spacing.xl, backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: Theme.radius.large, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  verifiedTitle: { fontFamily: Theme.typography.sans, fontSize: 24, fontWeight: '800', color: Theme.colors.success, marginBottom: Theme.spacing.md, textAlign: 'center' },
  verifiedText: { fontFamily: Theme.typography.sans, fontSize: 14, color: Theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  headerCard: { padding: Theme.spacing.xl, marginBottom: Theme.spacing.xl, backgroundColor: 'rgba(59, 130, 246, 0.18)' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontFamily: Theme.typography.sans, fontSize: 22, fontWeight: '800', color: Theme.colors.textPrimary, marginBottom: 4 },
  headerSubtitle: { fontFamily: Theme.typography.sans, fontSize: 13, color: Theme.colors.textSecondary },
  sectionTitle: { fontFamily: Theme.typography.sans, fontSize: 18, fontWeight: '700', color: Theme.colors.textPrimary, marginBottom: 6 },
  sectionDesc: { fontFamily: Theme.typography.sans, fontSize: 13, color: Theme.colors.textSecondary, marginBottom: Theme.spacing.xl },
  docsGrid: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', flexWrap: 'wrap', gap: Theme.spacing.lg, marginBottom: Theme.spacing.xxl },
  docCard: { flex: 1, minWidth: Platform.OS === 'web' ? 280 : '100%', padding: Theme.spacing.lg },
  docHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.sm },
  iconBg: { width: 36, height: 36, borderRadius: Theme.radius.medium, backgroundColor: 'rgba(37, 99, 235, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: Theme.spacing.sm },
  docLabel: { fontFamily: Theme.typography.sans, fontSize: 15, fontWeight: '700', color: Theme.colors.textPrimary },
  docDesc: { fontFamily: Theme.typography.sans, fontSize: 12, color: Theme.colors.textSecondary, marginBottom: Theme.spacing.lg, height: 32 },
  uploadedBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: Theme.spacing.sm, borderRadius: Theme.radius.medium, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  fileName: { fontFamily: Theme.typography.sans, fontSize: 12, color: Theme.colors.success, marginLeft: 8, flex: 1, fontWeight: '600' },
  deleteBtn: { marginLeft: 8 },
  actionRow: { alignItems: 'center', marginTop: Theme.spacing.lg },
  submitBtn: { minWidth: 240 },
  actionHint: { flexDirection: 'row', alignItems: 'center', marginTop: Theme.spacing.md, fontFamily: Theme.typography.sans, fontSize: 12, color: Theme.colors.warning, fontWeight: '600' },
});
