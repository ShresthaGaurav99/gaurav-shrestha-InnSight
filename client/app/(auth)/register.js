import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('staff');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
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

    setLoading(true);
    try {
      await register(name, email, password, role);
      Alert.alert('Success', 'Registration successful! Enter the OTP sent to your email.');
    } catch (e) {
      Alert.alert('Registration Failed', e.response?.data?.message || 'Error occurred');
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
          <Text style={styles.subtitle}>Join Our Community</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.infoText}>Sign up to get started</Text>

          <Text style={styles.label}>Select Role:</Text>
          <SegmentedButtons
            value={role}
            onValueChange={setRole}
            buttons={[
              { value: 'manager', label: 'Hotel Manager' },
              { value: 'staff', label: 'Reception/Housekeeping' },
              { value: 'customer', label: 'Guest' },
            ]}
            style={styles.segmented}
          />

          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            outlineColor="#e0e0e0"
            activeOutlineColor="#1A1D2E"
          />

          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            mode="outlined"
            outlineColor="#e0e0e0"
            activeOutlineColor="#1A1D2E"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            mode="outlined"
            outlineColor="#e0e0e0"
            activeOutlineColor="#1A1D2E"
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword((prev) => !prev)}
              />
            }
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            mode="outlined"
            outlineColor="#e0e0e0"
            activeOutlineColor="#1A1D2E"
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword((prev) => !prev)}
              />
            }
          />

          <Button 
            mode="contained" 
            onPress={handleRegister} 
            style={styles.button}
            contentStyle={styles.buttonContent}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Register'}
          </Button>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.link}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  header: { marginBottom: 32, alignItems: 'center' },
  appName: { fontSize: 42, fontWeight: '900', color: '#1A1D2E', letterSpacing: -1, marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#666', fontWeight: '500' },
  card: { backgroundColor: '#ffffff', width: '100%' },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1D2E', marginBottom: 6 },
  infoText: { fontSize: 14, color: '#888', marginBottom: 16, fontWeight: '400' },
  label: { marginBottom: 8, fontSize: 13, color: '#666', fontWeight: '700', textTransform: 'uppercase' },
  segmented: { marginBottom: 20 },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  button: { marginTop: 12, borderRadius: 16, backgroundColor: '#1A1D2E', elevation: 0 },
  buttonContent: { paddingVertical: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#888', fontSize: 15 },
  link: { color: '#1A1D2E', fontWeight: '800', fontSize: 15 }
});
