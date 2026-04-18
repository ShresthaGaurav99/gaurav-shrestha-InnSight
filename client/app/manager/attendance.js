import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Avatar, List, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import api from '../../services/api';

export default function AttendanceScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [roster, setRoster] = useState([]);

    const fetchAttendance = async () => {
        try {
            const response = await api.get('/attendance/today');
            setRoster(response.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAttendance();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAttendance();
        setRefreshing(false);
    };

    const renderItem = ({ item }) => {
        const checkInTime = item.check_in ? new Date(item.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
        const checkOutTime = item.check_out ? new Date(item.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still Working';

        return (
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.staffInfo}>
                        <Avatar.Text size={40} label={item.name.substring(0, 2).toUpperCase()} style={styles.avatar} />
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.position}>{item.position}</Text>
                        </View>
                    </View>
                    <View style={styles.statusSection}>
                        <Chip 
                            mode="flat" 
                            style={[styles.statusChip, { backgroundColor: item.check_out ? '#e0e0e0' : '#eafaf1' }]}
                            textStyle={{ color: item.check_out ? '#757575' : '#2ecc71', fontWeight: 'bold' }}
                        >
                            {item.check_out ? 'Finished' : 'Present'}
                        </Chip>
                    </View>
                </Card.Content>
                <View style={styles.timingRow}>
                    <View style={styles.timeBox}>
                        <Text style={styles.timeLabel}>CHECK IN</Text>
                        <Text style={styles.timeValue}>{checkInTime}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.timeBox}>
                        <Text style={styles.timeLabel}>CHECK OUT</Text>
                        <Text style={styles.timeValue}>{checkOutTime}</Text>
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Staff Presence</Text>
                <Text style={styles.headerSub}>{new Date().toDateString()}</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3498db" />
                    <Text style={{ marginTop: 10 }}>Loading attendance...</Text>
                </View>
            ) : (
                <FlatList
                    data={roster}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <IconButton icon="account-off-outline" size={60} iconColor="#bdc3c7" />
                            <Text style={styles.emptyText}>No staff checked in yet today.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
    headerSub: { fontSize: 14, color: '#7f8c8d', marginTop: 4 },
    list: { padding: 16 },
    card: { marginBottom: 16, borderRadius: 16, backgroundColor: '#fff', elevation: 2 },
    cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    staffInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { marginRight: 12, backgroundColor: '#3498db' },
    name: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
    position: { fontSize: 13, color: '#7f8c8d' },
    statusChip: { height: 28, borderRadius: 14 },
    timingRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f1f1', marginTop: 12 },
    timeBox: { flex: 1, padding: 12, alignItems: 'center' },
    timeLabel: { fontSize: 10, color: '#95a5a6', fontWeight: 'bold', marginBottom: 2 },
    timeValue: { fontSize: 14, fontWeight: '600', color: '#34495e' },
    divider: { width: 1, backgroundColor: '#f1f1f1' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { marginTop: 100, alignItems: 'center' },
    emptyText: { color: '#95a5a6', fontSize: 16 }
});
