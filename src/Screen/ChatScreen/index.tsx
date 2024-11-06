import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import styles from './styles';

type ChatScreenProps = {
  route: {
    params: {
      userId: string;
      userName: string;
      currentUser: string
    };
  };
};

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { userId, userName, currentUser } = route.params;

  useEffect(() => {
    if (!currentUser) return;

    const chatId = [currentUser, userId].sort().join('_');
    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const messagesFirestore = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            _id: data._id,
            text: data.text,
            createdAt: new Date(),
            user: data.user,
          };
        });
        setMessages(messagesFirestore);
      });

    return () => unsubscribe();
  }, [userId, currentUser]);

  const handleSend = useCallback((newMessages: IMessage[] = []) => {
    const chatId = [currentUser, userId].sort().join('_');
    const message = newMessages[0];

    firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .add({
        ...message,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
  }, [userId]);

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => handleSend(messages)}
        user={{
          _id: currentUser || '',
          name: 'Me',
        }}
        showUserAvatar
      />
    </View>
  );
};



export default ChatScreen;
