import React, { useState, useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MenuProvider } from "react-native-popup-menu";
import { UnreadMessagesContext, UnreadMessagesProvider } from "./src/contexts/UnreadMessagesContext";
import Chats from "./src/screens/Chats";
import ChatHeader from "./src/components/ChatHeader";
import ChatMenu from "./src/components/ChatMenu";
import Users from "./src/screens/Users";
import Profile from "./src/screens/Profile";

import Group from "./src/screens/Group";
import ChatInfo from "./src/screens/ChatInfo";
import Login from "./src/screens/Login";
import SignUp from "./src/screens/SignUp";
import { AuthenticatedUserContext, AuthenticatedUserProvider } from "./src/contexts/AuthenticatedUserContext";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import Ionicons from "react-native-vector-icons/Ionicons";
import Chat from "./src/screens/Chat";

// Types for navigation
type RootStackParamList = {
  Home: undefined;
  Chat: { chatName: string; id: string };
  Users: undefined;
  Profile: undefined;
  Group: undefined;
  ChatInfo: undefined;
  Login: undefined;
  SignUp: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  const { unreadCount, setUnreadCount } = useContext(UnreadMessagesContext)!;

  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        tabBarIcon: ({ focused, color, size }: any) => {
          let iconName = route.name === 'Chats' ? 'chatbubbles' : 'person';
          iconName += focused ? '' : '-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        presentation: 'modal',
      })}
    >
      <Tab.Screen name="Chats" options={{ tabBarBadge: unreadCount > 0 ? unreadCount : undefined }}>
        {() => <Chats setUnreadCount={setUnreadCount} />}
      </Tab.Screen>
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

const MainStack: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
    <Stack.Screen
      name="Chat"
      component={Chat as any}
      options={({ route }: any) => ({
        headerBackTitle: '',
        headerTitle: () => <ChatHeader chatName={route.params.chatName} chatId={route.params.id} />,
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ChatMenu chatName={route.params.chatName} chatId={route.params.id} />
          </View>
        ),
      })}
    />
    <Stack.Screen name="Users" component={Users} options={{ title: 'Select User', headerBackTitle: '', }} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="Group" component={Group} options={{ title: 'New Group', headerBackTitle: '', }} />
    <Stack.Screen name="ChatInfo" component={ChatInfo as any} options={{ title: 'Chat Information', headerBackTitle: '', }} />
  </Stack.Navigator>
);

const AuthStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name='Login' component={Login} />
    <Stack.Screen name='SignUp' component={SignUp} />
  </Stack.Navigator>
);

const RootNavigator: React.FC = () => {
  const { user, setUser } = useContext(AuthenticatedUserContext)!;
  const [isLoading, setIsLoading] = useState(true);

  console.log("user", user);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged((authenticatedUser: FirebaseAuthTypes.User | null) => {
      setUser(authenticatedUser || null);
      setIsLoading(false);
    });

    return unsubscribeAuth;
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const App: React.FC = () => {

  return (
    <MenuProvider>
      <AuthenticatedUserProvider>
        <UnreadMessagesProvider>
          <RootNavigator />
        </UnreadMessagesProvider>
      </AuthenticatedUserProvider>
    </MenuProvider>
  );
};

export default App;
