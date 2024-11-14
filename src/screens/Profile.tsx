import React, { useContext } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { colors } from "../config/constants";
import Cell from "../components/Cell";
import { AuthenticatedUserContext } from "../contexts/AuthenticatedUserContext";
import auth from '@react-native-firebase/auth';
const Profile: React.FC = () => {
    const { user } = useContext(AuthenticatedUserContext)!;


    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.infoContainer}>
                <Cell
                    title='Name'
                    icon='person-outline'
                    iconColor="black"
                    subtitle={user?.displayName || "No name set"}
                    secondIcon='pencil-outline'
                    onPress={() => { }}
                    style={styles.cell}
                />

                <Cell
                    title='Email'
                    subtitle={user?.email}
                    icon='mail-outline'
                    iconColor="black"
                    secondIcon='pencil-outline'
                    onPress={() => { }}
                    style={styles.cell}
                />
                <Cell
                    title='Logout'
                    subtitle={''}
                    icon='log-out'
                    iconColor="black"
                    secondIcon='pencil-outline'
                    onPress={() => { auth().signOut().then(() => console.log('User signed out!')) }}
                    style={styles.cell}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
    },
    avatarLabel: {
        fontSize: 36,
        color: 'white',
        fontWeight: 'bold',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.teal,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    infoContainer: {
        marginTop: 40,
        width: '90%',
    },
    cell: {
        marginBottom: 15,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 0.5,
    },
});

export default Profile;
