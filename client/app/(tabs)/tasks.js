import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Card, Text, Title, Chip, Button, Avatar, ActivityIndicator } from 'react-native-paper';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TasksScreen() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const endpoint = user?.role?.toLowerCase() === 'manager' ? '/tasks' : `/tasks/staff/${user?.userId || user?.id}`;
      const res = await api.get(endpoint);
      setTasks(res.data || []);
    } catch (err) {
      console.log('Error fetching tasks', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#2ecc71';
      case 'in-progress': return '#f1c40f';
      default: return '#7f8c8d';
    }
  };

  const renderTask = ({ item }) => (
    <Card style={styles.taskCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.taskTitle}>{item.title}</Title>
          <Chip 
            textStyle={{ color: '#fff', fontSize: 10 }}
            style={{ backgroundColor: getStatusColor(item.status), height: 24 }}
          >
            {item.status}
          </Chip>
        </View>
        <Text style={styles.taskDesc}>{item.description || 'No description provided.'}</Text>
        
        {item.status !== 'COMPLETED' && user.role.toLowerCase() === 'staff' && (
          <View style={styles.actions}>
            {item.status === 'PENDING' && (
              <Button 
                mode="outlined" 
                onPress={() => handleUpdateStatus(item.id, 'IN-PROGRESS')}
                style={styles.actionBtn}
              >
                Start
              </Button>
            )}
            <Button 
              mode="contained" 
              onPress={() => handleUpdateStatus(item.id, 'COMPLETED')}
              style={[styles.actionBtn, { backgroundColor: '#2ecc71' }]}
            >
              Complete
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Board</Text>
        <Text style={styles.headerSubtitle}>Manage hotel operations</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#3498db" />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTask}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTasks(); }} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="clipboard-check-outline" size={64} color="#bdc3c7" />
              <Text style={styles.emptyText}>No tasks assigned yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff' },
  header: { padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  headerSubtitle: { fontSize: 14, color: '#7f8c8d' },
  list: { padding: 16 },
  taskCard: { marginBottom: 16, borderRadius: 16, backgroundColor: '#fff', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  taskTitle: { fontSize: 18, fontWeight: '700', color: '#2c3e50', flex: 1, marginRight: 8 },
  taskDesc: { fontSize: 14, color: '#7f8c8d', marginVertical: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  actionBtn: { marginLeft: 8, borderRadius: 8 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, color: '#95a5a6' }
});
