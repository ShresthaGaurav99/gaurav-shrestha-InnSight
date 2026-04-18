import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Chip, Text, Title } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function CustomerMenuScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [menuResponse, bookingResponse] = await Promise.all([
          api.get('/menu'),
          api.get('/bookings/my'),
        ]);

        setCategories(menuResponse.data.categories || []);
        const liveBooking = (bookingResponse.data || []).find(
          (booking) => booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN'
        );
        setActiveBooking(liveBooking || null);
      } catch (error) {
        console.log('Failed to load menu', error);
      }
    };

    loadData();
  }, []);

  const flatItems = categories.flatMap((category) =>
    (category.items || []).map((item) => ({ ...item, category_name: category.name }))
  );

  const items = selectedCategory === 'All'
    ? flatItems
    : flatItems.filter((item) => item.category_name === selectedCategory);

  const addToRoomService = async (item) => {
    if (!activeBooking) {
      Alert.alert('Booking required', 'Create or confirm a room booking before ordering room service.');
      return;
    }

    try {
      await api.post('/room-service', {
        roomNumber: activeBooking.room_number,
        bookingId: activeBooking.id,
        menuItemId: item.id,
        quantity: 1,
        guestName: activeBooking.guestName,
      });

      Alert.alert('Added', `${item.name} has been sent to room service for Room ${activeBooking.room_number}.`);
    } catch (error) {
      Alert.alert('Order failed', error.response?.data?.message || 'Could not place room service order.');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Hotel Menu" subtitle="Fair Kathmandu mid-range pricing" />
      </Appbar.Header>

      <View style={styles.categoryRow}>
        <FlatList
          horizontal
          data={['All', ...categories.map((category) => category.name)]}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Chip
              selected={selectedCategory === item}
              onPress={() => setSelectedCategory(item)}
              style={[styles.categoryChip, selectedCategory === item && styles.activeChip]}
            >
              {item}
            </Chip>
          )}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <Card.Content>
              <View style={styles.row}>
                <Title style={styles.itemTitle}>{item.name}</Title>
                <Text style={styles.price}>Rs. {item.price}</Text>
              </View>
              <Text style={styles.categoryText}>{item.category_name} • {item.is_veg ? 'Veg' : 'Non-Veg'} • {item.spice_level}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Button mode="contained" onPress={() => addToRoomService(item)} style={styles.button}>
                Order to Room
              </Button>
            </Card.Content>
          </Card>
        )}
        ListHeaderComponent={
          <Card style={styles.infoCard}>
            <Card.Content>
              <Title style={styles.infoTitle}>Room Service Ordering</Title>
              <Text>
                {activeBooking
                  ? `Orders will be sent to Room ${activeBooking.room_number}.`
                  : 'Confirm a booking first, then you can order food directly to your room.'}
              </Text>
            </Card.Content>
          </Card>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  header: { backgroundColor: '#fff' },
  categoryRow: { paddingHorizontal: 16, paddingTop: 12 },
  categoryChip: { marginRight: 8, backgroundColor: '#fff' },
  activeChip: { backgroundColor: '#dff1ff' },
  list: { padding: 16 },
  infoCard: { borderRadius: 18, marginBottom: 16, backgroundColor: '#fff4e5' },
  infoTitle: { fontSize: 18 },
  card: { borderRadius: 20, overflow: 'hidden', marginBottom: 16, backgroundColor: '#fff' },
  image: { width: '100%', height: 180 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  itemTitle: { fontSize: 18, flex: 1, marginRight: 12 },
  price: { fontSize: 18, fontWeight: '700', color: '#0984E3' },
  categoryText: { color: '#636E72', marginTop: 6 },
  description: { marginTop: 10, color: '#2D3436', lineHeight: 20 },
  button: { marginTop: 14, borderRadius: 12, backgroundColor: '#0984E3' },
});
