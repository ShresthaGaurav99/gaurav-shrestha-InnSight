import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, FAB, Portal, Modal, TextInput, List, Avatar } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import api from '../../services/api';

export default function StaffManagementScreen() {
  const [staff, setStaff] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STAFF');

  const fetchStaff = async () => {
    try {
      const res = await api.get('/auth/staff');
      setStaff(res.data);
    } catch (e) {
      console.log('Error fetching staff', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStaff();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStaff();
    setRefreshing(false);
  }, []);

  const handleAddStaff = async () => {
    // In this mock, we just alert success after a fake call
    Alert.alert('Success', 'Staff member added (Mock)');
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={staff}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <List.Item
              title={item.fullName}
              description={item.email}
              left={props => <Avatar.Text {...props} size={45} label={item.fullName[0].toUpperCase()} />}
              right={props => <IconButton {...props} icon="dots-vertical" onPress={() => {}} />}
            />
          </Card>
        )}
      />

      <FAB icon="plus" style={styles.fab} onPress={() => setVisible(true)} />

      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          <Title>Add New Employee</Title>
          <TextInput label="Full Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
          <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" style={styles.input} />
          <Button mode="contained" onPress={handleAddStaff}>Add Staff</Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  card: { marginBottom: 10, borderRadius: 10 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#6200ee' },
  modal: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 },
  input: { marginBottom: 10 }
});

import { IconButton } from 'react-native-paper';
