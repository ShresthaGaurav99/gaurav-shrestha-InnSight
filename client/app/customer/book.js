import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Title, Appbar, Avatar, Divider, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

export default function BookingScreen() {
  const { roomId, roomNumber, price, type, title } = useLocalSearchParams();
  const { user } = useContext(AuthContext);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [phone, setPhone] = useState('98');
  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) return;
      try {
        const response = await api.get(`/rooms/${roomId}`);
        setRoom(response.data);
      } catch (error) {
        console.log('Failed to fetch room details', error);
      }
    };

    fetchRoom();
  }, [roomId]);

  const displayPrice = parseFloat(price || room?.price || 0);
  const displayRoomNumber = roomNumber || room?.number;
  const displayType = type || room?.type;
  const displayTitle = title || room?.title || `${displayType || 'Room'} Stay`;

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const roomAmount = displayPrice * nights;
  const vat = roomAmount * 0.13;
  const grandTotal = roomAmount + vat;

  const handleProceedToPayment = () => {
    if (!checkIn || !checkOut || phone.length !== 10) {
      Alert.alert('Error', 'Please enter valid dates (YYYY-MM-DD) and a 10-digit Nepal phone number.');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
        Alert.alert('Error', 'Check-out date must be after check-in date.');
        return;
    }
    
    router.push({
      pathname: '/customer/payment',
      params: { 
        roomId, 
        roomNumber, 
        price: displayPrice, 
        checkIn, 
        checkOut, 
        totalAmount: grandTotal.toFixed(2),
        phone,
        title: displayTitle,
        type: displayType,
      }
    });
  };

  if (!room && !price) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Room Booking (Nepal)" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Title style={styles.sectionTitle}>Booking Details</Title>
        <Card style={styles.roomCard}>
          <Card.Content style={styles.row}>
            <View>
              <Text style={styles.locationText}>Location: Kathmandu, Nepal</Text>
              <Title style={styles.roomTitle}>{displayTitle}</Title>
              <Text style={styles.roomType}>Room {displayRoomNumber} • {displayType}</Text>
              <Text style={styles.price}>Rs. {displayPrice} / night</Text>
            </View>
            <Avatar.Icon size={64} icon="bed" backgroundColor="#ebf5fb" color="#3498db" />
          </Card.Content>
        </Card>

        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.label}>Guest Phone (Nepal)</Text>
            <TextInput
              label="Contact Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              mode="outlined"
              style={styles.input}
              placeholder="98XXXXXXXX"
            />

            <View style={styles.dateRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Check-in Date</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  value={checkIn}
                  onChangeText={setCheckIn}
                  mode="outlined"
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Check-out Date</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  value={checkOut}
                  onChangeText={setCheckOut}
                  mode="outlined"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.summaryContainer}>
               <Title style={styles.summaryTitle}>Booking Summary</Title>
               <View style={styles.summaryRow}>
                 <Text>Room Charge ({nights} Night{nights > 1 ? 's' : ''})</Text>
                 <Text>Rs. {roomAmount.toFixed(2)}</Text>
               </View>
               <View style={styles.summaryRow}>
                 <Text>VAT (13%)</Text>
                 <Text>Rs. {vat.toFixed(2)}</Text>
               </View>
               <Divider style={styles.divider} />
               <View style={styles.summaryRow}>
                 <Text style={styles.totalLabel}>Grand Total</Text>
                 <Text style={styles.totalValue}>Rs. {grandTotal.toFixed(2)}</Text>
               </View>
            </View>

            <Button 
              mode="contained" 
              onPress={handleProceedToPayment}
              style={styles.bookBtn}
              contentStyle={styles.btnContent}
            >
              Confirm & Pay Rs. {grandTotal.toFixed(2)}
            </Button>

          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff' },
  header: { backgroundColor: '#fff' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#2c3e50' },
  roomCard: { borderRadius: 16, backgroundColor: '#fff', elevation: 2, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationText: { fontSize: 12, color: '#3498db', fontWeight: 'bold', marginBottom: 4 },
  roomTitle: { fontSize: 20, fontWeight: 'bold' },
  roomType: { color: '#7f8c8d' },
  price: { color: '#2ecc71', fontWeight: 'bold', marginTop: 4 },
  formCard: { borderRadius: 20, backgroundColor: '#fff', elevation: 3 },
  label: { fontSize: 14, fontWeight: '600', color: '#7f8c8d', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff' },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryContainer: { marginTop: 24, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#bdc3c7' },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  divider: { marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#3498db' },
  bookBtn: { marginTop: 32, borderRadius: 12, backgroundColor: '#3498db' },
  btnContent: { paddingVertical: 8 }
});
