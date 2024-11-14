import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { colors } from "../config/constants";
import Ionicons from "react-native-vector-icons/Ionicons";

const ContactRow = ({ name, subtitle, onPress, style,selected, showForwardIcon = true, subtitle2, newMessageCount }:any) => {
    return (
        <TouchableOpacity style={[styles.row, style]} onPress={onPress}>
            <View style={styles.avatar}>
                <Text style={styles.avatarLabel}>
                    {name?.trim()?.split(' ')?.reduce((prev:any, current:any) => `${prev}${current[0]}`, '')}
                </Text>
            </View>

            <View style={styles.textsContainer}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <View style={styles.rightContainer}>
                <Text style={styles.subtitle2}>{subtitle2}</Text>

                {newMessageCount > 0 && (
                    <View style={styles.newMessageBadge}>
                        <Text style={styles.newMessageText}>{newMessageCount}</Text>
                    </View>
                )}

                {selected && (
                    <View style={styles.overlay}>
                        <Ionicons name="checkmark-outline" size={16} color={'white'} />
                    </View>
                )}

                {showForwardIcon && <Ionicons name="chevron-forward-outline" size={20} />}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderColor: '#e0e0e0',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary
    },
    avatarLabel: {
        fontSize: 20,
        color: 'white',
    },
    textsContainer: {
        flex: 1,
        marginStart: 16,
    },
    name: {
        fontSize: 16,
        fontWeight: '400',
    },
    subtitle: {
        marginTop: 4,
        color: '#565656',
        fontSize: 14,
        maxWidth: 200,
    },
    rightContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    subtitle2: {
        fontSize: 12,
        color: '#8e8e8e',
        marginBottom: 4,
    },
    newMessageBadge: {
        backgroundColor: colors.teal,
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    newMessageText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 22,
        height: 22,
        backgroundColor: colors.teal,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'black',
        borderWidth: 1.5,
    },
});

export default ContactRow;
