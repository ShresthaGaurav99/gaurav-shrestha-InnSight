import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { Text, Avatar, List, FAB, Portal, Modal, TextInput, Divider } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import api from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function StaffManagementScreen() {
  const [staff, setStaff] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const fetchStaff = async () => {
    try {
      const res = await api.get('/auth/staff');
      setStaff(res.data);
    } catch (e) {
      console.log('Error fetching staff', e);
    }
  };

  useFocusEffect(useCallback(() => { fetchStaff(); }, []));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStaff();
    setRefreshing(false);
  }, []);

  const handleAddStaff = async () => {
    Alert.alert('System', 'Register new staff via registration endpoint for full security sync.');
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Employee Roster</Text>
        <Text style={styles.subtitle}>{staff.length} Active Team Members</Text>
      </View>

      <FlatList
        data={staff}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A1D2E" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Avatar.Text 
                size={50} 
                label={item.name?.[0]?.toUpperCase() || 'S'} 
                backgroundColor="#1A1D2E" 
                color="#FFF" 
              />
              <View style={styles.cardInfo}>
                <Text style={styles.staffName}>{item.name}</Text>
                <Text style={styles.staffEmail}>{item.email}</Text>
                <View style={styles.roleTag}>
                   <Text style={styles.roleTagText}>{item.role?.toUpperCase() || 'STAFF'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.moreBtn}>
                 <Icon name="dots-vertical" size={20} color="#8A8A8A" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
             <Icon name="account-search-outline" size={60} color="#DDD" />
             <Text style={styles.emptyText}>No staff members found</Text>
          </View>
        }
      />

      <FAB 
        icon="account-plus" 
        style={styles.fab} 
        color="#FFF"
        onPress={() => setVisible(true)} 
      />

      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Enlist Employee</Text>
          <Text style={styles.modalSub}>Add a new member to the InnSight team</Text>
          <TextInput label="Full Name" value={name} onChangeText={setName} mode="flat" style={styles.input} activeUnderlineColor="#1A1D2E" />
          <TextInput label="Official Email" value={email} onChangeText={setEmail} mode="flat" style={styles.input} activeUnderlineColor="#1A1D2E" />
          <TouchableOpacity style={styles.submitBtn} onPress={handleAddStaff}>
             <Text style={styles.submitBtnText}>Confirm Enrollment</Text>
          </TouchableOpacity>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FF' },
  header: { paddingHorizontal: 20, paddingTop: 24, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#1A1D2E', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#8A8A8A', fontWeight: '500', marginTop: 2 },

  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, marginBottom: 12, padding: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 16 },
  staffName: { fontSize: 16, fontWeight: '800', color: '#1A1D2E' },
  staffEmail: { fontSize: 13, color: '#8A8A8A', marginTop: 1 },
  roleTag: { backgroundColor: '#ECFDF5', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
  roleTagText: { fontSize: 9, fontWeight: '900', color: '#10B981', letterSpacing: 0.5 },
  moreBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },

  fab: { position: 'absolute', margin: 24, right: 0, bottom: 0, backgroundColor: '#1A1D2E', borderRadius: 20 },
  modal: { backgroundColor: 'white', padding: 24, margin: 20, borderRadius: 32 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1A1D2E' },
  modalSub: { fontSize: 13, color: '#8A8A8A', marginBottom: 20, marginTop: 2 },
  input: { marginBottom: 16, backgroundColor: '#F9F9F9' },
  submitBtn: { backgroundColor: '#1A1D2E', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },

  emptyWrap: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#AAAAAA', marginTop: 16, fontSize: 16, fontWeight: '600' }
});
