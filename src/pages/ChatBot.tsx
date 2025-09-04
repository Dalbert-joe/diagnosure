import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Camera, Mic, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import GeminiApiKeyPrompt from '@/components/GeminiApiKeyPrompt';

const ChatBot = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    chatMessages, 
    addChatMessage, 
    clearChat,
    symptoms,
    addSymptom,
    analyzeSymptomsWithAI,
    setDiagnoses,
    symptomContext,
    updateSymptomContext
  } = useAppData();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [conversationStage, setConversationStage] = useState<'greeting' | 'collecting' | 'followup' | 'complete'>('greeting');
  const [followUpStep, setFollowUpStep] = useState<'medications' | 'duration' | 'conditions' | 'complete'>('medications');
  const [followUpResponses, setFollowUpResponses] = useState<string[]>([]);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    // Initialize conversation if no messages
    if (chatMessages.length === 0) {
      const greeting = `Hello ${user?.name}! I'm your AI health assistant. I'm here to help analyze your symptoms and provide medical guidance. Please describe what symptoms you're experiencing, and when you're done, just type "done".`;
      addChatMessage(greeting, 'ai');
      setConversationStage('collecting');
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    addChatMessage(userMessage, 'user');
    setInputMessage('');

    // Check if user typed "done"
    if (userMessage.toLowerCase() === 'done') {
      if (symptoms.length === 0) {
        addChatMessage("I haven't recorded any symptoms yet. Please describe what you're experiencing first.", 'ai');
        return;
      }
      
      setConversationStage('followup');
      setFollowUpStep('medications');
      addChatMessage("Thank you for describing your symptoms. Now I need some additional information for a more accurate diagnosis:", 'ai');
      
      setTimeout(() => {
        addChatMessage("Are you currently taking any medications or pills? (Please be specific)", 'ai');
      }, 1000);
      
      return;
    }

    // Check if user typed "analyze"
    if (userMessage.toLowerCase() === 'analyze' && conversationStage === 'followup') {
      setIsAnalyzing(true);
      addChatMessage("Analyzing your symptoms with AI... This may take a moment.", 'ai');
      
      try {
        const symptomTexts = symptoms.map(s => s.text);
        const context = {
          medications: symptomContext.medications,
          duration: symptomContext.duration,
          existingConditions: symptomContext.existingConditions,
          followUpResponses
        };
        
        const diagnoses = await analyzeSymptomsWithAI(symptomTexts, context);
        setDiagnoses(diagnoses);
        
        addChatMessage(
          `Analysis complete! I've identified ${diagnoses.length} possible conditions based on your symptoms. ` +
          `The most likely condition is "${diagnoses[0]?.condition}" with ${diagnoses[0]?.probability}% probability. ` +
          `Would you like to view the detailed diagnosis or continue chatting?`, 
          'ai'
        );
        setConversationStage('complete');
      } catch (error) {
        console.error('AI Analysis error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        if (errorMessage.includes('API key')) {
          setShowApiKeyPrompt(true);
          addChatMessage("I need your Gemini API key to provide AI diagnosis. Please provide it to continue.", 'ai');
        } else {
          addChatMessage(`Sorry, there was an error analyzing your symptoms: ${errorMessage}`, 'ai');
        }
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    // Handle follow-up questions
    if (conversationStage === 'followup') {
      const newResponses = [...followUpResponses, userMessage];
      setFollowUpResponses(newResponses);
      
      if (followUpStep === 'medications') {
        updateSymptomContext({ medications: userMessage });
        setFollowUpStep('duration');
        addChatMessage("Thank you. How long have you been experiencing these symptoms?", 'ai');
      } else if (followUpStep === 'duration') {
        updateSymptomContext({ duration: userMessage });
        setFollowUpStep('conditions');
        addChatMessage("Got it. Do you have any existing medical conditions or take regular medications?", 'ai');
      } else if (followUpStep === 'conditions') {
        updateSymptomContext({ existingConditions: userMessage, followUpResponses: newResponses });
        setFollowUpStep('complete');
        addChatMessage("Perfect! I now have all the information needed. Type 'analyze' when you're ready for your AI diagnosis.", 'ai');
      }
      return;
    }

    // Process symptom collection
    if (conversationStage === 'collecting') {
      addSymptom(userMessage);
      
      // AI responses based on keywords and context
      let aiResponse = generateAIResponse(userMessage, conversationStage);
      
      setTimeout(() => {
        addChatMessage(aiResponse, 'ai');
      }, 1000);
    } else {
      // General conversation
      let aiResponse = generateAIResponse(userMessage, conversationStage);
      setTimeout(() => {
        addChatMessage(aiResponse, 'ai');
      }, 1000);
    }
  };

  const generateAIResponse = (message: string, stage: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (stage === 'collecting') {
      if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
        return "I understand you're experiencing pain. Can you describe where the pain is located and how severe it is on a scale of 1-10?";
      } else if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
        return "Fever can be a sign of infection. Have you measured your temperature? Any other symptoms accompanying the fever?";
      } else if (lowerMessage.includes('headache')) {
        return "Headaches can have various causes. Is it a constant ache or throbbing? Any visual changes or nausea?";
      } else if (lowerMessage.includes('cough')) {
        return "I've noted your cough. Is it dry or are you bringing up any phlegm? How long have you had this cough?";
      } else {
        const responses = [
          "I've recorded that symptom. Please continue describing any other symptoms you're experiencing.",
          "Thank you for sharing that. What other symptoms have you noticed?",
          "I've noted that down. Are there any other symptoms I should know about?",
          "Got it. Please continue with any additional symptoms you're experiencing."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
    } else if (stage === 'followup') {
      return "Thank you for that information. This helps me provide a more accurate analysis.";
    } else if (stage === 'complete') {
      return "I'm here to help with any questions about your diagnosis or if you need to book an appointment.";
    }
    
    return "I'm here to help with your health concerns. Please describe your symptoms or ask me any medical questions.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-card flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-soft border-b px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/patient/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-heading font-semibold">AI Health Chat</h1>
              <p className="text-sm text-muted-foreground">Powered by advanced medical AI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{symptoms.length} symptoms recorded</Badge>
            {conversationStage === 'complete' && (
              <Button 
                variant="gradient" 
                size="sm"
                onClick={() => navigate('/patient/diagnosis')}
              >
                View Diagnosis
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Health Consultation
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'chat-bubble-user ml-12' 
                      : 'chat-bubble-ai mr-12'
                  }`}>
                    <p className="font-chat text-sm leading-relaxed">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isAnalyzing && (
                <div className="flex justify-start">
                  <div className="chat-bubble-ai mr-12">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      <span className="text-sm ml-2">Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon-sm">
                  <Camera className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Mic className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Type your message... (or 'done' when finished describing symptoms)"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={isAnalyzing}
                />
                <Button 
                  variant="chat" 
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isAnalyzing}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {conversationStage === 'collecting' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setInputMessage('I have a headache');
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                    >
                      Headache
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setInputMessage('I have a fever');
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                    >
                      Fever
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setInputMessage('done');
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                    >
                      Done describing symptoms
                    </Button>
                  </>
                )}
                
                {conversationStage === 'followup' && (
                  <Button 
                    variant="gradient" 
                    size="sm"
                    onClick={() => {
                      setInputMessage('analyze');
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                  >
                    Ready for Analysis
                  </Button>
                )}
                
                {conversationStage === 'complete' && (
                  <>
                    <Button 
                      variant="gradient" 
                      size="sm"
                      onClick={() => navigate('/patient/diagnosis')}
                    >
                      View Diagnosis
                    </Button>
                    <Button 
                      variant="medical" 
                      size="sm"
                      onClick={() => navigate('/patient/booking')}
                    >
                      Book Appointment
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {showApiKeyPrompt && (
        <GeminiApiKeyPrompt
          onApiKeySet={() => {
            setShowApiKeyPrompt(false);
            toast({
              title: "API Key Set Successfully",
              description: "You can now use AI-powered diagnosis. Try typing 'analyze' again.",
            });
          }}
          onCancel={() => {
            setShowApiKeyPrompt(false);
            addChatMessage("AI diagnosis requires an API key. You can continue chatting or provide the key later.", 'ai');
          }}
        />
      )}
    </div>
  );
};

export default ChatBot;