import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Card, Title, Paragraph, Text, Badge, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function BookingsScreen() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      let endpoint = '/bookings';
      if (user?.role?.toLowerCase() === 'customer') {
        endpoint = `/bookings/my`;
      }
      const res = await api.get(endpoint);
      setBookings(res.data || []);
    } catch (e) {
      console.log('Error fetching bookings', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [user])
  );

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      fetchBookings();
      Alert.alert('Status Updated', `Guest status is now: ${status}`);
    } catch (e) {
      Alert.alert('Error', 'Update failed');
    }
  };

  const renderBooking = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.guestLabel}>Guest Name</Text>
            <Title style={styles.guestName}>{item.guestName}</Title>
          </View>
          <Badge size={28} style={[styles.badge, { backgroundColor: item.status === 'CONFIRMED' ? '#2ecc71' : item.status === 'PENDING' ? '#f39c12' : '#3498db' }]}>
            {item.status}
          </Badge>
        </View>
        
        <Divider style={styles.divider} />

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Icon name="door" size={16} color="#7f8c8d" />
            <Text style={styles.infoText}>Room {item.room_number}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="map-marker" size={16} color="#7f8c8d" />
            <Text style={styles.infoText}>Kathmandu</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="cash" size={16} color="#7f8c8d" />
            <Text style={styles.infoText}>Total: Rs. {item.totalAmount || item.totalamount || item.room_price || '0'}</Text>
          </View>
        </View>

        <View style={styles.dateBox}>
          <Text style={styles.dateText}>Stay: {new Date(item.checkIn).toLocaleDateString()} - {new Date(item.checkOut).toLocaleDateString()}</Text>
          <Text style={styles.dateText}>Payment: {item.paymentStatus || item.paymentstatus || 'PENDING'}</Text>
        </View>

        {user?.role?.toLowerCase() === 'manager' && item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && (
          <View style={styles.actions}>
            {item.status === 'CONFIRMED' && (
              <Button mode="contained" onPress={() => updateStatus(item.id, 'CHECKED_IN')} style={styles.checkInBtn}>
                Guest Arrival
              </Button>
            )}
            {item.status === 'CHECKED_IN' && (
              <Button mode="contained" onPress={() => updateStatus(item.id, 'COMPLETED')} style={styles.checkOutBtn}>
                Checkout
              </Button>
            )}
            <Button mode="text" onPress={() => updateStatus(item.id, 'CANCELLED')} textColor="#e74c3c">
              Cancel
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{user?.role?.toLowerCase() === 'customer' ? 'My Stay Details' : 'Guest Arrivals'}</Text>
        <Text style={styles.headerSubtitle}>Hotel Operations - Nepal</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#3498db" />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBooking}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="book-outline" size={64} color="#bdc3c7" />
              <Text style={styles.emptyText}>No bookings found today.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff' },
  header: { padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  headerSubtitle: { fontSize: 13, color: '#95a5a6', marginTop: 4 },
  list: { padding: 16 },
  card: { marginBottom: 16, borderRadius: 20, backgroundColor: '#fff', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  guestLabel: { fontSize: 10, color: '#95a5a6', textTransform: 'uppercase', letterSpacing: 1 },
  guestName: { fontSize: 18, fontWeight: '700', color: '#2c3e50' },
  badge: { borderRadius: 8, height: 26 },
  divider: { marginVertical: 12 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center' },
  infoText: { marginLeft: 6, fontSize: 13, color: '#7f8c8d', fontWeight: '500' },
  dateBox: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10, alignItems: 'center' },
  dateText: { fontSize: 12, color: '#34495e', fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  checkInBtn: { borderRadius: 10, backgroundColor: '#2ecc71', marginRight: 8 },
  checkOutBtn: { borderRadius: 10, backgroundColor: '#9b59b6', marginRight: 8 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, color: '#95a5a6' }
});
