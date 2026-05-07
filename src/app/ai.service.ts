import {Injectable} from '@angular/core';
import {GoogleGenAI} from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (typeof GEMINI_API_KEY !== 'undefined' && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY') {
      this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }
  }

  async summarize(content: string): Promise<string> {
    if (!this.ai) {
      return "AI Service not configured. Please add your GEMINI_API_KEY in the Secrets panel.";
    }

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Summarize the following communication thread into key points and action items. Keep it concise and professional.
        
        Content:
        ${content}`,
      });

      return response.text || "Could not generate summary.";
    } catch (error) {
      console.error("AI Summarization error:", error);
      return "An error occurred while generating the summary.";
    }
  }
}
