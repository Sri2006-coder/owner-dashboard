import React from 'react';
import { StyleSheet, View, useWindowDimensions, SafeAreaView, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { Header, CustomDrawer, CustomBottomTab } from '../components/NavigationLayout';
import { Theme } from '../constants/dashboardTheme';

// Import screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { VerificationScreen } from '../screens/VerificationScreen';
import { PropertiesScreen } from '../screens/PropertiesScreen';
import { AddPropertyScreen } from '../screens/AddPropertyScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { AppointmentsScreen } from '../screens/AppointmentsScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ReviewsScreen } from '../screens/ReviewsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { FraudMonitorScreen } from '../screens/FraudMonitorScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export default function HomeScreen() {
  const { activeScreen } = useApp();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // Screen routing selector
  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'verification':
        return <VerificationScreen />;
      case 'properties':
        return <PropertiesScreen />;
      case 'add-property':
        return <AddPropertyScreen />;
      case 'analytics':
      case 'reports': // Map financial reports to analytics view
        return <AnalyticsScreen />;
      case 'appointments':
        return <AppointmentsScreen />;
      case 'messages':
        return <MessagesScreen />;
      case 'reviews':
        return <ReviewsScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'fraud-monitor':
        return <FraudMonitorScreen />;
      case 'profile':
      case 'settings':
        return <ProfileScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.appContainer}>
        {/* Responsive Layout Grid */}
        <View style={styles.layoutRow}>
          {/* 1. Sidebar Drawer (Desktop permanent, Mobile overlay toggle) */}
          <CustomDrawer />

          {/* 2. Main content container */}
          <View style={styles.contentCol}>
            {/* Top header bar */}
            <Header />

            {/* Screen contents body */}
            <View style={styles.screenContainer}>
              {renderActiveScreen()}
            </View>
          </View>
        </View>

        {/* 3. Bottom Tabs (Visible only on mobile width) */}
        <CustomBottomTab />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#EBF3FF',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#EBF3FF',
    ...Platform.select({
      web: {
        backgroundImage: 'radial-gradient(rgba(37, 99, 235, 0.06) 1.5px, transparent 0), linear-gradient(180deg, #ebf3ff 0%, #d5e6ff 100%)',
        backgroundSize: '32px 32px, 100% 100%',
      },
    }),
  },
  layoutRow: {
    flexDirection: 'row',
    flex: 1,
    height: '100%',
    overflow: 'hidden',
  },
  contentCol: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
