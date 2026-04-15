import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Title, Button, Card, Appbar, TextInput, Avatar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PaymentOTPScreen() {
  const { transactionId, method, totalAmount, roomNumber, mockOtp } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/payments/confirm', {
        transactionId,
        otp
      });

      Alert.alert('Payment Successful', `Your payment of Rs. ${totalAmount} via ${method} has been confirmed. Transaction ID: ${transactionId}`, [
        { text: 'Finish', onPress: () => router.replace('/(tabs)/dashboard') }
      ]);
    } catch (err) {
      Alert.alert('Verification Failed', err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Verify Payment" />
      </Appbar.Header>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
           <Avatar.Icon size={80} icon="shield-check" backgroundColor="#ebf5fb" color="#3498db" />
           <Title style={styles.title}>Payment Verification</Title>
           <Text style={styles.subtitle}>Enter the 6-digit code sent to your mobile for {method} payment.</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.amountBox}>
               <Text style={styles.amountLabel}>Paying to InnSight</Text>
               <Text style={styles.amountValue}>Rs. {totalAmount}</Text>
            </View>

            <TextInput
              label="Enter 6-digit OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              mode="outlined"
              style={styles.input}
              textAlign="center"
              placeholder="000000"
            />

            {mockOtp && (
              <View style={styles.demoBox}>
                <Text style={styles.demoText}>FYP Demo OTP: <Text style={{ fontWeight: 'bold' }}>{mockOtp}</Text></Text>
              </View>
            )}

            <Button 
              mode="contained" 
              onPress={handleVerify}
              loading={loading}
              disabled={loading || otp.length < 6}
              style={styles.verifyBtn}
            >
              Verify & Complete Payment
            </Button>

            <TouchableOpacity disabled={timer > 0} style={styles.resendBtn}>
              <Text style={{ color: timer > 0 ? '#bdc3c7' : '#3498db', fontWeight: 'bold' }}>
                {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff' },
  header: { backgroundColor: '#fff' },
  content: { padding: 24, flex: 1, justifyContent: 'center' },
  iconContainer: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  subtitle: { textAlign: 'center', color: '#7f8c8d', marginTop: 8, paddingHorizontal: 20 },
  card: { borderRadius: 24, elevation: 4, backgroundColor: '#fff' },
  amountBox: { alignItems: 'center', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', pb: 16 },
  amountLabel: { fontSize: 13, color: '#95a5a6', marginBottom: 4 },
  amountValue: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50' },
  input: { fontSize: 24, letterSpacing: 8, backgroundColor: '#fff' },
  demoBox: { backgroundColor: '#fef9e7', padding: 8, borderRadius: 8, marginTop: 16, alignItems: 'center' },
  demoText: { fontSize: 12, color: '#9a7d0a' },
  verifyBtn: { marginTop: 24, borderRadius: 12, paddingVertical: 8, backgroundColor: '#3498db' },
  resendBtn: { marginTop: 20, alignItems: 'center' }
});
