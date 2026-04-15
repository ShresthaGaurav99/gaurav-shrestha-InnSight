import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Title, Card, Button, Avatar, Appbar } from 'react-native-paper';
import { AuthContext } from '../../../context/AuthContext';
import { COLORS, SIZES } from '../../../constants/theme';
import api from '../../../services/api';
import { LogOut, Hotel, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function CustomerDashboard() {
    const { user, logout } = useContext(AuthContext);
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bookings/my');
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.Content title={`Hello, ${user?.fullName}`} subtitle="Welcome back" />
                <Appbar.Action icon={() => <LogOut size={20} color={COLORS.primary} />} onPress={logout} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Title>Your Recent Bookings</Title>
                    {bookings.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <Card.Content style={styles.center}>
                                <Calendar size={40} color={COLORS.gray} />
                                <Text style={styles.emptyText}>No bookings found</Text>
                            </Card.Content>
                        </Card>
                    ) : (
                        bookings.map((item) => (
                            <Card key={item.id} style={styles.card}>
                                <Card.Title
                                    title={item.type + ' Room'}
                                    subtitle={`Room: ${item.room_number}`}
                                    left={(props) => <Avatar.Icon {...props} icon="bed" backgroundColor={COLORS.secondary} />}
                                />
                                <Card.Content>
                                    <Text>Check-in: {new Date(item.checkIn).toLocaleDateString()}</Text>
                                    <Text>Check-out: {new Date(item.checkOut).toLocaleDateString()}</Text>
                                    <Text style={styles.status}>Status: {item.status}</Text>
                                </Card.Content>
                            </Card>
                        ))
                    )}
                </View>

                <View style={styles.section}>
                    <Title>Quick Actions</Title>
                    <View style={styles.row}>
                        <Button
                            mode="contained"
                            style={styles.actionBtn}
                            icon="search"
                            onPress={() => router.push('/customer/rooms')}
                        >
                            Browse Rooms
                        </Button>
                    </View>
                </View>
            </ScrollView>
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
        elevation: 2,
    },
    content: {
        padding: SIZES.padding,
    },
    section: {
        marginBottom: 24,
    },
    card: {
        marginBottom: 12,
        backgroundColor: COLORS.white,
        elevation: 2,
    },
    emptyCard: {
        padding: 40,
        backgroundColor: COLORS.white,
        elevation: 1,
    },
    center: {
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 10,
        color: COLORS.darkGray,
    },
    status: {
        fontWeight: 'bold',
        color: COLORS.accent,
        marginTop: 5,
    },
    row: {
        flexDirection: 'row',
        marginTop: 10,
    },
    actionBtn: {
        backgroundColor: COLORS.secondary,
    }
});
