import React, { useCallback, useContext } from "react";
import { View, StyleSheet, Alert, Linking } from "react-native";
import ContactRow from "../components/ContactRow";
import { colors } from "../config/constants";
import Cell from "../components/Cell";
import { AuthenticatedUserContext } from "../contexts/AuthenticatedUserContext";

interface SettingsProps {
    navigation: any; 
}

const Settings: React.FC<SettingsProps> = ({ navigation }) => {
    const { user, setUser } = useContext(AuthenticatedUserContext)!;


    return (
        <View>
            <ContactRow
                name={user?.displayName ?? 'No name'}
                subtitle={user?.email}
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
