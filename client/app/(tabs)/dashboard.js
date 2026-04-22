import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity,
  StatusBar, Dimensions, Platform, FlatList,
} from 'react-native';
import { Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────
// SHARED HOTEL CARD COMPONENT
// ─────────────────────────────────────────────
function HotelCard({ item, onPress }) {
  const [liked, setLiked] = useState(false);
  return (
    <TouchableOpacity style={styles.hotelCard} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.hotelImageContainer}>
        {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={[styles.hotelImagePlaceholder, { backgroundColor: item.color || '#C5D8F0' }]}>
          <Icon name="bed-king-outline" size={40} color="rgba(255,255,255,0.5)" />
        </View>
        {item.badge && (
          <View style={styles.badgeOverlay}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.heartBtn} onPress={() => setLiked(!liked)}>
          <Icon name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? '#E74C3C' : '#FFFFFF'} />
        </TouchableOpacity>
      </View>
      <View style={styles.hotelCardBody}>
        <View style={styles.hotelCardTop}>
          <Text style={styles.hotelName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.hotelPrice}>
            <Text style={styles.priceValue}>${item.price}</Text>
            <Text style={styles.priceUnit}>/night</Text>
          </Text>
        </View>
        <View style={styles.hotelMeta}>
          <Icon name="map-marker-outline" size={12} color="#8A8A8A" />
          <Text style={styles.hotelLocation}>{item.location}</Text>
        </View>
        <View style={styles.hotelRating}>
          {[1,2,3,4,5].map(i => (
            <Icon key={i} name={i <= Math.floor(item.rating) ? 'star' : 'star-outline'} size={13} color="#F4B942" />
          ))}
          <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────
// CUSTOMER DASHBOARD
// ─────────────────────────────────────────────
const DESTINATIONS = ['Jakarta', 'Bali', 'Yogyakarta', 'Bandung', 'Padang'];
const CATEGORIES = ['All', 'Suite', 'Deluxe', 'Standard', 'Villa'];
const POPULAR_HOTELS = [
  { id: '1', name: 'The Bali Hotel', location: 'Bali, Indonesia', price: 315, rating: 4.8, reviews: '4.1K', badge: 'Breakfast Included', color: '#7FB5E1' },
  { id: '2', name: 'Santika Premiere Padang', location: 'Padang, Indonesia', price: 208, rating: 4.7, reviews: '3.2K', badge: null, color: '#8EC9A0' },
  { id: '3', name: 'The Gran Melia', location: 'Jakarta, Indonesia', price: 420, rating: 4.9, reviews: '2.8K', badge: 'Only 3 Rooms Left', color: '#D4A5C9' },
];

function CustomerDashboard({ user, router, stats }) {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FF" />

      {/* Header */}
      <View style={styles.customerHeader}>
        <View>
          <View style={styles.locationRow}>
            <Icon name="marker" size={12} color="#4F46E5" />
            <Text style={styles.locationLabel}>Current Destination</Text>
          </View>
          <Text style={styles.locationCity}>Kathmandu, Nepal</Text>
        </View>
        <Avatar.Text size={40} label={user?.name?.[0]?.toUpperCase() || 'U'} style={{ backgroundColor: '#1A1D2E' }} color="#FFF" />
      </View>

      {/* Search Bar */}
      <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/(tabs)/rooms')}>
        <Icon name="magnify" size={20} color="#8A8A8A" />
        <Text style={styles.searchPlaceholder}>Where would you like to stay?</Text>
      </TouchableOpacity>

      {/* Popular Hotels */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Accommodations</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/rooms')}>
          <Text style={styles.viewAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Hotel Cards */}
      <View style={styles.hotelsContainer}>
        {POPULAR_HOTELS.map(hotel => (
          <HotelCard key={hotel.id} item={hotel} onPress={() => router.push('/(tabs)/rooms')} />
        ))}
      </View>

      {/* Popular Hotels Around You */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Hotels Around You</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/rooms')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        {POPULAR_HOTELS.slice().reverse().map(hotel => (
          <TouchableOpacity key={hotel.id} style={styles.smallCard} onPress={() => router.push('/(tabs)/rooms')}>
            <View style={[styles.smallCardImage, { backgroundColor: hotel.color }]}>
              <Icon name="bed-king-outline" size={28} color="rgba(255,255,255,0.5)" />
            </View>
            <Text style={styles.smallCardName} numberOfLines={1}>{hotel.name}</Text>
            <Text style={styles.smallCardLocation} numberOfLines={1}>{hotel.location}</Text>
            <Text style={styles.smallCardPrice}>${hotel.price}<Text style={{ fontWeight: '400', fontSize: 11, color: '#8A8A8A' }}>/night</Text></Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

// ─────────────────────────────────────────────
// MANAGER DASHBOARD
// ─────────────────────────────────────────────
function ManagerDashboard({ user, router, stats, fetchStats }) {
  const occupancyRate = stats.totalRooms > 0 ? Math.round((stats.bookedRooms / stats.totalRooms) * 100) : 0;

  const quickActions = [
    { label: 'Inventory', icon: 'package-variant', color: '#EEF2FF', iconColor: '#4F46E5', route: '/(tabs)/inventory' },
    { label: 'Billing', icon: 'cash-register', color: '#ECFDF5', iconColor: '#10B981', route: '/(tabs)/billing' },
    { label: 'Staff List', icon: 'account-group', color: '#FEF2F2', iconColor: '#EF4444', route: '/(tabs)/staff-list' },
    { label: 'Room Svc', icon: 'room-service', color: '#FFF7ED', iconColor: '#F59E0B', route: '/(tabs)/room-service' },
  ];

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FF" />

      {/* Header */}
      <View style={styles.premiumHeader}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetingLabel}>InnSight Management</Text>
            <Text style={styles.greetingName}>{user?.name || 'Manager'}</Text>
          </View>
          <View style={styles.managerAvatarWrap}>
             <Avatar.Icon size={46} icon="account-tie" backgroundColor="#1A1D2E" color="#FFF" />
          </View>
        </View>
        
        {/* Status Banner */}
        <View style={styles.statusBanner}>
           <View style={styles.statusLabelRow}>
             <View style={styles.pulseDot} />
             <Text style={styles.statusBannerText}>HOTEL STATUS: LIVE</Text>
           </View>
           <Text style={styles.statusBannerValue}>{stats.totalRooms || 0} Total Rooms Operational</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={[styles.modernStatCard, { backgroundColor: '#4F46E5' }]}>
             <Icon name="currency-usd" size={24} color="#FFF" />
             <Text style={styles.modernStatValue}>Rs.{stats.totalRevenue?.toLocaleString() || '0'}</Text>
             <Text style={styles.modernStatLabel}>Revenue</Text>
          </View>
          <View style={[styles.modernStatCard, { backgroundColor: '#10B981' }]}>
             <Icon name="door-open" size={24} color="#FFF" />
             <Text style={styles.modernStatValue}>{occupancyRate}%</Text>
             <Text style={styles.modernStatLabel}>Occupancy</Text>
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View style={[styles.modernStatCard, { backgroundColor: '#F59E0B' }]}>
             <Icon name="receipt" size={24} color="#FFF" />
             <Text style={styles.modernStatValue}>{stats.pendingRoomService || 0}</Text>
             <Text style={styles.modernStatLabel}>Active Orders</Text>
          </View>
          <View style={[styles.modernStatCard, { backgroundColor: '#EF4444' }]}>
             <Icon name="alert-decagram" size={24} color="#FFF" />
             <Text style={styles.modernStatValue}>{stats.lowStockItems || 0}</Text>
             <Text style={styles.modernStatLabel}>Low Stock</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionHeaderDark}>
        <Text style={styles.sectionTitleDark}>Quick Operations</Text>
      </View>
      <View style={styles.quickActionsGrid}>
        {quickActions.map(a => (
          <TouchableOpacity key={a.label} style={styles.quickActionItem} onPress={() => router.push(a.route)}>
            <View style={[styles.quickActionIcon, { backgroundColor: a.color }]}>
              <Icon name={a.icon} size={26} color={a.iconColor} />
            </View>
            <Text style={styles.quickActionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings / Config */}
      <Text style={styles.sectionTitleDark}>System Configuration</Text>
      <TouchableOpacity style={styles.configItem} onPress={() => router.push('/manager/manage-rooms')}>
        <View style={[styles.configIcon, { backgroundColor: '#E0E7FF' }]}>
          <Icon name="cog-outline" size={22} color="#4F46E5" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.configLabel}>Room Pricing & Logic</Text>
          <Text style={{ fontSize: 12, color: '#8A8A8A' }}>Adjust rates and availability</Text>
        </View>
        <Icon name="chevron-right" size={20} color="#CCC" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.configItem} onPress={() => router.push('/manager/manage-menu')}>
        <View style={[styles.configIcon, { backgroundColor: '#FEF3C7' }]}>
          <Icon name="silverware-fork-knife" size={22} color="#D97706" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.configLabel}>Restaurant Inventory</Text>
          <Text style={{ fontSize: 12, color: '#8A8A8A' }}>Update menu and pricing</Text>
        </View>
        <Icon name="chevron-right" size={20} color="#CCC" />
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

// ─────────────────────────────────────────────
// STAFF DASHBOARD
// ─────────────────────────────────────────────
function StaffDashboard({ user, router, stats, fetchStats }) {
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={true}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FF" />

      <View style={styles.managerHeader}>
        <View>
          <Text style={styles.greetingLabel}>Reception / Housekeeping</Text>
          <Text style={styles.greetingName}>{user?.name || 'Staff'}</Text>
        </View>
        <Avatar.Icon size={46} icon="badge-account-horizontal" backgroundColor="#27AE60" />
      </View>

      {/* Duty Status */}
      <View style={styles.dutyCard}>
        <View>
          <Text style={styles.dutyTitle}>On Duty</Text>
          <Text style={styles.dutySubtitle}>You have {stats.pendingTasks || 0} tasks pending today</Text>
        </View>
        <View style={styles.dutyBadge}>
          <Icon name="check-circle" size={28} color="#27AE60" />
        </View>
      </View>

      {/* Attendance */}
      <View style={styles.checkInCard}>
        <View>
          <Text style={styles.attendanceMeta}>ATTENDANCE STATUS</Text>
          <Text style={styles.attendanceValue}>
            Status: <Text style={{ color: stats.isCheckedIn ? '#27AE60' : '#E74C3C', fontWeight: '800' }}>
              {stats.isCheckedIn ? 'At Work' : 'Checked Out'}
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.checkInBtn, { backgroundColor: stats.isCheckedIn ? '#E74C3C' : '#27AE60' }]}
          onPress={async () => {
            try {
              const endpoint = stats.isCheckedIn ? '/attendance/check-out' : '/attendance/check-in';
              await api.post(endpoint, { staffId: user.id });
              alert(`Successfully ${stats.isCheckedIn ? 'checked out' : 'checked in'}!`);
              fetchStats();
            } catch (e) {
              alert('Attendance failed: ' + (e.response?.data?.error || e.message));
            }
          }}
        >
          <Text style={styles.checkInBtnText}>{stats.isCheckedIn ? 'Check Out' : 'Check In'}</Text>
        </TouchableOpacity>
      </View>

      {/* Tools */}
      <Text style={styles.sectionTitleDark}>Operational Tools</Text>
      <View style={styles.toolsGrid}>
        <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/(tabs)/tasks')}>
          <View style={[styles.toolIcon, { backgroundColor: '#EAF4FF' }]}>
            <Icon name="clipboard-list" size={28} color="#2E86C1" />
          </View>
          <Text style={styles.toolLabel}>View Tasks</Text>
          <Text style={styles.toolMeta}>{stats.pendingTasks || 0} pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/(tabs)/rooms')}>
          <View style={[styles.toolIcon, { backgroundColor: '#E9F7EF' }]}>
            <Icon name="bed-king" size={28} color="#27AE60" />
          </View>
          <Text style={styles.toolLabel}>Room Status</Text>
          <Text style={styles.toolMeta}>View all rooms</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD SCREEN
// ─────────────────────────────────────────────
export default function DashboardScreen() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalRooms: 0, bookedRooms: 0, availableRooms: 0, pendingTasks: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/analytics');
      setStats(response.data);
    } catch (e) {
      console.log('Error fetching stats', e);
    }
  };

  useFocusEffect(useCallback(() => { fetchStats(); }, []));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, []);

  const role = user?.role?.toLowerCase() || 'customer';
  const props = { user, router, stats, fetchStats };

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F6FF' }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A1D2E" />}
      >
        {role === 'manager' && <ManagerDashboard {...props} />}
        {role === 'staff' && <StaffDashboard {...props} />}
        {(role === 'customer' || role === 'guest') && <CustomerDashboard {...props} />}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6FF' },

  // ── Premium Header ──────────────────────
  premiumHeader: {
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 24,
    backgroundColor: '#F4F6FF',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBanner: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginTop: 20,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10,
    borderWidth: 1, borderColor: '#EEE',
  },
  statusLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  statusBannerText: { fontSize: 11, fontWeight: '800', color: '#1A1D2E', letterSpacing: 0.5 },
  statusBannerValue: { fontSize: 16, fontWeight: '700', color: '#1A1D2E' },

  // ── Stats Container ──────────────────────
  statsContainer: { paddingHorizontal: 20, marginBottom: 24 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  modernStatCard: {
    flex: 1, borderRadius: 24, padding: 20, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12,
  },
  modernStatValue: { fontSize: 22, fontWeight: '900', color: '#FFF', marginTop: 12 },
  modernStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

  // ── Quick Actions ────────────────────────
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  quickActionItem: { width: (width - 64) / 4, alignItems: 'center' },
  quickActionIcon: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 2, backgroundColor: '#FFF' },
  quickActionLabel: { fontSize: 11, fontWeight: '700', color: '#1A1D2E', textAlign: 'center' },

  // ── Config Items ───────────────────────
  configItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 20, marginHorizontal: 20, marginBottom: 12, padding: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  configIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  configLabel: { fontSize: 15, fontWeight: '700', color: '#1A1D2E' },

  // ── Existing Mix ─────────────────
  customerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: 16,
    backgroundColor: '#F4F6FF',
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  locationLabel: { fontSize: 13, color: '#8A8A8A', marginHorizontal: 6, fontWeight: '500' },
  locationCity: { fontSize: 18, fontWeight: '800', color: '#1A1D2E', letterSpacing: -0.3 },
  notifBtn: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#E74C3C',
    borderWidth: 1.5, borderColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 18, marginHorizontal: 20, paddingHorizontal: 16, paddingVertical: 14,
    elevation: 4, shadowColor: '#1A1D2E', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, marginBottom: 24,
  },
  searchPlaceholder: { flex: 1, color: '#AAAAAA', fontSize: 14, marginLeft: 10 },
  filterBtn: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: '#1A1D2E',
    justifyContent: 'center', alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1A1D2E', letterSpacing: -0.2 },
  sectionTitleDark: { fontSize: 18, fontWeight: '800', color: '#1A1D2E', paddingHorizontal: 20, marginBottom: 14 },
  viewAll: { fontSize: 13, color: '#2E86C1', fontWeight: '700' },
  destinationsScroll: { paddingLeft: 20, marginBottom: 24 },
  destinationChip: { alignItems: 'center', marginRight: 16, width: 64 },
  destinationIcon: {
    width: 56, height: 56, borderRadius: 20, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8,
  },
  destinationText: { fontSize: 11, color: '#1A1D2E', fontWeight: '700', textAlign: 'center' },
  categoriesScroll: { paddingLeft: 20, marginBottom: 16 },
  categoryChip: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#FFFFFF', marginRight: 10,
    borderWidth: 1.5, borderColor: '#EBEBEB',
  },
  categoryChipActive: { backgroundColor: '#1A1D2E', borderColor: '#1A1D2E' },
  categoryText: { fontSize: 13, color: '#8A8A8A', fontWeight: '600' },
  categoryTextActive: { color: '#FFFFFF' },
  hotelsContainer: { paddingHorizontal: 20, marginBottom: 24 },
  hotelCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 20,
    elevation: 4, shadowColor: '#1A1D2E', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, overflow: 'hidden',
  },
  hotelImageContainer: { position: 'relative', height: 180 },
  hotelImagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  badgeOverlay: { position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  heartBtn: { position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  hotelCardBody: { padding: 16 },
  hotelCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  hotelName: { fontSize: 16, fontWeight: '800', color: '#1A1D2E', flex: 1, marginRight: 8 },
  hotelPrice: { flexShrink: 0 },
  priceValue: { fontSize: 16, fontWeight: '800', color: '#1A1D2E' },
  priceUnit: { fontSize: 11, color: '#8A8A8A', fontWeight: '400' },
  hotelMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  hotelLocation: { fontSize: 12, color: '#8A8A8A', marginLeft: 4, fontWeight: '500' },
  hotelRating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: '#8A8A8A', marginLeft: 6, fontWeight: '600' },

  // ── Manager Header ───────────────────────
  managerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: 20,
  },
  greetingLabel: { fontSize: 13, color: '#8A8A8A', fontWeight: '500', marginBottom: 4 },
  greetingName: { fontSize: 22, fontWeight: '800', color: '#1A1D2E', letterSpacing: -0.3 },
  managerAvatarWrap: {},

  // ── Stats ────────────────────────────────
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  statTile: {
    flex: 1, borderRadius: 16, padding: 14, alignItems: 'center',
    elevation: 0,
  },
  statTileValue: { fontSize: 16, fontWeight: '900', color: '#1A1D2E', letterSpacing: -0.5 },
  statTileLabel: { fontSize: 10, color: '#8A8A8A', fontWeight: '700', marginTop: 2, textTransform: 'uppercase' },

  // ── Attendance / Check-in ────────────────
  attendanceCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18,
    marginHorizontal: 20, marginBottom: 20, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
    borderLeftWidth: 4, borderLeftColor: '#27AE60',
  },
  attendanceMeta: { fontSize: 10, color: '#8A8A8A', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  attendanceValue: { fontSize: 15, color: '#1A1D2E', fontWeight: '600', marginTop: 4 },
  manageBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6FF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  manageBtnText: { fontSize: 13, fontWeight: '700', color: '#1A1D2E', marginRight: 4 },

  // ── Quick Actions ────────────────────────
  quickActionsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  quickActionItem: { flex: 1, alignItems: 'center' },
  quickActionIcon: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionLabel: { fontSize: 11, fontWeight: '700', color: '#1A1D2E', textAlign: 'center' },

  // ── Config Rows ──────────────────────────
  configRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 16, marginHorizontal: 20, marginBottom: 10, padding: 16,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
  },
  configIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  configLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1A1D2E' },

  // ── Duty Card ────────────────────────────
  dutyCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1A1D2E', borderRadius: 20, padding: 20,
    marginHorizontal: 20, marginBottom: 16,
    elevation: 4, shadowColor: '#1A1D2E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12,
  },
  dutyTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  dutySubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '400' },
  dutyBadge: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },

  // ── Check-in Card ────────────────────────
  checkInCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18,
    marginHorizontal: 20, marginBottom: 20, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  checkInBtn: { borderRadius: 14, paddingHorizontal: 18, paddingVertical: 10 },
  checkInBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },

  // ── Tools Grid ───────────────────────────
  toolsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  toolCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  toolIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  toolLabel: { fontSize: 14, fontWeight: '800', color: '#1A1D2E', marginBottom: 4 },
  toolMeta: { fontSize: 12, color: '#8A8A8A', fontWeight: '500' },
});
