import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { Text, Card, Title, Button, Appbar, Searchbar, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';
import { ChevronRight, Users, DollarSign } from 'lucide-react-native';

export default function RoomListScreen() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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

    const filteredRooms = rooms.filter(room =>
        room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.room_number.includes(searchQuery)
    );

    const renderRoom = ({ item }) => (
        <Card style={styles.card} onPress={() => router.push(`/customer/book?roomId=${item.id}`)}>
            <Card.Cover source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=870&auto=format&fit=crop' }} />
            <Card.Content style={styles.cardContent}>
                <View style={styles.priceTag}>
                    <Text style={styles.priceText}>Rs. {item.price}/night</Text>
                </View>
                <View style={styles.row}>
                    <Title>{item.type} Room</Title>
                    <Chip style={styles.chip}>{item.room_number}</Chip>
                </View>
                <View style={styles.details}>
                    <View style={styles.detailItem}>
                        <Users size={16} color={COLORS.darkGray} />
                        <Text style={styles.detailText}>Up to {item.capacity} Guests</Text>
                    </View>
                </View>
                <Text numberOfLines={2} style={styles.description}>{item.description || 'Experience comfort and style in our well-appointed rooms.'}</Text>
            </Card.Content>
            <Card.Actions>
                <Button
                    mode="contained"
                    onPress={() => router.push(`/customer/book?roomId=${item.id}`)}
                    style={styles.bookBtn}
                >
                    Book Now
                </Button>
            </Card.Actions>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Browse Rooms" />
            </Appbar.Header>

            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Search rooms..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />
            </View>

            <FlatList
                data={filteredRooms}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderRoom}
                contentContainerStyle={styles.list}
                onRefresh={fetchRooms}
                refreshing={loading}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text>No available rooms matching your search.</Text>
                    </View>
                }
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
    searchContainer: {
        padding: 16,
        backgroundColor: COLORS.white,
    },
    searchBar: {
        elevation: 0,
        backgroundColor: COLORS.background,
        borderRadius: 8,
    },
    list: {
        padding: 16,
    },
    card: {
        marginBottom: 20,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
    },
    cardContent: {
        marginTop: 10,
    },
    priceTag: {
        position: 'absolute',
        top: -40,
        right: 0,
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderTopLeftRadius: 12,
    },
    priceText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chip: {
        backgroundColor: COLORS.background,
    },
    details: {
        flexDirection: 'row',
        marginTop: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    detailText: {
        marginLeft: 5,
        color: COLORS.darkGray,
    },
    description: {
        marginTop: 10,
        color: COLORS.darkGray,
        fontSize: 14,
    },
    bookBtn: {
        flex: 1,
        backgroundColor: COLORS.secondary,
    },
    empty: {
        alignItems: 'center',
        marginTop: 50,
    }
});
