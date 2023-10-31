export interface QuestionsOverrideResponse {
  questions: QuestionOverrideResponse[];
}

export interface QuestionOverrideResponse {
  question: string;
  answer: string;
}
