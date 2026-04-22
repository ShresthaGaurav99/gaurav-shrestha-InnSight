import React, { useEffect, useState } from 'react';
import {
  ScrollView, StyleSheet, View, TouchableOpacity,
  Platform, StatusBar, Dimensions,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const FACILITIES = [
  { icon: 'wifi', label: 'Free Wifi' },
  { icon: 'food', label: 'Breakfast' },
  { icon: 'pool', label: 'Swimming Pool' },
  { icon: 'dumbbell', label: 'Minibar' },
  { icon: 'flower', label: 'Fitness Center' },
];

export default function RoomDetailsScreen() {
  const { roomId } = useLocalSearchParams();
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await api.get(`/rooms/${roomId}`);
        setRoom(response.data);
      } catch (error) {
        console.log('Failed to load room details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A1D2E" />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="bed-empty" size={56} color="#CCCCCC" />
        <Text style={styles.errorText}>Room could not be loaded.</Text>
      </View>
    );
  }

  const amenities = room.amenities?.length ? room.amenities : ['Free Wifi', 'Breakfast', 'Pool'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Hero Image Area */}
      <View style={[styles.heroImage, { backgroundColor: '#7FB5E1' }]}>
        <Icon name="bed-king-outline" size={72} color="rgba(255,255,255,0.35)" />

        {/* Back + Heart overlay */}
        <View style={styles.heroOverlayTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Icon name="arrow-left" size={20} color="#1A1D2E" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.heartBtnOverlay} onPress={() => setLiked(!liked)}>
            <Icon name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#E74C3C' : '#1A1D2E'} />
          </TouchableOpacity>
        </View>

        {/* Photo count pill */}
        <View style={styles.photoPill}>
          <Icon name="camera-outline" size={12} color="#FFFFFF" />
          <Text style={styles.photoPillText}>1/4</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Block */}
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.roomTitle} numberOfLines={2}>{room.title || `${room.type} Room`}</Text>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={12} color="#F4B942" />
              <Text style={styles.ratingBadgeText}>4.8</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Icon name="map-marker-outline" size={14} color="#8A8A8A" />
            <Text style={styles.locationText}>Kathmandu, Nepal • Room #{room.number}</Text>
          </View>

          <View style={styles.reviewsRow}>
            {[1,2,3,4,5].map(i => (
              <Icon key={i} name={i <= 4 ? 'star' : 'star-outline'} size={14} color="#F4B942" />
            ))}
            <Text style={styles.reviewCount}>4.8 (3,712 reviews)</Text>
          </View>
        </View>

        {/* Room Meta Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metaScrollContent}>
          <View style={styles.metaPill}><Icon name="account-multiple" size={14} color="#2E86C1" /><Text style={styles.metaPillText}>{room.capacity || 2} Guests</Text></View>
          <View style={styles.metaPill}><Icon name="bed-queen" size={14} color="#2E86C1" /><Text style={styles.metaPillText}>{room.bed_type || 'King Bed'}</Text></View>
          <View style={styles.metaPill}><Icon name="square-rounded" size={14} color="#2E86C1" /><Text style={styles.metaPillText}>{room.size_sqft || 280} sqft</Text></View>
          <View style={styles.metaPill}><Icon name="floor-plan" size={14} color="#2E86C1" /><Text style={styles.metaPillText}>{room.status}</Text></View>
        </ScrollView>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Room</Text>
          <Text style={styles.descText}>
            {room.description || `Experience unparalleled comfort in this ${room.type?.toLowerCase()} room at InnSight. Featuring world-class amenities, stunning views, and premium service for an unforgettable stay in Nepal.`}
          </Text>
        </View>

        {/* Room Facilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Room Facilities</Text>
          <View style={styles.facilitiesGrid}>
            {FACILITIES.map((f, idx) => (
              <View key={idx} style={styles.facilityItem}>
                <View style={styles.facilityIconWrap}>
                  <Icon name={f.icon} size={20} color="#2E86C1" />
                </View>
                <Text style={styles.facilityText}>{f.label}</Text>
                <Icon name="check" size={14} color="#27AE60" style={{ marginLeft: 'auto' }} />
              </View>
            ))}
          </View>
        </View>

        {/* Guest Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest Details</Text>
          <View style={styles.guestCard}>
            <View style={styles.guestAvatar}>
              <Icon name="account-circle" size={32} color="#8A8A8A" />
            </View>
            <View>
              <Text style={styles.guestName}>Guest at InnSight</Text>
              <Text style={styles.guestEmail}>innsightofficial@gmail.com</Text>
              <View style={styles.tagsRow}>
                <View style={styles.tag}><Text style={styles.tagText}>Location</Text></View>
                <View style={[styles.tag, { backgroundColor: '#E9F7EF' }]}><Text style={[styles.tagText, { color: '#27AE60' }]}>Non-Smoking</Text></View>
              </View>
            </View>
          </View>
        </View>

        {/* Policies */}
        {room.policies?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stay Policies</Text>
            {room.policies.map((p, i) => (
              <View key={i} style={styles.policyRow}>
                <Icon name="information-outline" size={14} color="#8A8A8A" />
                <Text style={styles.policyText}>{p}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPrice}>Rs. {room.price}</Text>
          <Text style={styles.bottomPriceUnit}>Total est. amount</Text>
        </View>
        <TouchableOpacity
          style={styles.bookNowBtn}
          onPress={() =>
            router.push({
              pathname: '/customer/book',
              params: { roomId: room.id, roomNumber: room.number, price: room.price, type: room.type, title: room.title },
            })
          }
        >
          <Text style={styles.bookNowText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6FF' },
  errorText: { marginTop: 16, fontSize: 16, color: '#CCCCCC', fontWeight: '600' },

  // ── Hero ─────────────────────────────────
  heroImage: {
    height: 280, justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  heroOverlayTop: {
    position: 'absolute', top: Platform.OS === 'ios' ? 52 : 32,
    left: 0, right: 0, flexDirection: 'row',
    justifyContent: 'space-between', paddingHorizontal: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  heartBtnOverlay: {
    width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  photoPill: {
    position: 'absolute', bottom: 16, right: 20,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  photoPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginLeft: 4 },

  // ── Content ──────────────────────────────
  content: { flex: 1, backgroundColor: '#F4F6FF' },

  titleBlock: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, marginTop: -24, paddingTop: 28,
    elevation: 0,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  roomTitle: { fontSize: 22, fontWeight: '900', color: '#1A1D2E', flex: 1, marginRight: 12, letterSpacing: -0.3 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF8E7', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  ratingBadgeText: { fontSize: 13, fontWeight: '800', color: '#D68910', marginLeft: 4 },

  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  locationText: { fontSize: 13, color: '#8A8A8A', marginLeft: 4, fontWeight: '500' },
  reviewsRow: { flexDirection: 'row', alignItems: 'center' },
  reviewCount: { fontSize: 12, color: '#8A8A8A', marginLeft: 8, fontWeight: '600' },

  // ── Meta Pills ───────────────────────────
  metaScrollContent: { paddingHorizontal: 20, paddingVertical: 16, gap: 10 },
  metaPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  metaPillText: { fontSize: 12, color: '#1A1D2E', fontWeight: '700', marginLeft: 6 },

  // ── Section ──────────────────────────────
  section: {
    backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 14,
    borderRadius: 20, padding: 20,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1A1D2E', marginBottom: 14, letterSpacing: -0.2 },
  descText: { fontSize: 14, color: '#8A8A8A', lineHeight: 22, fontWeight: '400' },

  // ── Facilities ───────────────────────────
  facilitiesGrid: {},
  facilityItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  facilityIconWrap: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: '#EAF4FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  facilityText: { flex: 1, fontSize: 14, color: '#1A1D2E', fontWeight: '600' },

  // ── Guest Card ───────────────────────────
  guestCard: { flexDirection: 'row', alignItems: 'flex-start' },
  guestAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  guestName: { fontSize: 15, fontWeight: '800', color: '#1A1D2E', marginBottom: 2 },
  guestEmail: { fontSize: 12, color: '#8A8A8A', marginBottom: 8 },
  tagsRow: { flexDirection: 'row', gap: 8 },
  tag: { backgroundColor: '#F0F0F0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 11, color: '#8A8A8A', fontWeight: '700' },

  // ── Policies ─────────────────────────────
  policyRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  policyText: { fontSize: 13, color: '#8A8A8A', marginLeft: 8, flex: 1, lineHeight: 20 },

  // ── Bottom Bar ───────────────────────────
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF', paddingHorizontal: 24,
    paddingVertical: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12,
  },
  bottomPrice: { fontSize: 22, fontWeight: '900', color: '#1A1D2E', letterSpacing: -0.5 },
  bottomPriceUnit: { fontSize: 11, color: '#8A8A8A', fontWeight: '500' },
  bookNowBtn: {
    backgroundColor: '#1A1D2E', borderRadius: 18,
    paddingHorizontal: 32, paddingVertical: 14,
    elevation: 0,
  },
  bookNowText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
});
