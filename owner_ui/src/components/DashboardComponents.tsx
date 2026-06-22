import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ViewStyle,
  TextStyle,
  Platform,
  ActivityIndicator,
  StyleProp,
  Animated,
} from 'react-native';
import { Theme, getScoreColor } from '../constants/dashboardTheme';
import { LucideIcon } from 'lucide-react-native';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevated?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, elevated = false, className }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const shadowStyle = elevated ? Theme.elevatedShadow : Theme.cardShadow;
  const cardStyle = [styles.card, Platform.OS === 'web' ? (shadowStyle as object) : shadowStyle, style];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...(Platform.OS === 'web' ? { className: className ? `luxury-card ${className}` : 'luxury-card' } : {})}
      >
        <Animated.View style={[cardStyle, { transform: [{ scale }] }]}>{children}</Animated.View>
      </Pressable>
    );
  }

  return (
    <View
      style={cardStyle}
      {...(Platform.OS === 'web' ? { className: className ? `luxury-card ${className}` : 'luxury-card' } : {})}
    >
      {children}
    </View>
  );
};

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = Theme.radius.small,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.skeleton, { width, height, borderRadius, opacity }, style as object]} />
  );
};

export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <Card>
    <Skeleton height={20} width="45%" style={{ marginBottom: Theme.spacing.md }} />
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} height={12} width={i === lines - 1 ? '60%' : '100%'} style={{ marginBottom: 8 }} />
    ))}
  </Card>
);

interface ScoreBadgeProps {
  label: string;
  score: number;
  size?: 'small' | 'medium';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ label, score, size = 'medium' }) => {
  const color = getScoreColor(score);
  const isSmall = size === 'small';
  return (
    <View style={[styles.scoreBadge, { backgroundColor: `${color}14`, borderColor: `${color}33` }]}>
      <Text style={[styles.scoreBadgeLabel, isSmall && { fontSize: 9 }]}>{label}</Text>
      <Text style={[styles.scoreBadgeValue, { color }, isSmall && { fontSize: 13 }]}>{score}%</Text>
    </View>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'warning';
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  onPress?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = Theme.colors.primary,
  iconBg = Theme.colors.lightBlue,
  onPress,
}) => {
  const changeColor =
    changeType === 'positive'
      ? Theme.colors.success
      : changeType === 'negative'
        ? Theme.colors.danger
        : changeType === 'warning'
          ? Theme.colors.warning
          : Theme.colors.textSecondary;

  const getTintClass = () => {
    const t = title.toLowerCase();
    if (t.includes('properties') || t.includes('listings')) return 'card-tint-property';
    if (t.includes('views') || t.includes('analytics')) return 'card-tint-analytics';
    if (t.includes('appt') || t.includes('appointment')) return 'card-tint-trust';
    return 'card-tint-statistics';
  };

  const getNativeBg = () => {
    const t = title.toLowerCase();
    if (t.includes('properties') || t.includes('listings')) return 'rgba(59, 130, 246, 0.16)';
    if (t.includes('views') || t.includes('analytics')) return 'rgba(99, 102, 241, 0.16)';
    if (t.includes('appt') || t.includes('appointment')) return 'rgba(99, 102, 241, 0.16)';
    return 'rgba(37, 99, 235, 0.14)';
  };

  return (
    <Card
      style={[styles.metricCard, { backgroundColor: getNativeBg() }]}
      {...(Platform.OS === 'web' ? { className: `luxury-card ${getTintClass()}` } : {})}
      onPress={onPress}
    >
      {/* Accent indicator bar */}
      <View
        style={[
          styles.metricAccentBar,
          {
            backgroundColor: iconColor,
            ...Platform.select({
              web: {
                backgroundImage: `linear-gradient(180deg, ${iconColor} 0%, ${iconColor}cc 100%)`,
              },
            }),
          },
        ]}
      />

      <View style={styles.metricRow}>
        <View style={styles.metricContent}>
          <Text style={styles.metricTitle}>{title}</Text>
          <Text style={styles.metricValue}>{value}</Text>
        </View>
        <View style={[styles.metricIconContainer, { backgroundColor: iconBg }]}>
          <Icon color={iconColor} size={22} />
        </View>
      </View>
      {(change || subtext) && (
        <View style={styles.metricFooter}>
          {change && <Text style={[styles.metricChange, { color: changeColor }]}>{change}</Text>}
          {subtext && <Text style={styles.metricSubtext}> {subtext}</Text>}
        </View>
      )}
    </Card>
  );
};

