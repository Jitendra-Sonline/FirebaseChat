import { getAuth } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';


const ChatMenu = ({ chatName, chatId }: any) => {
    const navigation = useNavigation();

    const handleDeleteChat = async () => {
        Alert.alert(
            "Delete this chat?",
            "Messages will be removed from this device.",
            [
                {
                    text: "Delete chat",
                    onPress: async () => {
                        const auth = getAuth();

                        try {
                            // Reference the specific chat document
                            const chatRef = firestore().collection('chats').doc(chatId);
                            const chatDoc = await chatRef.get();

                            if (chatDoc.exists) {
                                const updatedUsers = chatDoc.data()?.users.map((user: any) =>
                                    user.email === auth.currentUser?.email
                                        ? { ...user, deletedFromChat: true }
                                        : user
                                );

                                // Update the document with modified users array, merging changes
                                await chatRef.set({ users: updatedUsers }, { merge: true });

                                // Check if all users have been marked as deleted
                                const deletedUsers = updatedUsers.filter((user: any) => user.deletedFromChat).length;
                                if (deletedUsers === updatedUsers.length) {
                                    // Delete the document if all users are marked as deleted
                                    await chatRef.delete();
                                }

                                // Navigate back after deletion
                                navigation.goBack();
                            }
                        } catch (error) {
                            console.error("Error handling chat deletion:", error);
                        }
                    },
                },
                { text: "Cancel" },
            ],
            { cancelable: true }
        );
    };

    return (
        <Menu>
            <MenuTrigger>
                <Ionicons name="ellipsis-vertical" size={25} color="black" style={{ marginRight: 15 }} />
            </MenuTrigger>
            <MenuOptions>
                <MenuOption onSelect={() =>
                    //@ts-ignore
                    navigation.navigate('ChatInfo', { chatId, chatName })}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                        <Text style={{ fontWeight: '500', }}>Chat Info</Text>
                    </View>
                </MenuOption>
                <MenuOption onSelect={() => handleDeleteChat()}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                        <Text style={{ fontWeight: '500', }}>Delete Chat</Text>
                    </View>
                </MenuOption>
            </MenuOptions>
        </Menu>
    );
};

export default ChatMenu;


