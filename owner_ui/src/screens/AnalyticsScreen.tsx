import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Platform, useWindowDimensions } from 'react-native';
import {
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  Building,
  Award,
  Sparkles
} from 'lucide-react-native';
import { Theme } from '../constants/dashboardTheme';
import { useApp } from '../context/AppContext';
import { Card, MetricCard, BarChart, LineTrendChart } from '../components/DashboardComponents';

export const AnalyticsScreen: React.FC = () => {
  const { properties } = useApp();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // Retrieve top property cards
  const sortedByViews = [...properties].sort((a, b) => b.views - a.views);
  const sortedByRating = [...properties].sort((a, b) => b.rating - a.rating);
  const sortedByFavorites = [...properties].sort((a, b) => b.favorites - a.favorites);

  const mostViewed = sortedByViews[0];
  const highestRated = sortedByRating[0];
  const mostSaved = sortedByFavorites[0];

  // Chart data
  const viewsChartData = [
    { label: 'Jan', value: 890 },
    { label: 'Feb', value: 1200 },
    { label: 'Mar', value: 1650 },
    { label: 'Apr', value: 1400 },
    { label: 'May', value: 2100 },
    { label: 'Jun', value: 2700 },
  ];

  const inquiriesChartData = [
    { label: 'Jan', value: 12 },
    { label: 'Feb', value: 18 },
    { label: 'Mar', value: 24 },
    { label: 'Apr', value: 19 },
    { label: 'May', value: 31 },
    { label: 'Jun', value: 45 },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Analytics Overview Metrics Grid */}
      <View style={styles.metricsRow}>
        <MetricCard
          title="Conversion Rate"
          value="8.4%"
          change="+1.2%"
          changeType="positive"
          icon={TrendingUp}
          iconColor={Theme.colors.primary}
          iconBg={Theme.colors.lightBlue}
        />
        <MetricCard
          title="Avg Rating"
          value="4.5 / 5.0"
          change="0.2 increase"
          changeType="positive"
          icon={Award}
          iconColor={Theme.colors.warning}
          iconBg={Theme.colors.lightWarning}
        />
      </View>

      {/* Grid Charts Section */}
      <View style={[styles.chartsContainer, isLargeScreen && styles.rowLayout]}>
        <View style={styles.flex1}>
          <BarChart
            title="Monthly Property Views Trend"
            data={viewsChartData}
            color={Theme.colors.primary}
          />
        </View>
        <View style={styles.flex1}>
          <LineTrendChart
            title="Monthly Inquiry / Chat Requests"
            data={inquiriesChartData}
            color={Theme.colors.success}
          />
        </View>
      </View>

      {/* Performance Highlights Row (SaaS Style) */}
      <Text style={styles.sectionHeader}>Property Hall of Fame</Text>
      <View style={[styles.topCardsGrid, isLargeScreen && styles.rowLayout]}>
        
        {/* Most Viewed */}
        {mostViewed && (
          <Card style={styles.topCard} className="card-tint-property">
            <View style={styles.topCardHeader}>
              <View style={[styles.badgeIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Eye color="#0284C7" size={16} />
              </View>
              <Text style={styles.topBadgeText}>MOST VIEWED</Text>
            </View>
            <Image source={{ uri: mostViewed.image }} style={styles.topCardImage} />
            <Text style={styles.topCardName} numberOfLines={1}>{mostViewed.name}</Text>
            <Text style={styles.topCardLoc} numberOfLines={1}>{mostViewed.location}</Text>
            <View style={styles.topCardFooter}>
              <Text style={styles.topCardStat}>{mostViewed.views.toLocaleString()} Views</Text>
              <Text style={styles.topCardRent}>{mostViewed.rent}/mo</Text>
            </View>
          </Card>
        )}

        {/* Highest Rated */}
        {highestRated && (
          <Card style={styles.topCard} className="card-tint-trust">
            <View style={styles.topCardHeader}>
              <View style={[styles.badgeIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Award color={Theme.colors.warning} size={16} />
              </View>
              <Text style={styles.topBadgeText}>HIGHEST RATED</Text>
            </View>
            <Image source={{ uri: highestRated.image }} style={styles.topCardImage} />
            <Text style={styles.topCardName} numberOfLines={1}>{highestRated.name}</Text>
            <Text style={styles.topCardLoc} numberOfLines={1}>{highestRated.location}</Text>
            <View style={styles.topCardFooter}>
              <Text style={styles.topCardStat}>★ {highestRated.rating.toFixed(1)} ({highestRated.reviewsCount} Reviews)</Text>
              <Text style={styles.topCardRent}>{highestRated.rent}/mo</Text>
            </View>
          </Card>
        )}

        {/* Most Saved */}
        {mostSaved && (
          <Card style={styles.topCard} className="card-tint-verification">
            <View style={styles.topCardHeader}>
              <View style={[styles.badgeIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Heart color={Theme.colors.danger} size={16} />
              </View>
              <Text style={styles.topBadgeText}>MOST SAVED</Text>
            </View>
            <Image source={{ uri: mostSaved.image }} style={styles.topCardImage} />
            <Text style={styles.topCardName} numberOfLines={1}>{mostSaved.name}</Text>
            <Text style={styles.topCardLoc} numberOfLines={1}>{mostSaved.location}</Text>
            <View style={styles.topCardFooter}>
              <Text style={styles.topCardStat}>{mostSaved.favorites} Saves</Text>
              <Text style={styles.topCardRent}>{mostSaved.rent}/mo</Text>
            </View>
          </Card>
        )}
      </View>

      {/* Engagement Analytics Summary */}
      <Text style={styles.sectionHeader}>Engagement Analytics Summary</Text>
      <Card style={styles.summaryTableCard} className="card-tint-statistics">
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.cellHeader, styles.cellFlex2]}>Property Name</Text>
          <Text style={[styles.tableCell, styles.cellHeader, styles.cellCenter]}>Views</Text>
          <Text style={[styles.tableCell, styles.cellHeader, styles.cellCenter]}>Saves</Text>
          <Text style={[styles.tableCell, styles.cellHeader, styles.cellCenter]}>Bookings</Text>
        </View>
        {properties.map(p => (
          <View key={p.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.cellText, styles.cellFlex2]} numberOfLines={1}>
              {p.name}
            </Text>
            <Text style={[styles.tableCell, styles.cellText, styles.cellCenter]}>{p.views}</Text>
            <Text style={[styles.tableCell, styles.cellText, styles.cellCenter]}>{p.favorites}</Text>
            <Text style={[styles.tableCell, styles.cellText, styles.cellCenter]}>{p.appointments}</Text>
          </View>
        ))}
      </Card>
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
  metricsRow: {
    flexDirection: 'row',
    marginHorizontal: -Theme.spacing.xs,
    marginBottom: Theme.spacing.lg,
  },
  chartsContainer: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  rowLayout: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  sectionHeader: {
    fontFamily: Theme.typography.sans,
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  topCardsGrid: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  topCard: {
    flex: 1,
    padding: Theme.spacing.md,
    marginBottom: 0,
  },
  topCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  badgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  topBadgeText: {
    fontFamily: Theme.typography.sans,
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  topCardImage: {
    width: '100%',
    height: 120,
    borderRadius: Theme.radius.medium,
    marginBottom: Theme.spacing.sm,
    resizeMode: 'cover',
  },
  topCardName: {
    fontFamily: Theme.typography.sans,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  topCardLoc: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: Theme.spacing.sm,
  },
  topCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.20)',
    paddingTop: Theme.spacing.sm,
  },
  topCardStat: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  topCardRent: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  summaryTableCard: {
    padding: 0,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.30)',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
  },
  tableCell: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    flex: 1,
  },
  cellHeader: {
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  cellText: {
    color: Theme.colors.textPrimary,
    fontWeight: '500',
  },
  cellFlex2: {
    flex: 2,
  },
  cellCenter: {
    textAlign: 'center',
  },
});
