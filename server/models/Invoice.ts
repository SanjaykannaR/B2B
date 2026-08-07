// This file is for: Invoice Mongoose model — financial billing records
// Module: Database Models (Module 3)
// Owner: Developer 1 (Backend Engineer)
// Schema: invoiceNumber, manifest, client, amount, currency, status (Pending|Paid|Overdue|Cancelled),
//         issuedDate, dueDate, paidDate, lineItems[{description, quantity, unitPrice, total}]
// Indexes: client+status, invoiceNumber

import { Schema, model, Document, Types } from 'mongoose';

export type InvoiceStatus = 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceDocument extends Document {
  invoiceNumber: string;
  manifest: Types.ObjectId;
  client: Types.ObjectId;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issuedDate: Date;
  dueDate: Date;
  paidDate?: Date;
  lineItems: InvoiceLineItem[];
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
    },
    manifest: { type: Schema.Types.ObjectId, ref: 'Manifest', required: true },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Pending',
      required: true,
    },
    issuedDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    lineItems: [
      {
        description: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 0 },
        unitPrice: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

invoiceSchema.index({ client: 1, status: 1 });

const Invoice = model<InvoiceDocument>('Invoice', invoiceSchema);
export default Invoice;
