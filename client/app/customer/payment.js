import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Title, Button, Card, Appbar, List, Avatar, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PaymentScreen() {
  const { roomId, roomNumber, totalAmount, checkIn, checkOut, phone } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('eSewa');
  const router = useRouter();

  const handleProceed = async () => {
    setLoading(true);
    try {
      // 1. Create booking first (to have a booking ID)
      const bookingRes = await api.post('/bookings', {
        guestName: 'InnSight Guest', 
        guestEmail: 'guest@innsight.com',
        phone,
        checkIn,
        checkOut,
        roomId
      });
      
      const bookingId = bookingRes.data.booking.id;

      // 2. Initiate Payment API
      const payRes = await api.post('/payments/initiate', {
        bookingId,
        amount: totalAmount,
        method: selectedMethod
      });

      // 3. Redirect to OTP Screen
      router.push({
        pathname: '/customer/payment-otp',
        params: {
          transactionId: payRes.data.transactionId,
          method: selectedMethod,
          totalAmount,
          roomNumber,
          mockOtp: payRes.data.mockOtp
        }
      });

    } catch (err) {
      console.error(err);
      Alert.alert('Payment Error', 'Unable to process payment request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Payment Method" />
      </Appbar.Header>

      <View style={styles.content}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryLabel}>Final Payable Amount</Text>
            <Text style={styles.amountText}>Rs. {totalAmount}</Text>
            <View style={styles.divider} />
            <Text style={styles.detailText}>Room {roomNumber} • Kathmandu, Nepal</Text>
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Choose Service Provider</Text>
        
        <TouchableOpacity 
          style={[styles.methodItem, selectedMethod === 'eSewa' && styles.selectedMethod]}
          onPress={() => setSelectedMethod('eSewa')}
        >
          <View style={[styles.methodIconBox, { backgroundColor: '#60bb46' }]}>
             <Icon name="palette-swatch-variant" size={24} color="#fff" />
          </View>
          <Text style={styles.methodTitle}>eSewa</Text>
          <Text style={styles.methodSub}>Digital Wallet</Text>
          {selectedMethod === 'eSewa' && <Icon name="check-circle" size={24} color="#60bb46" />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.methodItem, selectedMethod === 'Khalti' && styles.selectedMethod]}
          onPress={() => setSelectedMethod('Khalti')}
        >
          <View style={[styles.methodIconBox, { backgroundColor: '#5c2d91' }]}>
             <Icon name="wallet-giftcard" size={24} color="#fff" />
          </View>
          <Text style={styles.methodTitle}>Khalti</Text>
          <Text style={styles.methodSub}>Pay with Khalti</Text>
          {selectedMethod === 'Khalti' && <Icon name="check-circle" size={24} color="#5c2d91" />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.methodItem, selectedMethod === 'Cash' && styles.selectedMethod]}
          onPress={() => setSelectedMethod('Cash')}
        >
          <View style={[styles.methodIconBox, { backgroundColor: '#f39c12' }]}>
             <Icon name="cash-register" size={24} color="#fff" />
          </View>
          <Text style={styles.methodTitle}>Cash</Text>
          <Text style={styles.methodSub}>Pay at Front Desk</Text>
          {selectedMethod === 'Cash' && <Icon name="check-circle" size={24} color="#f39c12" />}
        </TouchableOpacity>

        <Button 
          mode="contained" 
          onPress={handleProceed}
          loading={loading}
          disabled={loading}
          style={styles.proceedBtn}
          contentStyle={styles.btnContent}
        >
          Proceed to Pay Rs. {totalAmount}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff' },
  header: { backgroundColor: '#fff' },
  content: { padding: 24 },
  summaryCard: { backgroundColor: '#2c3e50', borderRadius: 24, padding: 8, marginBottom: 32 },
  summaryLabel: { color: '#bdc3c7', fontSize: 13 },
  amountText: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 6 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 },
  detailText: { color: '#bdc3c7', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2c3e50', marginBottom: 20 },
  methodItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  selectedMethod: { borderColor: '#3498db', backgroundColor: '#f0faff' },
  methodIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  methodTitle: { marginLeft: 16, fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  methodSub: { flex: 1, marginLeft: 8, fontSize: 12, color: '#95a5a6' },
  proceedBtn: { marginTop: 32, borderRadius: 12, backgroundColor: '#3498db' },
  btnContent: { paddingVertical: 10 }
});
