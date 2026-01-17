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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#1f2937',
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  shopInfo: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'right',
  },
  invoiceInfo: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  billTo: {
    flex: 1,
  },
  orderDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },
  sectionLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 11,
    color: '#1f2937',
  },
  customerName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#6b7280',
    marginRight: 4,
    fontSize: 9,
  },
  detailValue: {
    fontSize: 9,
    color: '#374151',
  },
  statusDelivered: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  statusCancelled: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  statusDefault: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  table: {
    marginTop: 8,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#d1d5db',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#374151',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  colProduct: {
    flex: 2.5,
  },
  colSku: {
    flex: 1.5,
  },
  colQty: {
    flex: 0.8,
    textAlign: 'center',
  },
  colPrice: {
    flex: 1.2,
    textAlign: 'right',
  },
  colDiscount: {
    flex: 1.2,
    textAlign: 'right',
  },
  colSubtotal: {
    flex: 1.2,
    textAlign: 'right',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  summary: {
    width: 200,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#374151',
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#d1d5db',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    textAlign: 'center',
  },
  footerText: {
    fontStyle: 'italic',
    color: '#6b7280',
    fontSize: 9,
    marginBottom: 4,
  },
  footerSubtext: {
    color: '#9ca3af',
    fontSize: 8,
  },
});

interface InvoiceDocumentProps {
  order: Order;
  shopInfo?: {
    name: string;
    owner: string;
    mobile: string;
    address?: string;
  };
  formatPrice: (amount: number) => string;
}

// PDF Document Component
const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ order, shopInfo, formatPrice }) => {
  const invoiceDate = new Date(order.order_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getStatusStyle = (status: string) => {
    if (status === 'DELIVERED') return styles.statusDelivered;
    if (status === 'CANCELLED') return styles.statusCancelled;
    return styles.statusDefault;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.shopName}>{shopInfo?.name || 'Invoice'}</Text>
            {shopInfo?.owner && <Text style={styles.shopInfo}>Owner: {shopInfo.owner}</Text>}
            {shopInfo?.mobile && <Text style={styles.shopInfo}>Mobile: {shopInfo.mobile}</Text>}
            {shopInfo?.address && <Text style={styles.shopInfo}>{shopInfo.address}</Text>}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceInfo}>Invoice #{order.transaction_id}</Text>
            <Text style={styles.invoiceInfo}>Date: {invoiceDate}</Text>
          </View>
        </View>

        {/* Bill To & Order Details */}
        <View style={styles.infoSection}>
          <View style={styles.billTo}>
            <Text style={styles.sectionLabel}>Bill To:</Text>
            <Text style={styles.customerName}>{order.customer_name}</Text>
            {order.customer_mobile && <Text style={styles.shopInfo}>Mobile: {order.customer_mobile}</Text>}
            {order.customer_email && <Text style={styles.shopInfo}>Email: {order.customer_email}</Text>}
            {order.customer_address && <Text style={styles.shopInfo}>{order.customer_address}</Text>}
          </View>
          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Source:</Text>
              <Text style={styles.detailValue}>{order.order_source}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment:</Text>
              <Text style={styles.detailValue}>{order.payment_method_name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, getStatusStyle(order.order_status)]}>{order.order_status}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colProduct]}>Product</Text>
            <Text style={[styles.tableHeaderCell, styles.colSku]}>SKU</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderCell, styles.colDiscount]}>Discount</Text>
            <Text style={[styles.tableHeaderCell, styles.colSubtotal]}>Subtotal</Text>
          </View>
          {order.items?.map((item) => (
            <View key={item.order_item_id} style={styles.tableRow}>
              <Text style={styles.colProduct}>{item.name_snapshot}</Text>
              <Text style={styles.colSku}>{item.product_sku || '-'}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatPrice(parseFloat(item.unit_price.toString()))}</Text>
              <Text style={styles.colDiscount}>{formatPrice(parseFloat(item.item_discount.toString()))}</Text>
              <Text style={styles.colSubtotal}>{formatPrice(parseFloat(item.subtotal.toString()))}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.summaryContainer}>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(order.items?.reduce((sum, item) => sum + parseFloat(item.subtotal.toString()), 0) || 0)}
              </Text>
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
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerSubtext}>This is a computer-generated invoice</Text>
        </View>
      </Page>
    </Document>
  );
};

// Function to generate and download PDF
export const downloadInvoicePdf = async (
  order: Order,
  shopInfo: {
    name: string;
    owner: string;
    mobile: string;
    address?: string;
  } | undefined,
  formatPrice: (amount: number) => string
) => {
  const blob = await pdf(
    <InvoiceDocument order={order} shopInfo={shopInfo} formatPrice={formatPrice} />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${order.transaction_id}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default InvoiceDocument;
