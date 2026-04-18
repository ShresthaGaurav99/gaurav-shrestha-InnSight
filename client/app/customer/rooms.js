import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Title, Button, Appbar, Searchbar, Chip, Paragraph } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';
import { Users, BedDouble, Ruler } from 'lucide-react-native';
import { DEFAULT_ROOM_AMENITIES } from '../../constants/hotelContent';

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

    const filteredRooms = rooms.filter((room) => {
        const term = searchQuery.toLowerCase();
        return (
            room.type?.toLowerCase().includes(term) ||
            room.title?.toLowerCase().includes(term) ||
            room.number?.toLowerCase().includes(term)
        );
    });

    const renderRoom = ({ item }) => (
        <Card
            style={styles.card}
            onPress={() => router.push({ pathname: '/customer/room-details', params: { roomId: item.id } })}
        >
            <Card.Cover source={{ uri: item.image_urls?.[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=870&auto=format&fit=crop' }} />
            <Card.Content style={styles.cardContent}>
                <View style={styles.priceTag}>
                    <Text style={styles.priceText}>Rs. {item.price}/night</Text>
                </View>
                <View style={styles.row}>
                    <Title>{item.title || `${item.type} Room`}</Title>
                    <Chip style={styles.chip}>#{item.number}</Chip>
                </View>
                <View style={styles.details}>
                    <View style={styles.detailItem}>
                        <Users size={16} color={COLORS.darkGray} />
                        <Text style={styles.detailText}>Up to {item.capacity} Guests</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <BedDouble size={16} color={COLORS.darkGray} />
                        <Text style={styles.detailText}>{item.bed_type || 'Queen Bed'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ruler size={16} color={COLORS.darkGray} />
                        <Text style={styles.detailText}>{item.size_sqft || 280} sqft</Text>
                    </View>
                </View>
                <Paragraph numberOfLines={2} style={styles.description}>
                    {item.description || 'Experience comfort and style in our well-appointed rooms.'}
                </Paragraph>
                <View style={styles.amenitiesRow}>
                    {(item.amenities?.length ? item.amenities : DEFAULT_ROOM_AMENITIES).slice(0, 3).map((amenity) => (
                        <Chip key={amenity} compact style={styles.amenityChip}>
                            {amenity}
                        </Chip>
                    ))}
                </View>
            </Card.Content>
            <Card.Actions>
                <Button
                    mode="outlined"
                    onPress={() => router.push({ pathname: '/customer/room-details', params: { roomId: item.id } })}
                    style={styles.secondaryBtn}
                >
                    View Details
                </Button>
                <Button
                    mode="contained"
                    onPress={() => router.push({
                        pathname: '/customer/book',
                        params: { roomId: item.id, roomNumber: item.number, price: item.price, type: item.type, title: item.title }
                    })}
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
        flexWrap: 'wrap',
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
    secondaryBtn: {
        flex: 1,
        marginRight: 8,
        borderColor: COLORS.secondary,
    },
    amenitiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
    },
    amenityChip: {
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#eef6ff',
    },
    empty: {
        alignItems: 'center',
        marginTop: 50,
    }
});
