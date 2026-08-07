// Service for: Auto-generate invoice from completed manifest
// Module: Backend Services (Module 6) | Owner: Developer 1
// Cost = distance x contractRate, creates invoice with 30-day payment window

import Invoice, { InvoiceDocument, InvoiceLineItem } from '../models/Invoice';
import { generateInvoiceNumber, addDaysISO } from '../utils/helpers';

const WEIGHT_SURCHARGE_PER_KG = 0.05;

export interface InvoiceInput {
  manifestId: string;
  clientId: string;
  distanceKm: number;
  weight: number;
  contractRate: number;
  description: string;
}

export async function generateInvoice(input: InvoiceInput): Promise<InvoiceDocument> {
  const distanceCharge = Math.round(input.distanceKm * input.contractRate * 100) / 100;
  const weightCharge = Math.round(input.weight * WEIGHT_SURCHARGE_PER_KG * 100) / 100;
  const amount = Math.round((distanceCharge + weightCharge) * 100) / 100;

  const lineItems: InvoiceLineItem[] = [
    {
      description: `Freight transport — ${input.distanceKm.toFixed(1)} km (${input.description})`,
      quantity: 1,
      unitPrice: distanceCharge,
      total: distanceCharge,
    },
    {
      description: 'Cargo weight surcharge',
      quantity: input.weight,
      unitPrice: WEIGHT_SURCHARGE_PER_KG,
      total: weightCharge,
    },
  ];

  const issuedDate = new Date();
  const dueDate = addDaysISO(30, issuedDate);

  const invoice = await Invoice.create({
    invoiceNumber: generateInvoiceNumber(),
    manifest: input.manifestId,
    client: input.clientId,
    amount,
    currency: 'USD',
    status: 'Pending',
    issuedDate,
    dueDate,
    lineItems,
  });

  return invoice;
}

export default { generateInvoice };
