'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

export interface TemplateConfig {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    headerStyle: string;
    borderStyle: string;
    tableStyle: string;
    showLogo: boolean;
    showFooter: boolean;
    showWatermark: boolean;
}

export interface TemplateInvoiceData {
    shopName?: string;
    shopMobile?: string;
    shopAddress?: string;
    shopLogo?: string;
    customerName: string;
    customerMobile?: string;
    customerAddress?: string;
    items: Array<{ name: string; quantity: number; price: number; total: number }>;
    subtotal: number;
    deliveryCharge: number;
    discount: number;
    totalAmount: number;
    paymentMethod: string;
    notes?: string;
    invoiceTitle?: string;
    itemsHeader?: string;
}

interface TemplateInvoicePdfProps {
    template: {
        layout_type: string;
        config: TemplateConfig;
    };
    data: TemplateInvoiceData;
}

const createStyles = (config: TemplateConfig) =>
    StyleSheet.create({
        page: {
            padding: 40,
            fontFamily: 'Helvetica',
            fontSize: 10,
        },
        // Classic header
        headerClassic: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottomWidth: 2,
            borderBottomColor: config.primaryColor,
        },
        // Modern header - full-width colored band
        headerModern: {
            backgroundColor: config.primaryColor,
            padding: 24,
            marginHorizontal: -40,
            marginTop: -40,
            marginBottom: 20,
        },
        headerModernInner: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 40,
        },
        // Minimal header
        headerMinimal: {
            marginBottom: 24,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
        },
        // Bold header
        headerBold: {
            backgroundColor: config.primaryColor,
            padding: 20,
            marginHorizontal: -40,
            marginTop: -40,
            marginBottom: 20,
            borderBottomWidth: 4,
            borderBottomColor: config.accentColor,
        },
        headerBoldInner: {
            paddingHorizontal: 40,
            textAlign: 'center',
        },
        shopName: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 4,
        },
        shopNameLight: {
            fontSize: 22,
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: 4,
        },
        shopNameBold: {
            fontSize: 26,
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: 6,
            textAlign: 'center',
        },
        shopInfo: {
            fontSize: 9,
            color: '#6b7280',
            marginBottom: 2,
        },
        shopInfoLight: {
            fontSize: 9,
            color: 'rgba(255,255,255,0.85)',
            marginBottom: 2,
        },
        invoiceTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: config.primaryColor,
            textAlign: 'right',
        },
        invoiceTitleLight: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'right',
        },
        invoiceTitleBold: {
            fontSize: 24,
            fontWeight: 'bold',
            color: config.accentColor,
            textAlign: 'center',
            marginTop: 8,
        },
        invoiceInfo: {
            fontSize: 9,
            color: '#6b7280',
            textAlign: 'right',
            marginTop: 4,
        },
        invoiceInfoLight: {
            fontSize: 9,
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'right',
            marginTop: 4,
        },
        // Customer section
        infoSection: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        billTo: {
            flex: 1,
        },
        sectionLabel: {
            fontWeight: 'bold',
            marginBottom: 4,
            fontSize: 11,
            color: config.primaryColor,
        },
        sectionLabelMinimal: {
            fontWeight: 'bold',
            marginBottom: 4,
            fontSize: 10,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        customerName: {
            fontWeight: 'bold',
            marginBottom: 2,
            color: '#1f2937',
        },
        detailText: {
            fontSize: 9,
            color: '#6b7280',
            marginBottom: 2,
        },
        // Table
        table: {
            marginTop: 8,
            marginBottom: 20,
        },
        tableHeader: {
            flexDirection: 'row',
            backgroundColor: config.primaryColor,
            paddingVertical: 8,
            paddingHorizontal: 8,
        },
        tableHeaderMinimal: {
            flexDirection: 'row',
            paddingVertical: 8,
            paddingHorizontal: 8,
            borderBottomWidth: 2,
            borderBottomColor: '#e5e7eb',
        },
        tableHeaderCell: {
            fontWeight: 'bold',
            color: '#ffffff',
            fontSize: 9,
        },
        tableHeaderCellDark: {
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
        tableRowStriped: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            paddingVertical: 8,
            paddingHorizontal: 8,
            backgroundColor: '#f9fafb',
        },
        colProduct: { flex: 3 },
        colQty: { flex: 1, textAlign: 'center' },
        colPrice: { flex: 1.5, textAlign: 'right' },
        colTotal: { flex: 1.5, textAlign: 'right' },
        cellText: {
            fontSize: 9,
            color: '#374151',
        },
        // Summary
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
            fontSize: 10,
        },
        summaryValue: {
            fontWeight: 'bold',
            fontSize: 10,
        },
        totalRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 2,
            borderTopColor: config.primaryColor,
        },
        totalLabel: {
            fontSize: 13,
            fontWeight: 'bold',
            color: config.primaryColor,
        },
        totalValue: {
            fontSize: 13,
            fontWeight: 'bold',
            color: config.primaryColor,
        },
        // Payment badge
        paymentBadge: {
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 4,
            marginBottom: 16,
            alignSelf: 'flex-start',
        },
        paymentBadgeCod: {
            backgroundColor: '#fef9c3',
        },
        paymentBadgePaid: {
            backgroundColor: '#bbf7d0',
        },
        paymentText: {
            fontSize: 10,
            fontWeight: 'bold',
        },
        paymentTextCod: {
            color: '#854d0e',
        },
        paymentTextPaid: {
            color: '#166534',
        },
        // Notes
        notes: {
            marginTop: 12,
            padding: 12,
            backgroundColor: '#f9fafb',
            borderRadius: 4,
        },
        notesTitle: {
            fontSize: 10,
            fontWeight: 'bold',
            color: '#374151',
            marginBottom: 4,
        },
        notesText: {
            fontSize: 9,
            color: '#6b7280',
        },
        // Footer
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
        watermark: {
            color: '#9ca3af',
            fontSize: 8,
            textAlign: 'center',
            marginTop: 8,
        },
    });

