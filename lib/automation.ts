import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getInvoiceEmailTemplate } from "@/lib/email-templates";

/**
 * Core function to process automated payment reminders based on frequency settings
 */
export async function processAutomatedReminders() {
  try {
    // 1. Get current automation settings
    const [automationActive, lastRun, frequency] = await Promise.all([
      prisma.systemSetting.findUnique({ where: { key: 'REMINDER_AUTOMATION_ACTIVE' } }),
      prisma.systemSetting.findUnique({ where: { key: 'REMINDER_LAST_RUN' } }),
      prisma.systemSetting.findUnique({ where: { key: 'REMINDER_FREQUENCY' } }),
    ]);

    // If automation is not active, stop here
    if (!automationActive || automationActive.value !== 'true') {
      return { success: false, message: 'Automation is disabled' };
    }

    const currentFrequency = frequency?.value || 'EVERY_7_DAYS';
    const now = new Date();
    
    // 2. Check if it's time to run based on frequency
    if (lastRun) {
      const lastRunDate = new Date(lastRun.value);
      const diffMs = now.getTime() - lastRunDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      let requiredDays = 7;
      if (currentFrequency === 'DAILY') requiredDays = 1;
      if (currentFrequency === 'EVERY_2_DAYS') requiredDays = 2;
      if (currentFrequency === 'EVERY_5_DAYS') requiredDays = 5;
      if (currentFrequency === 'EVERY_7_DAYS') requiredDays = 7;

      if (diffDays < requiredDays) {
        return { success: false, message: `Skipping: only ${diffDays.toFixed(1)} days since last run (requires ${requiredDays})` };
      }
    }

    // 3. Get all unpaid invoices
    const unpaidInvoices = await prisma.invoice.findMany({
      where: { paymentStatus: 'UNPAID' },
      include: {
        user: true,
        cargoBooking: { include: { items: true } },
        passengerBooking: true,
      },
    });

    if (unpaidInvoices.length === 0) {
      await updateLastRun(now);
      return { success: true, message: 'No unpaid invoices to remind', sentCount: 0 };
    }

    // 4. Group by user to avoid spamming multiple notifications for same user
    const userInvoices = unpaidInvoices.reduce((acc: any, invoice) => {
      if (invoice.user) {
        const userId = invoice.user.id;
        if (!acc[userId]) {
          acc[userId] = { user: invoice.user, invoices: [], totalAmount: 0 };
        }
        acc[userId].invoices.push(invoice);
        acc[userId].totalAmount += invoice.totalAmount;
      }
      return acc;
    }, {});

    const sentList = [];
    for (const userId in userInvoices) {
      const { user, invoices, totalAmount } = userInvoices[userId];

      // Create internal notification
      await prisma.notification.create({
        data: {
          userId,
          title: "Automated Payment Reminder",
          message: `You have ${invoices.length} unpaid invoice(s) totaling $${totalAmount.toFixed(2)}. Please complete your payment.`,
          type: "payment_reminder",
        },
      });

      // Send emails for each invoice
      for (const invoice of invoices) {
        const bookingType = invoice.cargoBooking ? 'Cargo Booking' : 'Passenger Booking';
        const fromLocation = invoice.cargoBooking?.fromLocation || invoice.passengerBooking?.fromLocation || 'N/A';
        const toLocation = invoice.cargoBooking?.toLocation || invoice.passengerBooking?.toLocation || 'N/A';
        
        let invoiceItems = [];
        if (invoice.cargoBooking?.items) {
          invoiceItems = invoice.cargoBooking.items.map((item: any) => ({
            description: item.itemType,
            quantity: item.quantity,
            total: item.total
          }));
        } else if (invoice.passengerBooking) {
          const pb = invoice.passengerBooking;
          if (pb.adultCount > 0) invoiceItems.push({ description: 'Adult Passenger', quantity: pb.adultCount, total: pb.adultCount * 65 });
          if (pb.childCount > 0) invoiceItems.push({ description: 'Child Passenger', quantity: pb.childCount, total: pb.childCount * 45 });
          if (pb.infantCount > 0) invoiceItems.push({ description: 'Infant Passenger', quantity: pb.infantCount, total: 0 });
        }

        const emailData = {
          invoiceNo: invoice.invoiceNo,
          customerName: `${user.firstName} ${user.lastName}`,
          totalAmount: invoice.totalAmount,
          subtotal: invoice.subtotal,
          vatAmount: invoice.vatAmount,
          items: invoiceItems,
          fromLocation,
          toLocation,
          bookingType
        };

        const { subject, html } = getInvoiceEmailTemplate(emailData, true);
        sentList.push(sendEmail({ to: user.email, subject, html }));
      }
    }

    await Promise.allSettled(sentList);
    
    // 5. Update last run date
    await updateLastRun(now);

    return { 
      success: true, 
      sentCount: Object.keys(userInvoices).length, 
      totalInvoices: unpaidInvoices.length 
    };
  } catch (error) {
    console.error('Automation engine error:', error);
    return { success: false, error };
  }
}

async function updateLastRun(date: Date) {
  return prisma.systemSetting.upsert({
    where: { key: 'REMINDER_LAST_RUN' },
    update: { value: date.toISOString() },
    create: { key: 'REMINDER_LAST_RUN', value: date.toISOString(), type: 'string', description: 'Timestamp of last automated reminder run' }
  });
}
