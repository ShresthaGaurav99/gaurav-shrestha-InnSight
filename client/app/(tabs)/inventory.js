import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Text, Searchbar, Chip } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import api from '../../services/api';

export default function InventoryScreen() {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchInventory = async () => {
    try {
      const res = await api.get('/inventory');
      setItems(res.data);
    } catch (e) {
      console.log('Error fetching inventory', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInventory();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInventory();
    setRefreshing(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return '#4caf50';
      case 'LOW_STOCK': return '#ff9800';
      case 'OUT_OF_STOCK': return '#f44336';
      default: return '#757575';
    }
  };

  const filteredItems = items.filter(item => 
    item.item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search inventory..."
        onChangeText={setSearch}
        value={search}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Card style={[styles.card, { borderLeftColor: getStatusColor(item.status) }]}>
            <Card.Content>
              <View style={styles.row}>
                <Title>{item.item}</Title>
                <Chip style={{ backgroundColor: getStatusColor(item.status) }} textStyle={{ color: 'white' }}>
                  {item.status.replace('_', ' ')}
                </Chip>
              </View>
              <Text style={styles.label}>Stock Quantity</Text>
              <Text style={styles.quantity}>{item.quantity}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc', padding: 15 },
  searchBar: { marginBottom: 20, borderRadius: 15, backgroundColor: '#fff', elevation: 2 },
  card: { marginBottom: 15, borderRadius: 15, backgroundColor: '#fff', elevation: 3, borderLeftWidth: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, color: '#777', fontWeight: '500' },
  quantity: { fontSize: 20, fontWeight: 'bold', color: '#333' }
});
