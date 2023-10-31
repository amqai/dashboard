export interface FrequentlyAskedQuestionsResponse {
  questions: FrequentlyAskedQuestionResponse[];
}

export interface FrequentlyAskedQuestionResponse {
  question: string;
  count: number;
  relatedQuestions: FrequentlyAskedQuestionContest;
}

export interface FrequentlyAskedQuestionContest {
  relatedQuestions: string[];
}
