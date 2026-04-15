import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, List, Avatar, Badge, IconButton } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import api from '../../services/api';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.log('Error fetching notifications', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (e) {
      console.log('Error marking as read', e);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={item.message}
            onPress={() => markAsRead(item.id)}
            titleStyle={{ fontWeight: item.unread ? 'bold' : 'normal' }}
            left={props => (
              <View style={styles.avatarContainer}>
                <Avatar.Icon {...props} icon="bell" backgroundColor={item.unread ? '#6200ee' : '#e1e1e1'} />
                {item.unread && <Badge style={styles.badge} size={10} />}
              </View>
            )}
            right={props => <Text {...props} style={styles.time}>{item.time}</Text>}
            style={[styles.item, { backgroundColor: item.unread ? '#f9f5ff' : '#fff' }]}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  avatarContainer: { position: 'relative' },
  badge: { position: 'absolute', top: 0, right: 0 },
  time: { fontSize: 12, color: '#9e9e9e', alignSelf: 'center' },
  item: { borderBottomWidth: 1, borderBottomColor: '#f1f1f1' }
});
