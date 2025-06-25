import { buffer } from 'micro';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { prisma } from '/lib/';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sig = req.headers['stripe-signature']!;
  const buf = await buffer(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  if (event.type === 'invoice.payment_succeeded') {
    const customerEmail = event.data.object['customer_email'];
    if (customerEmail) {
      await prisma.user.update({
        where: { email: customerEmail },
        data: { credits: { increment: 10 } },
      });
    }
  }

  res.status(200).json({ received: true });
}
