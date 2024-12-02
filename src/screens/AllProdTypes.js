import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, RefreshControl, Alert } from 'react-native';
import api from '../api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppContext } from '../AppContext';

const AllProdTypes = ({handleSelectProduct}) => {
    const appContext = useContext(AppContext)

    const navigation = useNavigation();

    const route = useRoute();
    const { vocNo } = route.params || {};
    const {prodTypes, setProdTypes} = appContext
    const [filteredProdTypes, setFilteredProdTypes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);


    const fetchprodTypes = async () => {        
        try {

            if (prodTypes?.length > 0) {
                setLoading(false)
                return;
            }
    
            const response = await api.get('/prodtype');
            console.log('ProdTypes:', response.data);
            setProdTypes(response.data);
            setFilteredProdTypes(response.data); // Initialize with all prodTypes
        } catch (error) {
            console.log('Error fetching prodTypes:', error);
        } finally {
            setLoading(false);
            setRefreshing(false); // Stop refreshing after fetching data
        }
    };

    useEffect(() => {
        fetchprodTypes();

    }, []);

    const handleSearch = (text) => {
        setSearchQuery(text);

        const filtered = prodTypes.filter(item => {
            const productType = item.ProdType ? item.ProdType.toLowerCase() : '';
            const ProdTypeId = item.ProdTypeId ? item.ProdTypeId.toString() : '';
            const query = text.toLowerCase();

            return productType.includes(query) || ProdTypeId.includes(query);
        });

        setFilteredProdTypes(filtered);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchprodTypes(); // Re-fetch prodTypes on pull-to-refresh
    };
    const handleSelectedProduct = (ProdTypeId, ProdType) => {
        handleSelectProduct(ProdTypeId, ProdType);
    }
    if (loading) {
        return <ActivityIndicator size="large" />;
    }




    return (
        <View style={styles.container}>
            <Text style={styles.heading}>All prodTypes</Text>

            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search by product type or ID"
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor={'#ff3d00'}
            />

            {/* Product List */}
            <FlatList
                data={filteredProdTypes}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.productItem}
                        onPress={() => navigation.navigate('AllprodTypes', { ProdTypeId: item.ProdTypeId })}
                    >
                        <Text style={styles.productName}>{item.ProdTypeId || 'No id'} {item.ProdTypeName || 'No Name'}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 10,
        backgroundColor: '#fff',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#ff3d00',
    },
    searchBar: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        fontSize: 16,
        borderColor: '#ddd',
        borderWidth: 1,
        color: '#ff3d00',
        marginBottom: 20, // Added margin for top and bottom spacing
    },
    productItem: {
        padding: 20,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        backgroundColor: 'white',
        borderRadius: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ff3d00',
    },
    productPrice: {
        fontSize: 14,
        color: 'black',
        marginTop: 5,
    },
});

export default AllProdTypes;
