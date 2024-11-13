import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for the context
interface UnreadMessagesContextType {
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

export const UnreadMessagesContext = createContext<UnreadMessagesContextType | undefined>(undefined);

interface UnreadMessagesProviderProps {
  children: ReactNode;
}

export const UnreadMessagesProvider: React.FC<UnreadMessagesProviderProps> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem('newMessages');
        const newMessages = storedMessages ? JSON.parse(storedMessages) : {};
        const count: any = Object.values(newMessages).reduce((total: any, num) => total + num, 0);
        setUnreadCount(count);
      } catch (error) {
        console.log('Error loading unread messages count', error);
      }
    };
    loadUnreadCount();
  }, []);

  return (
    <UnreadMessagesContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};
