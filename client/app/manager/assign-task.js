import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card, Avatar, List, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function AssignTask() {
  const [staff, setStaff] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      // For this system, we can fetch users with role 'staff'
      const res = await api.get('/auth/staff'); // Ensuring we have a route for this
      setStaff(res.data || []);
    } catch (err) {
      console.log('Failed to fetch staff', err);
    }
  };

  const handleAssign = async () => {
    if (!title || !selectedStaff) {
      Alert.alert('Error', 'Please enter a title and select a staff member');
      return;
    }
    setLoading(true);
    try {
      await api.post('/tasks', { title, description, staffId: selectedStaff.id });
      Alert.alert('Success', 'Task assigned successfully');
      setTitle('');
      setDescription('');
      setSelectedStaff(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Assign New Task" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Task Title"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Select Staff Member</Text>
        {staff.map((item) => (
          <List.Item
            key={item.id}
            title={item.fullName || item.name}
            description={item.role || 'Staff'}
            onPress={() => setSelectedStaff(item)}
            style={[styles.listItem, selectedStaff?.id === item.id && styles.selectedItem]}
            left={props => (
              <Avatar.Text 
                size={40} 
                label={(item.fullName || item.name || 'S').substring(0, 1).toUpperCase()} 
                backgroundColor={selectedStaff?.id === item.id ? '#3498db' : '#ecf0f1'}
                color={selectedStaff?.id === item.id ? '#fff' : '#7f8c8d'}
              />
            )}
          />
        ))}

        <Button 
          mode="contained" 
          onPress={handleAssign} 
          style={styles.assignButton}
          loading={loading}
          disabled={loading}
        >
          Assign Task
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff' },
  header: { backgroundColor: '#fff' },
  content: { padding: 20 },
  card: { borderRadius: 16, backgroundColor: '#fff', elevation: 2, marginBottom: 24 },
  input: { marginBottom: 12, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2c3e50', marginBottom: 16 },
  listItem: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 8, paddingHorizontal: 8 },
  selectedItem: { backgroundColor: '#ebf5fb', borderWidth: 1, borderColor: '#3498db' },
  assignButton: { marginTop: 24, borderRadius: 12, paddingVertical: 8, backgroundColor: '#3498db' }
});
