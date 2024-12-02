import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, RefreshControl, Alert } from 'react-native';
import api from '../api';
import { useRoute } from '@react-navigation/native';
import { AppContext } from '../AppContext';

const AllProducts = ({handleSelectProduct}) => {
    const appContext = useContext(AppContext);
    const {products, setProducts} = appContext
    const route = useRoute();
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { ProdTypeId = 0 } = route.params || {};

    

    useEffect(() => {
        if (ProdTypeId) {
            const filtered = products.filter(product => product.ProdTypeId === ProdTypeId);
            setFilteredProducts(filtered);
        }
        else
            setFilteredProducts(products)
    }, [ProdTypeId, products]);
    const fetchProducts = async () => {
        setLoading(true)
        if (products?.length > 0) {
            setLoading(false)
            return;
        }
        try {
            const response = await api.get('/product');
            console.log('Products:', response.data);
            setProducts(response.data);
            setFilteredProducts(response.data); // Initialize with all products
            setLoading(false)
        } catch (error) {
            console.log('Error fetching products:', error);
        } finally {
            setLoading(false);
            setRefreshing(false); // Stop refreshing after fetching data
        }
    };

    useEffect(() => {
        console.log('Use Effect')
        fetchProducts();

    }, []);

    const handleSearch = (text) => {
        setSearchQuery(text);

        const filtered = products?.filter(item => {
            const productName = item.ProdName ? item.ProdName.toLowerCase() : '';
            const productId = item.ProductId ? item.ProductId.toString() : '';
            const query = text.toLowerCase();

            return productName.includes(query) || productId.includes(query);
        });

        setFilteredProducts(filtered);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts(); // Re-fetch products on pull-to-refresh
    };
    const handleSelectedProduct = (productId, prodName, listRate) => {
        // Alert.alert('Product Selected', `Product ID: ${productId}\nProduct Name: ${prodName}\nPrice: ${listRate} PKR`);
        handleSelectProduct(productId, prodName, listRate);
    }
    if (loading) {
        return <ActivityIndicator size="large" />;
    }




    return (
        <View style={styles.container}>
            <Text style={styles.heading}>All Products</Text>

            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search by product name or ID"
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor={'#ff3d00'}
            />

            {/* Product List */}
            <FlatList
                data={filteredProducts}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.productItem}
                        onPress={() => handleSelectedProduct(item.ProductId, item.ProdName, item.ListRate)}
                    >
                        <Text style={styles.productName}>{item.ProductId || 'No id'} Product Name: {item.ProdName || 'No Name'}</Text>
                        <Text style={styles.productPrice}>Price: {item.ListRate || 'N/A'} PKR</Text>
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

export default AllProducts;
