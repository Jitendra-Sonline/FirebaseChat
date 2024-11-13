import React, { useCallback } from "react";
import { Text, View, StyleSheet, Alert, Linking, TouchableOpacity } from "react-native";
import ContactRow from "../components/ContactRow";
import { colors } from "../config/constants";
import Cell from "../components/Cell";
import { auth } from '../config/firebase';
import Ionicons from "react-native-vector-icons/Ionicons";

interface SettingsProps {
    navigation: any; // Adjust the type of 'navigation' based on your navigation setup, e.g., using `NavigationProp` if you're using React Navigation
}

const Settings: React.FC<SettingsProps> = ({ navigation }) => {

    const openGithub = useCallback(async (url: string) => {
        await Linking.openURL(url);
    }, []);

    return (
        <View>
            <ContactRow
                name={auth?.currentUser?.displayName ?? 'No name'}
                subtitle={auth?.currentUser?.email}
                style={styles.contactRow}
                onPress={() => {
                    navigation.navigate('Profile');
                }}
            />

            <Cell
                title='Account'
                subtitle='Privacy, logout, delete account'
                icon='key-outline'
                onPress={() => {
                    navigation.navigate('Account');
                }}
                iconColor="black"
                style={{ marginTop: 20 }}
            />

            <Cell
                title='Help'
                subtitle='Contact us, app info'
                icon='help-circle-outline'
                iconColor="black"
                onPress={() => {
                    navigation.navigate('Help');
                }}
            />

            <Cell
                title='Invite a friend'
                icon='people-outline'
                iconColor="black"
                onPress={() => {
                    Alert.alert('Share touched')
                }}
                showForwardIcon={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    contactRow: {
        backgroundColor: 'white',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border
    }
});

export default Settings;
