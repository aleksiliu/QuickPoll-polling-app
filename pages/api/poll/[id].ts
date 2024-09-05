import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pollId = parseInt(req.query.id as string);

  if (isNaN(pollId)) {
    return res.status(400).json({ error: 'Invalid poll ID' });
  }

  if (req.method === 'POST') {
    const { optionId } = req.body;

    if (typeof optionId !== 'number' || isNaN(optionId)) {
      return res.status(400).json({ error: 'Invalid option ID' });
    }

    try {
      const vote = await prisma.vote.create({
        data: {
          option: { connect: { id: optionId } },
          poll: { connect: { id: pollId } },
        },
      });
      res.status(200).json(vote);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        res.status(400).json({ error: 'You have already voted for this option in this poll.' });
      } else {
        console.error('Error submitting vote:', error);
        res.status(500).json({ error: 'Failed to submit vote. Please try again.' });
      }
    }
  } else if (req.method === 'GET') {
    try {
      const poll = await prisma.poll.findUnique({
        where: { id: pollId },
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

      if (!poll) {
        return res.status(404).json({ error: 'Poll not found' });
      }

      const pollWithVoteCounts = {
        ...poll,
        options: poll.options.map(({ _count, ...option }) => ({
          ...option,
          voteCount: _count.votes
        }))
      };

      res.status(200).json(pollWithVoteCounts);
    } catch (error) {
      console.error('Error fetching poll:', error);
      res.status(500).json({ error: 'Failed to fetch poll. Please try again.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}