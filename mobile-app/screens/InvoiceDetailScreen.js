import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, ActivityIndicator, Alert, Share
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const InvoiceDetailScreen = ({ route, navigation }) => {
  const { id, invoice: initialInvoice } = route.params;
  const [invoice, setInvoice] = useState(initialInvoice || null);
  const [loading, setLoading] = useState(!initialInvoice);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!initialInvoice) {
      loadInvoiceData();
    }
  }, [initialInvoice]);

  const loadInvoiceData = async () => {
    setLoading(true);
    try {
      const invoiceDoc = await getDoc(doc(db, 'invoices', id));
      if (invoiceDoc.exists()) {
        const data = invoiceDoc.data();
        setInvoice({
          id: invoiceDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy hóa đơn');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const updateInvoiceStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'invoices', id), { status: newStatus });
      setInvoice({ ...invoice, status: newStatus });
      Alert.alert('Thành công', `Đã cập nhật trạng thái hóa đơn thành ${getStatusText(newStatus)}`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái hóa đơn');
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkAsPaid = () => {
    Alert.alert(
      'Xác nhận thanh toán',
      'Bạn có chắc chắn muốn đánh dấu hóa đơn này là đã thanh toán?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: () => updateInvoiceStatus('paid') }
      ]
    );
  };

  const handleCancelInvoice = () => {
    Alert.alert(
      'Xác nhận hủy',
      'Bạn có chắc chắn muốn hủy hóa đơn này?',
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Có, hủy hóa đơn', style: 'destructive', onPress: () => updateInvoiceStatus('cancelled') }
      ]
    );
  };

  const shareInvoice = async () => {
    try {
      const invoiceDate = new Date(invoice.createdAt).toLocaleString('vi-VN');
      const items = invoice.items.map(item => 
        `${item.name} (${item.size}) x${item.quantity}: ${(item.price * item.quantity).toLocaleString()}đ`
      ).join('\n');

      const message = `CHI TIẾT HÓA ĐƠN #${id.substring(0, 8)}\n\n` +
        `Ngày: ${invoiceDate}\n` +
        `Trạng thái: ${getStatusText(invoice.status)}\n` +
        `-------------------\n` +
        `${items}\n` +
        `-------------------\n` +
        `Tổng tiền: ${invoice.total?.toLocaleString() || 0}đ\n` +
        `Giảm giá: ${invoice.discount?.toLocaleString() || 0}đ\n` +
        `Thành tiền: ${invoice.finalTotal?.toLocaleString() || 0}đ\n` +
        `Phương thức: ${invoice.paymentMethod === 'cash' ? 'Tiền mặt' : 
                      invoice.paymentMethod === 'qr' ? 'Chuyển khoản QR' : 
                      invoice.paymentMethod}`;

      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing invoice:', error);
      Alert.alert('Lỗi', 'Không thể chia sẻ hóa đơn');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1890ff" />
        <Text style={styles.loadingText}>Đang tải chi tiết hóa đơn...</Text>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.centered}>
        <FontAwesome name="exclamation-triangle" size={50} color="#ff4d4f" />
        <Text style={styles.errorText}>Không thể tải thông tin hóa đơn</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadInvoiceData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Invoice Header */}
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceId}>
            <FontAwesome name="file-text-o" size={20} color="#1890ff" style={styles.invoiceIcon} />
            <Text style={styles.invoiceIdText}>#{id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
            <Text style={styles.statusText}>{getStatusText(invoice.status)}</Text>
          </View>
        </View>

        {/* Invoice Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày tạo:</Text>
            <Text style={styles.infoValue}>{formatDate(invoice.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thanh toán:</Text>
            <Text style={styles.infoValue}>
              {invoice.paymentMethod === 'cash' ? 'Tiền mặt' : 
               invoice.paymentMethod === 'qr' ? 'Chuyển khoản QR' : 
               invoice.paymentMethod}
            </Text>
          </View>
          {invoice.staffName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nhân viên:</Text>
              <Text style={styles.infoValue}>{invoice.staffName}</Text>
            </View>
          )}
        </View>

        {/* Items List */}
        <View style={styles.sectionTitle}>
          <FontAwesome name="list" size={16} color="#1890ff" style={{marginRight: 5}} />
          <Text style={styles.sectionTitleText}>Danh sách món</Text>
        </View>

        <View style={styles.itemsCard}>
          {invoice.items && invoice.items.length > 0 ? (
            invoice.items.map((item, index) => (
              <View key={item.key || index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSize}>{item.size}</Text>
                </View>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                <Text style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()}đ</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noItems}>Không có sản phẩm</Text>
          )}
        </View>

        {/* Total Section */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng tiền:</Text>
            <Text style={styles.totalValue}>{invoice.total?.toLocaleString() || 0}đ</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Giảm giá:</Text>
            <Text style={styles.discountValue}>{invoice.discount?.toLocaleString() || 0}đ</Text>
          </View>

          <View style={[styles.totalRow, styles.finalRow]}>
            <Text style={styles.finalLabel}>Thành tiền:</Text>
            <Text style={styles.finalValue}>{invoice.finalTotal?.toLocaleString() || 0}đ</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {invoice.status === 'unpaid' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.markAsPaidButton]}
              onPress={handleMarkAsPaid}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <FontAwesome name="check" size={16} color="white" style={{marginRight: 5}} />
                  <Text style={styles.actionButtonText}>Đánh dấu đã thanh toán</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {invoice.status !== 'cancelled' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelInvoice}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <FontAwesome name="times" size={16} color="white" style={{marginRight: 5}} />
                  <Text style={styles.actionButtonText}>Hủy hóa đơn</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.actionButton, styles.shareButton]}
            onPress={shareInvoice}
          >
            <FontAwesome name="share-alt" size={16} color="white" style={{marginRight: 5}} />
            <Text style={styles.actionButtonText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ff4d4f',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1890ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  invoiceId: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invoiceIcon: {
    marginRight: 8,
  },
  invoiceIdText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1890ff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: 'white',
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 8,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1890ff',
  },
  itemsCard: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 3,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemSize: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  itemQuantity: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },
  itemPrice: {
    flex: 2,
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '500',
  },
  noItems: {
    textAlign: 'center',
    padding: 20,
    color: '#999',
  },
  totalCard: {
    backgroundColor: 'white',
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 8,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 15,
    color: '#666',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  discountValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ff4d4f',
  },
  finalRow: {
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  finalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  finalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1890ff',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 4,
    marginVertical: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  markAsPaidButton: {
    backgroundColor: '#52c41a',
  },
  cancelButton: {
    backgroundColor: '#ff4d4f',
  },
  shareButton: {
    backgroundColor: '#1890ff',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default InvoiceDetailScreen;
