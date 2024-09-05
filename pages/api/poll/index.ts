import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { question, options } = req.body;
    

    if (!question || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    try {
      const poll = await prisma.poll.create({
        data: {
          question,
          options: {
            create: options.map((option: string) => ({ text: option })),
          },
        },
        include: { options: true },
      });
      res.status(200).json(poll);
    } catch (error) {
      console.error('Error creating poll:', error);
      res.status(500).json({ error: 'Error creating poll' });
    }
  } else if (req.method === 'GET') {
    try {
      const polls = await prisma.poll.findMany({
        include: {
          options: {
            include: {
              _count: {
                select: { votes: true }
              }
            }
          }
        },
      });

      const pollsWithVoteCounts = polls.map(poll => ({
        ...poll,
        options: poll.options.map(({ _count, ...option }) => ({
          ...option,
          voteCount: _count.votes
        }))
      }));

      res.status(200).json(pollsWithVoteCounts);
    } catch (error) {
      console.error('Error fetching polls:', error);
      res.status(500).json({ error: 'Error fetching polls' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}