const TemplateInvoicePDFDocument: React.FC<TemplateInvoicePdfProps> = ({ template, data }) => {
    const config = template.config;
    const styles = createStyles(config);
    const layoutType = template.layout_type;

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const memoNumber = Date.now().toString().slice(-6);

    const renderHeader = () => {
        switch (layoutType) {
            case 'modern':
                return (
                    <View style={styles.headerModern}>
                        <View style={styles.headerModernInner}>
                            <View>
                                <Text style={styles.shopNameLight}>{data.shopName || 'Your Shop Name'}</Text>
                                <Text style={styles.shopInfoLight}>Mobile: {data.shopMobile || 'N/A'}</Text>
                                {data.shopAddress && <Text style={styles.shopInfoLight}>{data.shopAddress}</Text>}
                            </View>
                            <View>
                                <Text style={styles.invoiceTitleLight}>{data.invoiceTitle || 'INVOICE'}</Text>
                                <Text style={styles.invoiceInfoLight}>Date: {currentDate}</Text>
                                <Text style={styles.invoiceInfoLight}>Memo #: {memoNumber}</Text>
                            </View>
                        </View>
                    </View>
                );
            case 'minimal':
                return (
                    <View style={styles.headerMinimal}>
                        <Text style={{ ...styles.shopName, fontSize: 16 }}>{data.shopName || 'Your Shop Name'}</Text>
                        <Text style={styles.shopInfo}>{data.shopMobile || ''} {data.shopAddress ? `| ${data.shopAddress}` : ''}</Text>
                        <Text style={{ ...styles.invoiceInfo, textAlign: 'left', marginTop: 8, fontSize: 11, color: '#374151' }}>
                            {data.invoiceTitle || 'Invoice'} #{memoNumber} | {currentDate}
                        </Text>
                    </View>
                );
            case 'bold':
                return (
                    <View style={styles.headerBold}>
                        <View style={styles.headerBoldInner}>
                            <Text style={styles.shopNameBold}>{data.shopName || 'YOUR SHOP NAME'}</Text>
                            <Text style={{ ...styles.shopInfoLight, textAlign: 'center' }}>
                                {data.shopMobile || ''} {data.shopAddress ? `| ${data.shopAddress}` : ''}
                            </Text>
                            <Text style={styles.invoiceTitleBold}>{data.invoiceTitle || 'INVOICE'}</Text>
                            <Text style={{ ...styles.shopInfoLight, textAlign: 'center' }}>Date: {currentDate} | Memo #: {memoNumber}</Text>
                        </View>
                    </View>
                );
            default: // classic
                return (
                    <View style={styles.headerClassic}>
                        <View>
                            <Text style={styles.shopName}>{data.shopName || 'Your Shop Name'}</Text>
                            <Text style={styles.shopInfo}>Mobile: {data.shopMobile || 'N/A'}</Text>
                            {data.shopAddress && <Text style={styles.shopInfo}>{data.shopAddress}</Text>}
                        </View>
                        <View>
                            <Text style={styles.invoiceTitle}>{data.invoiceTitle || 'INVOICE'}</Text>
                            <Text style={styles.invoiceInfo}>Date: {currentDate}</Text>
                            <Text style={styles.invoiceInfo}>Memo #: {memoNumber}</Text>
                        </View>
                    </View>
                );
        }
    };

    const isMinimal = layoutType === 'minimal';
    const isStriped = config.tableStyle === 'striped';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {renderHeader()}

                {/* Customer Info */}
                <View style={styles.infoSection}>
                    <View style={styles.billTo}>
                        <Text style={isMinimal ? styles.sectionLabelMinimal : styles.sectionLabel}>Bill To:</Text>
                        <Text style={styles.customerName}>{data.customerName || 'Customer Name'}</Text>
                        {data.customerMobile && <Text style={styles.detailText}>Mobile: {data.customerMobile}</Text>}
                        {data.customerAddress && <Text style={styles.detailText}>{data.customerAddress}</Text>}
                    </View>
                </View>

                {/* Items Header */}
                {data.itemsHeader && (
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#374151', marginBottom: 4 }}>
                        {data.itemsHeader}
                    </Text>
                )}

                {/* Products Table */}
                <View style={styles.table}>
                    <View style={isMinimal ? styles.tableHeaderMinimal : styles.tableHeader}>
                        <Text style={[isMinimal ? styles.tableHeaderCellDark : styles.tableHeaderCell, styles.colProduct]}>Product</Text>
                        <Text style={[isMinimal ? styles.tableHeaderCellDark : styles.tableHeaderCell, styles.colQty]}>Qty</Text>
                        <Text style={[isMinimal ? styles.tableHeaderCellDark : styles.tableHeaderCell, styles.colPrice]}>Price</Text>
                        <Text style={[isMinimal ? styles.tableHeaderCellDark : styles.tableHeaderCell, styles.colTotal]}>Total</Text>
                    </View>
                    {data.items.filter(item => item.name && item.price > 0).map((item, index) => (
                        <View
                            key={index}
                            style={isStriped && index % 2 === 1 ? styles.tableRowStriped : styles.tableRow}
                        >
                            <Text style={[styles.cellText, styles.colProduct]}>{item.name}</Text>
                            <Text style={[styles.cellText, styles.colQty]}>{item.quantity}</Text>
                            <Text style={[styles.cellText, styles.colPrice]}>${item.price.toFixed(2)}</Text>
                            <Text style={[styles.cellText, styles.colTotal]}>${item.total.toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                {/* Payment Method */}
                <View style={[styles.paymentBadge, data.paymentMethod === 'cod' ? styles.paymentBadgeCod : styles.paymentBadgePaid]}>
                    <Text style={[styles.paymentText, data.paymentMethod === 'cod' ? styles.paymentTextCod : styles.paymentTextPaid]}>
                        {data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Already Paid'}
                    </Text>
                </View>

                {/* Summary */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal:</Text>
                            <Text style={styles.summaryValue}>${data.subtotal.toFixed(2)}</Text>
                        </View>
                        {data.deliveryCharge > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery:</Text>
                                <Text style={styles.summaryValue}>${data.deliveryCharge.toFixed(2)}</Text>
                            </View>
                        )}
                        {data.discount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Discount:</Text>
                                <Text style={{ ...styles.summaryValue, color: '#dc2626' }}>-${data.discount.toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total:</Text>
                            <Text style={styles.totalValue}>${data.totalAmount.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Notes */}
                {data.notes && (
                    <View style={styles.notes}>
                        <Text style={styles.notesTitle}>Notes:</Text>
                        <Text style={styles.notesText}>{data.notes}</Text>
                    </View>
                )}

                {/* Footer */}
                {config.showFooter && (
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Thank you for your business!</Text>
                        <Text style={{ ...styles.footerText, fontStyle: 'normal' }}>This is a computer-generated document</Text>
                    </View>
                )}

                {/* Watermark */}
                {config.showWatermark && (
                    <Text style={styles.watermark}>Created with EzyMemo - ezymemo.com</Text>
                )}
            </Page>
        </Document>
    );
};

export const downloadTemplateInvoicePdf = async (
    template: { layout_type: string; config: TemplateConfig },
    data: TemplateInvoiceData
) => {
    const blob = await pdf(
        <TemplateInvoicePDFDocument template={template} data={data} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${Date.now().toString().slice(-6)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export default TemplateInvoicePDFDocument;
