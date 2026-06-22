import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Send, ArrowLeft, Search, ShieldCheck, CalendarDays } from 'lucide-react-native';
import { Theme } from '../constants/dashboardTheme';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/DashboardComponents';

function getDateSeparatorLabel(timeStr: string, index: number): string | null {
  if (index === 0) return 'Today';
  if (timeStr.toLowerCase().includes('yesterday')) return null;
  if (timeStr.includes('days ago')) return null;
  return null;
}

export const MessagesScreen: React.FC = () => {
  const { conversations, sendChatMessage, setActiveScreen } = useApp();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const [activeChatId, setActiveChatId] = useState<string>('1');
  const [typedMessage, setTypedMessage] = useState('');
  const [listSearch, setListSearch] = useState('');
  const [showChatWindowMobile, setShowChatWindowMobile] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);

  const selectedConversation = conversations.find((c) => c.id === activeChatId) || conversations[0];

  useEffect(() => {
    if (chatScrollRef.current) {
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [selectedConversation?.messages.length, selectedConversation?.typing]);

  const handleSendMessage = () => {
    if (!typedMessage.trim() || !selectedConversation) return;
    sendChatMessage(selectedConversation.id, typedMessage.trim());
    setTypedMessage('');
  };

  const handleSelectConversation = (id: string) => {
    setActiveChatId(id);
    if (!isLargeScreen) setShowChatWindowMobile(true);
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.userName.toLowerCase().includes(listSearch.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(listSearch.toLowerCase())
  );

  const messagesWithSeparators = useMemo(() => {
    if (!selectedConversation) return [];
    const items: { type: 'separator' | 'message'; key: string; label?: string; message?: (typeof selectedConversation.messages)[0] }[] = [];
    selectedConversation.messages.forEach((msg, idx) => {
      const sep = getDateSeparatorLabel(msg.time, idx);
      if (sep || idx === 0) {
        items.push({ type: 'separator', key: `sep-${idx}`, label: idx === 0 ? 'Today' : sep ?? undefined });
      }
      items.push({ type: 'message', key: msg.id, message: msg });
    });
    return items;
  }, [selectedConversation]);

  const ConversationList = (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Messages</Text>
        <Text style={styles.listSubtitle}>{conversations.length} conversations</Text>
        <View style={styles.searchBarContainer}>
          <Search color={Theme.colors.textMuted} size={18} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search chats..."
            value={listSearch}
            onChangeText={setListSearch}
            placeholderTextColor={Theme.colors.textMuted}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.listScroll}>
        {filteredConversations.map((c) => {
          const isActive = activeChatId === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.convRow, isActive && styles.convRowActive]}
              onPress={() => handleSelectConversation(c.id)}
              activeOpacity={0.85}
            >
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: c.avatar }} style={styles.convAvatar} />
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.convDetails}>
                <View style={styles.convTitleRow}>
                  <Text style={[styles.convName, isActive && styles.convNameActive]}>{c.userName}</Text>
                  <Text style={styles.convTime}>{c.messages[c.messages.length - 1]?.time ?? ''}</Text>
                </View>
                <Text style={[styles.convLastMessage, c.unreadCount > 0 && styles.convLastMessageUnread]} numberOfLines={1}>
                  {c.typing ? 'typing...' : c.lastMessage}
                </Text>
              </View>
              {c.unreadCount > 0 && (
                <View style={styles.unreadCountBadge}>
                  <Text style={styles.unreadCountText}>{c.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const ActiveChatView = (
    <View style={styles.chatContainer}>
      {selectedConversation ? (
        <>
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderLeft}>
              {!isLargeScreen && (
                <TouchableOpacity style={styles.backButton} onPress={() => setShowChatWindowMobile(false)}>
                  <ArrowLeft color={Theme.colors.textPrimary} size={20} />
                </TouchableOpacity>
              )}
              <Image source={{ uri: selectedConversation.avatar }} style={styles.chatAvatar} />
              <View>
                <Text style={styles.chatName}>{selectedConversation.userName}</Text>
                <Text style={styles.chatStatus}>
                  {selectedConversation.typing ? 'typing...' : 'Online'}
                </Text>
              </View>
            </View>
            <View style={styles.chatHeaderRight}>
              <Badge text="Verified Owner" type="success" dot />
              <TouchableOpacity style={styles.bookBtn} onPress={() => setActiveScreen('appointments')} activeOpacity={0.8}>
                <CalendarDays color={Theme.colors.primary} size={16} />
                <Text style={styles.bookBtnText}>Book</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView ref={chatScrollRef} style={styles.messagesScroll} contentContainerStyle={styles.messagesContent}>
            <View style={styles.encryptionNotice}>
              <ShieldCheck color={Theme.colors.success} size={14} />
              <Text style={styles.encryptionText}>End-to-end owner messaging · Contact details protected</Text>
            </View>

            {messagesWithSeparators.map((item) => {
              if (item.type === 'separator' && item.label) {
                return (
                  <View key={item.key} style={styles.dateSeparatorRow}>
                    <View style={styles.dateSeparatorLine} />
                    <Text style={styles.dateSeparatorText}>{item.label}</Text>
                    <View style={styles.dateSeparatorLine} />
                  </View>
                );
              }
              if (item.type !== 'message' || !item.message) return null;
              const msg = item.message;
              const isOwner = msg.sender === 'owner';
              return (
                <View key={item.key} style={[styles.messageRow, isOwner ? styles.messageRowOwner : styles.messageRowUser]}>
                  {!isOwner && (
                    <Image source={{ uri: selectedConversation.avatar }} style={styles.messageAvatar} />
                  )}
                  <View style={[styles.messageBubble, isOwner ? styles.bubbleOwner : styles.bubbleUser]}>
                    <Text style={[styles.messageText, isOwner && styles.messageTextOwner]}>{msg.text}</Text>
                    <Text style={[styles.messageTime, isOwner && styles.messageTimeOwner]}>{msg.time}</Text>
                  </View>
                </View>
              );
            })}

            {selectedConversation.typing && (
              <View style={[styles.messageRow, styles.messageRowUser]}>
                <Image source={{ uri: selectedConversation.avatar }} style={styles.messageAvatar} />
                <View style={[styles.messageBubble, styles.bubbleUser, styles.typingBubble]}>
                  <Text style={styles.typingText}>{selectedConversation.userName} is typing...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
            style={styles.inputContainer}
          >
            <View style={styles.innerInputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                value={typedMessage}
                onChangeText={setTypedMessage}
                placeholderTextColor={Theme.colors.textMuted}
                onSubmitEditing={handleSendMessage}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !typedMessage.trim() && styles.sendBtnDisabled]}
                onPress={handleSendMessage}
                activeOpacity={0.85}
                disabled={!typedMessage.trim()}
              >
                <Send color="#FFFFFF" size={16} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      ) : (
        <View style={styles.noChatPlaceholder}>
          <Search color={Theme.colors.textMuted} size={48} style={{ marginBottom: 12 }} />
          <Text style={styles.placeholderTitle}>No Conversation Selected</Text>
          <Text style={styles.placeholderSubtitle}>Select a tenant from the list to start messaging.</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {isLargeScreen ? (
        <View style={styles.desktopLayout}>
          <View style={styles.desktopListCol}>{ConversationList}</View>
          <View style={styles.desktopChatCol}>{ActiveChatView}</View>
        </View>
      ) : (
        <View style={styles.mobileLayout}>{showChatWindowMobile ? ActiveChatView : ConversationList}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  desktopLayout: { flexDirection: 'row', height: '100%', width: '100%' },
  desktopListCol: {
    width: 340,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.20)',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      },
    }),
  } as any,
  desktopChatCol: { flex: 1, height: '100%' },
  mobileLayout: { flex: 1 },
  listContainer: { flex: 1, backgroundColor: 'transparent' },
  listHeader: { padding: Theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.20)' },
  listTitle: { fontFamily: Theme.typography.sans, fontSize: 20, fontWeight: '800', color: Theme.colors.textPrimary },
  listSubtitle: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: Theme.spacing.md,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.20)',
    borderRadius: Theme.radius.medium,
    paddingHorizontal: Theme.spacing.md,
    height: 42,
  },
  searchBar: {
    flex: 1,
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    color: Theme.colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: 'none' } as object }),
  },
  listScroll: { flex: 1 },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  convRowActive: { backgroundColor: 'rgba(37, 99, 235, 0.10)' },
  avatarWrapper: { position: 'relative', marginRight: Theme.spacing.md },
  convAvatar: { width: 48, height: 48, borderRadius: 24 },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.success,
    borderWidth: 2,
    borderColor: Theme.colors.cardBackground,
  },
  convDetails: { flex: 1, justifyContent: 'center' },
  convTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  convName: { fontFamily: Theme.typography.sans, fontSize: 14, fontWeight: '600', color: Theme.colors.textPrimary },
  convNameActive: { fontWeight: '800' },
  convTime: { fontFamily: Theme.typography.sans, fontSize: 11, color: Theme.colors.textMuted },
  convLastMessage: { fontFamily: Theme.typography.sans, fontSize: 13, color: Theme.colors.textSecondary },
  convLastMessageUnread: { fontWeight: '700', color: Theme.colors.textPrimary },
  unreadCountBadge: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
    minWidth: 22,
    alignItems: 'center',
  },
  unreadCountText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  chatContainer: { flex: 1, backgroundColor: 'transparent' },
  chatHeader: {
    height: 68,
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.30)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      },
    }),
  } as any,
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backButton: { marginRight: Theme.spacing.sm, padding: 4 },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: Theme.spacing.md },
  chatName: { fontFamily: Theme.typography.sans, fontSize: 15, fontWeight: '800', color: Theme.colors.textPrimary },
  chatStatus: { fontFamily: Theme.typography.sans, fontSize: 11, color: Theme.colors.success, fontWeight: '600' },
  chatHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Theme.radius.round,
    gap: 4,
  },
  bookBtnText: { fontFamily: Theme.typography.sans, fontSize: 11, fontWeight: '700', color: Theme.colors.primary },
  messagesScroll: { flex: 1 },
  messagesContent: { padding: Theme.spacing.lg, paddingBottom: 24 },
  encryptionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Theme.colors.lightSuccess,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.round,
    alignSelf: 'center',
    marginBottom: Theme.spacing.lg,
  },
  encryptionText: { fontFamily: Theme.typography.sans, fontSize: 11, color: Theme.colors.success, fontWeight: '600' },
  dateSeparatorRow: { flexDirection: 'row', alignItems: 'center', marginVertical: Theme.spacing.md, gap: Theme.spacing.sm },
  dateSeparatorLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.20)' },
  dateSeparatorText: {
    fontFamily: Theme.typography.sans,
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textMuted,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  messageRow: { flexDirection: 'row', marginBottom: Theme.spacing.sm, width: '100%', alignItems: 'flex-end' },
  messageRowOwner: { justifyContent: 'flex-end' },
  messageRowUser: { justifyContent: 'flex-start' },
  messageAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8, marginBottom: 2 },
  messageBubble: {
    maxWidth: '78%',
    paddingVertical: 9,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.radius.large,
  },
  bubbleOwner: {
    backgroundColor: Theme.colors.primary,
    borderBottomRightRadius: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 15px rgba(37, 99, 235, 0.25)',
      },
    }),
  },
  bubbleUser: {
    backgroundColor: 'rgba(255, 255, 255, 0.80)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.40)',
  },
  messageText: { fontFamily: Theme.typography.sans, fontSize: 14, color: Theme.colors.textPrimary, lineHeight: 20 },
  messageTextOwner: { color: '#FFFFFF' },
  messageTime: { fontFamily: Theme.typography.sans, fontSize: 10, color: Theme.colors.textMuted, marginTop: 4, textAlign: 'right' },
  messageTimeOwner: { color: 'rgba(255,255,255,0.75)' },
  typingBubble: { backgroundColor: 'rgba(255, 255, 255, 0.80)', paddingVertical: 8 },
  typingText: { fontFamily: Theme.typography.sans, fontSize: 12, fontStyle: 'italic', color: Theme.colors.textSecondary },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.30)',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      },
    }),
  } as any,
  innerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.20)',
    borderRadius: Theme.radius.round,
    paddingLeft: Theme.spacing.lg,
    paddingRight: 5,
    height: 46,
  },
  textInput: {
    flex: 1,
    fontFamily: Theme.typography.sans,
    fontSize: 14,
    color: Theme.colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: 'none' } as object }),
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: Theme.colors.textMuted, opacity: 0.5 },
  noChatPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Theme.spacing.xxxl },
  placeholderTitle: { fontFamily: Theme.typography.sans, fontSize: 16, fontWeight: '700', color: Theme.colors.textPrimary, marginBottom: 6 },
  placeholderSubtitle: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
});
