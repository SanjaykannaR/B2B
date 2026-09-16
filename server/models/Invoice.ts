import { Schema, model, Model, Types } from 'mongoose';

export const INVOICE_STATUSES = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface IInvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice {
  invoiceNumber: string;
  manifest: Types.ObjectId;
  client: Types.ObjectId;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issuedDate: Date;
  dueDate: Date;
  paidDate?: Date;
  lineItems: IInvoiceLineItem[];
}

export interface InvoiceModel extends Model<IInvoice> {}

const lineItemSchema = new Schema<IInvoiceLineItem>(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const invoiceSchema = new Schema<IInvoice, InvoiceModel>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    manifest: { type: Schema.Types.ObjectId, ref: 'Manifest', required: true },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: INVOICE_STATUSES, default: 'PENDING' },
    issuedDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    paidDate: { type: Date },
    lineItems: { type: [lineItemSchema], default: [] },
  },
  { timestamps: true },
);

invoiceSchema.index({ client: 1, status: 1 });
invoiceSchema.index({ invoiceNumber: 1 });

export const Invoice = model<IInvoice, InvoiceModel>('Invoice', invoiceSchema);
