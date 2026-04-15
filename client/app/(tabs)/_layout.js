import React, { useContext } from 'react';
import { Tabs } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View } from 'react-native';

export default function TabsLayout() {
  const { logout, user } = useContext(AuthContext);
  const userRole = user?.role?.toLowerCase() || 'customer';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
        headerRight: () => (
          <View style={{ flexDirection: 'row' }}>
            <IconButton icon="logout" size={24} onPress={logout} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: userRole === 'customer' ? 'Explore Rooms' : 'Room Status',
          tabBarIcon: ({ color, size }) => (
            <Icon name="bed" size={size} color={color} />
          ),
        }}
      />
      
      {/* Hotel Manager Only Tabs */}
      {userRole === 'manager' && (
        <>
          <Tabs.Screen
            name="staff-list"
            options={{
              title: 'Employees',
              tabBarIcon: ({ color, size }) => (
                <Icon name="account-group" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="inventory"
            options={{
              title: 'Hotel Stock',
              tabBarIcon: ({ color, size }) => (
                <Icon name="package-variant" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="billing"
            options={{
              title: 'Accounts',
              tabBarIcon: ({ color, size }) => (
                <Icon name="cash-register" size={size} color={color} />
              ),
            }}
          />
        </>
      )}

      {/* Staff & Manager Tabs */}
      {(userRole === 'staff' || userRole === 'manager') && (
        <>
          <Tabs.Screen
            name="tasks"
            options={{
              title: 'Duties',
              tabBarIcon: ({ color, size }) => (
                <Icon name="clipboard-check" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="housekeeping"
            options={{
              title: 'Cleaning',
              tabBarIcon: ({ color, size }) => (
                <Icon name="broom" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="room-service"
            options={{
              title: 'F&B Service',
              tabBarIcon: ({ color, size }) => (
                <Icon name="room-service" size={size} color={color} />
              ),
            }}
          />
        </>
      )}

      <Tabs.Screen
        name="bookings"
        options={{
          title: userRole === 'customer' ? 'My Stay' : 'Guest List',
          tabBarIcon: ({ color, size }) => (
            <Icon name="book" size={size} color={color} />
          ),
          href: userRole === 'customer' ? '/customer/book' : '/(tabs)/bookings'
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          href: null,
        }}
      />
    </Tabs>
  );
}
