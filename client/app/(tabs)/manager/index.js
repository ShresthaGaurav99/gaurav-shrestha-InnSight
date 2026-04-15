import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Title, Card, Avatar, Appbar, List } from 'react-native-paper';
import { AuthContext } from '../../../context/AuthContext';
import { COLORS, SIZES } from '../../../constants/theme';
import api from '../../../services/api';
import { LogOut, BarChart3, Users, Hotel, ClipboardEdit, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ManagerDashboard() {
    const { user, logout } = useContext(AuthContext);
    const router = useRouter();
    const [stats, setStats] = useState([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/tasks/summary');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.Content title="Manager Dashboard" subtitle={user?.fullName} />
                <Appbar.Action icon={() => <LogOut size={20} color={COLORS.primary} />} onPress={logout} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.statsContainer}>
                    <Card style={[styles.statCard, { backgroundColor: '#E3F2FD' }]} onPress={() => router.push('/manager/manage-rooms')}>
                        <Card.Content style={styles.statContent}>
                            <Hotel size={24} color="#1976D2" />
                            <Title style={{ color: '#1976D2' }}>Rooms</Title>
                            <Text style={{ color: '#1976D2' }}>Manage Inventory</Text>
                        </Card.Content>
                    </Card>
                    <Card style={[styles.statCard, { backgroundColor: '#E8F5E9' }]} onPress={() => router.push('/manager/assign-task')}>
                        <Card.Content style={styles.statContent}>
                            <ClipboardEdit size={24} color="#388E3C" />
                            <Title style={{ color: '#388E3C' }}>Tasks</Title>
                            <Text style={{ color: '#388E3C' }}>Assign Work</Text>
                        </Card.Content>
                    </Card>
                </View>

                <View style={styles.section}>
                    <Title>Task Overview</Title>
                    <Card style={styles.card}>
                        {stats.map((item, index) => (
                            <List.Item
                                key={index}
                                title={item.status.toUpperCase()}
                                description={`${item.count} tasks`}
                                left={props => <List.Icon {...props} icon="information" />}
                            />
                        ))}
                        {stats.length === 0 && (
                            <List.Item title="No task data available" />
                        )}
                    </Card>
                </View>

                <View style={styles.section}>
                    <Title>Hotel Operations</Title>
                    <Card style={styles.card}>
                        <List.Item
                            title="All Reservations"
                            description="View and manage guest bookings"
                            onPress={() => Alert.alert('Notice', 'Full Reservations list coming in the next update!')}
                            left={props => <List.Icon {...props} icon="calendar-check" color={COLORS.secondary} />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                        />
                        <List.Item
                            title="Staff Performance"
                            description="Monitor task completion rates"
                            left={props => <List.Icon {...props} icon="account-group" color={COLORS.accent} />}
                        />
                    </Card>
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
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        flex: 0.48,
        elevation: 1,
    },
    statContent: {
        alignItems: 'center',
        padding: 10,
    },
    section: {
        marginBottom: 24,
    },
    card: {
        backgroundColor: COLORS.white,
    }
});
