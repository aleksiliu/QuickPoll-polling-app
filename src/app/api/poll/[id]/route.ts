import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const pollId = parseInt(params.id);

  if (isNaN(pollId)) {
    return NextResponse.json({ error: 'Invalid poll ID' }, { status: 400 });
  }

  const { optionId } = await request.json();

  if (typeof optionId !== 'number' || isNaN(optionId)) {
    return NextResponse.json({ error: 'Invalid option ID' }, { status: 400 });
  }

  try {
    const vote = await prisma.vote.create({
      data: {
        option: { connect: { id: optionId } },
        poll: { connect: { id: pollId } },
      },
    });
    return NextResponse.json(vote);
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'You have already voted for this option in this poll.' }, { status: 400 });
    } else {
      console.error('Error submitting vote:', error);
      return NextResponse.json({ error: 'Failed to submit vote. Please try again.' }, { status: 500 });
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const pollId = parseInt(params.id);

  if (isNaN(pollId)) {
    return NextResponse.json({ error: 'Invalid poll ID' }, { status: 400 });
  }

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
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    const pollWithVoteCounts = {
      ...poll,
      options: poll.options.map(({ _count, ...option }) => ({
        ...option,
        voteCount: _count.votes
      }))
    };

    return NextResponse.json(pollWithVoteCounts);
  } catch (error) {
    console.error('Error fetching poll:', error);
    return NextResponse.json({ error: 'Failed to fetch poll. Please try again.' }, { status: 500 });
  }
}

// Optional: Handle other HTTP methods
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}