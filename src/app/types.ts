export interface Option {
    id: number;
    text: string;
    voteCount: number;
    votes: Vote[];
  }
  
  export interface Poll {
    id: number;
    question: string;
    options: Option[];
    allowMultipleAnswers: boolean;  // Add this line
  }
  
  export interface Vote {
    id: number;
    voterName: string;
  }
  
  export interface PollWithVoteCounts extends Poll {
    options: (Option & { voteCount: number })[];
  }
  
  export interface ApiResponse<T> {
    data?: T;
    error?: string;
  }