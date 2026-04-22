import React, { useContext } from 'react';
import { Tabs } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, Platform, StyleSheet, Text } from 'react-native';

function TabIcon({ name, label, color, focused }) {
  return (
    <View style={tabStyles.iconWrap}>
      <Icon name={name} size={24} color={color} />
      {focused && <View style={tabStyles.activeIndicator} />}
    </View>
  );
}

export default function TabsLayout() {
  const { logout, user } = useContext(AuthContext);
  const userRole = user?.role?.toLowerCase() || 'customer';

  const isTabVisible = (tabName) => {
    // Keep it minimal: Home, Explore, Bookings, Profile
    return ['dashboard', 'rooms', 'bookings', 'profile'].includes(tabName);
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1A1D2E',
        tabBarInactiveTintColor: '#AAAAAA',
        tabBarShowLabel: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: -2,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 10,
          elevation: 0,
          shadowColor: '#1A1D2E',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
        headerStyle: {
          backgroundColor: '#F4F6FF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 17,
          color: '#1A1D2E',
          letterSpacing: -0.3,
        },
        headerRight: () => (
          <View style={{ marginRight: 16 }}>
            <IconButton
              icon="logout-variant"
              size={22}
              iconColor="#E74C3C"
              onPress={logout}
              style={{ margin: 0 }}
            />
          </View>
        ),
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          href: isTabVisible('dashboard') ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} label="Home" color={color} focused={focused} />
          ),
        }}
      />

      {/* EXPLORE / ROOMS */}
      <Tabs.Screen
        name="rooms"
        options={{
          title: 'Explore',
          href: isTabVisible('rooms') ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'compass' : 'compass-outline'} label="Explore" color={color} focused={focused} />
          ),
        }}
      />

      {/* BOOKINGS */}
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          href: isTabVisible('bookings') ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'calendar-check' : 'calendar-check-outline'} label="Bookings" color={color} focused={focused} />
          ),
        }}
      />

      {/* INVENTORY (manager) */}
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          href: isTabVisible('inventory') ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'package-variant-closed' : 'package-variant'} label="Inventory" color={color} focused={focused} />
          ),
        }}
      />

      {/* BILLING (manager) */}
      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
          href: isTabVisible('billing') ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'cash-register' : 'cash-register'} label="Billing" color={color} focused={focused} />
          ),
        }}
      />

      {/* STAFF (manager) */}
      <Tabs.Screen
        name="staff-list"
        options={{
          title: 'Staff',
          href: isTabVisible('staff-list') ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'account-group' : 'account-group-outline'} label="Staff" color={color} focused={focused} />
          ),
        }}
      />

      {/* TASKS (staff) */}
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          href: isTabVisible('tasks') ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'clipboard-list' : 'clipboard-list-outline'} label="Tasks" color={color} focused={focused} />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          href: isTabVisible('profile') ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'account-circle' : 'account-circle-outline'} label="Profile" color={color} focused={focused} />
          ),
        }}
      />

      {/* ── Fully Hidden ── */}
      <Tabs.Screen name="housekeeping" options={{ href: null }} />
      <Tabs.Screen name="room-service" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  activeIndicator: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#1A1D2E', marginTop: 4,
  },
});
