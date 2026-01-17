'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { Order } from '@/services/orderService';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    backgroundColor: '#1e293b',
    padding: 24,
    marginBottom: 20,
    marginHorizontal: -40,
    marginTop: -40,
  },
  headerText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shopInfo: {
    fontSize: 9,
    opacity: 0.9,
  },
  section: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billTo: {
    marginBottom: 4,
  },
  billToLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 11,
  },
  customerName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  dateInfo: {
    textAlign: 'right',
    color: '#6b7280',
    fontSize: 9,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    marginVertical: 12,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#d1d5db',
    paddingBottom: 8,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  colProduct: {
    flex: 3,
  },
  colQty: {
    flex: 1,
    textAlign: 'center',
  },
  colPrice: {
    flex: 1.5,
    textAlign: 'right',
  },
  colTotal: {
    flex: 1.5,
    textAlign: 'right',
  },
  summary: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#d1d5db',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  summaryLabel: {
    width: 100,
    textAlign: 'right',
    color: '#6b7280',
  },
  summaryValue: {
    width: 80,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#1e293b',
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  contactSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  contactText: {
    textAlign: 'center',
    fontSize: 9,
    color: '#6b7280',
  },
  footer: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    textAlign: 'center',
  },
  footerText: {
    fontStyle: 'italic',
    color: '#6b7280',
    fontSize: 9,
  },
});

interface MemoDocumentProps {
  order: Order;
  shopInfo: {
    shopName: string;
    ownerName: string;
    mobile: string;
    email?: string;
    address?: string;
  };
  formatPrice: (amount: number) => string;
}

// PDF Document Component
const MemoDocument: React.FC<MemoDocumentProps> = ({ order, shopInfo, formatPrice }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subtotal = (order.items || []).reduce((sum, item) =>
    sum + parseFloat(item.subtotal.toString()), 0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.shopName}>{shopInfo?.shopName || 'Your Shop Name'}</Text>
            <Text style={styles.shopInfo}>Owner: {shopInfo?.ownerName || 'Owner Name'}</Text>
            <Text style={styles.shopInfo}>Mobile: {shopInfo?.mobile || '01XXXXXXXXX'}</Text>
            {shopInfo?.address && <Text style={styles.shopInfo}>{shopInfo.address}</Text>}
          </View>
        </View>

        {/* Customer Info & Date */}
        <View style={styles.row}>
          <View style={styles.billTo}>
            <Text style={styles.billToLabel}>Bill To:</Text>
            <Text style={styles.customerName}>{order.customer_name || 'Customer'}</Text>
            <Text style={styles.shopInfo}>{order.customer_mobile || '-'}</Text>
            {order.customer_address && <Text style={styles.shopInfo}>{order.customer_address}</Text>}
          </View>
          <View>
            <Text style={styles.dateInfo}>Date: {currentDate}</Text>
            <Text style={styles.dateInfo}>Memo #: {order.transaction_id}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Products Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colProduct]}>Product</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
          </View>
          {(order.items || []).map((item) => (
            <View key={item.order_item_id} style={styles.tableRow}>
              <Text style={styles.colProduct}>{item.name_snapshot}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatPrice(parseFloat(item.unit_price.toString()))}</Text>
              <Text style={styles.colTotal}>{formatPrice(parseFloat(item.subtotal.toString()))}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          {parseFloat(order.shipping_amount.toString()) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping:</Text>
              <Text style={styles.summaryValue}>{formatPrice(parseFloat(order.shipping_amount.toString()))}</Text>
            </View>
          )}
          {parseFloat(order.tax_amount.toString()) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax:</Text>
              <Text style={styles.summaryValue}>{formatPrice(parseFloat(order.tax_amount.toString()))}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>{formatPrice(parseFloat(order.total_amount.toString()))}</Text>
          </View>
        </View>

        {/* Contact Info */}
        {shopInfo?.email && (
          <View style={styles.contactSection}>
            <Text style={styles.contactText}>Contact Information</Text>
            <Text style={styles.contactText}>Email: {shopInfo.email}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
};

// Function to generate and download PDF
export const downloadMemoPdf = async (
  order: Order,
  shopInfo: {
    shopName: string;
    ownerName: string;
    mobile: string;
    email?: string;
    address?: string;
  },
  formatPrice: (amount: number) => string
) => {
  const blob = await pdf(
    <MemoDocument order={order} shopInfo={shopInfo} formatPrice={formatPrice} />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `memo-${order.transaction_id}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default MemoDocument;
