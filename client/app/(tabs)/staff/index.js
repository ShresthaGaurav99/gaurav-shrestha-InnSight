import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Title, Card, Button, Avatar, Appbar, Chip } from 'react-native-paper';
import { AuthContext } from '../../../context/AuthContext';
import { COLORS, SIZES } from '../../../constants/theme';
import api from '../../../services/api';
import { LogOut, ClipboardList, CheckCircle } from 'lucide-react-native';

export default function StaffDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tasks/assigned');
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/tasks/${id}/status`, { status });
            fetchTasks();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.Content title="Staff Portal" subtitle={user?.fullName} />
                <Appbar.Action icon={() => <LogOut size={20} color={COLORS.primary} />} onPress={logout} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Title>Assigned Tasks</Title>
                    {tasks.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <Card.Content style={styles.center}>
                                <ClipboardList size={40} color={COLORS.gray} />
                                <Text style={styles.emptyText}>No tasks assigned today</Text>
                            </Card.Content>
                        </Card>
                    ) : (
                        tasks.map((item) => (
                            <Card key={item.id} style={styles.card}>
                                <Card.Title
                                    title={item.title}
                                    subtitle={item.description}
                                    left={(props) => <Avatar.Icon {...props} icon="clipboard-text" backgroundColor={COLORS.primary} />}
                                />
                                <Card.Content>
                                    <View style={styles.meta}>
                                        <Chip style={styles.chip}>{item.status}</Chip>
                                        {item.status !== 'completed' && (
                                            <Button
                                                mode="outlined"
                                                onPress={() => updateStatus(item.id, 'completed')}
                                                style={styles.doneBtn}
                                            >
                                                Mark Done
                                            </Button>
                                        )}
                                    </View>
                                </Card.Content>
                            </Card>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.white,
        elevation: 2,
    },
    content: {
        padding: SIZES.padding,
    },
    section: {
        marginBottom: 24,
    },
    card: {
        marginBottom: 12,
        backgroundColor: COLORS.white,
    },
    emptyCard: {
        padding: 40,
        backgroundColor: COLORS.white,
    },
    center: {
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 10,
        color: COLORS.darkGray,
    },
    meta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    chip: {
        backgroundColor: COLORS.background,
    },
    doneBtn: {
        borderColor: COLORS.accent,
    }
});
