import { Manifest } from '../models/Manifest';
import { Invoice } from '../models/Invoice';
import { generateInvoiceNumber } from '../utils/helpers';

export const DEFAULT_CONTRACT_RATE = 12; // ₹ per km

/**
 * Build + persist an invoice from a delivered manifest.
 * Cost = distance × client.contractRate. 30-day payment window.
 * Idempotent: returns the existing invoice if one already exists for the manifest.
 */
export const generateInvoiceForManifest = async (
  manifestId: string,
): Promise<any | null> => {
  const manifest = await Manifest.findById(manifestId).populate('client');
  if (!manifest) return null;

  const existing = await Invoice.findOne({ manifest: manifestId });
  if (existing) return existing;

  const client: any = manifest.client as any;
  const contractRate =
    typeof client?.contractRate === 'number' && client.contractRate > 0
      ? client.contractRate
      : DEFAULT_CONTRACT_RATE;

  const distance = manifest.routing?.estimatedDistanceKm ?? 0;
  const amount = Math.round(distance * contractRate * 100) / 100;

  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 30);

  const originCity = manifest.routing?.origin?.city || 'Origin';
  const destCity = manifest.routing?.destination?.city || 'Destination';

  const lineItems = [
    {
      description: `Freight: ${manifest.trackingId} (${originCity} → ${destCity})`,
      quantity: 1,
      unitPrice: amount,
      total: amount,
    },
  ];

  const invoice = await Invoice.create({
    invoiceNumber: generateInvoiceNumber(),
    manifest: manifest._id,
    client: manifest.client,
    amount,
    currency: 'INR',
    status: 'PENDING',
    issuedDate: now,
    dueDate,
    lineItems,
  });

  return invoice;
};
