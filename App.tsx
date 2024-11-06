import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import UserListScreen from './src/Screen/UserListScreen';
import ChatScreen from './src/Screen/ChatScreen';
import UserInfoScreen from './src/Screen/UserInfoScreen';


type RootStackParamList = {
  UserInfo: undefined;
  UserList: undefined;
  Chat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by Firebase authentication state
    const unsubscribe = auth().onAuthStateChanged(async (user: any) => {
      console.log(user);

      if (user) {
        // Check if user exists in Firestore
        const userDoc = await firestore().collection('users').doc(user.phoneNumber!).get();
        setIsLoggedIn(userDoc.exists);
      } else {
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return null; // You can add a loading spinner here if you want
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="UserInfo" component={UserInfoScreen} />
        <Stack.Screen name="UserList" component={UserListScreen} />
        <Stack.Screen name="Chat" component={ChatScreen as any} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
