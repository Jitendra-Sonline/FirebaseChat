import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, ScrollView, Pressable, ActivityIndicator, Text, View, TouchableOpacity, Alert } from "react-native";
import ContactRow from '../components/ContactRow';
import Separator from "../components/Separator";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from "../config/constants";
import Ionicons from "react-native-vector-icons/Ionicons";
import firestore from '@react-native-firebase/firestore';
import { AuthenticatedUserContext } from "../contexts/AuthenticatedUserContext";

interface Chat {
    id: string;
    _data: {
        users: { email: string; name: string; deletedFromChat: boolean }[];
        messages: Array<{ user: { _id: string; name: string }; text: string; image?: string }>;
        lastUpdated: string;
        groupName?: string;
    };
}

interface ChatsProps {
    setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const Chats: React.FC<ChatsProps> = ({ setUnreadCount }) => {
    const navigation = useNavigation();
    const { user } = useContext(AuthenticatedUserContext)!;
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [newMessages, setNewMessages] = useState<Record<string, number>>({});


    useFocusEffect(
        React.useCallback(() => {
            const loadNewMessages = async () => {
                try {
                    const storedMessages = await AsyncStorage.getItem('newMessages');
                    const parsedMessages = storedMessages ? JSON.parse(storedMessages) : {};
                    setNewMessages(parsedMessages);
                    setUnreadCount(
                        Object.values(parsedMessages)
                            .filter((num): num is number => typeof num === 'number')
                            .reduce((total, num) => total + num, 0)
                    );
                } catch (error) {
                    console.log('Error loading new messages from storage', error);
                }
            };
            const chatQuery = firestore().collection('chats').orderBy('lastUpdated', 'desc').onSnapshot((snapshot) => {
                setChats(snapshot.docs as any);
                setLoading(false);
                // Track document changes to manage unread message count
                snapshot.docChanges().forEach(change => {
                    const messages = change.doc.data().messages;

                    if (change.type === 'modified') {
                        const chatId = change.doc.id;
                        const messages = change.doc.data().messages;
                        const firstMessage = messages[0];

                        if (firstMessage.user._id !== user?.email) {
                            setNewMessages(prev => {
                                const updatedMessages = { ...prev, [chatId]: (prev[chatId] || 0) + 1 };
                                AsyncStorage.setItem('newMessages', JSON.stringify(updatedMessages));
                                setUnreadCount(Object.values(updatedMessages).reduce((total, num) => total + num, 0));
                                return updatedMessages;
                            });
                        }
                    }
                });
            });
            loadNewMessages();
            return () => chatQuery();
        }, [])
    );

    useEffect(() => {
        updateNavigationOptions();
    }, [selectedItems]);

    const updateNavigationOptions = () => {
        if (selectedItems.length > 0) {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity style={styles.trashBin}>
                        <Ionicons name="trash" size={24} color={colors.teal} />
                    </TouchableOpacity>
                ),
                headerLeft: () => (
                    <Text style={styles.itemCount}>{selectedItems.length}</Text>
                ),
            });
        } else {
            navigation.setOptions({
                headerRight: null,
                headerLeft: null,
            });
        }
    };

    const handleChatName = (chat: Chat): string => {
        const users = chat._data.users;
        if (chat._data.groupName) {
            return chat._data.groupName;
        }
        if (users.length > 0) {
            return users[0].name;
        }
        return '~ No Name or Email ~';
    };

    const handleOnPress = async (chat: Chat) => {
        const chatId = chat.id;
        if (selectedItems.length) {
            return selectItems(chat);
        }

        setNewMessages(prev => {
            const updatedMessages = { ...prev, [chatId]: 0 };
            AsyncStorage.setItem('newMessages', JSON.stringify(updatedMessages));
            setUnreadCount(Object.values(updatedMessages).reduce((total, num) => total + num, 0));
            return updatedMessages;
        });
        //@ts-ignore
        navigation.navigate('Chat', { id: chat.id, chatName: handleChatName(chat) });
    };

    const handleLongPress = (chat: Chat) => {
        selectItems(chat);
    };

    const selectItems = (chat: Chat) => {
        if (selectedItems.includes(chat.id)) {
            setSelectedItems(selectedItems.filter(item => item !== chat.id));
        } else {
            setSelectedItems([...selectedItems, chat.id]);
        }
    };

    const getSelected = (chat: Chat): boolean => {
        return selectedItems.includes(chat.id);
    };

    const deSelectItems = () => {
        setSelectedItems([]);
    };

    const handleFabPress = () => {
        //@ts-ignore
        navigation.navigate('Users');
    };

    
    const handleSubtitle = (chat: Chat) => {
        try {
            const message = chat?._data?.messages[0];
            if (!message) return "No messages yet";
            const isCurrentUser = user?.email === message.user._id;
            const userName = isCurrentUser ? 'You' : message.user.name.split(' ')[0];
            const messageText = message.text;
            return `${userName}: ${messageText}`;
        } catch (error) {
            return `NA`;
        }

    };

    const handleSubtitle2 = (chat: Chat) => {
        const options: any = { year: '2-digit', month: 'numeric', day: 'numeric' };
        return new Date(chat._data.lastUpdated).toLocaleDateString(undefined, options);
    };

    return (
        <Pressable style={styles.container} onPress={deSelectItems}>
            {loading ? (
                <ActivityIndicator size='large' style={styles.loadingContainer} />
            ) : (
                <ScrollView>
                    {chats.length === 0 ? (
                        <View style={styles.blankContainer}>
                            <Text style={styles.textContainer}>No conversations yet</Text>
                        </View>
                    ) : (
                        chats.map(chat => (
                            <React.Fragment key={chat.id}>
                                <ContactRow
                                    style={getSelected(chat) ? styles.selectedContactRow : ""}
                                    name={handleChatName(chat)}
                                    subtitle={handleSubtitle(chat)}
                                    subtitle2={handleSubtitle2(chat)}
                                    onPress={() => handleOnPress(chat)}
                                    onLongPress={() => handleLongPress(chat)}
                                    selected={getSelected(chat)}
                                    showForwardIcon={false}
                                    newMessageCount={newMessages[chat.id] || 0}
                                />
                            </React.Fragment>
                        ))
                    )}
                    <Separator />
                 
                </ScrollView>
            )}
            <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
                <View style={styles.fabContainer}>
                    <Ionicons name="chatbox-ellipses" size={24} color={'white'} />
                </View>
            </TouchableOpacity>
        </Pressable>
    );
};
const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 12,
        right: 12
    },
    fabContainer: {
        width: 56,
        height: 56,
        backgroundColor: colors.teal,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1
    },
    blankContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        fontSize: 16
    },
    selectedContactRow: {
        backgroundColor: '#E0E0E0'
    },
    trashBin: {
        right: 12,
        color: colors.teal,
    },
    itemCount: {
        left: 100,
        color: colors.teal,
        fontSize: 18,
        fontWeight: "400",
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.teal
    },
   
});

export default Chats;
