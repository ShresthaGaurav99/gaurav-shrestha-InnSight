import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Text, Button, Chip } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import api from '../../services/api';

export default function HousekeepingScreen() {
  const [rooms, setRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHousekeeping = async () => {
    try {
      const res = await api.get('/housekeeping');
      setRooms(res.data);
    } catch (e) {
      console.log('Error fetching housekeeping', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHousekeeping();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHousekeeping();
    setRefreshing(false);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/housekeeping/${id}`, { status });
      fetchHousekeeping();
    } catch (e) {
      console.log('Error updating housekeeping status', e);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CLEAN': return '#4caf50';
      case 'CLEANING': return '#2196f3';
      case 'DIRTY': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.header}>Housekeeping Management</Title>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <Title>Room {item.roomNumber}</Title>
                <Chip style={{ backgroundColor: getStatusColor(item.status) }} textStyle={{ color: 'white' }}>
                  {item.status}
                </Chip>
              </View>
              <Paragraph>Staff: {item.assignedTo}</Paragraph>
              <View style={styles.actions}>
                <Button mode="outlined" onPress={() => updateStatus(item.id, 'CLEANING')} style={styles.actionBtn}>
                  Start
                </Button>
                <Button mode="contained" onPress={() => updateStatus(item.id, 'CLEAN')} style={[styles.actionBtn, {backgroundColor: '#4caf50'}]}>
                  Finish
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  header: { fontSize: 24, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
  card: { marginBottom: 10, borderRadius: 10, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  actionBtn: { marginLeft: 10 }
});
