import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api';
import {
  calculateDaysRemaining,
  computeDescriptionCompleteness,
  calculateExpiresAt,
  calculateListingHealthScore,
  calculatePropertyTrustScore,
  computeDelistingState,
  computeVerificationFreshness,
  computeVerificationStats,
  daysSinceVerification,
  getExpiryNotificationType,
  getHealthScoreCategory,
  getTrustScoreCategory,
  isPropertyTenantVisible,
  normalizePipelineStatus,
  toISODate,
  type PropertyListingStatus,
  type PropertyPipelineStatus,
  type PropertyVerificationState,
  type PropertyVisibility,
  type ScoreCategory,
  type VerificationImage,
  type VerificationRecord,
  type VerificationStats,
  type VerificationStatusHistoryEntry,
} from '../utils/verificationHelpers';

// Re-export types for consumers
export type {
  PropertyListingStatus,
  PropertyPipelineStatus,
  PropertyVerificationState,
  PropertyVisibility,
  ScoreCategory,
  VerificationImage,
  VerificationRecord,
  VerificationStats,
};

export interface Property {
  id: string;
  name: string;
  location: string;
  rent: string;
  /** Automated AI pipeline stage */
  status: PropertyPipelineStatus;
  image: string;
  views: number;
  favorites: number;
  appointments: number;
  rating: number;
  reviewsCount: number;
  description: string;
  imageCount: number;
  publishedAt: string;
  expiresAt: string;
  daysRemaining: number;
  listingStatus: PropertyListingStatus;
  visibility: PropertyVisibility;
  verificationState: PropertyVerificationState;
  trustScore: number;
  listingHealthScore: number;
  complaintCount: number;
  lastVerifiedAt: string | null;
  previousVerifiedAt: string | null;
  verificationHistory: VerificationRecord[];
  duplicateRisk: boolean;
  expiryNotified7: boolean;
  expiryNotified3: boolean;
  expiryNotified0: boolean;
  images?: string[];
}

export interface Appointment {
  id: string;
  userName: string;
  propertyName: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Pending' | 'Completed' | 'Cancelled';
}

export interface ChatMessage {
  id: string;
  sender: 'owner' | 'user';
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  userName: string;
  avatar: string;
  lastMessage: string;
  unreadCount: number;
  typing: boolean;
  messages: ChatMessage[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
  propertyName: string;
  reply?: string;
}

export type NotificationType =
  | 'all'
  | 'appointments'
  | 'reviews'
  | 'verification'
  | 'propertyUpdates'
  | 'expiryWarning7'
  | 'expiryWarning3'
  | 'expired'
  | 'verificationRequired'
  | 'verificationSuccess'
  | 'verificationFailed'
  | 'trustScoreChange';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  propertyId?: string;
}

export interface OwnerVerificationRecord {
  id: number;
  ownerId: number;
  aadhaarDocument?: string | null;
  taxBillDocument?: string | null;
  propertyDeedDocument?: string | null;
  selfieDocument?: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  submittedAt?: string | null;
  verifiedAt?: string | null;
}

export interface VerificationStatus {
  email: boolean;
  mobile: boolean;
  aadhaar: boolean;
  aiVerified: boolean;
  admin: boolean;
}

export interface OwnerProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface FraudMetrics {
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  duplicateCount: number;
  complaints: number;
}

export interface AddPropertyInput {
  name: string;
  location: string;
  rent: string;
  status?: PropertyPipelineStatus;
  image: string;
  description?: string;
  imageCount?: number;
  images?: string[];
}

export interface ReVerifyImageInput {
  uri: string;
  type: VerificationImage['type'];
}

