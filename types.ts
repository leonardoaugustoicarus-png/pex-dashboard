export interface Product {
    id: string;
    name: string;
    batch: string;
    quantity: number;
    expiryDate: string; // YYYY-MM-DD
    daysRemaining: number;
    status: 'safe' | 'critical' | 'expired';
    ean?: string;
    registration?: string; // Matricula
    section?: string;
    transfer?: string;
    notes?: string;
    isAnimatingOut?: boolean;
}

export interface SaleRecord extends Product {
    quantitySold: number;
    sellerId: string;
    saleDate: string; // ISO String
}
