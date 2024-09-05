import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { question, options } = req.body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({ error: 'Invalid question' });
    }

    if (!Array.isArray(options) || options.length < 2 || options.some(opt => typeof opt !== 'string' || opt.trim() === '')) {
      return res.status(400).json({ error: 'Invalid options. Provide at least 2 non-empty options.' });
    }

    try {
      const poll = await prisma.poll.create({
        data: {
          question,
          options: {
            create: options.map((option: string) => ({ text: option.trim() })),
          },
        },
        include: { options: true },
      });
      res.status(200).json(poll);
    } catch (error) {
      console.error('Error creating poll:', error);
      res.status(500).json({ error: 'Failed to create poll. Please try again.' });
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
      res.status(500).json({ error: 'Failed to fetch polls. Please try again.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}