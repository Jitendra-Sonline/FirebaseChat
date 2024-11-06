
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import styles from './styles';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

type Errors = {
    mobileNumber: string;
    firstName: string;
    lastName: string;
};

const UserInfoScreen: React.FC = (props: any) => {
    const navigation = useNavigation();
    const [mobileNumber, setMobileNumber] = useState('9662480519');
    const [firstName, setFirstName] = useState('s');
    const [lastName, setLastName] = useState('s');
    const [errors, setErrors] = useState<Errors>({ mobileNumber: '', firstName: '', lastName: '' });


    const handleValidation = () => {
        let isValid = true;
        const newErrors: Errors = { mobileNumber: '', firstName: '', lastName: '' };

        if (!mobileNumber) {
            newErrors.mobileNumber = 'Mobile number is required';
            isValid = false;
        }

        if (!firstName) {
            newErrors.firstName = 'First name is required';
            isValid = false;
        }

        if (!lastName) {
            newErrors.lastName = 'Last name is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!handleValidation()) return;

        try {
            const userRef = firestore().collection('users').doc(mobileNumber);

            // Check if user already exists
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                // Create new user in Firestore
                await userRef.set({
                    mobileNumber,
                    firstName,
                    lastName,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });
                Alert.alert('Success', 'User created successfully!');
                // createUserWithEmailAndPassword()
            } else {
                Alert.alert('Welcome back!', 'User already exists, logging you in.');
            }

            //@ts-ignore
            navigation.navigate('UserList', { mobileNumber });
        } catch (error) {
            console.error('Error creating user:', error);
            Alert.alert('Error', 'Could not create user');
        }
    };

    const createUserWithEmailAndPassword = () => {
        auth()
            .createUserWithEmailAndPassword(`${firstName}@example.com`, 'SuperSecretPassword!')
            .then(() => {
                console.log('User account created & signed in!');
            })
            .catch(error => {
                if (error.code === 'auth/email-already-in-use') {
                    console.log('That email address is already in use!');
                }

                if (error.code === 'auth/invalid-email') {
                    console.log('That email address is invalid!');
                }

                console.error(error);
            });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={text => setMobileNumber(text)}
            />
            {errors.mobileNumber ? <Text style={styles.errorText}>{errors.mobileNumber}</Text> : null}

            <Text style={styles.label}>First Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter first name"
                value={firstName}
                onChangeText={text => setFirstName(text)}
            />
            {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}

            <Text style={styles.label}>Last Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter last name"
                value={lastName}
                onChangeText={text => setLastName(text)}
            />
            {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}

            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
};
export default UserInfoScreen;