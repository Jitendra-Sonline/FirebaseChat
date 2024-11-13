import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GiftedChat, Bubble, Send, IMessage } from 'react-native-gifted-chat';
import { colors } from '../config/constants';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthenticatedUserContext } from '../contexts/AuthenticatedUserContext';
import { getAuth } from "@react-native-firebase/auth";
import firestore from '@react-native-firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ChatProps {
  route: {
    params: {
      id: string;
    };
  };
}

interface ChatMessage extends IMessage {
  image?: string;
  createdAt: Date;
}

const Chat: React.FC<ChatProps> = ({ route }) => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { user } = useContext(AuthenticatedUserContext)!;
  const auth = getAuth();

  useEffect(() => {
    // Reference the specific chat document
    const chatRef = firestore().collection('chats').doc(route.params.id);

    // Subscribe to real-time updates on the chat document
    const unsubscribe = chatRef.onSnapshot((docSnap) => {
      const chatData = docSnap.data();
      if (chatData?.messages) {
        // Map over messages to format them as needed
        setMessages(
          chatData.messages.map((message: any) => ({
            ...message,
            createdAt: message.createdAt.toDate(),
            image: message.image ?? '',
          }))
        );
      }
    });

    // Cleanup the subscription on component unmount
    return () => unsubscribe();
  }, [route.params.id]);

  const onSend = useCallback(async (m: IMessage[] = []) => {
    const chatDocRef = firestore().collection('chats').doc(route.params.id);
    const chatDocSnap = await chatDocRef.get();
    const chatData = chatDocSnap.data();

    // Retrieve existing messages and format them
    const existingMessages = chatData?.messages?.map((message: any) => ({
      ...message,
      createdAt: message.createdAt.toDate(),
      image: message.image ?? '',
    })) || [];

    // Add the new message to the chat
    const newMessage = [{ ...m[0], sent: true, received: false }];
    const chatMessages = GiftedChat.append(existingMessages, newMessage);

    // Update the chat document with the new messages and last updated timestamp
    await chatDocRef.set({
      messages: chatMessages,
      lastUpdated: Date.now(),
    }, { merge: true });
  }, [route.params.id]);

  const renderBubble = useMemo(() => (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: colors.primary },
        left: { backgroundColor: 'lightgrey' },
      }}
    />
  ), []);

  const renderSend = useMemo(() => (props: any) => (
    <>
      <Send {...props}>
        <View style={{ justifyContent: 'center', height: '100%', marginLeft: 8, marginRight: 4, marginTop: 12 }}>
          <Ionicons
            name='send'
            size={24}
            color={colors.teal} />
        </View>
      </Send>
    </>
  ), []);

  const renderLoading = useMemo(() => () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size='large' color={colors.teal} />
    </View>
  ), []);

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={false}
        showUserAvatar={false}
        onSend={messages => onSend(messages)}
        imageStyle={{ height: 212, width: 212 }}
        messagesContainerStyle={{ backgroundColor: '#fff' }}
        user={{
          _id: auth?.currentUser?.email ?? '',
          name: user?.displayName ?? '',
          avatar: 'https://i.pravatar.cc/300',
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderUsernameOnMessage={true}
        renderAvatarOnTop={true}
        minInputToolbarHeight={56}
        scrollToBottom={true}
        scrollToBottomStyle={styles.scrollToBottomStyle}
        renderLoading={renderLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputToolbar: {
    bottom: 6,
    marginLeft: 8,
    marginRight: 8,
    borderRadius: 16,
  },
  scrollToBottomStyle: {
    borderColor: colors.grey,
    borderWidth: 1,
    width: 56,
    height: 56,
    borderRadius: 28,
    position: 'absolute',
    bottom: 12,
    right: 12,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

});

export default Chat;
