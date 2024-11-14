import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar } from "react-native";
import { colors } from '../config/constants';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


const backImage = require("../images/background.png");

interface SignUpProps {
    navigation: any; // Adjust the type of 'navigation' based on your navigation setup
}

const SignUp: React.FC<SignUpProps> = ({ navigation }) => {

    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');


    const onHandleSignup = async () => {
        if (email !== '') {
            try {
                // Create a new user with email and password
                const cred = await auth().createUserWithEmailAndPassword(`${email}@example.com`, 'SuperSecretPassword!');

                if (cred.user) {
                    // Update the user's profile with a display name
                    await cred.user.updateProfile({ displayName: username });
                    // Add user details to Firestore
                    await firestore().collection('users').doc(cred.user.email ?? '').set({
                        id: cred.user.uid,
                        email: cred.user.email,
                        name: username,
                        about: 'Available'
                    });
                }
            } catch (error) {
                console.log("Error registering user:", error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Image source={backImage} style={styles.backImage} />
            <View style={styles.whiteSheet} />
            <SafeAreaView style={styles.form}>
                <Text style={styles.title}>Sign Up</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter name"
                    autoCapitalize="none"
                    keyboardType="name-phone-pad"
                    textContentType="name"
                    autoFocus={true}
                    value={username}
                    onChangeText={(text) => setUsername(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoFocus={true}
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />
                <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}> Sign Up</Text>
                </TouchableOpacity>
                <View style={{ marginTop: 30, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                    <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={{ color: colors.pink, fontWeight: '600', fontSize: 14 }}> Log In</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            <StatusBar barStyle="light-content" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'black',
        alignSelf: "center",
        paddingTop: 48,
    },
    input: {
        backgroundColor: "#F6F7FB",
        height: 58,
        marginBottom: 20,
        fontSize: 16,
        borderRadius: 10,
        padding: 12,
    },
    backImage: {
        width: "100%",
        height: 340,
        position: "absolute",
        top: 0,
        resizeMode: 'cover',
    },
    whiteSheet: {
        width: '100%',
        height: '75%',
        position: "absolute",
        bottom: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 60,
    },
    form: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 30,
    },
    button: {
        backgroundColor: colors.primary,
        height: 58,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
});

export default SignUp;
