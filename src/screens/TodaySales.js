import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
  RefreshControl,
  TouchableOpacity,
  BackHandler,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import api from '../api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { formatAmount } from '../utils/util';

const TodaySales = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  const fetchData = async (sDate = startDate, eDate = endDate) => {
    try {
      const formattedStartDate = sDate.toISOString().split('T')[0];
      const formattedEndDate = eDate.toISOString().split('T')[0];
      const response = await api.get(
        `/stk/salsum?sdate=${formattedStartDate}&edate=${formattedEndDate}&orderby=VocNo`,
      );
      setData(response?.data?.table || []);
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleStartDateChange = (_, date) => {
    setStartDate(date);
    setEndDate(date)
    fetchData(date, date);
  };

  const handleEndDateChange = (_, date) => {
    setEndDate(date);
    fetchData(startDate, date);
  };

  const totalSalesByType = data.reduce((acc, item) => {
    if (!acc[item.PT]) {
      acc[item.PT] = 0;
    }
    acc[item.PT] += item.NetAmount;
    return acc;
  }, {});

  console.log(totalSalesByType);

  // useFocusEffect(
  //   useCallback(() => {
  //     const onBackPress = () => {
  //       navigation.navigate('Home');
  //       return true;
  //     };
  //     BackHandler.addEventListener('hardwareBackPress', onBackPress);
  //     return () =>
  //       BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  //   }, [navigation]),
  // );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>Today Sales</Text>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStart(true)}>
                <Text style={styles.dateButtonText}>
                  {startDate.toDateString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEnd(true)}>
                <Text style={styles.dateButtonText}>
                  {endDate.toDateString()}
                </Text>
              </TouchableOpacity>
            </View>
            <View >
              <Text style={styles.summaryText} >
                Total Sales:{' '}
                {formatAmount(
                  data.reduce((sum, item) => sum + item.NetAmount, 0),
                )}
              </Text>
            </View>
            <View style={styles.salesTyContainer}>
              <Text style={styles.heading}>
                Total Sales by Type:

              </Text>
              <View style={styles.saleWrapper}>
                {Object.entries(totalSalesByType).map(([key, value]) => (
                  <Text style={styles.salesText} key={key}>
                    {key}: {formatAmount(value)}{' '}
                  </Text>
                ))}

             
              </View>
            </View>

            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Inv#.</Text>
              <Text style={styles.headerText}>Type</Text>
              <Text style={styles.headerText}>Tbl.No</Text>
              <Text style={styles.headerText}>Prods</Text>
              <Text style={styles.headerText}>Amt</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('HomeStack', {
                screen: 'SaleDetails',
                params: { vocNo: item.VocNo },
              })
            }>
            <Animated.View
              style={[
                styles.item,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}>
              <Text style={styles.cellText}>{item.VocNo}</Text>
              <Text style={styles.cellText}>{item.PT}</Text>
              <Text style={styles.cellText}>{item.TblNo}</Text>
              <Text style={styles.cellTextSmall}>{item.CntProds} Prod(s)</Text>
              <Text style={styles.cellTextRight}>
                {formatAmount(item.NetAmount)}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        )}
      />
      {showStart && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStart(false);
            handleStartDateChange(event, date);
          }}
        />
      )}
      {showEnd && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEnd(false);
            handleEndDateChange(event, date);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff3d00',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'black',
  },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#fff',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dateButtonText: { color: '#ff3d00', fontSize: 16, fontWeight: 'bold' },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3d00',
    flex: 1,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
    backgroundColor: 'white',
  },
  cellText: { fontSize: 16, flex: 1, textAlign: 'center', color: '#333' },
  cellTextSmall: { fontSize: 12, flex: 1, textAlign: 'center', color: '#333' },
  cellTextRight: { fontSize: 16, flex: 1, textAlign: 'right', color: '#333' },
  summaryText: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff3d00',
  },
  salesTyContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff3d00',
    gap: 3,
    marginBottom: 10,
    padding: 2,
  },
  saleWrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10, 
  },
  salesText: {
    // flex: 1,
    width:"45%",
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    // marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff3d00',
  },
});

export default TodaySales;
