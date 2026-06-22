import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import {
  LayoutDashboard,
  ShieldCheck,
  Home,
  PlusCircle,
  BarChart3,
  Calendar,
  MessageSquare,
  Star,
  Bell,
  AlertTriangle,
  FileText,
  Settings,
  User,
  Menu,
  X,
} from 'lucide-react-native';
import { Theme } from '../constants/dashboardTheme';
import { useApp } from '../context/AppContext';

const drawerItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'verification', label: 'Verification Center', icon: ShieldCheck },
  { id: 'properties', label: 'My Properties', icon: Home },
  { id: 'add-property', label: 'Add Property', icon: PlusCircle },
  { id: 'analytics', label: 'Property Analytics', icon: BarChart3 },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'fraud-monitor', label: 'Fraud Monitor', icon: AlertTriangle },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'profile', label: 'Profile Settings', icon: Settings },
];

const bottomTabItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'properties', label: 'Properties', icon: Home },
  { id: 'appointments', label: 'Appts', icon: Calendar },
  { id: 'messages', label: 'Chats', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: User },
];

export const Header: React.FC = () => {
  const { activeScreen, setDrawerOpen, notifications, setActiveScreen, trustScore, ownerProfile } = useApp();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'dashboard':
        return 'Dashboard';
      case 'verification':
        return 'Verification Center';
      case 'properties':
        return 'My Properties';
      case 'add-property':
        return 'Add Property';
      case 'analytics':
        return 'Property Analytics';
      case 'appointments':
        return 'Appointments';
      case 'messages':
        return 'Messages';
      case 'reviews':
        return 'Reviews & Ratings';
      case 'notifications':
        return 'Notification Center';
      case 'fraud-monitor':
        return 'Fraud Monitor';
      case 'reports':
        return 'Financial Reports';
      case 'profile':
        return 'Owner Profile';
      default:
        return 'Owner Panel';
    }
  };

  return (
    <SafeAreaView style={styles.headerSafe} {...(Platform.OS === 'web' ? { className: 'frosted-header' } : {})}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          {!isLargeScreen && (
            <TouchableOpacity style={styles.menuButton} onPress={() => setDrawerOpen(true)} activeOpacity={0.7}>
              <Menu color={Theme.colors.textPrimary} size={22} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerEyebrow}>RentShield Owner</Text>
            <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconCircle}
            onPress={() => setActiveScreen('notifications')}
            activeOpacity={0.7}
          >
            <Bell color={Theme.colors.textPrimary} size={20} />
            {unreadNotifCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadNotifCount > 9 ? '9+' : unreadNotifCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.profilePill} {...(Platform.OS === 'web' ? { className: 'profile-pill' } : {})} onPress={() => setActiveScreen('profile')} activeOpacity={0.7}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: ownerProfile.avatar }} style={styles.avatar} />
              <View style={styles.verifiedDot}>
                <ShieldCheck color="#FFFFFF" size={8} />
              </View>
            </View>
            {isLargeScreen && (
              <View style={styles.profilePillTextContainer}>
                <Text style={styles.profileName}>{ownerProfile.name}</Text>
                <Text style={styles.profileTrust}>Trust {trustScore}%</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export const CustomBottomTab: React.FC = () => {
  const { activeScreen, setActiveScreen, ownerVerification } = useApp();
  const isVerified = ownerVerification?.status === 'VERIFIED';
  const lockedScreens = ['add-property', 'analytics', 'appointments', 'reviews', 'messages', 'reports'];
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  if (isLargeScreen) return null;

  return (
    <View style={styles.bottomTabContainer}>
      {bottomTabItems.map((tab) => {
        const Icon = tab.icon;
        const isSelected =
          activeScreen === tab.id ||
          (tab.id === 'properties' && activeScreen === 'add-property');

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => {
              if (!isVerified && lockedScreens.includes(tab.id)) {
                alert('Complete verification to unlock owner features.');
                return;
              }
              setActiveScreen(tab.id);
            }}
            activeOpacity={0.85}
          >
            <View style={[styles.tabIconWrapper, isSelected && styles.tabIconWrapperActive]}>
              <Icon color={isSelected ? Theme.colors.primary : Theme.colors.textMuted} size={20} />
            </View>
            <Text style={[styles.tabLabel, isSelected && styles.tabLabelActive]}>{tab.label}</Text>
            {isSelected && <View style={styles.tabActiveIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const CustomDrawer: React.FC = () => {
  const { activeScreen, setActiveScreen, drawerOpen, setDrawerOpen, trustScore, ownerProfile, ownerVerification } = useApp();
  const isVerified = ownerVerification?.status === 'VERIFIED';
  const lockedScreens = ['add-property', 'analytics', 'appointments', 'reviews', 'messages', 'reports'];
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const navigateTo = (screenId: string) => {
    if (!isVerified && lockedScreens.includes(screenId)) {
      if (Platform.OS === 'web') {
        window.alert('Complete verification to unlock owner features.');
      } else {
        alert('Complete verification to unlock owner features.');
      }
      setDrawerOpen(false);
      return;
    }
    setActiveScreen(screenId);
    setDrawerOpen(false);
  };

  const isItemSelected = (itemId: string) =>
    activeScreen === itemId || (itemId === 'properties' && activeScreen === 'add-property');

  const DrawerView = (
    <View style={styles.drawerInner}>
      <View style={styles.drawerBrand}>
        <View style={styles.brandLogoContainer}>
          <ShieldCheck color="#FFFFFF" size={22} />
        </View>
        <View style={styles.brandTextCol}>
          <Text style={styles.brandTitle}>RentShield</Text>
          <Text style={styles.brandSubtitle}>Owner Platform</Text>
        </View>
        {!isLargeScreen && (
          <TouchableOpacity style={styles.closeDrawerButton} onPress={() => setDrawerOpen(false)}>
            <X color="#FFFFFF" size={20} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.drawerScroll} contentContainerStyle={styles.drawerScrollContent}>
        <Text style={styles.navSectionLabel}>Main Menu</Text>
        {drawerItems.map((item) => {
          const Icon = item.icon;
          const isSelected = isItemSelected(item.id);

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.drawerItem, isSelected && styles.drawerItemActive]}
              {...(Platform.OS === 'web' ? { className: isSelected ? 'sidebar-item sidebar-item-active' : 'sidebar-item' } : {})}
              onPress={() => navigateTo(item.id)}
              activeOpacity={0.75}
            >
              {isSelected && <View style={styles.drawerActiveBar} />}
              <View style={[styles.drawerIconWrap, isSelected && styles.drawerIconWrapActive]}>
                <Icon color={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.65)'} size={17} />
              </View>
              <Text style={[styles.drawerItemLabel, isSelected && styles.drawerItemLabelActive]}>{item.label}</Text>
              {item.id === 'verification' && trustScore < 100 && (
                <View style={styles.alertPill}>
                  <Text style={styles.alertPillText}>!</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.drawerFooter}>
        <View style={styles.footerAvatarContainer}>
          <Image source={{ uri: ownerProfile.avatar }} style={styles.footerAvatar} />
          <View style={styles.footerVerifiedDot}>
            <ShieldCheck color="#FFFFFF" size={8} />
          </View>
        </View>
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerName}>{ownerProfile.name}</Text>
          <Text style={styles.footerStatus}>AI Verified · {trustScore}% Trust</Text>
        </View>
      </View>
    </View>
  );

  if (isLargeScreen) {
    return <View style={styles.desktopDrawerContainer}>{DrawerView}</View>;
  }

  if (!drawerOpen) return null;

  return (
    <View style={styles.mobileDrawerOverlay}>
      <TouchableOpacity style={styles.mobileDrawerBackdrop} activeOpacity={1} onPress={() => setDrawerOpen(false)} />
      <View style={styles.mobileDrawerContainer}>{DrawerView}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSafe: {
    backgroundColor: Theme.colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    ...(Platform.OS === 'web' ? (Theme.cardShadow as object) : {}),
  },
  headerContainer: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  menuButton: { marginRight: Theme.spacing.md, padding: Theme.spacing.xs, borderRadius: Theme.radius.small },
  headerEyebrow: {
    fontFamily: Theme.typography.sans,
    fontSize: 10,
    fontWeight: '600',
    color: Theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontFamily: Theme.typography.sans,
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Theme.colors.danger,
    borderRadius: Theme.radius.round,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: Theme.colors.headerBg,
  },
  notificationBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  avatarContainer: { position: 'relative', width: 30, height: 30 },
  avatar: { width: '100%', height: '100%', borderRadius: 15 },
  verifiedDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Theme.colors.success,
    borderRadius: Theme.radius.round,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors.headerBg,
  },
  profilePillTextContainer: { marginLeft: Theme.spacing.sm },
  profileName: { fontFamily: Theme.typography.sans, fontSize: 12, fontWeight: '700', color: Theme.colors.textPrimary },
  profileTrust: { fontFamily: Theme.typography.sans, fontSize: 10, color: Theme.colors.success, fontWeight: '600' },
  bottomTabContainer: {
    height: 68,
    backgroundColor: Theme.colors.headerBg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 12 : 4,
    ...(Platform.OS === 'web' ? (Theme.cardShadow as object) : {}),
  },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: Theme.spacing.xs, position: 'relative' },
  tabIconWrapper: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: Theme.radius.medium },
  tabIconWrapperActive: { backgroundColor: Theme.colors.lightBlue },
  tabLabel: {
    fontFamily: Theme.typography.sans,
    fontSize: 10,
    fontWeight: '500',
    color: Theme.colors.textMuted,
    marginTop: 3,
  },
  tabLabelActive: { color: Theme.colors.primary, fontWeight: '700' },
  tabActiveIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: Theme.colors.primary,
  },
  desktopDrawerContainer: {
    width: 272,
    backgroundColor: Theme.colors.sidebar,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.06)',
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%)',
      },
    }),
  },
  mobileDrawerOverlay: { ...StyleSheet.absoluteFill, zIndex: 999, flexDirection: 'row' },
  mobileDrawerBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  mobileDrawerContainer: {
    width: 280,
    height: '100%',
    backgroundColor: Theme.colors.sidebar,
    zIndex: 1000,
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%)',
      },
    }),
  },
  drawerInner: { flex: 1, justifyContent: 'space-between' },
  drawerBrand: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: Theme.radius.medium,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  brandTextCol: { flex: 1 },
  brandTitle: { fontFamily: Theme.typography.sans, color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  brandSubtitle: { fontFamily: Theme.typography.sans, color: 'rgba(255, 255, 255, 0.45)', fontSize: 11, fontWeight: '500', marginTop: 1 },
  closeDrawerButton: { position: 'absolute', right: 16, top: 24, padding: 4 },
  drawerScroll: { flex: 1 },
  drawerScrollContent: { paddingVertical: Theme.spacing.md, paddingHorizontal: Theme.spacing.md },
  navSectionLabel: {
    fontFamily: Theme.typography.sans,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Theme.spacing.sm,
    marginLeft: Theme.spacing.sm,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: 20,
    marginBottom: 4,
    position: 'relative',
  },
  drawerItemActive: { backgroundColor: 'rgba(255,255,255,0.16)' },
  drawerActiveBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  drawerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Theme.radius.small,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  drawerIconWrapActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  drawerItemLabel: {
    fontFamily: Theme.typography.sans,
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  drawerItemLabelActive: { color: '#FFFFFF', fontWeight: '700' },
  alertPill: {
    backgroundColor: Theme.colors.warning,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertPillText: { fontSize: 10, fontWeight: '800', color: Theme.colors.sidebar },
  drawerFooter: {
    padding: Theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  footerAvatarContainer: { position: 'relative', width: 38, height: 38 },
  footerAvatar: { width: '100%', height: '100%', borderRadius: 19 },
  footerVerifiedDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Theme.colors.success,
    borderRadius: Theme.radius.round,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.sidebar,
  },
  footerTextContainer: { marginLeft: Theme.spacing.sm, flex: 1 },
  footerName: { fontFamily: Theme.typography.sans, fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  footerStatus: { fontFamily: Theme.typography.sans, fontSize: 11, color: 'rgba(255, 255, 255, 0.45)', marginTop: 1 },
});
