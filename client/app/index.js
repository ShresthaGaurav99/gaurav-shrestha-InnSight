import { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { AuthContext } from '../context/AuthContext';

export default function Index() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === 'admin' || user.role === 'manager') {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  if (user.role === 'staff') {
    return <Redirect href="/(tabs)/tasks" />;
  }

  return <Redirect href="/(tabs)/customer" />;
}
