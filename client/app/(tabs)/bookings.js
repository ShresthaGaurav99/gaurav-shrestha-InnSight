import React, { useState, useCallback, useContext } from 'react';
import {
  View, StyleSheet, FlatList, RefreshControl, Alert,
  TouchableOpacity, Platform, StatusBar,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const STATUS_CONFIG = {
  CONFIRMED:  { color: '#27AE60', bg: '#E9F7EF', label: 'Confirmed' },
  PENDING:    { color: '#D68910', bg: '#FEF9E7', label: 'Pending' },
  CHECKED_IN: { color: '#2E86C1', bg: '#EAF4FF', label: 'Checked In' },
  COMPLETED:  { color: '#8E44AD', bg: '#F4ECF7', label: 'Completed' },
  CANCELLED:  { color: '#E74C3C', bg: '#FDEDEC', label: 'Cancelled' },
};

export default function BookingsScreen() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isCustomer = user?.role?.toLowerCase() === 'customer';

  const fetchBookings = async () => {
    try {
      const endpoint = isCustomer ? '/bookings/my' : '/bookings';
      const res = await api.get(endpoint);
      setBookings(res.data || []);
    } catch (e) {
      console.log('Error fetching bookings', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchBookings(); }, [user]));

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      fetchBookings();
      Alert.alert('Updated', `Guest status: ${status}`);
    } catch (e) {
      Alert.alert('Error', 'Update failed');
    }
  };

  const renderBooking = ({ item }) => {
    const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
    const checkIn = new Date(item.checkIn);
    const checkOut = new Date(item.checkOut);
    const nights = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

    return (
      <View style={styles.card}>
        {/* Image Placeholder */}
        <View style={[styles.cardImageBand, { backgroundColor: '#7FB5E1' }]}>
          <Icon name="bed-king-outline" size={28} color="rgba(255,255,255,0.5)" />
          <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: sc.color }]} />
            <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          {/* Guest name + Room */}
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.guestLabel}>GUEST</Text>
              <Text style={styles.guestName} numberOfLines={1}>{item.guestName}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.roomLabel}>ROOM</Text>
              <Text style={styles.roomNum}>#{item.room_number}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Stay Dates */}
          <View style={styles.datesRow}>
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>CHECK-IN</Text>
              <Text style={styles.dateValue}>{checkIn.getDate()}</Text>
              <Text style={styles.dateMonth}>{checkIn.toLocaleDateString('en', { month: 'short', year: '2-digit' })}</Text>
            </View>
            <View style={styles.nightsPill}>
              <Icon name="weather-night" size={14} color="#8A8A8A" />
              <Text style={styles.nightsText}>{nights} Night{nights > 1 ? 's' : ''}</Text>
            </View>
            <View style={[styles.dateBlock, { alignItems: 'flex-end' }]}>
              <Text style={styles.dateLabel}>CHECK-OUT</Text>
              <Text style={styles.dateValue}>{checkOut.getDate()}</Text>
              <Text style={styles.dateMonth}>{checkOut.toLocaleDateString('en', { month: 'short', year: '2-digit' })}</Text>
            </View>
          </View>

          {/* Amount + Payment */}
          <View style={styles.amountRow}>
            <View>
              <Text style={styles.amountLabel}>Total Amount</Text>
              <Text style={styles.amountValue}>Rs. {item.totalAmount || item.totalamount || item.room_price || '—'}</Text>
            </View>
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentText}>{item.paymentStatus || item.paymentstatus || 'PENDING'}</Text>
            </View>
          </View>

          {/* Manager Actions */}
          {!isCustomer && item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && (
            <View style={styles.actionsRow}>
              {item.status === 'CONFIRMED' && (
                <TouchableOpacity style={styles.arrivalBtn} onPress={() => updateStatus(item.id, 'CHECKED_IN')}>
                  <Icon name="walk" size={14} color="#FFFFFF" />
                  <Text style={styles.arrivalBtnText}>Guest Arrival</Text>
                </TouchableOpacity>
              )}
              {item.status === 'CHECKED_IN' && (
                <TouchableOpacity style={[styles.arrivalBtn, { backgroundColor: '#1A1D2E' }]} onPress={() => updateStatus(item.id, 'COMPLETED')}>
                  <Icon name="check-circle-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.arrivalBtnText}>Checkout</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => updateStatus(item.id, 'CANCELLED')} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{isCustomer ? 'My Stays' : 'Guest Arrivals'}</Text>
          <Text style={styles.headerSub}>
            {bookings.length} {isCustomer ? 'booking' : 'reservation'}{bookings.length !== 1 ? 's' : ''} found
          </Text>
        </View>
        <View style={styles.filterBtn}>
          <Icon name="tune-vertical" size={18} color="#1A1D2E" />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#1A1D2E" />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBooking}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchBookings(); }}
              tintColor="#1A1D2E"
            />
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="calendar-blank-outline" size={64} color="#DDDDE3" />
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptySubtitle}>Your reservations will appear here</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FF' },

  // ── Header ──────────────────────────────
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1A1D2E', letterSpacing: -0.8 },
  headerSub: { fontSize: 14, color: '#8A8A8A', marginTop: 2, fontWeight: '500' },
  filterBtn: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
  },

  list: { paddingHorizontal: 20, paddingBottom: 24 },

  // ── Card ─────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 22, marginBottom: 18,
    overflow: 'hidden', elevation: 3,
    shadowColor: '#1A1D2E', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 12,
  },
  cardImageBand: {
    height: 80, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 18,
  },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '800' },

  cardBody: { padding: 18 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  guestLabel: { fontSize: 10, color: '#AAAAAA', fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 },
  guestName: { fontSize: 17, fontWeight: '800', color: '#1A1D2E' },
  roomLabel: { fontSize: 10, color: '#AAAAAA', fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 },
  roomNum: { fontSize: 17, fontWeight: '800', color: '#1A1D2E' },

  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 14 },

  // ── Dates ────────────────────────────────
  datesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  dateBlock: { alignItems: 'flex-start' },
  dateLabel: { fontSize: 10, color: '#AAAAAA', fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  dateValue: { fontSize: 28, fontWeight: '900', color: '#1A1D2E', lineHeight: 32 },
  dateMonth: { fontSize: 12, color: '#8A8A8A', fontWeight: '600' },
  nightsPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6FF',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  nightsText: { fontSize: 12, color: '#8A8A8A', fontWeight: '700', marginLeft: 6 },

  // ── Amount ───────────────────────────────
  amountRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F4F6FF', borderRadius: 14, padding: 14, marginBottom: 12,
  },
  amountLabel: { fontSize: 11, color: '#AAAAAA', fontWeight: '700', marginBottom: 4 },
  amountValue: { fontSize: 18, fontWeight: '900', color: '#1A1D2E' },
  paymentBadge: { backgroundColor: '#1A1D2E', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  paymentText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  // ── Actions ──────────────────────────────
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  arrivalBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#27AE60',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, gap: 6,
  },
  arrivalBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 10 },
  cancelBtnText: { color: '#E74C3C', fontWeight: '700', fontSize: 13 },

  // ── Empty ────────────────────────────────
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#CCCCCC', marginTop: 20 },
  emptySubtitle: { fontSize: 14, color: '#CCCCCC', marginTop: 6, fontWeight: '400' },
});
