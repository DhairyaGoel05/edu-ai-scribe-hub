
import { GoogleGenerativeAI } from '@google/generative-ai';

// Note: In production, this should be stored in Supabase secrets
const API_KEY = 'your-gemini-api-key'; // TODO: Replace with actual key

const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async generateSummary(text: string): Promise<string> {
    try {
      const prompt = `Please provide a comprehensive summary of the following text. Focus on key points, main ideas, and important details:\n\n${text}`;
      
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
      const prompt = `Based on the following text, generate ${count} multiple-choice questions with 4 options each. Format the response as JSON with the following structure:
      [
        {
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Brief explanation"
        }
      ]
      
      Text: ${text}`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text();
      
      // Extract JSON from the response
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error generating MCQs:', error);
      throw new Error('Failed to generate MCQs');
    }
  }

  async chatWithDocument(question: string, context: string): Promise<string> {
    try {
      const prompt = `Based on the following document context, please answer the user's question. Be accurate and reference the document when possible.

      Document Context: ${context}
      
      User Question: ${question}
      
      Answer:`;
      
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

      ${text}`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().split('\n').filter(term => term.trim().length > 0);
    } catch (error) {
      console.error('Error generating YouTube terms:', error);
      throw new Error('Failed to generate YouTube search terms');
    }
  }
}

export const geminiService = new GeminiService();
