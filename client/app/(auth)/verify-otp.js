import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';

export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { email } = useLocalSearchParams();
  const { verifyOTP } = useContext(AuthContext);
  const router = useRouter();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, otp);
      Alert.alert('Success', 'Verification successful!');
    } catch (e) {
      Alert.alert('Verification Failed', e.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.appName}>InnSight</Text>
          <Text style={styles.subtitle}>Verification</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.infoText}>We sent a 6-digit code to {email}</Text>

          <TextInput
            label="6-Digit OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
            mode="outlined"
            outlineColor="#e0e0e0"
            activeOutlineColor="#3498db"
          />

          <Button 
            mode="contained" 
            onPress={handleVerify} 
            style={styles.button}
            contentStyle={styles.buttonContent}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </Button>

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>Change Email</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { marginBottom: 40, alignItems: 'center' },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#2c3e50', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#7f8c8d', marginTop: 4 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#2c3e50', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#95a5a6', marginBottom: 24 },
  input: { marginBottom: 16, backgroundColor: '#fff', textAlign: 'center', fontSize: 20, letterSpacing: 5 },
  button: { marginTop: 8, borderRadius: 12, backgroundColor: '#3498db' },
  buttonContent: { paddingVertical: 8 },
  backButton: { marginTop: 24, alignItems: 'center' },
  backText: { color: '#3498db', fontWeight: '500' }
});
