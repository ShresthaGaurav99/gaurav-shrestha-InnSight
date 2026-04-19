import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Text, Avatar, Button, IconButton } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function DashboardScreen() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalRooms: 15, bookedRooms: 5, availableRooms: 10, pendingTasks: 4 });
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/analytics');
      setStats(response.data);
    } catch (e) {
      console.log('Error fetching stats', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, []);

  const renderManagerDashboard = () => {
    const occupancyRate = stats.totalRooms > 0 
      ? Math.round((stats.bookedRooms / stats.totalRooms) * 100) 
      : 0;

    return (
      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Hotel Manager</Text>
            <Text style={styles.subWelcome}>{user?.name}</Text>
          </View>
          <Avatar.Icon size={48} icon="account-tie" backgroundColor="#2c3e50" />
        </View>

        <Text style={styles.sectionTitle}>Business Status</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statLabel}>Total Revenue</Text>
              <Text style={[styles.statValue, { color: '#2ecc71' }]}>Rs. {stats.totalRevenue?.toLocaleString()}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statLabel}>Occupancy</Text>
              <Text style={[styles.statValue, { color: '#3498db' }]}>{occupancyRate}%</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={[styles.statsGrid, { marginTop: 16 }]}>
          <Card style={[styles.statCard, { backgroundColor: stats.pendingRoomService > 0 ? '#fff3e0' : '#fff' }]}>
            <Card.Content>
              <Text style={styles.statLabel}>Room Service</Text>
              <Text style={[styles.statValue, { color: '#e67e22' }]}>{stats.pendingRoomService} Pending</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: stats.lowStockItems > 0 ? '#ffebeef' : '#fff' }]}>
            <Card.Content>
              <Text style={styles.statLabel}>Inv. Alerts</Text>
              <Text style={[styles.statValue, { color: '#e74c3c' }]}>{stats.lowStockItems} Low</Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.attendanceSummaryCard}>
           <Card.Content style={styles.attendanceContent}>
              <View>
                <Text style={styles.statLabel}>Staff Attendance</Text>
                <Text style={styles.attendanceText}>
                   <Text style={{fontWeight: 'bold', color: '#2ecc71'}}>{stats.presentStaff}</Text> of {stats.totalStaff} Present Today
                </Text>
              </View>
              <Button mode="outlined" compact onPress={() => router.push('/manager/attendance')}>View List</Button>
           </Card.Content>
        </Card>

      <Text style={styles.sectionTitle}>Staff Duties</Text>
      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/manager/manage-rooms')}>
        <View style={styles.menuIconContainer}>
          <Icon name="door-open" size={24} color="#3498db" />
        </View>
        <Text style={styles.menuText}>Update Room Inventory</Text>
        <Icon name="chevron-right" size={24} color="#bdc3c7" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/manager/manage-menu')}>
        <View style={[styles.menuIconContainer, { backgroundColor: '#fff4e5' }]}>
          <Icon name="silverware-fork-knife" size={24} color="#f39c12" />
        </View>
        <Text style={styles.menuText}>Manage Menu & Pricing</Text>
        <Icon name="chevron-right" size={24} color="#bdc3c7" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/manager/assign-task')}>
        <View style={[styles.menuIconContainer, { backgroundColor: '#eafaf1' }]}>
          <Icon name="clipboard-text" size={24} color="#2ecc71" />
        </View>
        <Text style={styles.menuText}>Assign Cleaning Duties</Text>
        <Icon name="chevron-right" size={24} color="#bdc3c7" />
      </TouchableOpacity>
    </View>
    );
  };


  const renderStaffDashboard = () => (
    <View style={styles.content}>
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.welcomeText}>Reception/Housekeeping</Text>
          <Text style={styles.subWelcome}>{user?.name}</Text>
        </View>
        <Avatar.Icon size={48} icon="badge-account-horizontal" backgroundColor="#27ae60" />
      </View>

      <Card style={[styles.statusCard, { backgroundColor: '#2ecc71' }]}>
        <Card.Content>
          <Title style={{ color: '#fff' }}>Duty Status</Title>
          <Paragraph style={{ color: '#fff', opacity: 0.9 }}>You have {stats.pendingTasks || 0} tasks pending today.</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.attendanceActionCard}>
        <Card.Content style={styles.attendanceActionContent}>
          <View>
            <Text style={styles.attendanceLabel}>Attendance</Text>
            <Text style={styles.attendanceStatus}>Status: <Text style={{color: stats.isCheckedIn ? '#2ecc71' : '#e74c3c'}}>{stats.isCheckedIn ? 'At Work' : 'Checked Out'}</Text></Text>
          </View>
          <Button 
            mode="contained" 
            buttonColor={stats.isCheckedIn ? '#e74c3c' : '#2ecc71'}
            onPress={() => alert('Check-in feature requires linked Staff ID')}
          >
            {stats.isCheckedIn ? 'Check Out' : 'Check In'}
          </Button>
        </Card.Content>
      </Card>

      <Text style={styles.sectionTitle}>Operational Tools</Text>
      <View style={styles.statsGrid}>
        <TouchableOpacity style={styles.toolBox} onPress={() => router.push('/(tabs)/tasks')}>
          <Icon name="playlist-check" size={32} color="#3498db" />
          <Text style={styles.toolLabel}>View Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBox} onPress={() => router.push('/(tabs)/rooms')}>
          <Icon name="bed" size={32} color="#e67e22" />
          <Text style={styles.toolLabel}>Room Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCustomerDashboard = () => (
    <View style={styles.content}>
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.welcomeText}>Namaste, Guest</Text>
          <Text style={styles.subWelcome}>{user?.name}</Text>
        </View>
        <Avatar.Icon size={48} icon="account-circle" backgroundColor="#3498db" />
      </View>

      <Card style={styles.heroCard}>
        <Card.Content>
          <Text style={styles.heroTop}>Best Stays in Nepal</Text>
          <Title style={styles.heroTitle}>Book Your Comfort</Title>
          <Text style={styles.heroSub}>Rooms from Rs. 4,200 and meals from Rs. 80</Text>
          <Button 
            mode="contained" 
            style={styles.heroButton}
            onPress={() => router.push('/(tabs)/rooms')}
          >
            Explore Rooms
          </Button>
        </Card.Content>
      </Card>

      <Text style={styles.sectionTitle}>Popular Destinations</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.destinationScroll}>
        <View style={styles.destDot}><Text style={styles.destText}>Kathmandu</Text></View>
        <View style={styles.destDot}><Text style={styles.destText}>Pokhara</Text></View>
        <View style={styles.destDot}><Text style={styles.destText}>Chitwan</Text></View>
        <View style={styles.destDot}><Text style={styles.destText}>Lumbini</Text></View>
      </ScrollView>

      <Text style={styles.sectionTitle}>Menu & Service</Text>
      <View style={styles.serviceRow}>
        <TouchableOpacity style={styles.serviceBox} onPress={() => router.push('/customer/menu')}>
          <View style={styles.serviceIconContainer}>
             <Icon name="food-hot-dog" size={24} color="#e74c3c" />
          </View>
          <Text style={styles.serviceText}>Nepali Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.serviceBox} onPress={() => router.push('/(tabs)/bookings')}>
          <View style={[styles.serviceIconContainer, { backgroundColor: '#eafaf1' }]}>
             <Icon name="receipt" size={24} color="#2ecc71" />
          </View>
          <Text style={styles.serviceText}>Invoices</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const role = user?.role?.toLowerCase() || 'customer';

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {role === 'manager' && renderManagerDashboard()}
      {role === 'staff' && renderStaffDashboard()}
      {role === 'customer' && renderCustomerDashboard()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff' },
  content: { padding: 24 },
  welcomeSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  welcomeText: { fontSize: 14, color: '#7f8c8d', fontWeight: '500' },
  subWelcome: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#34495e', marginTop: 20, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { width: '48%', borderRadius: 16, backgroundColor: '#fff', elevation: 2 },
  statLabel: { fontSize: 12, color: '#95a5a6' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#2ecc71', marginTop: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 16, marginBottom: 10, elevation: 1 },
  menuIconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#ebf5fb', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#2c3e50' },
  statusCard: { borderRadius: 16, padding: 8, marginTop: 10 },
  toolBox: { width: '48%', backgroundColor: '#fff', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 2 },
  toolLabel: { marginTop: 10, fontSize: 14, fontWeight: '600', color: '#34495e' },
  heroCard: { backgroundColor: '#3498db', borderRadius: 24, padding: 12, elevation: 4 },
  heroTop: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginVertical: 4 },
  heroSub: { color: '#fff', fontSize: 14, opacity: 0.9 },
  heroButton: { backgroundColor: '#fff', marginTop: 20, borderRadius: 12 },
  destinationScroll: { flexDirection: 'row', marginBottom: 10 },
  destDot: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#f0f0f0', elevation: 1 },
  destText: { color: '#34495e', fontWeight: '600' },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  serviceBox: { alignItems: 'center' },
  serviceIconContainer: { width: 56, height: 56, borderRadius: 20, backgroundColor: '#fdedec', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  serviceText: { fontSize: 12, color: '#7f8c8d', fontWeight: '600' },
  attendanceSummaryCard: { marginTop: 20, borderRadius: 16, backgroundColor: '#fff', borderLeftWidth: 4, borderLeftColor: '#2ecc71', elevation: 2 },
  attendanceContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  attendanceText: { fontSize: 15, color: '#34495e', marginTop: 4 },
  attendanceActionCard: { marginTop: 16, borderRadius: 16, backgroundColor: '#fff', elevation: 2 },
  attendanceActionContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attendanceLabel: { fontSize: 12, color: '#7f8c8d', fontWeight: 'bold', textTransform: 'uppercase' },
  attendanceStatus: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginTop: 2 }
});
