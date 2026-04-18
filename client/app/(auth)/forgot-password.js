import React, { useContext, useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

  const { requestPasswordReset, resetPassword } = useContext(AuthContext);
  const router = useRouter();

  const normalizedEmail = email.trim().toLowerCase();

  const handleRequestOtp = async () => {
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setRequesting(true);
    try {
      const response = await requestPasswordReset(normalizedEmail);
      setOtpRequested(true);
      Alert.alert('OTP Sent', response.message);
    } catch (e) {
      Alert.alert('Request Failed', e.response?.data?.message || 'Could not send reset OTP');
    } finally {
      setRequesting(false);
    }
  };

  const handleResetPassword = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setResetting(true);
    try {
      const response = await resetPassword(normalizedEmail, otp, password);
      Alert.alert('Success', response.message, [
        {
          text: 'Go to Login',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]);
    } catch (e) {
      Alert.alert('Reset Failed', e.response?.data?.message || 'Could not reset password');
    } finally {
      setResetting(false);
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
          <Text style={styles.subtitle}>Recover Your Account</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.infoText}>
            Enter your email to receive an OTP, then set a new password.
          </Text>

          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            mode="outlined"
            outlineColor="#e0e0e0"
            activeOutlineColor="#3498db"
          />

          <Button
            mode="contained"
            onPress={handleRequestOtp}
            style={styles.button}
            contentStyle={styles.buttonContent}
            loading={requesting}
            disabled={requesting || resetting}
          >
            {requesting ? 'Sending OTP...' : otpRequested ? 'Send OTP Again' : 'Send Reset OTP'}
          </Button>

          {otpRequested && (
            <>
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

              <TextInput
                label="New Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                mode="outlined"
                outlineColor="#e0e0e0"
                activeOutlineColor="#3498db"
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword((prev) => !prev)}
                  />
                }
              />

              <TextInput
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                mode="outlined"
                outlineColor="#e0e0e0"
                activeOutlineColor="#3498db"
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                  />
                }
              />

              <Button
                mode="contained"
                onPress={handleResetPassword}
                style={styles.button}
                contentStyle={styles.buttonContent}
                loading={resetting}
                disabled={resetting || requesting}
              >
                {resetting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </>
          )}

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.backButton}>
            <Text style={styles.backText}>Back to Login</Text>
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#2c3e50', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#95a5a6', marginBottom: 24 },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  button: { marginTop: 8, borderRadius: 12, backgroundColor: '#3498db' },
  buttonContent: { paddingVertical: 8 },
  backButton: { marginTop: 24, alignItems: 'center' },
  backText: { color: '#3498db', fontWeight: '500' },
});
