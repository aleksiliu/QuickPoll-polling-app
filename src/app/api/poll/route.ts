import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function POST(request: NextRequest) {
  const { question, options, allowMultipleAnswers } = await request.json();

  if (!question || typeof question !== 'string' || question.trim() === '') {
    return NextResponse.json({ error: 'Invalid question' }, { status: 400 });
  }

  if (!Array.isArray(options) || options.length < 2 || options.some(opt => typeof opt !== 'string' || opt.trim() === '')) {
    return NextResponse.json({ error: 'Invalid options. Provide at least 2 non-empty options.' }, { status: 400 });
  }

  try {
    const poll = await prisma.poll.create({
      data: {
        question,
        allowMultipleAnswers,
        options: {
          create: options.map((option: string) => ({ text: option.trim() })),
        },
      },
      include: { options: true },
    });
    return NextResponse.json(poll);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create poll. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
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

    return NextResponse.json(pollsWithVoteCounts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch polls. Please try again.' }, { status: 500 });
  }
}