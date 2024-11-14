import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { colors } from "../config/constants";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ContactRow from "../components/ContactRow";
import auth from "@react-native-firebase/auth";
import firestore from '@react-native-firebase/firestore';


interface User {
    about: string;
    email: string;
    id: string;
    name: string;
}

const Group: React.FC = () => {
    const navigation = useNavigation();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [groupName, setGroupName] = useState<string>("");
    const currentUser = auth().currentUser;
    useEffect(() => {
        const unsubscribeUsers = firestore().collection('users').onSnapshot(snapshot => {
            const users: User[] = snapshot.docs.map(doc => ({
                about: doc.data().about,
                email: doc.data().email,
                id: doc.id,
                name: doc.data().name,
            }));
            setUsers(users);
        })
        return () => {
            unsubscribeUsers();
        };
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                selectedItems.length > 0 && <Text style={styles.itemCount}>{selectedItems.length}</Text>
            ),
        });
    }, [selectedItems]);

    const handleName = (user: User) => {
        if (user?.name) {
            return user.email === currentUser?.email ? `${user.name}*(You)` : user.name;
        }
        return user.email ? user.email : '~ No Name or Email ~';
    }

    const handleSubtitle = (user: User) => {
        return user.email === currentUser?.email ? 'Message yourself' : 'User status';
    }

    const handleOnPress = (user: User) => {
        selectItems(user);
    }

    const selectItems = (user: User) => {
        setSelectedItems((prevItems) => {
            if (prevItems.includes(user.id)) {
                return prevItems.filter(item => item !== user.id);
            }
            return [...prevItems, user.id];
        });
    }

    const getSelected = (user: User) => selectedItems.includes(user.id);

    const deSelectItems = () => {
        setSelectedItems([]);
    };

    const handleFabPress = () => {
        setModalVisible(true);
    }

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert('Group name cannot be empty');
            return;
        }

        const usersToAdd = users
            .filter(user => selectedItems.includes(user.id))
            .map(user => ({ email: user.email, name: user.name, deletedFromChat: false }));


        usersToAdd.unshift({ email: currentUser?.email!, name: currentUser?.displayName!, deletedFromChat: false });
        console.log(usersToAdd);

        const newRef = firestore().collection("chats").doc();
        newRef.set({
            lastUpdated: Date.now(),
            users: usersToAdd,
            messages: [],
            groupName: groupName,
            groupAdmins: [currentUser?.email]
        }).then(() => {
            //@ts-ignore
            navigation.navigate('Chat', { id: newRef.id, chatName: groupName });
            deSelectItems();
            setModalVisible(false);
            setGroupName("");
        });
    }

    return (
        <Pressable style={styles.container} onPress={deSelectItems}>
            {users.length === 0 ? (
                <View style={styles.blankContainer}>
                    <Text style={styles.textContainer}>No registered users yet</Text>
                </View>
            ) : (
                <ScrollView>
                    {users.map(user => (
                        user.email !== currentUser?.email &&
                        <React.Fragment key={user.id}>
                            <ContactRow
                                style={getSelected(user) ? styles.selectedContactRow : ""}
                                name={handleName(user)}
                                subtitle={handleSubtitle(user)}
                                onPress={() => handleOnPress(user)}
                                selected={getSelected(user)}
                                showForwardIcon={false}
                            />
                        </React.Fragment>
                    ))}
                </ScrollView>
            )}
            {selectedItems.length > 0 && (
                <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
                    <View style={styles.fabContainer}>
                        <Ionicons name="arrow-forward-outline" size={24} color={'white'} />
                    </View>
                </TouchableOpacity>
            )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Enter Group Name</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setGroupName}
                            value={groupName}
                            placeholder="Group Name"
                            onSubmitEditing={handleCreateGroup} // Create group on submit
                        />

                        <TouchableOpacity onPress={handleCreateGroup}>
                            <View style={styles.fabContainerButton}>
                                <Ionicons name="arrow-forward-outline" size={24} color={'white'} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

            </Modal>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 12,
        right: 12
    },

    fabContainerButton: {
        width: 200,
        height: 40,
        backgroundColor: colors.teal,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabContainer: {
        width: 56,
        height: 56,
        backgroundColor: colors.teal,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1
    },
    textContainer: {
        fontSize: 16
    },
    blankContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedContactRow: {
        backgroundColor: '#E0E0E0'
    },
    itemCount: {
        right: 10,
        color: colors.teal,
        fontSize: 18,
        fontWeight: "400",
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold"
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10
    }
});

export default Group;
