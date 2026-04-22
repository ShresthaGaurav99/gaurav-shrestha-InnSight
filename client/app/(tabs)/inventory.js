import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Avatar } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import api from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

  useFocusEffect(useCallback(() => { fetchInventory(); }, []));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInventory();
    setRefreshing(false);
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'AVAILABLE': return { color: '#10B981', label: 'In Stock', icon: 'check-circle' };
      case 'LOW_STOCK': return { color: '#F59E0B', label: 'Low Stock', icon: 'alert-circle' };
      case 'OUT_OF_STOCK': return { color: '#EF4444', label: 'Out of Stock', icon: 'close-circle' };
      default: return { color: '#8A8A8A', label: 'Unknown', icon: 'help-circle' };
    }
  };

  const filteredItems = items.filter(item => 
    item.item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Asset Inventory</Text>
        <Text style={styles.subtitle}>{items.length} Total Items Tracked</Text>
      </View>

      <Searchbar
        placeholder="Filter items..."
        onChangeText={setSearch}
        value={search}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor="#1A1D2E"
      />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A1D2E" />}
        renderItem={({ item }) => {
          const status = getStatusInfo(item.status);
          return (
            <View style={styles.card}>
              <View style={[styles.statusIndicator, { backgroundColor: status.color }]} />
              <View style={styles.cardMain}>
                <View style={styles.cardHeader}>
                  <Text style={styles.itemName}>{item.item}</Text>
                  <View style={[styles.badge, { backgroundColor: status.color + '20' }]}>
                    <Icon name={status.icon} size={14} color={status.color} />
                    <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
                <View style={styles.cardStats}>
                   <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Current Stock</Text>
                      <Text style={styles.statValue}>{item.quantity}</Text>
                   </View>
                   <Icon name="package-variant-closed" size={24} color="#F0F0F0" />
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
             <Icon name="package-variant-remove" size={60} color="#DDD" />
             <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FF' },
  header: { paddingHorizontal: 20, paddingTop: 24, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#1A1D2E', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#8A8A8A', fontWeight: '500', marginTop: 2 },
  
  searchBar: { 
    marginHorizontal: 20, marginBottom: 20, borderRadius: 16, 
    backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10,
  },
  searchInput: { fontSize: 15, color: '#1A1D2E' },

  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 16,
    flexDirection: 'row', overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10,
  },
  statusIndicator: { width: 6 },
  cardMain: { flex: 1, padding: 18 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itemName: { fontSize: 17, fontWeight: '800', color: '#1A1D2E', flex: 1, marginRight: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, gap: 4 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  
  cardStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statItem: {},
  statLabel: { fontSize: 11, color: '#8A8A8A', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#1A1D2E' },

  emptyWrap: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#AAAAAA', marginTop: 16, fontSize: 16, fontWeight: '600' }
});
