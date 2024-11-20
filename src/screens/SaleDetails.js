import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  Button,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../api';
import DateTimePicker from '@react-native-community/datetimepicker';
import AllProducts from './AllProducts';
import { ScrollView } from 'react-native-gesture-handler';

export default function SaleDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { vocNo, selectedProductName, selectedProductPrice, selectedProductId } =
    route.params || {};

  const [data, setData] = useState({ Trans: [], SCharges: 0 });
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  function handleOpenModel(index) {
    setCurrentIndex(index);
    setShowModel(true);
  }

  useEffect(() => {
    fetchData();
  }, [vocNo, selectedProductName, selectedProductPrice, selectedProductId]);

  useEffect(() => {
    if (data.Trans && (data.PType === 1 || data.PType === 3)) {
      const totalNetAmount = data.Trans.reduce(
        (acc, curr) => acc + curr.NetAmount,
        0,
      );
      const serviceCharges = Math.round(totalNetAmount * 0.07);
      setData(prevData => ({ ...prevData, SCharges: serviceCharges }));
    } else {
      setData(prevData => ({ ...prevData, SCharges: 0 }));
    }
  }, [data.Trans, data.PType]);

  const fetchData = async (isRefresh = false) => {
    try {
      const response = await api.get('/sal/' + vocNo);
      setData(response.data[0]);
      // console.log(response.data[0])
      // let newData = response.data[0];
      // if (
      //   selectedProductName &&
      //   selectedProductPrice &&
      //   selectedProductId &&
      //   !isRefresh
      // ) {
      //   newData.Trans = newData.Trans.map(transaction => ({
      //     ...transaction,
      //     ProdName: selectedProductName,
      //     ListRate: selectedProductPrice,
      //     ProductId: selectedProductId,
      //     NetAmount: transaction.Qty * selectedProductPrice,
      //   }));
      // }
      // setData(newData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch sale details');
      setLoading(false);
    }
  };

  const handleDelete = index => {
    const updatedData = [...data.Trans];
    updatedData[index] = { ...updatedData[index], PQty: 0, Qty: 0, NetAmount: 0 };
    updateDataAndCharges(updatedData);
  };

  const handleQtyChange = (index, change) => {
    console.log(change);
    const updatedData = [...data.Trans];
    const item = updatedData[index];
    item.PQty = Math.max(0, item.PQty + change);
    item.Qty = item.PQty;
    item.NetAmount = item.Qty * (item.ListRate || item.Rate);
    updateDataAndCharges(updatedData);
  };

  const handleCustomQtyChange = (index, text) => {
    const updatedData = [...data.Trans];
    const item = updatedData[index];
    item.PQty = Number(text) || 0;
    item.Qty = item.PQty;
    item.NetAmount = item.Qty * (item.ListRate || item.Rate);
    updateDataAndCharges(updatedData);
  };

  const hanldeProductIdChange = (index, obj) => {
    const updatedData = [...data.Trans];
    const item = updatedData[index];
    item.ProductId = obj.ProductId;
    item.ProdName = obj.ProdName;
    item.Rate = obj.Rate;
    item.NetAmount = item.Qty * (obj.Rate || 0);
    updateDataAndCharges(updatedData);
  };

  const updateDataAndCharges = updatedData => {
    const totalNetAmount = updatedData.reduce(
      (acc, curr) => acc + curr.NetAmount,
      0,
    );
    const serviceCharges = totalNetAmount * 0.07;
    setData(prevData => ({
      ...prevData,
      Trans: updatedData,
      SCharges: serviceCharges,
    }));
  };

  const handleSave = () => {
    const preparedData = {
      ...data,
      Trans: data.Trans.map(transaction => ({
        ...transaction,
        ProdName: selectedProductName || transaction.ProdName,
        Rate: selectedProductPrice || transaction.Rate,
        ProductId: selectedProductId || transaction.ProductId,
        NetAmount: transaction.Qty * (selectedProductPrice || transaction.Rate),
      })),
      SCharges: Math.round(data.SCharges),
    };

    api
      .put('/sal', JSON.stringify(preparedData), {
        headers: { 'Content-Type': 'application/json' },
      })
      .then(() => {
        Alert.alert('Success', 'Sale details updated successfully');
        fetchData(true);
      })
      .catch(error => {
        console.error('Error during save:', error);
        Alert.alert('Error', 'Failed to save details');
      });
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(data.Date);
    setData(prevData => ({
      ...prevData,
      Date: currentDate.toISOString().split('T')[0],
    }));
    setShowDatePicker(false);
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color={'#ff3d00'} style={styles.loader} />
    );
  }

  //jsx
  const handleSelectProduct = (productId, prodName, listRate) => {
    Alert.alert('Selected Product', `${prodName} - ${listRate} {current index: ${currentIndex}}`);
    const trans = [...data.Trans]
    trans[currentIndex].ProductId = productId;
    trans[currentIndex].ProdName = prodName;
    trans[currentIndex].Rate = listRate;
    trans[currentIndex].NetAmount = trans[currentIndex].Qty * listRate;
    setData(prevData => ({
      ...prevData,
      Trans: trans
    }))

    // setData(prevData => ({
    //   ...prevData,
    //   Trans: prevData.Trans.map(transaction =>
    //   transaction.id === proId
    //     ? {
    //       ...transaction,
    //       ProdName: proName,
    //       Rate: listRate,
    //       ProductId: proId,
    //       NetAmount: transaction.Qty * listRate,
    //       vocNo: vocNo,
    //     }
    //     : transaction,
    //   ),
    // }));

  };

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
      <FlatList
        data={data.Trans}
        keyExtractor={(item, index) => index.toString()}
        onRefresh={() => fetchData(true)}
        refreshing={loading}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headerLabelContainer}>
                <Icon name="file-document-outline" size={20} color="#333333" />
                <Text style={styles.headerLabel}>Invoice No:</Text>
              </View>
              <Text style={styles.headerValue}>{data.VocNo}</Text>
            </View>
            <View style={styles.headerRow}>
              <View style={styles.headerLabelContainer}>
                <Icon name="calendar" size={20} color="#333333" />
                <Text style={styles.headerLabel}>Date:</Text>
              </View>
              <TextInput
                style={styles.headerValue}
                value={data.Date}
                onChangeText={text =>
                  setData(prevData => ({ ...prevData, Date: text }))
                }
                placeholder="YYYY-MM-DD"
                keyboardType="default"
                onFocus={() => setShowDatePicker(true)}
              />
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(data.Date)}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  onClose={() => setShowDatePicker(false)}
                />
              )}
            </View>
            <View style={styles.headerRow}>
              <View style={styles.headerLabelContainer}>
                <Icon name="table-furniture" size={20} color="#333333" />
                <Text style={styles.headerLabel}>Table No:</Text>
              </View>
              <TextInput
                style={styles.headerValue}
                value={data.TblNo}
                onChangeText={text =>
                  setData(prevData => ({ ...prevData, TblNo: text }))
                }
                placeholder="Enter Table No"
              />
            </View>
            <View style={styles.headerRow}>
              <View style={styles.headerLabelContainer}>
                <Icon name="credit-card-outline" size={20} color="#333333" />
                <Text style={styles.headerLabel}>PType:</Text>
              </View>
              <Text style={styles.headerValue}>{data.PType}</Text>
            </View>
          </View>
        )}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text style={styles.productName} onPress={() => handleOpenModel(index)}>{item.ProdName}</Text>
            <View style={styles.qtyContainer}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => handleQtyChange(index, -1)}>
                <Icon name="minus" size={20} color="white" />
              </TouchableOpacity>
              <TextInput
                style={styles.qtyInput}
                onChangeText={text => handleCustomQtyChange(index, text)}
                value={item.Qty.toString()}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => handleQtyChange(index, 1)}>
                <Icon name="plus" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.netAmount}>{Math.round(item.Rate) || "100"}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(index)}>
              <Icon name="delete-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.customButton}
              onPress={() => handleOpenModel(index)}>
              <Icon name="tag-edit-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => {
          const totalQty = data.Trans.reduce((sum, item) => sum + item.Qty, 0);
          const totalNetAmount = data.Trans.reduce(
            (sum, item) => sum + item.NetAmount,
            0,
          );
          const serviceCharges = data.SCharges || 0;
          const grandTotal = totalNetAmount + serviceCharges;

          return (
            <View style={styles.footer}>
              <View style={styles.footerRow}>
                <Text style={styles.footerLabel}>Total Quantity:</Text>
                <Text style={styles.footerValue}>{totalQty}</Text>
              </View>
              <View style={styles.footerRow}>
                <Text style={styles.footerLabel}>Total Amount:</Text>
                <Text style={styles.footerValue}>
                  {totalNetAmount.toFixed(0)} PKR
                </Text>
              </View>
              <View style={styles.footerRow}>
                <Text style={styles.footerLabel}>Service Charges:</Text>
                <Text style={styles.footerValue}>
                  {serviceCharges.toFixed(0)} PKR
                </Text>
              </View>
              <View style={styles.footerRow}>
                <Text style={styles.footerLabel}>Grand Total:</Text>
                <Text style={styles.footerValue}>
                  {grandTotal.toFixed(0)} PKR
                </Text>
              </View>
            </View>
          );
        }}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Icon
          name="content-save"
          size={24}
          color="white"
          style={styles.saveButtonIcon}
        />
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
      {showModel && (
        <View style={styles.modelContainer}>
          <AllProducts handleSelectProduct={handleSelectProduct} />
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowModel(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  headerLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  headerLabel: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  headerValue: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  item: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  productName: {
    flex: 3,
    fontSize: 16,
    color: '#333333',
  },
  qtyContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  qtyButton: {
    backgroundColor: '#ff3d00',
    borderRadius: 4,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 5,
    width: 40,
    textAlign: 'center',
    marginHorizontal: 5,
    color: '#333333',
  },
  netAmount: {
    flex: 2,
    fontSize: 16,
    textAlign: 'right',
    color: '#333333',
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
    backgroundColor: '#ff3d00',
    borderRadius: 4,
  },
  footer: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  footerLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
  },
  footerValue: {
    fontSize: 16,
    color: '#333333',
  },
  saveButton: {
    backgroundColor: '#ff3d00',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    margin: 15,
    borderRadius: 5,
  },
  saveButtonIcon: {
    marginRight: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modelContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '10%',
    left: 15,
    right: 15,
    height: '70%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#ff3d00',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
  },
  closeButton: {
    width: '100%',
    color: 'bold',
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#ff3d00"
  },

  closeButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: 'bold',
  }
});
