import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Modal, Portal, Text, TextInput, Title } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function ManageMenuScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    spiceLevel: 'Mild',
  });

  const loadMenu = async () => {
    try {
      const response = await api.get('/menu');
      setCategories(response.data.categories || []);
      setItems(response.data.items || []);
      setForm((current) => ({
        ...current,
        categoryId: current.categoryId || response.data.categories?.[0]?.id || '',
      }));
    } catch (error) {
      console.log('Failed to load menu', error);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const submit = async () => {
    if (!form.name || !form.price) {
      Alert.alert('Required', 'Name and price are required.');
      return;
    }

    try {
      await api.post('/menu', {
        categoryId: form.categoryId,
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        imageUrl: form.imageUrl,
        spiceLevel: form.spiceLevel,
      });
      setVisible(false);
      setForm({
        categoryId: categories[0]?.id || '',
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        spiceLevel: 'Mild',
      });
      loadMenu();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not save menu item.');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Manage Hotel Menu" subtitle="Menu categories and fair pricing" />
      </Appbar.Header>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <Title style={styles.title}>{item.name}</Title>
                <Text style={styles.price}>Rs. {item.price}</Text>
              </View>
              <Text style={styles.meta}>
                {item.category_name || 'Uncategorized'} • {item.is_veg ? 'Veg' : 'Non-Veg'} • {item.spice_level}
              </Text>
              <Text style={styles.description}>{item.description}</Text>
            </Card.Content>
          </Card>
        )}
        ListHeaderComponent={
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title>Current Categories</Title>
              <Text>{categories.map((category) => category.name).join(' • ')}</Text>
            </Card.Content>
          </Card>
        }
      />

      <Button mode="contained" style={styles.floatingButton} onPress={() => setVisible(true)}>
        Add Menu Item
      </Button>

      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          <Title style={{ marginBottom: 14 }}>Add Menu Item</Title>
          <TextInput label="Name" mode="outlined" value={form.name} onChangeText={(value) => setForm({ ...form, name: value })} style={styles.input} />
          <TextInput label="Description" mode="outlined" value={form.description} onChangeText={(value) => setForm({ ...form, description: value })} style={styles.input} />
          <TextInput label="Price" mode="outlined" keyboardType="numeric" value={form.price} onChangeText={(value) => setForm({ ...form, price: value })} style={styles.input} />
          <TextInput label="Category ID" mode="outlined" value={form.categoryId} onChangeText={(value) => setForm({ ...form, categoryId: value })} style={styles.input} />
          <TextInput label="Spice Level" mode="outlined" value={form.spiceLevel} onChangeText={(value) => setForm({ ...form, spiceLevel: value })} style={styles.input} />
          <TextInput label="Image URL" mode="outlined" value={form.imageUrl} onChangeText={(value) => setForm({ ...form, imageUrl: value })} style={styles.input} />
          <Button mode="contained" onPress={submit} style={styles.submitBtn}>Save Menu Item</Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  header: { backgroundColor: '#fff' },
  list: { padding: 16, paddingBottom: 100 },
  summaryCard: { marginBottom: 16, borderRadius: 18, backgroundColor: '#fff4e5' },
  card: { marginBottom: 12, borderRadius: 16, backgroundColor: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { flex: 1, marginRight: 12 },
  price: { fontSize: 18, fontWeight: '700', color: '#0984E3' },
  meta: { marginTop: 6, color: '#636E72' },
  description: { marginTop: 8, color: '#2D3436' },
  floatingButton: { position: 'absolute', right: 20, bottom: 20, borderRadius: 14, backgroundColor: '#0984E3' },
  modal: { backgroundColor: '#fff', padding: 20, margin: 20, borderRadius: 20 },
  input: { marginBottom: 12 },
  submitBtn: { marginTop: 4, borderRadius: 12, backgroundColor: '#0984E3' },
});
