import React, { useState, useEffect, useContext } from 'react';
import {
  View, StyleSheet, FlatList, TouchableOpacity,
  Alert, Platform, StatusBar, ScrollView,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ROOM_COLORS = ['#7FB5E1', '#8EC9A0', '#D4A5C9', '#F5B88A', '#85C1E9'];
const CATEGORIES = ['All', 'Suite', 'Deluxe', 'Standard', 'Villa'];

export default function RoomsScreen() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [liked, setLiked] = useState({});
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data || res.rows || []);
    } catch (err) {
      console.log('Error fetching rooms', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (item) => {
    const role = user?.role?.toLowerCase();
    if (role === 'manager' || role === 'admin') {
      router.push('/manager/manage-rooms');
      return;
    } else if (role === 'staff') {
      Alert.alert('Restricted', 'Only Managers can edit room configurations. You can view the details.');
      router.push({ pathname: '/customer/room-details', params: { roomId: item.id } });
      return;
    }
    router.push({ pathname: '/customer/room-details', params: { roomId: item.id } });
  };

  const toggleLike = (id) => setLiked(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredRooms = activeCategory === 'All'
    ? rooms
    : rooms.filter(r => r.type?.toLowerCase().includes(activeCategory.toLowerCase()));

  const renderRoom = ({ item, index }) => {
    const isAvailable = item.status === 'AVAILABLE';
    const colorBg = ROOM_COLORS[index % ROOM_COLORS.length];
    const price = Math.round(item.price / 133); // rough NPR to USD for display

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleBook(item)} activeOpacity={0.92}>
        {/* Image / Placeholder */}
        <View style={[styles.cardImage, { backgroundColor: colorBg }]}>
          <Icon name="bed-king-outline" size={44} color="rgba(255,255,255,0.45)" />

          {/* Availability Badge */}
          <View style={[styles.availBadge, { backgroundColor: isAvailable ? 'rgba(39,174,96,0.88)' : 'rgba(231,76,60,0.88)' }]}>
            <Text style={styles.availBadgeText}>{isAvailable ? 'Available' : 'Occupied'}</Text>
          </View>

          {/* Heart Button */}
          <TouchableOpacity style={styles.heartBtn} onPress={() => toggleLike(item.id)}>
            <Icon
              name={liked[item.id] ? 'heart' : 'heart-outline'}
              size={18}
              color={liked[item.id] ? '#E74C3C' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          {/* Name & Price */}
          <View style={styles.cardTop}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.roomName} numberOfLines={1}>
                {item.title || `Room ${item.number}`}
              </Text>
              <View style={styles.locationRow}>
                <Icon name="map-marker-outline" size={12} color="#8A8A8A" />
                <Text style={styles.locationText}>Kathmandu, Nepal</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.priceValue}>Rs. {item.price}</Text>
              <Text style={styles.priceUnit}>/night</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(i => (
              <Icon key={i} name={i <= 4 ? 'star' : 'star-outline'} size={13} color="#F4B942" />
            ))}
            <Text style={styles.ratingText}>4.0 (1.2K reviews)</Text>
          </View>

          {/* Room Meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Icon name="account-multiple" size={12} color="#5A7BAF" />
              <Text style={styles.metaText}>{item.capacity || 2} Guests</Text>
            </View>
            <View style={styles.metaChip}>
              <Icon name="bed-queen" size={12} color="#5A7BAF" />
              <Text style={styles.metaText}>{item.bed_type || 'Queen Bed'}</Text>
            </View>
            <View style={styles.metaChip}>
              <Icon name="square-rounded" size={12} color="#5A7BAF" />
              <Text style={styles.metaText}>{item.size_sqft || 280} sqft</Text>
            </View>
          </View>

          {/* Amenities */}
          <View style={styles.amenitiesRow}>
            <View style={styles.amenityTag}><Icon name="wifi" size={12} color="#2E86C1" /><Text style={styles.amenityText}>Free Wifi</Text></View>
            <View style={styles.amenityTag}><Icon name="coffee" size={12} color="#2E86C1" /><Text style={styles.amenityText}>Breakfast</Text></View>
            <View style={styles.amenityTag}><Icon name="pool" size={12} color="#2E86C1" /><Text style={styles.amenityText}>Pool</Text></View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.bookBtn, !isAvailable && styles.bookBtnDisabled]}
            disabled={!isAvailable}
            onPress={() => handleBook(item)}
          >
            <Text style={styles.bookBtnText}>
              {isAvailable
                ? (['manager', 'admin'].includes(user?.role?.toLowerCase()) ? 'Manage Room' : 'View Room')
                : 'Not Available'}
            </Text>
            {isAvailable && <Icon name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Explore Rooms</Text>
          <Text style={styles.headerSub}>Nepal's Finest Hospitality</Text>
        </View>
        <TouchableOpacity style={styles.filterIconBtn}>
          <Icon name="tune-vertical" size={18} color="#1A1D2E" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="magnify" size={18} color="#AAAAAA" />
        <Text style={styles.searchPlaceholder}>Search room type, amenity...</Text>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
      >
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

      {/* Room Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          <Text style={{ fontWeight: '800', color: '#1A1D2E' }}>{filteredRooms.length}</Text> rooms found
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#1A1D2E" />
      ) : (
        <FlatList
          data={filteredRooms}
          renderItem={renderRoom}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="bed-empty" size={56} color="#CCCCCC" />
              <Text style={styles.emptyText}>No rooms found</Text>
              <Text style={styles.emptySubText}>Try a different category</Text>
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
  filterIconBtn: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
  },

  // ── Search ───────────────────────────────
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 16, paddingVertical: 13,
    marginBottom: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  searchPlaceholder: { flex: 1, color: '#BBBBBB', fontSize: 14, marginLeft: 10 },

  // ── Categories ───────────────────────────
  categoriesContent: { paddingHorizontal: 20, paddingBottom: 12 },
  categoryChip: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22,
    backgroundColor: '#FFFFFF', marginRight: 10,
    borderWidth: 1.5, borderColor: '#EBEBEB',
  },
  categoryChipActive: { backgroundColor: '#1A1D2E', borderColor: '#1A1D2E' },
  categoryText: { fontSize: 13, color: '#8A8A8A', fontWeight: '600' },
  categoryTextActive: { color: '#FFFFFF' },

  // ── Count ────────────────────────────────
  countRow: { paddingHorizontal: 20, marginBottom: 8 },
  countText: { fontSize: 13, color: '#8A8A8A', fontWeight: '500' },

  // ── List ─────────────────────────────────
  list: { paddingHorizontal: 20, paddingBottom: 24 },

  // ── Card ─────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 22, marginBottom: 22,
    overflow: 'hidden', elevation: 4,
    shadowColor: '#1A1D2E', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16,
  },
  cardImage: { height: 180, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  availBadge: {
    position: 'absolute', bottom: 12, left: 12,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  availBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  heartBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
  },

  cardBody: { padding: 18 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  roomName: { fontSize: 17, fontWeight: '800', color: '#1A1D2E', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 12, color: '#8A8A8A', marginLeft: 4, fontWeight: '500' },
  priceValue: { fontSize: 16, fontWeight: '900', color: '#1A1D2E' },
  priceUnit: { fontSize: 11, color: '#8A8A8A', fontWeight: '400', textAlign: 'right' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingText: { fontSize: 12, color: '#8A8A8A', marginLeft: 6, fontWeight: '600' },

  metaRow: { flexDirection: 'row', marginBottom: 12, gap: 8, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EFF4FF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  metaText: { fontSize: 11, color: '#2E5FA3', fontWeight: '700', marginLeft: 4 },

  amenitiesRow: { flexDirection: 'row', marginBottom: 18, gap: 8 },
  amenityTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amenityText: { fontSize: 11, color: '#8A8A8A', fontWeight: '600' },

  bookBtn: {
    backgroundColor: '#1A1D2E', borderRadius: 16, height: 52,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    elevation: 0,
  },
  bookBtnDisabled: { backgroundColor: '#E0E0E0' },
  bookBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },

  // ── Empty State ──────────────────────────
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '800', color: '#CCCCCC', marginTop: 16 },
  emptySubText: { fontSize: 14, color: '#CCCCCC', marginTop: 6 },
});
