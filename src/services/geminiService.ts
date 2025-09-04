interface SymptomAnalysisRequest {
  symptoms: string[];
  medications?: string;
  duration?: string;
  existingConditions?: string;
  followUpResponses?: string[];
}

interface DiagnosisResult {
  id: string;
  condition: string;
  probability: number;
  reasoning: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  doctorRecommended: boolean;
}

class GeminiService {
  private apiKey: string | null = null;

  constructor() {
    // In a real production app, this would be handled by backend
    // For now, we'll use localStorage to store the API key temporarily
    this.apiKey = localStorage.getItem('gemini_api_key');
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('gemini_api_key', apiKey);
  }

  async analyzeSymptomsWithAI(request: SymptomAnalysisRequest): Promise<DiagnosisResult[]> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Please set your API key.');
    }

    try {
      const prompt = this.buildMedicalPrompt(request);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text;

      if (!aiResponse) {
        throw new Error('No response from Gemini API');
      }

      return this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to analyze symptoms with AI. Please try again.');
    }
  }

  private buildMedicalPrompt(request: SymptomAnalysisRequest): string {
    const { symptoms, medications, duration, existingConditions, followUpResponses } = request;
    
    let prompt = `You are an advanced medical AI assistant. Analyze the following symptoms and provide a medical assessment.

IMPORTANT: Respond ONLY with a valid JSON array containing exactly 5 diagnosis objects. Do not include any other text, explanations, or formatting.

Symptoms: ${symptoms.join(', ')}`;

    if (medications) {
      prompt += `\nCurrent Medications: ${medications}`;
    }
    
    if (duration) {
      prompt += `\nSymptom Duration: ${duration}`;
    }
    
    if (existingConditions) {
      prompt += `\nExisting Medical Conditions: ${existingConditions}`;
    }
    
    if (followUpResponses && followUpResponses.length > 0) {
      prompt += `\nAdditional Information: ${followUpResponses.join('; ')}`;
    }

    prompt += `

Provide exactly 5 possible diagnoses in JSON format:
[
  {
    "condition": "Condition Name",
    "probability": 75,
    "reasoning": "Medical reasoning for this diagnosis based on symptoms",
    "urgency": "low|medium|high|critical",
    "doctorRecommended": true|false
  }
]

Guidelines:
- Probability should be between 10-95%
- Reasoning should be medical and professional
- Urgency levels: low (routine care), medium (see doctor soon), high (see doctor today), critical (immediate attention)
- Doctor recommended should be true for medium/high/critical urgency
- Order by probability (highest first)
- Consider differential diagnosis principles`;

    return prompt;
  }

  private parseAIResponse(aiResponse: string): DiagnosisResult[] {
    try {
      // Clean the response to extract JSON
      let cleanResponse = aiResponse.trim();
      
      // Remove any markdown code blocks
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find the JSON array
      const jsonStart = cleanResponse.indexOf('[');
      const jsonEnd = cleanResponse.lastIndexOf(']') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No valid JSON found in response');
      }
      
      const jsonString = cleanResponse.substring(jsonStart, jsonEnd);
      const parsedResponse = JSON.parse(jsonString);
      
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Response is not an array');
      }

      return parsedResponse.map((item: any, index: number) => ({
        id: `diagnosis_${Date.now()}_${index}`,
        condition: item.condition || 'Unknown Condition',
        probability: Math.min(95, Math.max(10, item.probability || 50)),
        reasoning: item.reasoning || 'Analysis based on reported symptoms',
        urgency: ['low', 'medium', 'high', 'critical'].includes(item.urgency) 
          ? item.urgency 
          : 'medium',
        doctorRecommended: Boolean(item.doctorRecommended)
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw AI response:', aiResponse);
      
      // Fallback with mock data but indicate it's a parsing error
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }

  calculatePriorityScore(symptoms: string[], urgency: string, note: string): number {
    let score = 0;
    
    // Base urgency score
    const urgencyScores = { critical: 100, high: 75, medium: 50, low: 25 };
    score += urgencyScores[urgency as keyof typeof urgencyScores] || 25;
    
    // Symptom severity keywords
    const highSeverityKeywords = ['severe', 'intense', 'unbearable', 'emergency', 'critical', 'chest pain', 'difficulty breathing', 'unconscious'];
    const mediumSeverityKeywords = ['moderate', 'persistent', 'ongoing', 'fever', 'pain', 'bleeding'];
    
    const allText = [...symptoms, note].join(' ').toLowerCase();
    
    highSeverityKeywords.forEach(keyword => {
      if (allText.includes(keyword)) score += 15;
    });
    
    mediumSeverityKeywords.forEach(keyword => {
      if (allText.includes(keyword)) score += 5;
    });
    
    // Duration indicators
    if (allText.includes('days') || allText.includes('weeks')) score += 10;
    if (allText.includes('sudden') || allText.includes('immediate')) score += 20;
    
    return Math.min(100, score);
  }
}

export const geminiService = new GeminiService();
export type { SymptomAnalysisRequest, DiagnosisResult };