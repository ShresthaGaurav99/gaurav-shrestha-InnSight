import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function RoomsScreen() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    fetchRooms();
  }, []);

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
    if (user.role.toLowerCase() !== 'customer') {
      router.push('/manager/manage-rooms');
      return;
    }
    router.push({
      pathname: '/customer/book',
      params: { 
          roomId: item.id, 
          roomNumber: item.number, 
          price: item.price, 
          type: item.type,
          location: 'Kathmandu' // Mock location
      }
    });
  };

  const renderRoom = ({ item }) => (
    <Card style={styles.roomCard}>
      <Card.Cover source={{ uri: `https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=500&auto=format&fit=crop` }} />
      <Card.Content style={styles.cardContent}>
        <View style={styles.row}>
          <View>
            <Text style={styles.location}><Icon name="map-marker" size={12} /> Kathmandu, Nepal</Text>
            <Title style={styles.roomNumber}>Room {item.number}</Title>
            <Text style={styles.roomType}>{item.type} Premier</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>Rs. {item.price}</Text>
            <Text style={styles.priceUnit}>per night</Text>
          </View>
        </View>

        <View style={styles.chipRow}>
          <Chip icon="wifi" style={styles.chip} textStyle={{ fontSize: 11 }}>Free Wifi</Chip>
          <Chip icon="coffee" style={styles.chip} textStyle={{ fontSize: 11 }}>Breakfast</Chip>
          <Chip 
            style={[styles.statusChip, { backgroundColor: item.status === 'AVAILABLE' ? '#eafaf1' : '#fdedec' }]}
            textStyle={{ color: item.status === 'AVAILABLE' ? '#2ecc71' : '#e74c3c', fontSize: 10, fontWeight: 'bold' }}
          >
            {item.status}
          </Chip>
        </View>

        <Button 
          mode="contained" 
          disabled={item.status !== 'AVAILABLE'}
          onPress={() => handleBook(item)}
          style={[styles.bookBtn, item.status === 'AVAILABLE' ? { backgroundColor: '#3498db' } : {}]}
        >
          {item.status === 'AVAILABLE' ? (user.role.toLowerCase() === 'customer' ? 'Reserve Now' : 'Edit Status') : 'Occupied'}
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hotel Inventory</Text>
        <Text style={styles.headerSubtitle}>Nepal's Finest Hospitality</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#3498db" />
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderRoom}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff' },
  header: { padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  headerSubtitle: { fontSize: 14, color: '#7f8c8d' },
  list: { padding: 16 },
  roomCard: { marginBottom: 24, borderRadius: 20, overflow: 'hidden', elevation: 3, backgroundColor: '#fff' },
  cardContent: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  location: { fontSize: 11, color: '#3498db', fontWeight: '700', marginBottom: 4 },
  roomNumber: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  roomType: { fontSize: 13, color: '#95a5a6' },
  priceContainer: { alignItems: 'flex-end' },
  priceValue: { fontSize: 19, fontWeight: 'bold', color: '#2ecc71' },
  priceUnit: { fontSize: 11, color: '#7f8c8d' },
  chipRow: { flexDirection: 'row', marginTop: 16, marginBottom: 20, flexWrap: 'wrap' },
  chip: { marginRight: 8, marginBottom: 8, height: 28, backgroundColor: '#f8f9f9' },
  statusChip: { marginBottom: 8, height: 28 },
  bookBtn: { borderRadius: 12, paddingVertical: 4 }
});
