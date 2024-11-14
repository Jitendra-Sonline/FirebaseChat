import React from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from "../config/constants";

const ChatHeader = ({ chatName, chatId }: any) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            style={styles.container}
            //@ts-ignore
            onPress={() => navigation.navigate('ChatInfo', { chatId, chatName })}>
            <Text style={styles.chatName}>{chatName}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        marginLeft: -30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary
    },
    avatarLabel: {
        fontSize: 20,
        color: 'white'
    },
    chatName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
});

export default ChatHeader;
