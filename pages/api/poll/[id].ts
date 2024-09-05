import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pollId = parseInt(req.query.id as string);


  if (req.method === 'POST') {
    const { optionId } = req.body;
    try {
      const vote = await prisma.vote.create({
        data: {
          option: { connect: { id: optionId } },
          poll: { connect: { id: pollId } },
        },
      });
      res.status(200).json(vote);
    } catch (error) {
      res.status(500).json({ error: 'Error submitting vote' });
    }
  }

  if (req.method === 'GET') {
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
      res.status(500).json({ error: 'Error fetching poll' });
    }
  } else if (req.method === 'POST') {
    // ... (rest of the POST logic remains the same)
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}