'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

interface InvoiceItem {
    order_item_id: number;
    name_snapshot: string;
    quantity: number;
    unit_price: number;
    item_discount: number;
    subtotal: number;
    product_sku: string;
}

interface PaymentRecord {
    payment_id: number;
    payment_date: string;
    payment_method: string | null;
    amount_paid: number;
    reference_number: string | null;
    notes: string | null;
}

interface InvoiceDetail {
    invoice_id: number;
    invoice_number: string;
    transaction_id: number;
    customer_id: number;
    customer_name: string;
    customer_email: string;
    customer_mobile: string;
    customer_address: string;
    issue_date: string;
    due_date: string | null;
    total_amount: number;
    amount_paid: number;
    status: string;
    notes: string | null;
    items: InvoiceItem[];
    shipping_amount: number;
    tax_amount: number;
    payment_method_name: string;
    balance_remaining: number;
}

interface ShopInfo {
    shopName: string;
    ownerName: string;
    mobile: string;
    email?: string;
    address?: string;
}

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
        fontSize: 20,
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
    statusBadge: {
        textAlign: 'right',
        marginTop: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusDue: {
        backgroundColor: '#fef9c3',
        color: '#854d0e',
    },
    statusPaid: {
        backgroundColor: '#bbf7d0',
        color: '#166534',
    },
    statusOverdue: {
        backgroundColor: '#fecaca',
        color: '#991b1b',
    },
    statusVoid: {
        backgroundColor: '#e5e7eb',
        color: '#374151',
    },
    statusPartial: {
        backgroundColor: '#bfdbfe',
        color: '#1e40af',
    },
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    billTo: {
        flex: 1,
    },
    invoiceDetails: {
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
    summaryValueGreen: {
        fontWeight: 'bold',
        color: '#166534',
    },
    paymentSummary: {
        backgroundColor: '#f0fdf4',
        padding: 12,
        marginBottom: 20,
        borderRadius: 4,
    },
    paymentSummaryTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 8,
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
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: '#1f2937',
    },
    balanceLabelRed: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#dc2626',
    },
    balanceLabelGreen: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#166534',
    },
    balanceValueRed: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#dc2626',
    },
    balanceValueGreen: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#166534',
    },
    paymentHistory: {
        marginTop: 20,
        marginBottom: 20,
    },
    paymentHistoryTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    paymentTable: {
        marginTop: 8,
    },
    paymentTableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f9fafb',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
    },
    paymentTableHeaderCell: {
        fontWeight: 'bold',
        color: '#6b7280',
        fontSize: 9,
    },
    paymentTableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    colDate: {
        flex: 1.5,
    },
    colMethod: {
        flex: 1,
    },
    colAmount: {
        flex: 1,
        textAlign: 'right',
    },
    colAmountGreen: {
        flex: 1,
        textAlign: 'right',
        color: '#166534',
    },
    colReference: {
        flex: 1,
    },
    colNotes: {
        flex: 2,
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
    notes: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#fef9c3',
        borderRadius: 4,
    },
    notesTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#854d0e',
        marginBottom: 4,
    },
    notesText: {
        fontSize: 9,
        color: '#713f12',
    },
});

interface InvoicePDFProps {
    invoice: InvoiceDetail;
    shopInfo: ShopInfo;
    payments: PaymentRecord[];
    formatPrice: (amount: number) => string;
}