interface BadgeProps {
  text: string;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  style?: StyleProp<ViewStyle>;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ text, type = 'neutral', style, dot }) => {
  const getBadgeStyle = () => {
    switch (type) {
      case 'primary':
        return { bg: Theme.colors.lightBlue, txt: Theme.colors.primary, border: '#BFDBFE' };
      case 'success':
        return { bg: Theme.colors.lightSuccess, txt: Theme.colors.success, border: '#A7F3D0' };
      case 'warning':
        return { bg: Theme.colors.lightWarning, txt: '#B45309', border: '#FDE68A' };
      case 'danger':
        return { bg: Theme.colors.lightDanger, txt: Theme.colors.danger, border: '#FECACA' };
      case 'info':
        return { bg: '#F0F9FF', txt: '#0284C7', border: '#BAE6FD' };
      default:
        return { bg: '#F1F5F9', txt: '#475569', border: Theme.colors.border };
    }
  };

  const colors = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }, style as object]}>
      {dot ? <View style={[styles.badgeDot, { backgroundColor: colors.txt }]} /> : null}
      <Text style={[styles.badgeText, { color: colors.txt }]}>{text}</Text>
    </View>
  );
};

interface TrustScoreRingProps {
  score: number;
  size?: number;
  label?: string;
  sublabel?: string;
  animated?: boolean;
}

export const TrustScoreRing: React.FC<TrustScoreRingProps> = ({
  score,
  size = 112,
  label,
  sublabel,
  animated = true,
}) => {
  const ringColor = getScoreColor(score);
  const innerSize = size - 20;
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (!animated) {
      fadeAnim.setValue(1);
      return;
    }
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Theme.animation.slow,
      useNativeDriver: true,
    }).start();
  }, [score, animated, fadeAnim]);

  return (
    <View style={styles.ringContainer}>
      <View
        style={[
          styles.ringOuter,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: ringColor,
            backgroundColor: `${ringColor}08`,
            borderWidth: 8,
            ...Platform.select({
              web: {
                boxShadow: `0 0 15px ${ringColor}44`,
              },
            }),
          },
        ]}
      >
        <Animated.View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: 'rgba(255, 255, 255, 0.90)',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: fadeAnim,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            ...Platform.select({
              web: {
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.08)',
              } as any,
              default: Theme.cardShadow as any,
            }),
          }}
        >
          <Text style={{ fontFamily: Theme.typography.sans, fontSize: size * 0.22, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 }}>
            {score}%
          </Text>
          {sublabel ? (
            <Text style={{ fontFamily: Theme.typography.sans, fontSize: 9, fontWeight: '700', color: ringColor, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {sublabel}
            </Text>
          ) : null}
        </Animated.View>
      </View>
      {label ? <Text style={styles.ringLabel}>{label}</Text> : null}
    </View>
  );
};

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon: Icon,
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return { bg: Theme.colors.sidebar, border: 'transparent', txt: '#FFFFFF' };
      case 'outline':
        return { bg: 'rgba(255, 255, 255, 0.40)', border: 'rgba(255, 255, 255, 0.25)', txt: '#1E3A8A' };
      case 'danger':
        return { bg: Theme.colors.danger, border: 'transparent', txt: '#FFFFFF' };
      case 'success':
        return { bg: Theme.colors.success, border: 'transparent', txt: '#FFFFFF' };
      default: // primary
        return { bg: '#2563EB', border: 'transparent', txt: '#FFFFFF' };
    }
  };

  const getSizes = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 7, paddingHorizontal: 14, fontSize: 13, radius: Theme.radius.small };
      case 'large':
        return { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16, radius: Theme.radius.medium };
      default:
        return { paddingVertical: 11, paddingHorizontal: 20, fontSize: 14, radius: Theme.radius.medium };
    }
  };

  const colors = getVariantStyles();
  const sizes = getSizes();

  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: colors.border !== 'transparent' ? 1 : 0,
          borderRadius: sizes.radius,
          paddingVertical: sizes.paddingVertical,
          paddingHorizontal: sizes.paddingHorizontal,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          ...Platform.select({
            web: {
              ...(isPrimary ? {
                backgroundImage: 'linear-gradient(90deg, #1E3A8A 0%, #2563EB 100%)',
              } : {}),
              ...(isOutline ? {
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              } : {}),
            },
          }),
        },
        disabled && styles.buttonDisabled,
        style as object,
      ]}
      {...(Platform.OS === 'web' ? { className: isOutline ? 'btn-glow btn-glass' : 'btn-glow' } : {})}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={colors.txt} size="small" />
      ) : (
        <View style={styles.buttonInner}>
          {Icon && <Icon color={colors.txt} size={18} style={{ marginRight: 6 }} />}
          <Text style={[styles.buttonText, { color: colors.txt, fontSize: sizes.fontSize }, textStyle]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
};

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  multiline = false,
  numberOfLines = 1,
  style,
}) => (
  <View style={[styles.inputContainer, style]}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && { height: 40 * numberOfLines, textAlignVertical: 'top' }, error && styles.inputErrorBorder]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Theme.colors.textMuted}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
    />
    {error && <Text style={styles.inputErrorText}>{error}</Text>}
  </View>
);

