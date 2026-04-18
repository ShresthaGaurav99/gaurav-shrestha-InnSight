import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Text, Title, Card, Button, Avatar, Appbar } from 'react-native-paper';
import { AuthContext } from '../../../context/AuthContext';
import { COLORS, SIZES, SPACING } from '../../../constants/theme';
import api from '../../../services/api';
import { LogOut, Calendar as CalendarIcon, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Calendar as RNCalendar } from 'react-native-calendars';

export default function CustomerDashboard() {
    const { user, logout } = useContext(AuthContext);
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    // Search state
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [rooms, setRooms] = useState(1);
    const [guests, setGuests] = useState(2);
    const [markedDates, setMarkedDates] = useState({});

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bookings/my');
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const formatDate = (dateString, defaultText) => {
        if (!dateString) return defaultText;
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getDatesInRange = (startDate, endDate) => {
        const date = new Date(startDate);
        const end = new Date(endDate);
        const dates = [];
        while (date <= end) {
            dates.push(date.toISOString().split('T')[0]);
            date.setDate(date.getDate() + 1);
        }
        return dates;
    };

    const onDayPress = (day) => {
        if (!checkIn || (checkIn && checkOut)) {
            // Start new selection
            setCheckIn(day.dateString);
            setCheckOut('');
            setMarkedDates({
                [day.dateString]: { startingDay: true, color: '#053F2C', textColor: 'white' }
            });
        } else if (!checkOut && day.dateString > checkIn) {
            // End selection
            setCheckOut(day.dateString);
            const range = getDatesInRange(checkIn, day.dateString);
            const marks = {};
            range.forEach((date, i) => {
                if (i === 0) {
                    marks[date] = { startingDay: true, color: '#053F2C', textColor: 'white' };
                } else if (i === range.length - 1) {
                    marks[date] = { endingDay: true, color: '#053F2C', textColor: 'white' };
                } else {
                    marks[date] = { color: '#E8F5E9', textColor: '#053F2C' }; // light green
                }
            });
            setMarkedDates(marks);
            setTimeout(() => setShowCalendar(false), 800);
        } else {
            // User clicked a date before checkin, so reset
            setCheckIn(day.dateString);
            setCheckOut('');
            setMarkedDates({
                [day.dateString]: { startingDay: true, color: '#053F2C', textColor: 'white' }
            });
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.Content title={`Hello, ${user?.name || 'Guest'}`} subtitle="Welcome back" />
                <Appbar.Action icon={() => <LogOut size={20} color={COLORS.primary} />} onPress={logout} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
                
                {/* Hero Search Section */}
                <View style={[styles.heroSection, isDesktop && styles.heroSectionDesktop]}>
                    <View style={[styles.searchContainer, !isDesktop && styles.searchContainerMobile]}>
                        <TouchableOpacity style={styles.searchField} onPress={() => setShowCalendar(!showCalendar)}>
                            <CalendarIcon size={20} color={COLORS.darkGray} />
                            <View style={styles.searchTexts}>
                                <Text style={styles.searchLabel}>Check In</Text>
                                <Text style={styles.searchValue}>{formatDate(checkIn, 'Add Dates')}</Text>
                            </View>
                        </TouchableOpacity>
                        
                        {isDesktop ? <View style={styles.divider} /> : <View style={styles.hDivider} />}
                        
                        <TouchableOpacity style={styles.searchField} onPress={() => setShowCalendar(!showCalendar)}>
                            <CalendarIcon size={20} color={COLORS.darkGray} />
                            <View style={styles.searchTexts}>
                                <Text style={styles.searchLabel}>Check Out</Text>
                                <Text style={styles.searchValue}>{formatDate(checkOut, 'Add Dates')}</Text>
                            </View>
                        </TouchableOpacity>

                        {isDesktop ? <View style={styles.divider} /> : <View style={styles.hDivider} />}

                        <TouchableOpacity style={styles.searchField}>
                            <Users size={20} color={COLORS.darkGray} />
                            <View style={styles.searchTexts}>
                                <Text style={styles.searchLabel}>Rooms/Guests</Text>
                                <Text style={styles.searchValue}>{rooms} Room, {guests} Guests</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {showCalendar && (
                        <Card style={styles.calendarDropdown}>
                            <Card.Title 
                                title="Select dates to find the best prices for your trip" 
                                titleStyle={{fontSize: 14, fontWeight: 'bold'}} 
                                left={(props) => <CalendarIcon size={20} color={'#053F2C'} />} 
                            />
                            <Card.Content>
                                <RNCalendar
                                    onDayPress={onDayPress}
                                    markedDates={markedDates}
                                    markingType={'period'}
                                    theme={{
                                        todayTextColor: COLORS.secondary,
                                        selectedDayBackgroundColor: '#053F2C',
                                        arrowColor: '#053F2C',
                                        monthTextColor: '#053F2C',
                                        textMonthFontWeight: 'bold',
                                    }}
                                />
                                {(checkIn && checkOut) ? (
                                    <View style={styles.calendarFooter}>
                                       <Button mode="contained" onPress={() => router.push('/customer/rooms')} buttonColor="#053F2C" style={styles.searchBtn}>
                                            Search Rooms
                                       </Button>
                                    </View>
                                ) : null}
                            </Card.Content>
                        </Card>
                    )}
                </View>

                {/* Main Content Sections */}
                <View style={styles.section}>
                    <Title>Your Recent Bookings</Title>
                    {bookings.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <Card.Content style={styles.center}>
                                <CalendarIcon size={40} color={COLORS.gray} />
                                <Text style={styles.emptyText}>No bookings found</Text>
                            </Card.Content>
                        </Card>
                    ) : (
                        bookings.map((item) => (
                            <Card key={item.id} style={styles.card}>
                                <Card.Title
                                    title={item.type + ' Room'}
                                    subtitle={`Room: ${item.room_number}`}
                                    left={(props) => <Avatar.Icon {...props} icon="bed" backgroundColor={COLORS.secondary} />}
                                />
                                <Card.Content>
                                    <Text>Check-in: {new Date(item.checkIn).toLocaleDateString()}</Text>
                                    <Text>Check-out: {new Date(item.checkOut).toLocaleDateString()}</Text>
                                    <Text style={styles.status}>Status: {item.status}</Text>
                                </Card.Content>
                            </Card>
                        ))
                    )}
                </View>

                <View style={styles.section}>
                    <Title>Quick Actions</Title>
                    <View style={styles.row}>
                        <Button
                            mode="contained"
                            style={styles.actionBtn}
                            icon="search"
                            onPress={() => router.push('/customer/rooms')}
                        >
                            Browse Rooms
                        </Button>
                        <Button
                            mode="outlined"
                            style={styles.secondaryBtn}
                            icon="silverware-fork-knife"
                            onPress={() => router.push('/customer/menu')}
                        >
                            Hotel Menu
                        </Button>
                    </View>
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
    heroSection: {
        marginBottom: 32,
        alignItems: 'center',
    },
    heroSectionDesktop: {
        paddingTop: 40,
        paddingBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: COLORS.gray,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 900,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    searchContainerMobile: {
        flexDirection: 'column',
        borderRadius: 20,
        padding: 15,
        alignItems: 'flex-start',
    },
    searchField: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        flex: 1,
        width: '100%',
    },
    searchTexts: {
        marginLeft: 12,
    },
    searchLabel: {
        fontSize: 12,
        color: COLORS.darkGray,
        marginBottom: 2,
    },
    searchValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    divider: {
        width: 1,
        height: '70%',
        backgroundColor: '#E0E0E0',
    },
    hDivider: {
        height: 1,
        width: '100%',
        backgroundColor: '#E0E0E0',
        marginVertical: 5,
    },
    calendarDropdown: {
        marginTop: 15,
        width: '100%',
        maxWidth: 600,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        elevation: 6,
        overflow: 'hidden',
        zIndex: 100,
    },
    calendarFooter: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        alignItems: 'center'
    },
    searchBtn: {
        width: '100%',
        paddingVertical: 6,
    },
    section: {
        marginBottom: 24,
    },
    card: {
        marginBottom: 12,
        backgroundColor: COLORS.white,
        elevation: 2,
    },
    emptyCard: {
        padding: 40,
        backgroundColor: COLORS.white,
        elevation: 1,
    },
    center: {
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 10,
        color: COLORS.darkGray,
    },
    status: {
        fontWeight: 'bold',
        color: COLORS.accent,
        marginTop: 5,
    },
    row: {
        flexDirection: 'row',
        marginTop: 10,
    },
    actionBtn: {
        backgroundColor: COLORS.secondary,
        marginRight: 10,
    },
    secondaryBtn: {
        borderColor: COLORS.secondary,
    }
});