interface AppContextProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  properties: Property[];
  tenantVisibleProperties: Property[];
  addProperty: (property: AddPropertyInput) => void;
  deleteProperty: (id: string) => void;
  updatePropertyStatus: (id: string, status: PropertyPipelineStatus) => void;
  reVerifyProperty: (propertyId: string, images: ReVerifyImageInput[]) => Promise<void>;
  processPropertyPipeline: (propertyId: string) => void;
  isReVerifying: boolean;
  appointments: Appointment[];
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  conversations: Conversation[];
  sendChatMessage: (conversationId: string, text: string) => void;
  reviews: Review[];
  replyToReview: (reviewId: string, replyText: string) => void;
  notifications: Notification[];
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
  verificationStatus: VerificationStatus;
  updateVerification: (type: keyof VerificationStatus, val: boolean) => void;
  ownerVerification: OwnerVerificationRecord | null;
  refreshOwnerVerification: () => Promise<void>;
  ownerProfile: OwnerProfile;
  trustScore: number;
  reputationScore: number;
  fraudMetrics: FraudMetrics;
  updateFraudScore: (score: number) => void;
  getVerificationStats: () => VerificationStats;
  getPropertyTrustCategory: (score: number) => ScoreCategory;
  getPropertyHealthCategory: (score: number) => ScoreCategory;
  isPropertyTenantVisible: (property: Property) => boolean;
  refreshPropertyExpiry: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function enrichProperty(base: Omit<Property, 'daysRemaining'>): Property {
  const delisting = computeDelistingState(base.publishedAt);
  const expiresAt = base.expiresAt ?? calculateExpiresAt(base.publishedAt);
  const daysRemaining = calculateDaysRemaining(expiresAt);
  return {
    ...base,
    expiresAt,
    daysRemaining,
    listingStatus: delisting.listingStatus,
    visibility: delisting.visibility,
  };
}

