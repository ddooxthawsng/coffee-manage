import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, ActivityIndicator, RefreshControl, ScrollView,
  Modal, TextInput, Alert
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

// Local storage helpers
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderScreen = () => {
  const { user } = useAuth();
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Load menu with caching
  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = async () => {
    setLoading(true);
    try {
      // Check for cached menu data
      const cachedData = await AsyncStorage.getItem('mobile_menu_cache');
      const lastUpdated = await AsyncStorage.getItem('mobile_menu_cache_timestamp');

      if (cachedData && lastUpdated) {
        const parsedData = JSON.parse(cachedData);
        const cacheTime = parseInt(lastUpdated);
        const currentTime = Date.now();
        const sixHoursInMs = 6 * 60 * 60 * 1000;

        if (currentTime - cacheTime < sixHoursInMs) {
          console.log('Using cached menu data');
          setMenu(parsedData);
          setupCategories(parsedData);
          setLoading(false);
          return;
        }
      }

      // If no cache or expired cache, fetch from server
      const menuData = await fetchMenuFromServer();
      setMenu(menuData);
      setupCategories(menuData);

      // Update cache
      await AsyncStorage.setItem('mobile_menu_cache', JSON.stringify(menuData));
      await AsyncStorage.setItem('mobile_menu_cache_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error loading menu:', error);
      Alert.alert('Lỗi', 'Không thể tải menu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMenuFromServer = async () => {
    const menuSnapshot = await getDocs(collection(db, 'menu'));
    return menuSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  const setupCategories = (menuItems) => {
    const uniqueCategories = [...new Set(menuItems.map(item => item.category).filter(Boolean))];
    setCategories(['Tất cả', ...uniqueCategories]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Clear cache and reload
    AsyncStorage.removeItem('mobile_menu_cache_timestamp')
      .then(() => loadMenuData())
      .catch(error => {
        console.error('Error refreshing:', error);
        setRefreshing(false);
      });
  };

  const addToCart = (item, size) => {
    const key = `${item.id}_${size.size}`;
    const existingItem = cart.find(cartItem => cartItem.key === key);

    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.key === key 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      setCart([...cart, {
        key,
        id: item.id,
        name: item.name,
        size: size.size,
        price: size.price,
        quantity: 1
      }]);
    }
  };

  const changeQuantity = (key, change) => {
    setCart(cart.map(item => {
      if (item.key === key) {
        const newQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (key) => {
    setCart(cart.filter(item => item.key !== key));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm món vào giỏ hàng trước khi thanh toán.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create invoice in Firestore
      await addDoc(collection(db, 'invoices'), {
        items: cart,
        total,
        discount: 0,
        finalTotal: total,
        status: 'paid',
        createdAt: serverTimestamp(),
        paymentMethod: 'cash',
        staffId: user.uid,
        staffName: user.displayName || user.email
      });

      Alert.alert('Thành công', 'Đã thanh toán đơn hàng thành công!');
      setCart([]);
      setCartModalVisible(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
      Alert.alert('Lỗi', 'Không thể tạo hóa đơn. Vui lòng thử lại.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const filteredMenu = activeCategory === 'Tất cả'
    ? menu
    : menu.filter(item => item.category === activeCategory);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1890ff" />
        <Text style={styles.loadingText}>Đang tải menu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryBtn, activeCategory === category && styles.activeCategoryBtn]}
              onPress={() => setActiveCategory(category)}
            >
              <Text style={[styles.categoryText, activeCategory === category && styles.activeCategoryText]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu List */}
      <FlatList
        data={filteredMenu}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              <Text style={styles.menuItemDesc}>{item.description || 'Không có mô tả'}</Text>

              {/* Sizes */}
              <View style={styles.sizesContainer}>
                {item.sizes && item.sizes.map((size, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.sizeBtn}
                    onPress={() => addToCart(item, size)}
                  >
                    <Text style={styles.sizeText}>{size.size}</Text>
                    <Text style={styles.priceText}>{size.price.toLocaleString()}đ</Text>
                    <MaterialIcons name="add-shopping-cart" size={16} color="#1890ff" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
        numColumns={1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="exclamation-circle" size={50} color="#d9d9d9" />
            <Text style={styles.emptyText}>Không có món nào trong danh mục này</Text>
          </View>
        }
      />

      {/* Cart button */}
      <TouchableOpacity 
        style={styles.cartBtn}
        onPress={() => setCartModalVisible(true)}
      >
        <View style={styles.cartBtnContent}>
          <FontAwesome name="shopping-cart" size={24} color="white" />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </View>
        <Text style={styles.cartText}>{total.toLocaleString()}đ</Text>
      </TouchableOpacity>

      {/* Cart Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={cartModalVisible}
        onRequestClose={() => setCartModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Giỏ hàng</Text>
            <TouchableOpacity onPress={() => setCartModalVisible(false)}>
              <FontAwesome name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <FontAwesome name="shopping-cart" size={60} color="#d9d9d9" />
              <Text style={styles.emptyCartText}>Giỏ hàng trống</Text>
              <TouchableOpacity 
                style={styles.backToMenuBtn}
                onPress={() => setCartModalVisible(false)}
              >
                <Text style={styles.backToMenuText}>Quay lại thực đơn</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <FlatList
                data={cart}
                keyExtractor={item => item.key}
                renderItem={({ item }) => (
                  <View style={styles.cartItem}>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemSize}>{item.size}</Text>
                    </View>
                    <View style={styles.cartItemPrice}>
                      <Text>{item.price.toLocaleString()}đ</Text>
                    </View>
                    <View style={styles.cartItemActions}>
                      <TouchableOpacity onPress={() => changeQuantity(item.key, -1)}>
                        <FontAwesome name="minus-circle" size={24} color="#ff4d4f" />
                      </TouchableOpacity>
                      <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => changeQuantity(item.key, 1)}>
                        <FontAwesome name="plus-circle" size={24} color="#52c41a" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.removeBtn}
                        onPress={() => removeFromCart(item.key)}
                      >
                        <FontAwesome name="trash" size={20} color="#ff4d4f" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />

              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Tổng tiền:</Text>
                <Text style={styles.totalAmount}>{total.toLocaleString()}đ</Text>
              </View>

              <TouchableOpacity 
                style={styles.checkoutBtn}
                onPress={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.checkoutBtnText}>Thanh toán</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f7fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeCategoryBtn: {
    backgroundColor: '#1890ff',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeCategoryText: {
    color: 'white',
  },
  menuItem: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuItemContent: {
    padding: 15,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  menuItemDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  sizesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
  priceText: {
    fontSize: 14,
    color: '#1890ff',
    fontWeight: 'bold',
    marginRight: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  cartBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1890ff',
    width: 150,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cartBtnContent: {
    position: 'relative',
    marginRight: 10,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4d4f',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f6f7fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  backToMenuBtn: {
    backgroundColor: '#1890ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  backToMenuText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cartItem: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemInfo: {
    flex: 2,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemSize: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cartItemPrice: {
    flex: 1,
  },
  cartItemActions: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  removeBtn: {
    padding: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginVertical: 15,
    borderRadius: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1890ff',
  },
  checkoutBtn: {
    backgroundColor: '#52c41a',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  checkoutBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OrderScreen;
