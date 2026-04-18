import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Image } from 'react-native';
import { Appbar, Button, Card, Divider, Text, Title, Chip, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../services/api';

export default function RoomDetailsScreen() {
  const { roomId } = useLocalSearchParams();
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

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
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  if (!room) {
    return (
      <View style={styles.center}>
        <Text>Room details could not be loaded.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={room.title || `${room.type} Room`} subtitle={room.location} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: room.image_urls?.[0] }} style={styles.heroImage} />

        <Card style={styles.card}>
          <Card.Content>
            <Title>{room.title || `${room.type} Room`}</Title>
            <Text style={styles.price}>Rs. {room.price} / night</Text>
            <Text style={styles.meta}>Room #{room.number} • {room.capacity} Guests • {room.bed_type}</Text>
            <Text style={styles.meta}>{room.size_sqft || 280} sqft • {room.status}</Text>
            <Text style={styles.description}>{room.description}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Amenities</Title>
            <View style={styles.chips}>
              {(room.amenities || []).map((amenity) => (
                <Chip key={amenity} style={styles.chip}>{amenity}</Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Stay Policies</Title>
            {(room.policies || []).map((policy) => (
              <Text key={policy} style={styles.policy}>• {policy}</Text>
            ))}
          </Card.Content>
        </Card>

        {room.image_urls?.slice(1).length ? (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>More Photos</Title>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {room.image_urls.slice(1).map((imageUrl) => (
                  <Image key={imageUrl} source={{ uri: imageUrl }} style={styles.galleryImage} />
                ))}
              </ScrollView>
            </Card.Content>
          </Card>
        ) : null}

        <Divider style={{ marginVertical: 8 }} />

        <Button
          mode="contained"
          style={styles.bookButton}
          onPress={() =>
            router.push({
              pathname: '/customer/book',
              params: {
                roomId: room.id,
                roomNumber: room.number,
                price: room.price,
                type: room.type,
                title: room.title,
              },
            })
          }
        >
          Book this room
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  header: { backgroundColor: '#fff' },
  content: { padding: 16 },
  heroImage: { width: '100%', height: 240, borderRadius: 20, marginBottom: 16 },
  card: { marginBottom: 16, borderRadius: 18, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 18 },
  price: { fontSize: 20, color: '#0984E3', fontWeight: '700', marginTop: 8 },
  meta: { color: '#636E72', marginTop: 4 },
  description: { marginTop: 12, lineHeight: 20, color: '#2D3436' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  chip: { marginRight: 8, marginBottom: 8, backgroundColor: '#eef6ff' },
  policy: { marginTop: 8, color: '#2D3436' },
  galleryImage: { width: 170, height: 120, borderRadius: 14, marginRight: 10, marginTop: 12 },
  bookButton: { borderRadius: 12, marginBottom: 24, backgroundColor: '#0984E3' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
