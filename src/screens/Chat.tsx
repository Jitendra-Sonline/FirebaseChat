import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Keyboard, Text, ActivityIndicator } from 'react-native';
import { GiftedChat, Bubble, Send, InputToolbar, IMessage } from 'react-native-gifted-chat';
import { auth, database } from '../config/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { colors } from '../config/constants';
import EmojiModal from 'react-native-emoji-modal';
import { useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
  const [modal, setModal] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(database, 'chats', route.params.id), (docSnap) => {
      const chatData = docSnap.data();
      if (chatData?.messages) {
        setMessages(chatData.messages.map((message: any) => ({
          ...message,
          createdAt: message.createdAt.toDate(),
          image: message.image ?? '',
        })));
      }
    });

    return () => unsubscribe();
  }, [route.params.id]);

  const onSend = useCallback(async (m: ChatMessage[] = []) => {
    const chatDocRef = doc(database, 'chats', route.params.id);
    const chatDocSnap = await getDoc(chatDocRef);
    const chatData = chatDocSnap.data();
    const data = chatData?.messages?.map((message: any) => ({
      ...message,
      createdAt: message.createdAt.toDate(),
      image: message.image ?? '',
    })) || [];

    const messagesWillSend = [{ ...m[0], sent: true, received: false }];
    const chatMessages = GiftedChat.append(data, messagesWillSend);

    await setDoc(doc(database, 'chats', route.params.id), {
      messages: chatMessages,
      lastUpdated: Date.now(),
    }, { merge: true });
  }, [route.params.id]);

  const pickImage = async () => {
    // Your image picking logic
  };

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
      <TouchableOpacity style={styles.addImageIcon} onPress={pickImage}>
        <View>
          <Ionicons
            name='attach-outline'
            size={32}
            color={colors.teal} />
        </View>
      </TouchableOpacity>
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

  const renderInputToolbar = useMemo(() => (props: any) => (
    <InputToolbar {...props}
      containerStyle={styles.inputToolbar}
      renderActions={renderActions}
    />
  ), []);

  const renderActions = useMemo(() => () => (
    <TouchableOpacity style={styles.emojiIcon} onPress={handleEmojiPanel}>
      <View>
        <Ionicons
          name='happy-outline'
          size={32}
          color={colors.teal} />
      </View>
    </TouchableOpacity>
  ), [modal]);

  const handleEmojiPanel = useCallback(() => {
    if (modal) {
      setModal(false);
    } else {
      Keyboard.dismiss();
      setModal(true);
    }
  }, [modal]);

  const renderLoading = useMemo(() => () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size='large' color={colors.teal} />
    </View>
  ), []);

  const renderLoadingUpload = useMemo(() => () => (
    <View style={styles.loadingContainerUpload}>
      <ActivityIndicator size='large' color={colors.teal} />
    </View>
  ), []);

  return (
    <>
      {uploading && renderLoadingUpload()}
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={false}
        showUserAvatar={false}
        onSend={messages => onSend(messages)}
        imageStyle={{ height: 212, width: 212 }}
        messagesContainerStyle={{ backgroundColor: '#fff' }}
        textInputStyle={{ backgroundColor: '#fff', borderRadius: 20 }}
        user={{
          _id: auth?.currentUser?.email,
          name: auth?.currentUser?.displayName,
          avatar: 'https://i.pravatar.cc/300',
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderUsernameOnMessage={true}
        renderAvatarOnTop={true}
        renderInputToolbar={renderInputToolbar}
        minInputToolbarHeight={56}
        scrollToBottom={true}
        onPressActionButton={handleEmojiPanel}
        scrollToBottomStyle={styles.scrollToBottomStyle}
        renderLoading={renderLoading}
      />

      {modal &&
        <EmojiModal
          onPressOutside={handleEmojiPanel}
          modalStyle={styles.emojiModal}
          containerStyle={styles.emojiContainerModal}
          backgroundStyle={styles.emojiBackgroundModal}
          columns={5}
          emojiSize={66}
          activeShortcutColor={colors.primary}
          onEmojiSelected={(emoji) => {
            onSend([{
              _id: uuid.v4() as string,
              createdAt: new Date(),
              text: emoji,
              user: {
                _id: auth?.currentUser?.email,
                name: auth?.currentUser?.displayName,
                avatar: 'https://i.pravatar.cc/300',
              },
            }]);
          }}
        />
      }
    </>
  );
};

const styles = StyleSheet.create({
  inputToolbar: {
    bottom: 6,
    marginLeft: 8,
    marginRight: 8,
    borderRadius: 16,
  },
  emojiIcon: {
    marginLeft: 4,
    bottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  emojiModal: {},
  emojiContainerModal: {
    height: 348,
    width: 396,
  },
  emojiBackgroundModal: {},
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
  addImageIcon: {
    bottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainerUpload: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
});

export default Chat;
