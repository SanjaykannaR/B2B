import cron from 'node-cron';
import { Manifest } from '../models/Manifest';
import { Notification } from '../models/Notification';
import { sendEmail } from '../services/emailService';

/**
 * Nightly sweep: marks manifests past their `scheduledDeliveryWindowClose`
 * that were never delivered as DELAYED, appends a timeline entry, and
 * notifies the client (in-app + email).
 */
export const overdueSweep = async (): Promise<void> => {
  const now = new Date();

  const overdue = await Manifest.find({
    currentStatus: { $in: ['PENDING', 'ASSIGNED', 'IN_TRANSIT'] },
    scheduledDeliveryWindowClose: { $lt: now },
  }).populate('client');

  let processed = 0;
  for (const manifest of overdue) {
    if (manifest.currentStatus === 'DELAYED') continue;

    manifest.currentStatus = 'DELAYED';
    manifest.delayReason = 'Delivery window closed without completion';
    manifest.statusTimeline.push({
      status: 'DELAYED',
      timestamp: now,
      note: 'Auto-marked Delayed by overdue sweep',
      updatedBy: 'system',
    });
    await manifest.save();

    await Notification.create({
      recipient: manifest.client,
      title: `Delivery delayed: ${manifest.trackingId}`,
      message: `Shipment ${manifest.trackingId} is now Delayed — the scheduled delivery window has closed.`,
      type: 'warning',
      relatedManifest: manifest._id,
    });

    const client: any = manifest.client as any;
    if (client?.email) {
      await sendEmail(
        client.email,
        `[B2B Logistics] Shipment ${manifest.trackingId} delayed`,
        `<p>Hi ${client.firstName || 'there'},</p><p>Your shipment <b>${manifest.trackingId}</b> is now marked <b>Delayed</b> because the scheduled delivery window closed without completion.</p>`,
      );
    }

    processed++;
  }

  if (processed > 0) {
    console.log(`[cron] overdueSweep: processed ${processed} overdue manifest(s)`);
  }
};

/** Schedule at 00:00 every day. */
export const startOverdueSweep = (): void => {
  cron.schedule('0 0 * * *', () => {
    overdueSweep().catch((err) =>
      console.error('[cron] overdueSweep failed:', err),
    );
  });
  console.log('[cron] overdueSweep scheduled (00:00 daily)');
};
