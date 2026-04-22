import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';

export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { email } = useLocalSearchParams();
  const { verifyOTP, resendOTP } = useContext(AuthContext);
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

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await resendOTP(email);
      Alert.alert('OTP Sent', response.message);
    } catch (e) {
      Alert.alert('Resend Failed', e.response?.data?.message || 'Could not resend OTP');
    } finally {
      setResending(false);
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
          <Text style={styles.subtitle}>Email Verification</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.infoText}>We sent a 6-digit registration code to {email}</Text>

          <TextInput
            label="6-Digit OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
            mode="outlined"
            outlineColor="#e0e0e0"
            activeOutlineColor="#1A1D2E"
          />

          <Button 
            mode="contained" 
            onPress={handleVerify} 
            style={styles.button}
            contentStyle={styles.buttonContent}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </Button>

          <Button
            mode="text"
            onPress={handleResend}
            style={styles.secondaryButton}
            disabled={loading || resending}
            loading={resending}
          >
            {resending ? 'Sending...' : 'Resend OTP'}
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  header: { marginBottom: 40, alignItems: 'center' },
  appName: { fontSize: 42, fontWeight: '900', color: '#1A1D2E', letterSpacing: -1, marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#666', fontWeight: '500' },
  card: { backgroundColor: '#ffffff', width: '100%' },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1D2E', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#888', marginBottom: 24, fontWeight: '400', lineHeight: 20 },
  input: { marginBottom: 24, backgroundColor: '#fff', fontSize: 24, fontWeight: '700' },
  button: { borderRadius: 16, backgroundColor: '#1A1D2E', elevation: 0 },
  buttonContent: { paddingVertical: 12 },
  secondaryButton: { marginTop: 8 },
  backButton: { marginTop: 32, alignItems: 'center' },
  backText: { color: '#1A1D2E', fontWeight: '800', fontSize: 14 }
});
