import React, { useContext, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Avatar, Text, List, Divider, Portal, Modal, TextInput, Button } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../../services/api';

export default function ProfileScreen() {
  const { user, login, logout } = useContext(AuthContext); // Note: we assume login or set user context function can update context. If not, just force refresh.
  const [editVisible, setEditVisible] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!newName.trim()) return Alert.alert('Error', 'Name cannot be empty.');
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', { name: newName });
      Alert.alert('Success', 'Profile updated successfully!');
      // Update local storage/context ideally, we will just reflect it in state for demo
      // In a real app we'd update AuthContext.
      user.name = newName; 
      setEditVisible(false);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Portal>
        <Modal visible={editVisible} onDismiss={() => setEditVisible(false)} contentContainerStyle={styles.modalBg}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TextInput
            label="Full Name"
            value={newName}
            onChangeText={setNewName}
            mode="outlined"
            style={{ marginBottom: 20 }}
            outlineColor="#E0E0E0"
            activeOutlineColor="#1A1D2E"
          />
          <Button mode="contained" onPress={handleUpdateProfile} loading={loading} style={{ backgroundColor: '#1A1D2E', borderRadius: 8 }}>
            Save Changes
          </Button>
        </Modal>
      </Portal>

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarWrap}>
            <Avatar.Text size={90} label={user?.name?.[0]?.toUpperCase() || 'U'} style={styles.avatar} color="#1A1D2E" />
            <TouchableOpacity 
              style={styles.editBadge}
              onPress={() => setEditVisible(true)}
            >
              <Icon name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <View style={styles.roleBadge}>
             <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'STAFF'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.card}>
          <List.Item
            title="Email Address"
            description={user?.email}
            left={props => <Icon name="email-outline" size={24} color="#1A1D2E" style={styles.listIcon} />}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Employee ID"
            description={user?.id?.slice(0, 8).toUpperCase() || 'EMP-001'}
            left={props => <Icon name="badge-account-outline" size={24} color="#1A1D2E" style={styles.listIcon} />}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        <View style={styles.card}>
          <List.Item
            title="Notifications"
            left={props => <Icon name="bell-outline" size={24} color="#1A1D2E" style={styles.listIcon} />}
            right={props => <Icon name="chevron-right" size={20} color="#CCC" style={{ alignSelf: 'center' }} />}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Privacy & Security"
            left={props => <Icon name="shield-check-outline" size={24} color="#1A1D2E" style={styles.listIcon} />}
            right={props => <Icon name="chevron-right" size={20} color="#CCC" style={{ alignSelf: 'center' }} />}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
         <Icon name="logout" size={20} color="#FF3B30" />
         <Text style={styles.logoutText}>Sign Out from InnSight</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
         <Text style={styles.versionText}>InnSight v2.4.0 (Supervisor Edition)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FF' },
  header: { 
    backgroundColor: '#1A1D2E', 
    paddingTop: 60, 
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: { alignItems: 'center' },
  avatarWrap: { position: 'relative' },
  avatar: { backgroundColor: '#FFFFFF', elevation: 12 },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#4F46E5', width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#1A1D2E',
  },
  name: { color: '#FFFFFF', marginTop: 20, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 10 },
  roleText: { color: '#FFF', fontWeight: '800', fontSize: 11, letterSpacing: 1 },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  listIcon: { marginLeft: 16, marginRight: 8, alignSelf: 'center' },
  divider: { marginHorizontal: 16, backgroundColor: '#F0F0F0' },

  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 30, paddingVertical: 16,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#FFE5E5',
  },
  logoutText: { color: '#FF3B30', fontWeight: '800', fontSize: 15, marginLeft: 10 },
  
  footer: { alignItems: 'center', paddingVertical: 30 },
  versionText: { fontSize: 12, color: '#AAAAAA', fontWeight: '500' },
  
  modalBg: { backgroundColor: '#FFFFFF', padding: 24, margin: 20, borderRadius: 16, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1A1D2E', marginBottom: 16 }
});
