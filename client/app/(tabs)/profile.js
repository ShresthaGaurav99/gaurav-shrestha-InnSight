import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Title, Paragraph, List, Button, Divider, Text } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={80} label={user?.name?.[0]?.toUpperCase() || 'U'} style={styles.avatar} />
        <Title style={styles.name}>{user?.name}</Title>
        <Paragraph style={styles.role}>{user?.role}</Paragraph>
      </View>

      <View style={styles.content}>
        <List.Section>
          <List.Subheader>Account Settings</List.Subheader>
          <List.Item
            title="Email"
            description={user?.email}
            left={props => <List.Icon {...props} icon="email" />}
          />
          <List.Item
            title="Password"
            description="********"
            left={props => <List.Icon {...props} icon="lock" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Preferences</List.Subheader>
          <List.Item
            title="Notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Dark Mode"
            left={props => <List.Icon {...props} icon="brightness-4" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>

        <Button mode="outlined" onPress={logout} style={styles.logoutBtn} color="#f44336">
          Logout
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#6200ee' },
  avatar: { backgroundColor: '#fff', elevation: 5 },
  name: { color: '#fff', marginTop: 10, fontSize: 24 },
  role: { color: '#e1e1e1', fontStyle: 'italic' },
  content: { padding: 20 },
  logoutBtn: { marginTop: 30, borderColor: '#f44336' }
});
