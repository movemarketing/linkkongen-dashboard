import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, amount } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.credits < amount) {
    return res.status(400).json({ message: 'Not enough credits' });
  }

  await prisma.user.update({
    where: { email },
    data: { credits: { decrement: amount } },
  });

  res.status(200).json({ message: 'Credits used' });
}