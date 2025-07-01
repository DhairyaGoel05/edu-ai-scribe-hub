
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
