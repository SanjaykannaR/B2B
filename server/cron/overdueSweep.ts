// Cron for: Daily midnight check for overdue deliveries
// Module: Backend Services (Module 6) | Owner: Developer 1
// Runs node-cron at 00:00, finds past-due manifests, marks Delayed, sends alerts

import cron from 'node-cron';
import Manifest from '../models/Manifest';
import Notification from '../models/Notification';
import { sendEmail, overdueEmailTemplate } from '../services/emailService';

export async function runOverdueSweep(): Promise<number> {
  const now = new Date();

  const overdueManifests = await Manifest.find({
    currentStatus: { $in: ['Assigned', 'In-Transit'] },
    scheduledDeliveryWindowClose: { $lt: now },
  }).populate('client', 'firstName lastName email company');

  for (const manifest of overdueManifests) {
    manifest.currentStatus = 'Delayed';
    manifest.statusTimeline.push({
      status: 'Delayed',
      at: now,
      note: 'Automatically marked Delayed — delivery window closed',
    });
    await manifest.save();

    const client = manifest.client as unknown as { _id: string; firstName: string; lastName: string; email: string; company?: string };

    await Notification.create({
      recipient: client._id,
      title: 'Delivery Overdue',
      message: `Shipment ${manifest.trackingId} (${manifest.routing.origin.name} → ${manifest.routing.destination.name}) missed its delivery window and has been marked Delayed.`,
      type: 'warning',
      relatedManifest: manifest._id,
    });

    if (client.email) {
      await sendEmail(
        client.email,
        `[B2B Logistics] Delivery overdue — ${manifest.trackingId}`,
        overdueEmailTemplate({
          trackingId: manifest.trackingId,
          origin: manifest.routing.origin.name,
          destination: manifest.routing.destination.name,
          windowClose: manifest.scheduledDeliveryWindowClose,
        })
      );
    }
  }

  return overdueManifests.length;
}

export function startOverdueSweep(): void {
  cron.schedule('0 0 * * *', async () => {
    console.log('[OverdueSweep] Running scheduled check...');
    try {
      const count = await runOverdueSweep();
      console.log(`[OverdueSweep] Marked ${count} manifest(s) as Delayed.`);
    } catch (err) {
      console.error('[OverdueSweep] Failed:', (err as Error).message);
    }
  });
  console.log('[OverdueSweep] Scheduled daily at 00:00.');
}

export default { runOverdueSweep, startOverdueSweep };
