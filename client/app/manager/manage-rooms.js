import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { FAB, Appbar, List, Avatar, Chip, Modal, Portal, TextInput, Button, Title } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';

export default function ManageRoomsScreen() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    const [roomNumber, setRoomNumber] = useState('');
    const [type, setType] = useState('Standard');
    const [price, setPrice] = useState('');
    const [capacity, setCapacity] = useState('2');
    const [title, setTitle] = useState('');
    const [bedType, setBedType] = useState('Queen Bed');

    const router = useRouter();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const res = await api.get('/rooms');
            setRooms(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleAddRoom = async () => {
        if (!roomNumber || !price) {
            Alert.alert('Error', 'Please fill room number and price');
            return;
        }

        try {
            await api.post('/rooms', {
                number: roomNumber,
                title,
                type,
                price: parseFloat(price),
                capacity: parseInt(capacity),
                bedType,
                description: `Comfortable ${type} room for Kathmandu mid-range stays.`,
                amenities: ['Free Wi-Fi', 'Breakfast', 'Air Conditioning'],
                policies: ['Check-in from 2 PM', 'Check-out before 12 PM'],
            });
            setVisible(false);
            fetchRooms();
            setRoomNumber('');
            setPrice('');
            setTitle('');
        } catch (err) {
            Alert.alert('Error', 'Failed to add room');
        }
    };

    const renderRoom = ({ item }) => (
        <List.Item
            title={`${item.title || `Room ${item.number}`}`}
            description={`${item.type} • Room ${item.number} • Rs. ${item.price}/night • ${item.capacity} Guests`}
            style={styles.roomItem}
            left={props => <Avatar.Icon {...props} icon="door" backgroundColor={item.status === 'AVAILABLE' ? COLORS.accent : COLORS.error} />}
            right={props => (
                <View style={styles.rightActions}>
                    <Chip style={[styles.statusChip, { backgroundColor: item.status === 'AVAILABLE' ? '#E8F5E9' : '#FFEBEE' }]}>
                        {item.status}
                    </Chip>
                </View>
            )}
        />
    );

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Manage Hotel Rooms" />
            </Appbar.Header>

            <FlatList
                data={rooms}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderRoom}
                onRefresh={fetchRooms}
                refreshing={loading}
                contentContainerStyle={styles.list}
            />

            <Portal>
                <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
                    <Title style={styles.modalTitle}>Add New Room</Title>
                    <TextInput label="Room Number" value={roomNumber} onChangeText={setRoomNumber} mode="outlined" style={styles.input} />
                    <TextInput label="Room Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
                    <TextInput label="Room Type (Standard, Deluxe, Family, Suite)" value={type} onChangeText={setType} mode="outlined" style={styles.input} />
                    <TextInput label="Price per Night" value={price} onChangeText={setPrice} keyboardType="numeric" mode="outlined" style={styles.input} />
                    <TextInput label="Capacity" value={capacity} onChangeText={setCapacity} keyboardType="numeric" mode="outlined" style={styles.input} />
                    <TextInput label="Bed Type" value={bedType} onChangeText={setBedType} mode="outlined" style={styles.input} />
                    <Button mode="contained" onPress={handleAddRoom} style={styles.addBtn}>Add Room</Button>
                </Modal>
            </Portal>

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => setVisible(true)}
                color={COLORS.white}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.white,
    },
    list: {
        padding: 8,
    },
    roomItem: {
        backgroundColor: COLORS.white,
        marginVertical: 4,
        borderRadius: 8,
        elevation: 1,
    },
    rightActions: {
        justifyContent: 'center',
    },
    statusChip: {
        height: 28,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.secondary,
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    modalTitle: {
        marginBottom: 15,
    },
    input: {
        marginBottom: 10,
    },
    addBtn: {
        marginTop: 10,
        backgroundColor: COLORS.secondary,
    }
});
