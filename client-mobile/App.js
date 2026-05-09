import { StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  // We use your computer's local IP address so the phone can reach the Vite dev server
  const VITE_FRONTEND_URL = 'http://192.168.1.75:5173';

  return (
    <SafeAreaView style={styles.container}>
      <WebView 
        source={{ uri: VITE_FRONTEND_URL }} 
        style={styles.webview}
        bounces={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    // Add margin top for Android to avoid notch overlapping if SafeAreaView isn't enough
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
});
