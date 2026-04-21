import React, { useState, useContext } from 'react';
import {
  View, StyleSheet, Alert, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, Image,
} from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      if (e.response?.status === 403 && e.response?.data?.email) {
        router.push({ pathname: '/(auth)/verify-otp', params: { email: e.response.data.email } });
      }
      Alert.alert('Login Failed', e.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Logo / Brand */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBox}>
            <Icon name="home-city" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>InnSight</Text>
        </View>

        {/* Hero Text */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Welcome Back!</Text>
          <Text style={styles.heroSubtitle}>Login to access your account and continue your journey</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="kathrynmurphy@gmail.com"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            mode="outlined"
            outlineColor="#EBEBEB"
            activeOutlineColor="#1A1D2E"
            outlineStyle={{ borderRadius: 14 }}
            left={<TextInput.Icon icon="email-outline" color="#A0A0A0" />}
          />

          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="••••••••"
            style={styles.input}
            mode="outlined"
            outlineColor="#EBEBEB"
            activeOutlineColor="#1A1D2E"
            outlineStyle={{ borderRadius: 14 }}
            left={<TextInput.Icon icon="lock-outline" color="#A0A0A0" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                color="#A0A0A0"
                onPress={() => setShowPassword(p => !p)}
              />
            }
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <Text style={styles.loginBtnText}>Signing In...</Text>
              : <Text style={styles.loginBtnText}>Login</Text>}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flexGrow: 1, padding: 28, paddingTop: Platform.OS === 'ios' ? 60 : 40 },

  brandContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: '#1A1D2E',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  brandName: { fontSize: 26, fontWeight: '800', color: '#1A1D2E', letterSpacing: -0.5 },

  heroSection: { marginBottom: 36 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: '#1A1D2E', letterSpacing: -0.5, marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: '#8A8A8A', lineHeight: 22, fontWeight: '400' },

  form: { flex: 1 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#1A1D2E', marginBottom: 8, marginLeft: 2 },
  input: { marginBottom: 20, backgroundColor: '#FFFFFF', fontSize: 14 },

  forgotContainer: { alignSelf: 'flex-end', marginBottom: 28, marginTop: -8 },
  forgotText: { fontSize: 13, color: '#8A8A8A', fontWeight: '600' },

  loginBtn: {
    backgroundColor: '#1A1D2E', borderRadius: 16, height: 56,
    justifyContent: 'center', alignItems: 'center', elevation: 0,
  },
  loginBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 28 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EBEBEB' },
  dividerText: { marginHorizontal: 16, color: '#AAAAAA', fontSize: 13, fontWeight: '600' },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  registerPrompt: { color: '#8A8A8A', fontSize: 14 },
  registerLink: { color: '#1A1D2E', fontSize: 14, fontWeight: '800' },
});
