export interface OverrideQuestionsResponse {
    overrideQuestions: OverrideQuestionResponse[];
}

export interface OverrideQuestionResponse {
    overrideQuestion: string;
    answer: string;
}