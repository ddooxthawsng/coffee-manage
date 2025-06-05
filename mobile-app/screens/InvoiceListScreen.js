import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, ActivityIndicator, RefreshControl
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useIsFocused } from '@react-navigation/native';

const InvoiceListScreen = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    // Load invoices when screen is focused
    if (isFocused) {
      loadInvoices();
    }
  }, [isFocused]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const invoicesQuery = query(
        collection(db, 'invoices'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const invoicesSnapshot = await getDocs(invoicesQuery);
      const invoicesData = invoicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInvoices();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#52c41a';
      case 'unpaid': return '#faad14';
      case 'cancelled': return '#ff4d4f';
      default: return '#1890ff';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'unpaid': return 'Chưa thanh toán';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1890ff" />
        <Text style={styles.loadingText}>Đang tải hóa đơn...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={invoices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.invoiceItem}
            onPress={() => navigation.navigate('InvoiceDetail', { id: item.id, invoice: item })}
          >
            <View style={styles.invoiceHeader}>
              <View style={styles.invoiceId}>
                <FontAwesome name="file-text-o" size={16} color="#1890ff" style={styles.invoiceIcon} />
                <Text style={styles.invoiceIdText}>#{item.id.substring(0, 8)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
              </View>
            </View>

            <View style={styles.invoiceDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ngày:</Text>
                <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tổng tiền:</Text>
                <Text style={styles.detailValue}>{item.finalTotal?.toLocaleString() || 0}đ</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Thanh toán:</Text>
                <Text style={styles.detailValue}>
                  {item.paymentMethod === 'cash' ? 'Tiền mặt' : 
                   item.paymentMethod === 'qr' ? 'Chuyển khoản QR' : 
                   item.paymentMethod}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Số món:</Text>
                <Text style={styles.detailValue}>
                  {item.items?.length || 0} món
                </Text>
              </View>
            </View>

            <View style={styles.viewDetailsContainer}>
              <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
              <FontAwesome name="angle-right" size={16} color="#1890ff" />
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="receipt" size={50} color="#d9d9d9" />
            <Text style={styles.emptyText}>Không có hóa đơn nào</Text>
          </View>
        }
      />
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
  invoiceItem: {
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
    padding: 15,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invoiceId: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invoiceIcon: {
    marginRight: 5,
  },
  invoiceIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1890ff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  invoiceDetails: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#1890ff',
    marginRight: 5,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default InvoiceListScreen;
