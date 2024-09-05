export interface Option {
    id: number;
    text: string;
    voteCount: number;
  }
  
  export interface Poll {
    id: number;
    question: string;
    options: Option[];
  }
  
  export interface Vote {
    id: number;
    optionId: number;
    pollId: number;
  }
  
  export interface PollWithVoteCounts extends Poll {
    options: (Option & { voteCount: number })[];
  }
  
  export interface ApiResponse<T> {
    data?: T;
    error?: string;
  }