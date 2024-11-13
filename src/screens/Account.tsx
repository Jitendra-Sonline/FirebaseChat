import React from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { signOut, deleteUser } from '@react-native-firebase/auth';
import { doc, deleteDoc } from '@react-native-firebase/firestore';

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import Cell from '../components/Cell';
import { colors } from '../config/constants';

type AccountProps = {
    navigation: any; // Adjust this type if you know your navigation prop type
};

const Account: React.FC<AccountProps> = ({ navigation }) => {

    const onSignOut = async () => {
        try {
            // await signOut(); // Use auth instance here
            console.log('User signed out successfully');
        } catch (error) {
            console.log('Error logging out: ', error);
        }
    };

    const deleteAccount = async () => {
        // try {
        //     const currentUser = auth().currentUser; // Ensure you're using auth() properly
        //     if (currentUser) {
        //         // Delete user from Firebase Authentication
        //         await deleteUser(currentUser);
    
        //         // Delete user's document from Firestore
        //         await deleteDoc(doc(FirebaseFirestoreTypes.firestore(), 'users', currentUser.email));
                
        //         console.log('Account deleted successfully');
        //     } else {
        //         console.log('No user is signed in');
        //     }
        // } catch (error) {
        //     console.log('Error deleting account: ', error);
        // }
    };

    return (
        <View>
            <Cell
                title="Blocked Users"
                icon="close-circle-outline"
                tintColor={colors.primary}
                onPress={() => {
                    Alert.alert('Blocked users touched');
                }}
                style={{ marginTop: 20 }}
            />
            <Cell
                title="Logout"
                icon="log-out-outline"
                tintColor={colors.grey}
                onPress={() => {
                    Alert.alert(
                        'Logout?',
                        'You have to login again',
                        [
                            {
                                text: "Logout",
                                onPress: onSignOut,
                            },
                            {
                                text: "Cancel",
                            },
                        ],
                        { cancelable: true }
                    );
                }}
                showForwardIcon={false}
            />
            <Cell
                title="Delete my account"
                icon="trash-outline"
                tintColor={colors.red}
                onPress={() => {
                    Alert.alert(
                        'Delete account?',
                        'Deleting your account will erase your message history',
                        [
                            {
                                text: "Delete my account",
                                onPress: deleteAccount,
                            },
                            {
                                text: "Cancel",
                            },
                        ],
                        { cancelable: true }
                    );
                }}
                showForwardIcon={false}
                style={{ marginTop: 20 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    contactRow: {
        backgroundColor: 'white',
        marginTop: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
});

export default Account;
