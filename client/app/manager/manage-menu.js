import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Appbar, Button, Card, Modal, Portal, Text, TextInput, Title, ActivityIndicator, IconButton, Chip, Menu, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ManageMenuScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [catMenuVisible, setCatMenuVisible] = useState(false);
  const [form, setForm] = useState({
    categoryId: '',
    categoryName: 'Select Category',
    name: '',
    description: '',
    price: '',
    isVeg: true,
    spiceLevel: 'Mild',
  });

  const loadMenu = async () => {
    try {
      const response = await api.get('/menu');
      setCategories(response.data.categories || []);
      setItems(response.data.items || []);
    } catch (error) {
      console.log('Failed to load menu', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleDelete = async (id) => {
    Alert.alert('Delete Item', 'Are you sure you want to remove this item from the menu?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            try {
                await api.delete(`/menu/${id}`);
                loadMenu();
            } catch (e) {
                Alert.alert('Error', 'Could not delete item');
            }
        }}
    ]);
  };

  const submit = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      Alert.alert('Required', 'Name, price, and category are required.');
      return;
    }

    try {
      await api.post('/menu', {
        categoryId: form.categoryId,
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        isVeg: form.isVeg,
        spiceLevel: form.spiceLevel,
      });
      setVisible(false);
      setForm({
        categoryId: '',
        categoryName: 'Select Category',
        name: '',
        description: '',
        price: '',
        isVeg: true,
        spiceLevel: 'Mild',
      });
      loadMenu();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not save menu item.');
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.itemMain}>
          <View style={styles.titleRow}>
             <Icon name={item.is_veg ? "leaf" : "food-variant"} color={item.is_veg ? "#2ecc71" : "#e67e22"} size={18} style={{marginRight: 6}} />
             <Title style={styles.itemTitle}>{item.name}</Title>
          </View>
          <Text style={styles.categoryLabel}>{item.category_name}</Text>
          <Text numberOfLines={2} style={styles.description}>{item.description}</Text>
          <View style={styles.chipRow}>
             <Chip compact textStyle={{fontSize: 10}} style={styles.spiceChip}>{item.spice_level}</Chip>
             {item.is_veg && <Chip compact textStyle={{fontSize: 10}} style={styles.vegChip}>Veg</Chip>}
          </View>
        </View>
        <View style={styles.itemActions}>
           <Text style={styles.priceText}>Rs. {item.price}</Text>
           <IconButton icon="pencil-outline" size={20} onPress={() => {}} />
           <IconButton icon="delete-outline" iconColor="#e74c3c" size={20} onPress={() => handleDelete(item.id)} />
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header elevated mode="center-aligned" style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Menu Management" titleStyle={{fontWeight: 'bold'}} />
      </Appbar.Header>

      {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#3498db" /></View>
      ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
            ListHeaderComponent={
                <View style={styles.listHeader}>
                    <Text style={styles.totalText}>Total Items: {items.length}</Text>
                </View>
            }
          />
      )}

      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          <ScrollView>
              <Title style={{ marginBottom: 20 }}>Add New Item</Title>
              
              <View style={styles.catPicker}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <Menu
                    visible={catMenuVisible}
                    onDismiss={() => setCatMenuVisible(false)}
                    anchor={
                        <Button mode="outlined" onPress={() => setCatMenuVisible(true)} icon="chevron-down" contentStyle={{flexDirection: 'row-reverse'}}>
                            {form.categoryName}
                        </Button>
                    }
                  >
                    {categories.map((c) => (
                        <Menu.Item key={c.id} onPress={() => { setForm({...form, categoryId: c.id, categoryName: c.name}); setCatMenuVisible(false); }} title={c.name} />
                    ))}
                  </Menu>
              </View>

              <TextInput label="Item Name" mode="outlined" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} style={styles.input} />
              <TextInput label="Description" mode="outlined" multiline numberOfLines={3} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} style={styles.input} />
              <TextInput label="Price (Rs.)" mode="outlined" keyboardType="numeric" value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} style={styles.input} />
              
              <Text style={[styles.inputLabel, {marginTop: 10}]}>Food Preferences</Text>
              <View style={styles.formRow}>
                  <Chip selected={form.isVeg} onPress={() => setForm({...form, isVeg: true})} style={styles.formChip}>Veg</Chip>
                  <Chip selected={!form.isVeg} onPress={() => setForm({...form, isVeg: false})} style={styles.formChip}>Non-Veg</Chip>
              </View>

              <Text style={[styles.inputLabel, {marginTop: 10}]}>Spice Level</Text>
              <View style={styles.formRow}>
                  {['Mild', 'Medium', 'Hot'].map((lvl) => (
                      <Chip key={lvl} selected={form.spiceLevel === lvl} onPress={() => setForm({...form, spiceLevel: lvl})} style={styles.formChip}>{lvl}</Chip>
                  ))}
              </View>

              <Button mode="contained" onPress={submit} style={styles.submitBtn}>Add to Menu</Button>
              <Button mode="text" onPress={() => setVisible(false)} style={{marginTop: 8}}>Cancel</Button>
          </ScrollView>
        </Modal>
      </Portal>

      <Button mode="contained" icon="plus" style={styles.floatingButton} onPress={() => setVisible(true)} contentStyle={styles.floatingContent}>
        Add Item
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafd' },
  header: { backgroundColor: '#fff' },
  list: { padding: 16, paddingBottom: 100 },
  listHeader: { marginBottom: 16 },
  totalText: { color: '#7f8c8d', fontSize: 13, fontWeight: '600' },
  card: { marginBottom: 12, borderRadius: 16, backgroundColor: '#fff', elevation: 2 },
  cardRow: { flexDirection: 'row', padding: 16 },
  itemMain: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  itemTitle: { fontSize: 17, fontWeight: 'bold', color: '#2c3e50' },
  categoryLabel: { fontSize: 12, color: '#3498db', fontWeight: 'bold', textTransform: 'uppercase', marginTop: 2 },
  description: { fontSize: 13, color: '#7f8c8d', marginTop: 4 },
  chipRow: { flexDirection: 'row', marginTop: 8 },
  spiceChip: { height: 24, fontSize: 10, marginRight: 6, backgroundColor: '#fef9e7' },
  vegChip: { height: 24, fontSize: 10, backgroundColor: '#eafaf1' },
  itemActions: { alignItems: 'flex-end', marginLeft: 12 },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#2ecc71', marginBottom: 8 },
  floatingButton: { position: 'absolute', right: 20, bottom: 20, borderRadius: 16, backgroundColor: '#2c3e50', elevation: 4 },
  floatingContent: { paddingVertical: 8, paddingHorizontal: 12 },
  modal: { backgroundColor: '#fff', margin: 20, borderRadius: 24, padding: 24, maxHeight: '80%' },
  input: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#95a5a6', textTransform: 'uppercase', marginBottom: 6 },
  catPicker: { marginBottom: 16 },
  formRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  formChip: { marginRight: 8, marginBottom: 8 },
  submitBtn: { marginTop: 20, paddingVertical: 6, borderRadius: 12, backgroundColor: '#3498db' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
