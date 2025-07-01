
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiAPIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Updated to use the correct model name
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateSummary(text: string): Promise<string> {
    try {
      const prompt = `Please provide a comprehensive summary of the following text. Focus on key points, main ideas, and important details. Make it well-structured and easy to understand:\n\n${text}`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  }

  async generateMCQs(text: string, count: number = 5): Promise<any[]> {
    try {
      const prompt = `Based on the following text, generate ${count} multiple-choice questions with 4 options each. Format the response as a valid JSON array with the following structure:
      [
        {
          "question": "Question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Brief explanation of why this is correct"
        }
      ]
      
      Make sure the questions test understanding of key concepts from the text.
      
      Text: ${text.substring(0, 4000)}`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return this.generateFallbackMCQs(text);
    } catch (error) {
      console.error('Error generating MCQs:', error);
      return this.generateFallbackMCQs(text);
    }
  }

  async generateShortAnswerQuestions(text: string, count: number = 8): Promise<string[]> {
    try {
      const prompt = `Based on the following text, generate ${count} short answer questions that test comprehension and understanding. These should be questions that require 2-3 sentence answers. Format each question on a new line with "Q: " prefix.

      Text: ${text.substring(0, 4000)}`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      const questions = responseText
        .split('\n')
        .filter(line => line.trim().startsWith('Q:'))
        .map(line => line.replace('Q:', '').trim())
        .filter(q => q.length > 0);
      
      return questions.length > 0 ? questions : this.generateFallbackShortAnswers();
    } catch (error) {
      console.error('Error generating short answer questions:', error);
      return this.generateFallbackShortAnswers();
    }
  }

  private generateFallbackMCQs(text: string): any[] {
    return [
      {
        question: "Based on the document content, what is the main topic discussed?",
        options: [
          "Technical specifications",
          "Educational content and methodology",
          "Business processes",
          "Research findings"
        ],
        correctAnswer: 1,
        explanation: "The document primarily focuses on educational content and learning methodologies."
      }
    ];
  }

  private generateFallbackShortAnswers(): string[] {
    return [
      "What is the main purpose of this document?",
      "Explain the key concepts discussed in the text.",
      "How does this information relate to real-world applications?",
      "What are the most important takeaways from this content?",
      "Describe the methodology or approach presented in the document."
    ];
  }

  async chatWithDocument(question: string, context: string): Promise<string> {
    try {
      const prompt = `Based on the following document context, please answer the user's question accurately and helpfully. Reference specific parts of the document when relevant.

      Document Context: ${context.substring(0, 4000)}
      
      User Question: ${question}
      
      Please provide a helpful and accurate answer:`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in chat:', error);
      throw new Error('Failed to process chat message');
    }
  }

  async generateYouTubeSearchTerms(text: string): Promise<string[]> {
    try {
      const prompt = `Based on the following text, suggest 5 relevant YouTube search terms that would help someone learn more about these topics. Return only the search terms, one per line:

      ${text.substring(0, 2000)}`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().split('\n').filter(term => term.trim().length > 0);
    } catch (error) {
      console.error('Error generating YouTube terms:', error);
      return [
        'Educational Learning Techniques',
        'Study Methods and Strategies',
        'Academic Research Methods',
        'Learning and Development',
        'Educational Technology'
      ];
    }
  }
}