const InvoicePDFDocument: React.FC<InvoicePDFProps> = ({ invoice, shopInfo, payments, formatPrice }) => {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatPaymentDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusStyle = () => {
        switch (invoice.status) {
            case 'DUE': return styles.statusDue;
            case 'PAID': return styles.statusPaid;
            case 'OVERDUE': return styles.statusOverdue;
            case 'VOID': return styles.statusVoid;
            case 'PARTIAL': return styles.statusPartial;
            default: return styles.statusDue;
        }
    };

    const subtotal = (invoice.items || []).reduce((sum, item) => sum + item.subtotal, 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.shopName}>{shopInfo?.shopName || 'Your Shop Name'}</Text>
                        <Text style={styles.shopInfo}>Owner: {shopInfo?.ownerName || 'Owner Name'}</Text>
                        <Text style={styles.shopInfo}>Mobile: {shopInfo?.mobile || '01XXXXXXXXX'}</Text>
                        {shopInfo?.address && <Text style={styles.shopInfo}>{shopInfo.address}</Text>}
                    </View>
                    <View>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.invoiceInfo}>Invoice #: {invoice.invoice_number}</Text>
                        <Text style={styles.invoiceInfo}>Issue Date: {formatDate(invoice.issue_date)}</Text>
                        {invoice.due_date && <Text style={styles.invoiceInfo}>Due Date: {formatDate(invoice.due_date)}</Text>}
                        <View style={styles.statusBadge}>
                            <Text style={[styles.statusText, getStatusStyle()]}>{invoice.status}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.billTo}>
                        <Text style={styles.sectionLabel}>Bill To:</Text>
                        <Text style={styles.customerName}>{invoice.customer_name || 'Customer'}</Text>
                        {invoice.customer_mobile && <Text style={styles.shopInfo}>Mobile: {invoice.customer_mobile}</Text>}
                        {invoice.customer_email && <Text style={styles.shopInfo}>Email: {invoice.customer_email}</Text>}
                        {invoice.customer_address && <Text style={styles.shopInfo}>{invoice.customer_address}</Text>}
                    </View>
                    <View style={styles.invoiceDetails}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Order #:</Text>
                            <Text style={styles.detailValue}>{invoice.transaction_id}</Text>
                        </View>
                        {invoice.payment_method_name && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Payment Method:</Text>
                                <Text style={styles.detailValue}>{invoice.payment_method_name}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, styles.colProduct]}>Product</Text>
                        <Text style={[styles.tableHeaderCell, styles.colSku]}>SKU</Text>
                        <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
                        <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit Price</Text>
                        <Text style={[styles.tableHeaderCell, styles.colDiscount]}>Discount</Text>
                        <Text style={[styles.tableHeaderCell, styles.colSubtotal]}>Subtotal</Text>
                    </View>
                    {(invoice.items || []).map((item) => (
                        <View key={item.order_item_id} style={styles.tableRow}>
                            <Text style={styles.colProduct}>{item.name_snapshot}</Text>
                            <Text style={styles.colSku}>{item.product_sku || '-'}</Text>
                            <Text style={styles.colQty}>{item.quantity}</Text>
                            <Text style={styles.colPrice}>{formatPrice(item.unit_price)}</Text>
                            <Text style={styles.colDiscount}>{formatPrice(item.item_discount)}</Text>
                            <Text style={styles.colSubtotal}>{formatPrice(item.subtotal)}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.summaryContainer}>
                    <View style={styles.summary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal:</Text>
                            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
                        </View>
                        {invoice.shipping_amount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Shipping:</Text>
                                <Text style={styles.summaryValue}>{formatPrice(invoice.shipping_amount)}</Text>
                            </View>
                        )}
                        {invoice.tax_amount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Tax:</Text>
                                <Text style={styles.summaryValue}>{formatPrice(invoice.tax_amount)}</Text>
                            </View>
                        )}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Amount:</Text>
                            <Text style={styles.totalValue}>{formatPrice(invoice.total_amount)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.paymentSummary}>
                    <Text style={styles.paymentSummaryTitle}>Payment Summary</Text>
                    <View style={styles.summary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Amount:</Text>
                            <Text style={styles.summaryValue}>{formatPrice(invoice.total_amount)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Amount Paid:</Text>
                            <Text style={styles.summaryValueGreen}>{formatPrice(invoice.amount_paid || 0)}</Text>
                        </View>
                        <View style={[styles.balanceRow, { marginTop: 8 }]}>
                            <Text style={invoice.balance_remaining > 0 ? styles.balanceLabelRed : styles.balanceLabelGreen}>
                                Balance Remaining:
                            </Text>
                            <Text style={invoice.balance_remaining > 0 ? styles.balanceValueRed : styles.balanceValueGreen}>
                                {formatPrice(invoice.balance_remaining)}
                            </Text>
                        </View>
                    </View>
                </View>

                {payments && payments.length > 0 && (
                    <View style={styles.paymentHistory}>
                        <Text style={styles.paymentHistoryTitle}>Payment History</Text>
                        <View style={styles.paymentTable}>
                            <View style={styles.paymentTableHeader}>
                                <Text style={[styles.paymentTableHeaderCell, styles.colDate]}>Date</Text>
                                <Text style={[styles.paymentTableHeaderCell, styles.colMethod]}>Method</Text>
                                <Text style={[styles.paymentTableHeaderCell, styles.colAmount]}>Amount</Text>
                                <Text style={[styles.paymentTableHeaderCell, styles.colReference]}>Reference</Text>
                                <Text style={[styles.paymentTableHeaderCell, styles.colNotes]}>Notes</Text>
                            </View>
                            {payments.map((payment) => (
                                <View key={payment.payment_id} style={styles.paymentTableRow}>
                                    <Text style={styles.colDate}>{formatPaymentDate(payment.payment_date)}</Text>
                                    <Text style={styles.colMethod}>{payment.payment_method || '-'}</Text>
                                    <Text style={styles.colAmountGreen}>{formatPrice(payment.amount_paid)}</Text>
                                    <Text style={styles.colReference}>{payment.reference_number || '-'}</Text>
                                    <Text style={styles.colNotes}>{payment.notes || '-'}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {invoice.notes && (
                    <View style={styles.notes}>
                        <Text style={styles.notesTitle}>Notes:</Text>
                        <Text style={styles.notesText}>{invoice.notes}</Text>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Thank you for your business!</Text>
                    <Text style={styles.footerSubtext}>This is a computer-generated invoice</Text>
                </View>
            </Page>
        </Document>
    );
};

export const downloadInvoicePdf = async (
    invoice: InvoiceDetail,
    shopInfo: ShopInfo,
    payments: PaymentRecord[],
    formatPrice: (amount: number) => string
) => {
    const blob = await pdf(
        <InvoicePDFDocument invoice={invoice} shopInfo={shopInfo} payments={payments} formatPrice={formatPrice} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.invoice_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export default InvoicePDFDocument;
