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
import { Star, MessageSquare, ShieldAlert, Award, Send, X } from 'lucide-react-native';
import { Theme } from '../constants/dashboardTheme';
import { useApp, Review } from '../context/AppContext';
import { Card, Button, Badge, Input } from '../components/DashboardComponents';

export const ReviewsScreen: React.FC = () => {
  const { reviews, replyToReview } = useApp();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // Local state for reply dialog
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  // Calculate metrics
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews || 0;

  // Mock distribution
  const ratingsBreakdown = [
    { stars: 5, count: reviews.filter(r => r.rating === 5).length, percent: '66%' },
    { stars: 4, count: reviews.filter(r => r.rating === 4).length, percent: '33%' },
    { stars: 3, count: 0, percent: '0%' },
    { stars: 2, count: 0, percent: '0%' },
    { stars: 1, count: 0, percent: '0%' },
  ];

  const handlePostReply = () => {
    if (replyingReview && replyText.trim()) {
      replyToReview(replyingReview.id, replyText.trim());
      setReplyText('');
      setReplyingReview(null);
    }
  };

  const getStarsArray = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 1. Statistics Rating Breakdown Banner */}
      <Card style={styles.metricsCard} className="card-tint-statistics">
        <View style={[styles.metricsRow, isLargeScreen && styles.rowLayout]}>
          {/* Average Rating Block */}
          <View style={styles.avgCol}>
            <Text style={styles.avgLabel}>Average Rating</Text>
            <Text style={styles.avgValue}>{averageRating.toFixed(1)}</Text>
            <View style={styles.starsRow}>
              {getStarsArray(Math.round(averageRating)).map((filled, idx) => (
                <Star
                  key={idx}
                  color={filled ? Theme.colors.warning : '#CBD5E1'}
                  fill={filled ? Theme.colors.warning : 'transparent'}
                  size={20}
                  style={{ marginRight: 2 }}
                />
              ))}
            </View>
            <Text style={styles.totalReviewsText}>Based on {totalReviews} reviews</Text>
          </View>

          {/* Bar breakout distribution column */}
          <View style={styles.breakdownCol}>
            {ratingsBreakdown.map((row) => (
              <View key={row.stars} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{row.stars} ★</Text>
                <View style={styles.breakdownBarBg}>
                  <View style={[styles.breakdownBarFill, { width: row.percent as any }]} />
                </View>
                <Text style={styles.breakdownCount}>{row.count}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>

      {/* 2. Review List */}
      <Text style={styles.sectionHeader}>Tenant Reviews & Feedback</Text>
      <View style={styles.listContainer}>
        {reviews.map(review => (
          <Card key={review.id} style={styles.reviewCard} className="card-tint-property">
            <View style={styles.reviewHeader}>
              <View>
                <Text style={styles.reviewAuthor}>{review.userName}</Text>
                <Text style={styles.reviewDate}>Date: {review.date}</Text>
                <Text style={styles.reviewProperty} numberOfLines={1}>{review.propertyName}</Text>
              </View>
              <View style={styles.cardStarsRow}>
                {getStarsArray(review.rating).map((filled, idx) => (
                  <Star
                    key={idx}
                    color={filled ? Theme.colors.warning : '#CBD5E1'}
                    fill={filled ? Theme.colors.warning : 'transparent'}
                    size={14}
                    style={{ marginLeft: 1 }}
                  />
                ))}
              </View>
            </View>

            <Text style={styles.reviewText}>{review.text}</Text>

            {/* Landlord reply bubble if exists */}
            {review.reply ? (
              <View style={styles.replyBubble}>
                <View style={styles.replyHeader}>
                  <Text style={styles.replyAuthor}>Your Response</Text>
                  <Badge text="PUBLISHED" type="success" />
                </View>
                <Text style={styles.replyText}>{review.reply}</Text>
              </View>
            ) : null}

            {/* Actions: Reply and Report */}
            <View style={styles.actionsRow}>
              {!review.reply && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    setReplyingReview(review);
                    setReplyText('');
                  }}
                  activeOpacity={0.7}
                >
                  <MessageSquare color={Theme.colors.primary} size={16} style={{ marginRight: 6 }} />
                  <Text style={[styles.actionBtnText, { color: Theme.colors.primary }]}>Reply</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={[styles.actionBtn, styles.reportBtn]} activeOpacity={0.7}>
                <ShieldAlert color={Theme.colors.danger} size={16} style={{ marginRight: 6 }} />
                <Text style={[styles.actionBtnText, { color: Theme.colors.danger }]}>Report Review</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </View>

      {/* Reply Modal */}
      <Modal
        visible={replyingReview !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReplyingReview(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setReplyingReview(null)}
          />
          <View style={[styles.modalContent, isLargeScreen && styles.modalContentDesktop]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post Reply to Review</Text>
              <TouchableOpacity onPress={() => setReplyingReview(null)}>
                <X color={Theme.colors.textPrimary} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Card style={styles.targetReviewSummary} className="card-tint-analytics">
                <Text style={styles.targetAuthor}>{replyingReview?.userName}</Text>
                <Text style={styles.targetText} numberOfLines={3}>"{replyingReview?.text}"</Text>
              </Card>

              <Input
                label="Your Response message"
                placeholder="Type your official landlord response here..."
                value={replyText}
                onChangeText={setReplyText}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setReplyingReview(null)}
                style={styles.modalFooterBtn}
              />
              <View style={{ width: 12 }} />
              <Button
                title="Send Reply"
                icon={Send}
                variant="primary"
                onPress={handlePostReply}
                style={styles.modalFooterBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: Theme.spacing.lg,
  },
  metricsCard: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  },
  metricsRow: {
    gap: Theme.spacing.xl,
  },
  rowLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avgCol: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  avgLabel: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  avgValue: {
    fontFamily: Theme.typography.sans,
    fontSize: 48,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    marginVertical: 4,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  totalReviewsText: {
    fontFamily: Theme.typography.sans,
    fontSize: 11,
    color: Theme.colors.textMuted,
  },
  breakdownCol: {
    flex: Platform.OS === 'web' ? 2 : 1,
    gap: 8,
    justifyContent: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    width: 32,
  },
  breakdownBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderRadius: 3,
    marginHorizontal: Theme.spacing.md,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.warning,
    borderRadius: 3,
  },
  breakdownCount: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
    width: 20,
  },
  sectionHeader: {
    fontFamily: Theme.typography.sans,
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  listContainer: {
    gap: Theme.spacing.md,
  },
  reviewCard: {
    padding: Theme.spacing.lg,
    marginBottom: 0,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  reviewAuthor: {
    fontFamily: Theme.typography.sans,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  reviewDate: {
    fontFamily: Theme.typography.sans,
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  reviewProperty: {
    fontFamily: Theme.typography.sans,
    fontSize: 11,
    color: Theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
    maxWidth: 240,
  },
  cardStarsRow: {
    flexDirection: 'row',
  },
  reviewText: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: Theme.spacing.lg,
  },
  replyBubble: {
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.10)',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.medium,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
    marginBottom: Theme.spacing.lg,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyAuthor: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  replyText: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    lineHeight: 17,
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.20)',
    paddingTop: Theme.spacing.md,
    justifyContent: 'flex-start',
    gap: Theme.spacing.lg,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  reportBtn: {
    marginLeft: 'auto',
  },
  actionBtnText: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    fontWeight: '700',
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
  targetReviewSummary: {
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderColor: 'rgba(37, 99, 235, 0.10)',
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xs,
  },
  targetAuthor: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  targetText: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
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
