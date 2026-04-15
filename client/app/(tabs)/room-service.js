import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, FAB, Portal, Modal, TextInput } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import api from '../../services/api';

export default function RoomServiceScreen() {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [item, setItem] = useState('');
  const [room, setRoom] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/room-service');
      setOrders(res.data);
    } catch (e) {
      console.log('Error fetching orders', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, []);

  const handleOrder = async () => {
    try {
      await api.post('/room-service', { item, roomNumber: room, price: 10 });
      setVisible(false);
      fetchOrders();
      setItem('');
      setRoom('');
    } catch (e) {
      console.log('Error creating order', e);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/room-service/${id}`, { status });
      fetchOrders();
    } catch (e) {
      console.log('Error updating status', e);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <Title>{item.item}</Title>
                <Chip style={{ backgroundColor: item.status === 'DELIVERED' ? '#4caf50' : '#ff9800' }}>{item.status}</Chip>
              </View>
              <Paragraph>Room: {item.roomNumber} | Time: {item.time}</Paragraph>
              {item.status !== 'DELIVERED' && (
                <View style={styles.actions}>
                  <Button mode="outlined" onPress={() => updateStatus(item.id, 'PREPARING')}>Prep</Button>
                  <Button mode="contained" onPress={() => updateStatus(item.id, 'DELIVERED')} style={{ marginLeft: 10 }}>Deliver</Button>
                </View>
              )}
            </Card.Content>
          </Card>
        )}
      />
      
      <FAB icon="plus" style={styles.fab} onPress={() => setVisible(true)} />

      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          <Title>New Order</Title>
          <TextInput label="Room Number" value={room} onChangeText={setRoom} mode="outlined" style={styles.input} />
          <TextInput label="Item (e.g. Tea, Coffee)" value={item} onChangeText={setItem} mode="outlined" style={styles.input} />
          <Button mode="contained" onPress={handleOrder} style={{ marginTop: 10 }}>Place Order</Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  card: { marginBottom: 10, borderRadius: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#6200ee' },
  modal: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 },
  input: { marginBottom: 10 }
});