interface ChartDataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  title: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 180, color = Theme.colors.primary, title }) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  return (
    <Card
      style={styles.chartCard}
      {...(Platform.OS === 'web' ? { className: 'luxury-card card-tint-analytics' } : {})}
      elevated
    >
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={[styles.chartContainer, { height }]}>
        <View style={styles.chartGridLines}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.chartGridRow} />
          ))}
        </View>
        <View style={styles.chartBarsArea}>
          {data.map((item, idx) => {
            const barHeightPercent = (item.value / maxValue) * 78;
            return (
              <View key={idx} style={styles.chartBarCol}>
                <View style={styles.chartBarWrapper}>
                  <Text style={styles.chartBarValue}>{item.value}</Text>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: `${barHeightPercent}%`,
                        backgroundColor: color,
                        ...Platform.select({
                          web: {
                            backgroundImage: 'linear-gradient(180deg, #2563EB 0%, #06B6D4 100%)',
                          },
                        }),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartBarLabel} numberOfLines={1}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </Card>
  );
};

interface LineTrendChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  title: string;
}

export const LineTrendChart: React.FC<LineTrendChartProps> = ({ data, height = 180, color = Theme.colors.success, title }) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  return (
    <Card
      style={styles.chartCard}
      {...(Platform.OS === 'web' ? { className: 'luxury-card card-tint-analytics' } : {})}
      elevated
    >
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={[styles.chartContainer, { height }]}>
        <View style={styles.chartGridLines}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.chartGridRow} />
          ))}
        </View>
        <View style={styles.chartLinesArea}>
          {data.map((item, idx) => {
            const heightPercent = (item.value / maxValue) * 75;
            return (
              <View key={idx} style={styles.chartLineCol}>
                <View style={styles.chartLineDotContainer}>
                  <Text style={styles.chartLineValue}>{item.value}</Text>
                  <View
                    style={[
                      styles.chartLineDot,
                      {
                        bottom: `${heightPercent}%`,
                        borderColor: color,
                        ...Platform.select({
                          web: {
                            boxShadow: `0 0 10px ${color}`,
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                          },
                        }),
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.chartLineStem,
                      {
                        height: `${heightPercent}%`,
                        backgroundColor: `${color}22`,
                        ...Platform.select({
                          web: {
                            backgroundImage: 'linear-gradient(180deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0) 100%)',
                            width: 6,
                            borderRadius: 3,
                          },
                        }),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartBarLabel} numberOfLines={1}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </Card>
  );
};

interface ActivityItem {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  time: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  title?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, title = 'Recent Activity' }) => (
  <Card
    style={styles.timelineCard}
    {...(Platform.OS === 'web' ? { className: 'luxury-card card-tint-activity' } : {})}
    elevated
  >
    <Text style={styles.timelineTitle}>{title}</Text>
    <View style={styles.timelineList}>
      {activities.map((activity, index) => {
        const Icon = activity.icon;
        const isLast = index === activities.length - 1;
        return (
          <View key={activity.id} style={styles.timelineItem}>
            <View style={styles.timelineLeftCol}>
              <View
                style={[
                  styles.timelineIconBg,
                  {
                    backgroundColor: activity.iconBg,
                    borderWidth: 1,
                    borderColor: `${activity.iconColor}22`,
                  },
                ]}
              >
                <Icon color={activity.iconColor} size={16} />
              </View>
              {!isLast && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineRightCol}>
              <View style={styles.timelineRow}>
                <Text style={styles.timelineItemTitle}>{activity.title}</Text>
                <Text style={styles.timelineItemTime}>{activity.time}</Text>
              </View>
              <Text style={styles.timelineItemDesc}>{activity.description}</Text>
            </View>
          </View>
        );
      })}
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderRadius: 24,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: Theme.spacing.md,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.14) 0%, rgba(37, 99, 235, 0.08) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 15px 45px rgba(37, 99, 235, 0.12)',
      } as any,
      default: Theme.cardShadow as any,
    }),
  },
  skeleton: { backgroundColor: '#E2E8F0' },
  scoreBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Theme.radius.medium,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 72,
  },
  scoreBadgeLabel: {
    fontFamily: Theme.typography.sans,
    fontSize: 10,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  scoreBadgeValue: { fontFamily: Theme.typography.sans, fontSize: 16, fontWeight: '800', marginTop: 2 },
  metricCard: {
    padding: Theme.spacing.lg,
    flex: 1,
    minWidth: 140,
    marginHorizontal: Theme.spacing.xs,
    position: 'relative',
    overflow: 'hidden',
  },
  metricAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: 6 },
  metricContent: { flex: 1 },
  metricTitle: { fontFamily: Theme.typography.sans, fontSize: 13, fontWeight: '600', color: Theme.colors.textMuted, marginBottom: Theme.spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValue: { fontFamily: Theme.typography.sans, fontSize: 32, fontWeight: '800', color: Theme.colors.textPrimary, letterSpacing: -0.8 },
  metricIconContainer: { width: 44, height: 44, borderRadius: Theme.radius.medium, justifyContent: 'center', alignItems: 'center' },
  metricFooter: { flexDirection: 'row', alignItems: 'center', marginTop: Theme.spacing.sm, paddingLeft: 6 },
  metricChange: { fontFamily: Theme.typography.sans, fontSize: 12, fontWeight: '700' },
  metricSubtext: { fontFamily: Theme.typography.sans, fontSize: 12, color: Theme.colors.textMuted },
  badge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10, borderRadius: Theme.radius.round, borderWidth: 1, alignSelf: 'flex-start' },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontFamily: Theme.typography.sans, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  ringContainer: { alignItems: 'center' },
  ringOuter: { borderWidth: 6, alignItems: 'center', justifyContent: 'center' },
  ringLabel: { fontFamily: Theme.typography.sans, fontSize: 12, fontWeight: '600', color: Theme.colors.textSecondary, marginTop: 10 },
  button: { justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { opacity: 0.55 },
  buttonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: Theme.typography.sans, fontWeight: '600', textAlign: 'center' },
  inputContainer: { marginBottom: Theme.spacing.md, width: '100%' },
  inputLabel: { fontFamily: Theme.typography.sans, fontSize: 13, fontWeight: '600', color: Theme.colors.textPrimary, marginBottom: 6 },
  input: {
    fontFamily: Theme.typography.sans,
    backgroundColor: Theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.medium,
    paddingVertical: Theme.spacing.sm + 2,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 14,
    color: Theme.colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: 'none' } as object }),
  },
  inputErrorBorder: { borderColor: Theme.colors.danger },
  inputErrorText: { fontFamily: Theme.typography.sans, fontSize: 11, color: Theme.colors.danger, marginTop: 4 },
  chartCard: {
    padding: Theme.spacing.xxl,
    marginBottom: Theme.spacing.xl,
    backgroundColor: 'rgba(99, 102, 241, 0.16)',
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(99, 102, 241, 0.08) 100%)',
      } as any,
    }),
  },
  chartTitle: { fontFamily: Theme.typography.sans, fontSize: 15, fontWeight: '700', color: Theme.colors.textPrimary, marginBottom: Theme.spacing.lg },
  chartContainer: { position: 'relative', width: '100%', justifyContent: 'flex-end' },
  chartGridLines: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 28, justifyContent: 'space-between' },
  chartGridRow: { borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.25)', width: '100%' },
  chartBarsArea: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: '100%', paddingBottom: 28, paddingHorizontal: Theme.spacing.sm },
  chartBarCol: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  chartBarWrapper: { width: '100%', alignItems: 'center', justifyContent: 'flex-end', flexGrow: 1 },
  chartBarValue: { fontFamily: Theme.typography.sans, fontSize: 10, fontWeight: '600', color: Theme.colors.textSecondary, marginBottom: 4 },
  chartBar: { width: 28, borderTopLeftRadius: 6, borderTopRightRadius: 6, maxWidth: '65%' },
  chartBarLabel: { fontFamily: Theme.typography.sans, fontSize: 11, color: Theme.colors.textMuted, marginTop: 8, textAlign: 'center' },
  chartLinesArea: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: '100%', paddingBottom: 28, width: '100%' },
  chartLineCol: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  chartLineDotContainer: { position: 'relative', width: '100%', flexGrow: 1, justifyContent: 'flex-end', alignItems: 'center' },
  chartLineDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 2.5, backgroundColor: Theme.colors.cardBackground, zIndex: 2, transform: [{ translateY: 5 }] },
  chartLineStem: { width: 2, borderRadius: 1, position: 'absolute', bottom: 0 },
  chartLineValue: { position: 'absolute', fontFamily: Theme.typography.sans, fontSize: 10, fontWeight: '600', color: Theme.colors.textSecondary, bottom: '82%', alignSelf: 'center' },
  timelineCard: {
    padding: Theme.spacing.xxl,
    marginBottom: Theme.spacing.xl,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(135deg, rgba(15, 23, 42, 0.35) 0%, rgba(37, 99, 235, 0.15) 100%)',
      } as any,
    }),
  },
  timelineTitle: { fontFamily: Theme.typography.sans, fontSize: 15, fontWeight: '700', color: Theme.colors.textPrimary, marginBottom: Theme.spacing.lg },
  timelineList: { marginTop: 4 },
  timelineItem: { flexDirection: 'row', marginBottom: Theme.spacing.md },
  timelineLeftCol: { alignItems: 'center', marginRight: Theme.spacing.md, width: 36 },
  timelineIconBg: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  timelineLine: { width: 2, backgroundColor: Theme.colors.border, flexGrow: 1, position: 'absolute', top: 36, bottom: -16, zIndex: 1 },
  timelineRightCol: { flex: 1, paddingTop: 2 },
  timelineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  timelineItemTitle: { fontFamily: Theme.typography.sans, fontSize: 14, fontWeight: '600', color: Theme.colors.textPrimary },
  timelineItemTime: { fontFamily: Theme.typography.sans, fontSize: 11, color: Theme.colors.textMuted },
  timelineItemDesc: { fontFamily: Theme.typography.sans, fontSize: 13, color: Theme.colors.textSecondary, lineHeight: 18 },
});
