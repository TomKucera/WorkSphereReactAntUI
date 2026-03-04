export interface CoverLetterResponse {
    jobDescription: string;
    cvText: string;
    body: string;
    matchScore: number;
    jobSkills: string[];
    cvSkills: string[];
    generationInfo: {
      model: string;
      language: string;
      languageLevel: string;
      inputTokens: number;
      outputTokens: number;
      estimatedCostUsd: number;
    };
  }