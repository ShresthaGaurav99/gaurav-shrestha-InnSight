import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Text, FAB, Chip } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import api from '../../services/api';

export default function BillingScreen() {
  const [invoices, setInvoices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/billing');
      setInvoices(res.data);
    } catch (e) {
      console.log('Error fetching invoices', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInvoices();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInvoices();
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <Title style={styles.header}>Revenue & Billing</Title>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <Title>{item.guestName}</Title>
                <Chip style={{ backgroundColor: item.status === 'PAID' ? '#4caf50' : '#ff9800' }} textStyle={{ color: 'white' }}>
                  {item.status}
                </Chip>
              </View>
              <View style={styles.row}>
                <Paragraph style={styles.amount}>Rs. {item.amount}</Paragraph>
                <Text style={styles.date}>{item.date}</Text>
              </View>
            </Card.Content>
          </Card>
        )}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => console.log('Create Invoice')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  header: { fontSize: 24, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
  card: { marginBottom: 10, borderRadius: 10, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#6200ee' },
  date: { color: '#757575' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#6200ee' }
});
