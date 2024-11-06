import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';

type User = {
  mobileNumber: string;
  firstName: string;
  lastName: string;
};

const UserListScreen: React.FC = (props: any) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsers = async () => {
      //   const currentUserPhone = auth().currentUser?.phoneNumber;
      //   if (!currentUserPhone) {
      //     Alert.alert('Error', 'Unable to fetch current user.');
      //     return;
      //   }
      console.log(props.route.params.mobileNumber);


      try {
        const snapshot = await firestore().collection('users').get();
        const userList: User[] = [];

        snapshot.forEach((doc) => {
          const userData = doc.data() as User;
          if (userData.mobileNumber !== props.route.params.mobileNumber) {
            userList.push(userData);
          }
        });

        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Error', 'Could not fetch user list.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChatStart = (user: User) => {
    //@ts-ignore
    navigation.navigate('Chat', { currentUser: props.route.params.mobileNumber, userId: user.mobileNumber, userName: `${user.firstName} ${user.lastName}` });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.mobileNumber}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItem} onPress={() => handleChatStart(item)}>
            <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.userPhone}>{item.mobileNumber}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No users available</Text>}
      />
    </View>
  );
};



export default UserListScreen;
