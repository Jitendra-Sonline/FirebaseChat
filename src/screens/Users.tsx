import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useCallback } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../config/constants";
import Cell from "../components/Cell";
import ContactRow from "../components/ContactRow";
import firestore from '@react-native-firebase/firestore';
import { getAuth } from "@react-native-firebase/auth";

interface UserData {
    id: string;
    data: {
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


    const [users, setUsers] = useState<{ id: string; data: any }[]>([]);
    const [existingChats, setExistingChats] = useState<{ chatId: string; userEmails: any }[]>([]);

    const auth = getAuth();


    useEffect(() => {
        // Fetch users ordered by name (ascending)
        const unsubscribeUsers = firestore().collection('users').onSnapshot(snapshot => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
        })

        // Fetch chats where current user is included and groupName is empty
        const chatQuery = firestore()
            .collection('chats')
            .where('users', "array-contains", {
                email: auth.currentUser?.email,
                name: auth.currentUser?.displayName,
                deletedFromChat: false
            })
            .where('groupName', "==", '');

        const unsubscribeChats = chatQuery.onSnapshot(snapshot => {
            const existing = snapshot.docs.map(existingChat => ({
                chatId: existingChat.id,
                userEmails: existingChat.data().users
            }));
            setExistingChats(existing);
        });

        // Cleanup subscriptions on component unmount
        return () => {
            unsubscribeUsers();
            unsubscribeChats();
        };
    }, [auth]);

    const handleNewGroup = useCallback(() => {
        //@ts-ignore
        navigation.navigate('Group');
    }, [navigation]);

    const handleNewUser = useCallback(() => {
        Alert.alert('New user');
    }, []);

    const handleNavigate = useCallback(async (user: UserData) => {
        let navigationChatID = '';
        let messageYourselfChatID = '';

        existingChats.forEach(existingChat => {
            const isCurrentUserInTheChat = existingChat.userEmails.some((e: any) => e.email === auth?.currentUser?.email);
            const isMessageYourselfExists = existingChat.userEmails.filter((e: any) => e.email === user.data.email).length;

            if (isCurrentUserInTheChat && existingChat.userEmails.some((e: any) => e.email === user.data.email)) {
                navigationChatID = existingChat.chatId;
            }

            if (isMessageYourselfExists === 2) {
                messageYourselfChatID = existingChat.chatId;
            }

            if (auth?.currentUser?.email === user.data.email) {
                navigationChatID = '';
            }
        });



        if (messageYourselfChatID) {
            //@ts-ignore
            navigation.navigate('Chat', { id: messageYourselfChatID, chatName: handleName(user) });
        } else if (navigationChatID) {
            //@ts-ignore
            navigation.navigate('Chat', { id: navigationChatID, chatName: handleName(user) });
        } else {

            const newRef = firestore().collection("chats").doc();
            try {

                await newRef.set({
                    lastUpdated: Date.now(),
                    groupName: '', // Not a group chat
                    users: [
                        // Add other users if needed
                        { email: user.data.email, name: user.data.displayName, deletedFromChat: false }
                    ],
                    lastAccess: [
                        { email: user.data.email, date: '' }
                    ],
                    messages: []
                });
                console.log(Date.now(), " <<<--->>> ", newRef.id);
                // Navigate to the Chat screen with the new chat's ID and name
                //@ts-ignore
                navigation.navigate('Chat', { id: newRef.id, chatName: handleName(user) });
            } catch (error) {
                console.error("Error creating new chat:", error);
            }
        }
    }, [existingChats, navigation]);

    const handleSubtitle = useCallback((user: UserData) => {
        return user.data.email === auth?.currentUser?.email ? 'Message yourself' : 'User status';
    }, []);

    const handleName = useCallback((user: UserData) => {
        const name = user.data.displayName;
        const email = user.data.email;
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