function buildPropertyScores(
  property: Property,
  verifiedOwner: boolean,
  overrides?: Partial<Pick<Property, 'trustScore' | 'listingHealthScore' | 'lastVerifiedAt'>>
): Pick<Property, 'trustScore' | 'listingHealthScore'> {
  const lastVerified = overrides?.lastVerifiedAt ?? property.lastVerifiedAt;
  const trustScore =
    overrides?.trustScore ??
    calculatePropertyTrustScore({
      recentVerification: property.verificationState === 'Verified',
      activeListing: property.listingStatus === 'Active' || property.listingStatus === 'Expiring Soon',
      noComplaints: property.complaintCount === 0,
      successfulAiValidation: property.verificationState === 'Verified',
      verifiedOwner,
      noDuplicateDetection: !property.duplicateRisk,
      daysSinceVerification: daysSinceVerification(lastVerified),
    });

  const listingHealthScore =
    overrides?.listingHealthScore ??
    calculateListingHealthScore({
      descriptionCompleteness: computeDescriptionCompleteness(property.description),
      imageCount: property.imageCount,
      verificationFreshness: computeVerificationFreshness(lastVerified),
      trustScore,
      complaintCount: property.complaintCount,
    });

  return { trustScore, listingHealthScore };
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isReVerifying, setIsReVerifying] = useState(false);
  const pipelineTimers = useRef<Record<string, ReturnType<typeof setTimeout>[]>>({});
  const localPropertyImagesRef = useRef<Record<string, string[]>>({});

  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>({
    name: 'Alex Sterling',
    email: 'alex.sterling@enterprise.com',
    phone: '+1 (555) 019-2834',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80',
  });

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    email: true,
    mobile: true,
    aadhaar: false,
    aiVerified: false,
    admin: false,
  });

  const [trustScore, setTrustScore] = useState(96);
  const [reputationScore, setReputationScore] = useState(888);
  const [isLoading, setIsLoading] = useState(false);
  const [ownerVerification, setOwnerVerification] = useState<OwnerVerificationRecord | null>(null);

  const refreshOwnerVerification = async () => {
    try {
      const ver = await api.getVerificationByOwner(1);
      setOwnerVerification(ver);
      
      // Sync legacy verificationStatus with the real one
      setVerificationStatus(prev => ({
        ...prev,
        aiVerified: ver.status === 'VERIFIED',
        admin: ver.status === 'VERIFIED'
      }));
    } catch (e) {
      console.log('No verification found or error fetching verification');
    }
  };

  useEffect(() => {
    let score = 30;
    if (verificationStatus.email) score += 15;
    if (verificationStatus.mobile) score += 15;
    if (verificationStatus.aadhaar) score += 20;
    if (verificationStatus.aiVerified) score += 20;
    setTrustScore(score);
    setReputationScore(600 + score * 3);
  }, [verificationStatus]);

  const [properties, setProperties] = useState<Property[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [fraudMetrics, setFraudMetrics] = useState<FraudMetrics>({
    score: 4,
    riskLevel: 'Low',
    duplicateCount: 0,
    complaints: 0,
  });

  // Mapper helper
  const mapBackendPropertyToFrontend = useCallback((item: any): Property => {
    const localImgs = localPropertyImagesRef.current[item.id.toString()];
    const hasLocalImgs = localImgs && localImgs.length > 0;

    const base = enrichProperty({
      id: item.id.toString(),
      name: item.title,
      location: item.addressLine,
      rent: `$${Math.round(item.rentAmount)}`,
      status: item.status === 'AVAILABLE' ? 'Published' : 'AI Analysis',
      image: hasLocalImgs ? localImgs[0] : (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80'),
      views: 120,
      favorites: 15,
      appointments: 0,
      rating: 4.8,
      reviewsCount: 0,
      description: item.description,
      imageCount: hasLocalImgs ? localImgs.length : (item.imageUrls ? item.imageUrls.length : 5),
      images: hasLocalImgs ? localImgs : (item.imageUrls || []),
      publishedAt: item.createdAt ? item.createdAt.split('T')[0] : daysAgoISO(8),
      expiresAt: calculateExpiresAt(item.createdAt ? item.createdAt.split('T')[0] : daysAgoISO(8)),
      listingStatus: 'Active',
      visibility: 'public',
      verificationState: item.status === 'AVAILABLE' ? 'Verified' : 'Verification Pending',
      trustScore: 90,
      listingHealthScore: 85,
      complaintCount: 0,
      lastVerifiedAt: daysAgoISO(3),
      previousVerifiedAt: daysAgoISO(33),
      verificationHistory: [],
      duplicateRisk: false,
      expiryNotified7: false,
      expiryNotified3: false,
      expiryNotified0: false,
    });

    const scores = buildPropertyScores(base, true);
    return { ...base, ...scores };
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read'>) => {
    setNotifications((prev) => [
      { ...notification, id: createId(), read: false },
      ...prev,
    ]);
  }, []);

  const applyExpiryToProperty = useCallback((property: Property): Property => {
    const delisting = computeDelistingState(property.publishedAt);
    const daysRemaining = calculateDaysRemaining(property.expiresAt);
    const enriched = enrichProperty({
      ...property,
      listingStatus: delisting.listingStatus,
      visibility: delisting.visibility,
    });
    const scores = buildPropertyScores(enriched, verificationStatus.aiVerified);
    return { ...enriched, daysRemaining, ...scores };
  }, [verificationStatus.aiVerified]);

  const refreshPropertyExpiry = useCallback(() => {
    setProperties((prev) =>
      prev.map((property) => {
        const updated = applyExpiryToProperty(property);
        const notifType = getExpiryNotificationType(updated.daysRemaining);
        let flags = { ...updated };

        if (notifType === 'expiryWarning7' && !property.expiryNotified7) {
          flags = { ...flags, expiryNotified7: true };
          addNotification({
            type: 'expiryWarning7',
            title: 'Property Expires in 7 Days',
            description: `"${property.name}" expires in 7 days. Schedule live re-verification to stay published.`,
            time: 'Just now',
            propertyId: property.id,
          });
        } else if (notifType === 'expiryWarning3' && !property.expiryNotified3) {
          flags = { ...flags, expiryNotified3: true };
          addNotification({
            type: 'expiryWarning3',
            title: 'Property Expires in 3 Days',
            description: `"${property.name}" expires in 3 days. Re-verify now to avoid delisting.`,
            time: 'Just now',
            propertyId: property.id,
          });
        } else if (notifType === 'expired' && !property.expiryNotified0) {
          flags = { ...flags, expiryNotified0: true };
          addNotification({
            type: 'expired',
            title: 'Property Listing Expired',
            description: `"${property.name}" has expired. It is now hidden from tenant search until re-verified.`,
            time: 'Just now',
            propertyId: property.id,
          });
        }

        if (
          updated.listingStatus === 'Hidden' &&
          property.listingStatus !== 'Hidden' &&
          property.listingStatus !== 'Archived'
        ) {
          addNotification({
            type: 'expired',
            title: 'Listing Hidden from Tenants',
            description: `"${property.name}" was hidden from search 7 days after expiry.`,
            time: 'Just now',
            propertyId: property.id,
          });
        }

        if (updated.listingStatus === 'Archived' && property.listingStatus !== 'Archived') {
          addNotification({
            type: 'expired',
            title: 'Listing Archived',
            description: `"${property.name}" has been archived. Re-verify to reactivate.`,
            time: 'Just now',
            propertyId: property.id,
          });
        }

        return flags;
      })
    );
  }, [addNotification, applyExpiryToProperty]);

  // Sync / Load logic on mount
  useEffect(() => {
    const syncData = async () => {
      setIsLoading(true);
      try {
        // 1. Sync Owner with ID 1
        let owner;
        try {
          owner = await api.getOwner(1);
          setOwnerProfile({
            name: owner.name,
            email: owner.email,
            phone: owner.phone,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80',
          });
        } catch (e) {
          // If Owner 1 does not exist, create it
          owner = await api.createOwner({
            name: 'Alex Sterling',
            email: 'alex.sterling@enterprise.com',
            phone: '+1 (555) 019-2834',
            password: 'defaultPassword123'
          });
          setOwnerProfile({
            name: owner.name,
            email: owner.email,
            phone: owner.phone,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80',
          });
        }
        
        await refreshOwnerVerification();

        // 2. Fetch properties
        const propsList = await api.getPropertiesByOwner(1);
        const frontendProps = propsList.map(mapBackendPropertyToFrontend);
        setProperties(frontendProps);

        // 3. Fetch appointments
        const apptsList = await api.getAppointmentsByOwner(1);
        const mappedAppts: Appointment[] = apptsList.map((item: any) => {
          const matchedProp = propsList.find((p: any) => p.id === item.propertyId);
          const propTitle = matchedProp ? matchedProp.title : 'My Property';

          let uiStatus: Appointment['status'] = 'Pending';
          if (item.status === 'CONFIRMED') uiStatus = 'Upcoming';
          else if (item.status === 'COMPLETED') uiStatus = 'Completed';
          else if (item.status === 'CANCELLED') uiStatus = 'Cancelled';

          return {
            id: item.id.toString(),
            userName: item.tenantName,
            propertyName: propTitle,
            date: item.appointmentDate.split('T')[0],
            time: item.appointmentDate.split('T')[1]?.substring(0, 5) || '12:00',
            status: uiStatus
          };
        });
        setAppointments(mappedAppts);

        // 4. Fetch notifications
        const notifsList = await api.getNotificationsByOwner(1);
        const mappedNotifs: Notification[] = notifsList.map((item: any) => ({
          id: item.id.toString(),
          type: item.notificationType as any,
          title: item.title,
          description: item.message,
          time: 'Just now',
          read: item.isRead
        }));
        setNotifications(mappedNotifs);

        // 5. Fetch reviews
        const reviewsCombined: Review[] = [];
        for (const p of propsList) {
          const reviewItems = await api.getReviewsByProperty(p.id);
          for (const r of reviewItems) {
            reviewsCombined.push({
              id: r.id.toString(),
              userName: r.tenantName,
              rating: r.rating,
              text: r.comment,
              date: r.createdAt ? r.createdAt.split('T')[0] : daysAgoISO(2),
              propertyName: p.title,
              reply: r.replyMessage || undefined
            });
          }
        }
        setReviews(reviewsCombined);

      } catch (err) {
        console.warn("Backend is not running. Please start Spring Boot on localhost:8080. Error: " + err);
      } finally {
        setIsLoading(false);
      }
    };

    syncData();
  }, [mapBackendPropertyToFrontend]);

  useEffect(() => {
    refreshPropertyExpiry();
    const interval = setInterval(refreshPropertyExpiry, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshPropertyExpiry]);

  useEffect(() => {
    return () => {
      Object.values(pipelineTimers.current).forEach((timers) => timers.forEach(clearTimeout));
    };
  }, []);

  const processPropertyPipeline = useCallback(
    (propertyId: string) => {
      // Mock pipeline removed
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id !== propertyId) return p;
          const publishedAt = toISODate(new Date());
          return applyExpiryToProperty({
            ...p,
            status: 'Published',
            verificationState: 'Verified',
            publishedAt,
            expiresAt: calculateExpiresAt(publishedAt),
            listingStatus: 'Active',
            visibility: 'public',
            expiryNotified7: false,
            expiryNotified3: false,
            expiryNotified0: false,
          });
        })
      );
      
      addNotification({
        type: 'verificationSuccess',
        title: 'Property Verified & Published',
        description: `Your property passed verification and is now live.`,
        time: 'Just now',
        propertyId,
      });
    },
    [addNotification, applyExpiryToProperty]
  );

  const reVerifyProperty = useCallback(
    async (propertyId: string, images: ReVerifyImageInput[]): Promise<void> => {
      setIsReVerifying(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId
            ? {
                ...p,
                status: 'Published',
                verificationState: 'Verified',
              }
            : p
        )
      );
      addNotification({
        type: 'verificationSuccess',
        title: 'Verification Successful',
        description: `Property reverification passed successfully.`,
        time: 'Just now',
        propertyId,
      });
      setIsReVerifying(false);
    },
    [addNotification]
  );

  const addProperty = (newProp: AddPropertyInput) => {
    // 1. Prepare parameters matching PropertyRequestDTO
    const rentVal = parseFloat(newProp.rent.replace(/[^0-9.]/g, '')) || 1500.00;
    const reqDto = {
      title: newProp.name,
      description: newProp.description || 'No description provided.',
      propertyType: 'Apartment',
      status: 'AVAILABLE',
      addressLine: newProp.location,
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      rentAmount: rentVal,
      depositAmount: rentVal * 2
    };

    // 2. Call backend
    api.createProperty(1, reqDto)
      .then((savedProp) => {
        // Cache images locally for session persistence
        if (newProp.images && newProp.images.length > 0) {
          localPropertyImagesRef.current[savedProp.id.toString()] = newProp.images;
        }

        const enriched = mapBackendPropertyToFrontend(savedProp);
        if (newProp.images && newProp.images.length > 0) {
          enriched.image = newProp.images[0];
          enriched.images = newProp.images;
          enriched.imageCount = newProp.images.length;
        } else if (newProp.image) {
          enriched.image = newProp.image;
        }

        setProperties((prev) => [enriched, ...prev]);

        addNotification({
          type: 'propertyUpdates',
          title: 'Property Submitted',
          description: `"${enriched.name}" has been submitted to the automated AI verification pipeline.`,
          time: 'Just now',
          propertyId: enriched.id,
        });

        processPropertyPipeline(enriched.id);
      })
      .catch((err) => {
        console.warn("Failed to add property to backend:", err);
      });
  };

  const deleteProperty = (id: string) => {
    api.deleteProperty(id)
      .then(() => {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        if (pipelineTimers.current[id]) {
          pipelineTimers.current[id].forEach(clearTimeout);
          delete pipelineTimers.current[id];
        }
      })
      .catch((err) => {
        console.warn("Failed to delete property on backend:", err);
      });
  };

  const updatePropertyStatus = (id: string, status: PropertyPipelineStatus) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? applyExpiryToProperty({ ...p, status: normalizePipelineStatus(status) }) : p))
    );
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    // Map status string: Upcoming -> CONFIRMED, Pending -> PENDING, Completed -> COMPLETED, Cancelled -> CANCELLED
    let backendStatus = 'PENDING';
    if (status === 'Upcoming') backendStatus = 'CONFIRMED';
    else if (status === 'Pending') backendStatus = 'PENDING';
    else if (status === 'Completed') backendStatus = 'COMPLETED';
    else if (status === 'Cancelled') backendStatus = 'CANCELLED';

    api.updateAppointmentStatus(id, backendStatus)
      .then(() => {
        setAppointments((prev) => {
          const appt = prev.find((a) => a.id === id);
          if (appt) {
            addNotification({
              type: 'appointments',
              title: `Appointment ${status}`,
              description: `You have ${status.toLowerCase()} the appointment with ${appt.userName} for ${appt.propertyName}.`,
              time: 'Just now',
            });
          }
          return prev.map((a) => (a.id === id ? { ...a, status } : a));
        });
      })
      .catch((err) => {
        console.warn("Failed to update appointment status on backend:", err);
      });
  };

  const sendChatMessage = (conversationId: string, text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage: ChatMessage = {
      id: createId(),
      sender: 'owner',
      text,
      time,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: [...c.messages, newMessage],
            lastMessage: text,
            unreadCount: 0,
          };
        }
        return c;
      })
    );

    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, typing: true } : c))
      );

      setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const autoReply: ChatMessage = {
          id: createId(),
          sender: 'user',
          text: 'Thanks for responding! I am review this and will get back to you shortly.',
          time: replyTime,
        };

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === conversationId) {
              return {
                ...c,
                typing: false,
                messages: [...c.messages, autoReply],
                lastMessage: autoReply.text,
              };
            }
            return c;
          })
        );

        setConversations((prev) => {
          const chatPartner = prev.find((c) => c.id === conversationId)?.userName || 'User';
          addNotification({
            type: 'all',
            title: `New message from ${chatPartner}`,
            description: autoReply.text,
            time: 'Just now',
          });
          return prev;
        });
      }, 1500);
    }, 1000);
  };

  const replyToReview = (reviewId: string, replyText: string) => {
    api.replyToReview(reviewId, replyText)
      .then(() => {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, reply: replyText } : r)));
      })
      .catch((err) => {
        console.warn("Failed to reply to review on backend:", err);
      });
  };

  const markAllNotificationsRead = () => {
    // Note: We can make multiple concurrent API patch calls to clear notifications
    notifications.forEach((n) => {
      if (!n.read) {
        api.markNotificationAsRead(n.id).catch(e => console.warn("Error marking notify read:", e));
      }
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const updateVerification = (type: keyof VerificationStatus, val: boolean) => {
    setVerificationStatus((prev) => {
      const next = { ...prev, [type]: val };
      if (type === 'aiVerified') next.admin = val;
      if (type === 'admin') next.aiVerified = val;
      return next;
    });
  };

  const updateFraudScore = (score: number) => {
    let level: 'Low' | 'Medium' | 'High' = 'Low';
    if (score > 30) level = 'Medium';
    if (score > 60) level = 'High';

    setFraudMetrics((prev) => ({
      ...prev,
      score,
      riskLevel: level,
    }));
  };

  const tenantVisibleProperties = properties.filter((p) =>
    isPropertyTenantVisible(p.listingStatus, p.visibility, p.status)
  );

  const getVerificationStats = () =>
    computeVerificationStats(
      properties.map((p) => ({
        verificationState: p.verificationState,
        listingStatus: p.listingStatus,
      }))
    );

  return (
    <AppContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        drawerOpen,
        setDrawerOpen,
        properties,
        tenantVisibleProperties,
        addProperty,
        deleteProperty,
        updatePropertyStatus,
        reVerifyProperty,
        processPropertyPipeline,
        isReVerifying,
        appointments,
        updateAppointmentStatus,
        conversations,
        sendChatMessage,
        reviews,
        replyToReview,
        notifications,
        markAllNotificationsRead,
        addNotification,
        verificationStatus,
        updateVerification,
        ownerVerification,
        refreshOwnerVerification,
        ownerProfile,
        trustScore,
        reputationScore,
        fraudMetrics,
        updateFraudScore,
        getVerificationStats,
        getPropertyTrustCategory: getTrustScoreCategory,
        getPropertyHealthCategory: getHealthScoreCategory,
        isPropertyTenantVisible: (property) =>
          isPropertyTenantVisible(property.listingStatus, property.visibility, property.status),
        refreshPropertyExpiry,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
