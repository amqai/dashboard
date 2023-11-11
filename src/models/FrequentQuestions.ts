export interface FrequentlyAskedQuestionsResponse {
  questions: FrequentlyAskedQuestionResponse[];
}

export interface FrequentlyAskedQuestionResponse {
  question: string;
  count: number;
  mfaqId: string;
}

export interface FrequentlyAskedQuestionPromptsResponse {
  prompts: FrequentlyAskedQuestionPrompt[]
}

export interface FrequentlyAskedQuestionPrompt {
  question: String,
  score: number
}
