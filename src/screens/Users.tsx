import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useCallback } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { collection, query, orderBy, onSnapshot, where, doc, setDoc } from "firebase/firestore";
import { auth, database } from "../config/firebase";
import { colors } from "../config/constants";
import Cell from "../components/Cell";
import ContactRow from "../components/ContactRow";

interface UserData {
    id: string;
    data: () => {
        email: string;
        name: string;
        [key: string]: any;
    };
}

interface ChatData {
    chatId: string;
    userEmails: { email: string, name: string }[];
}

const Users: React.FC = () => {
    const navigation = useNavigation();
    const [users, setUsers] = useState<UserData[]>([]);
    const [existingChats, setExistingChats] = useState<ChatData[]>([]);

    useEffect(() => {
        const collectionUserRef = collection(database, 'users');
        const q = query(collectionUserRef, orderBy("name", "asc"));
        const unsubscribeUsers = onSnapshot(q, (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, data: doc.data })));
        });

        const collectionChatsRef = collection(database, 'chats');
        const q2 = query(
            collectionChatsRef,
            where('users', "array-contains", { email: auth?.currentUser?.email, name: auth?.currentUser?.displayName, deletedFromChat: false }),
            where('groupName', "==", '')
        );
        const unsubscribeChats = onSnapshot(q2, (snapshot) => {
            const existing = snapshot.docs.map(existingChat => ({
                chatId: existingChat.id,
                userEmails: existingChat.data().users
            }));
            setExistingChats(existing);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeChats();
        };
    }, []);

    const handleNewGroup = useCallback(() => {
        navigation.navigate('Group');
    }, [navigation]);

    const handleNewUser = useCallback(() => {
        Alert.alert('New user');
    }, []);

    const handleNavigate = useCallback((user: UserData) => {
        let navigationChatID = '';
        let messageYourselfChatID = '';

        existingChats.forEach(existingChat => {
            const isCurrentUserInTheChat = existingChat.userEmails.some(e => e.email === auth?.currentUser?.email);
            const isMessageYourselfExists = existingChat.userEmails.filter(e => e.email === user.data().email).length;

            if (isCurrentUserInTheChat && existingChat.userEmails.some(e => e.email === user.data().email)) {
                navigationChatID = existingChat.chatId;
            }

            if (isMessageYourselfExists === 2) {
                messageYourselfChatID = existingChat.chatId;
            }

            if (auth?.currentUser?.email === user.data().email) {
                navigationChatID = '';
            }
        });

        if (messageYourselfChatID) {
            navigation.navigate('Chat', { id: messageYourselfChatID, chatName: handleName(user) });
        } else if (navigationChatID) {
            navigation.navigate('Chat', { id: navigationChatID, chatName: handleName(user) });
        } else {
            const newRef = doc(collection(database, "chats"));
            setDoc(newRef, {
                lastUpdated: Date.now(),
                groupName: '', // It is not a group chat
                users: [
                    { email: auth?.currentUser?.email, name: auth?.currentUser?.displayName, deletedFromChat: false },
                    { email: user.data().email, name: user.data().name, deletedFromChat: false }
                ],
                lastAccess: [
                    { email: auth?.currentUser?.email, date: Date.now() },
                    { email: user.data().email, date: '' }
                ],
                messages: []
            }).then(() => {
                navigation.navigate('Chat', { id: newRef.id, chatName: handleName(user) });
            });
        }
    }, [existingChats, navigation]);

    const handleSubtitle = useCallback((user: UserData) => {
        return user.data().email === auth?.currentUser?.email ? 'Message yourself' : 'User status';
    }, []);

    const handleName = useCallback((user: UserData) => {
        const name = user.data().name;
        const email = user.data().email;
        if (name) {
            return email === auth?.currentUser?.email ? `${name}*(You)` : name;
        }
        return email ? email : '~ No Name or Email ~';
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Cell
                title='New group'
                icon='people'
                tintColor={colors.teal}
                onPress={handleNewGroup}
                style={{ marginTop: 5 }}
            />
            <Cell
                title='New user'
                icon='person-add'
                tintColor={colors.teal}
                onPress={handleNewUser}
                style={{ marginBottom: 10 }}
            />

            {users.length === 0 ? (
                <View style={styles.blankContainer}>
                    <Text style={styles.textContainer}>
                        No registered users yet
                    </Text>
                </View>
            ) : (
                <ScrollView>
                    <View>
                        <Text style={styles.textContainer}>
                            Registered users
                        </Text>
                    </View>
                    {users.map(user => (
                        <React.Fragment key={user.id}>
                            <ContactRow
                                name={handleName(user)}
                                subtitle={handleSubtitle(user)}
                                onPress={() => handleNavigate(user)}
                                showForwardIcon={false}
                            />
                        </React.Fragment>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    blankContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        marginLeft: 16,
        fontSize: 16,
        fontWeight: "300",
    }
});

export default Users;
