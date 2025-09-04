import { useState } from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { geminiService } from '@/services/geminiService';

interface GeminiApiKeyPromptProps {
  onApiKeySet: () => void;
  onCancel: () => void;
}

const GeminiApiKeyPrompt = ({ onApiKeySet, onCancel }: GeminiApiKeyPromptProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    try {
      geminiService.setApiKey(apiKey.trim());
      onApiKeySet();
    } catch (error) {
      console.error('API key validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
            Gemini API Key Required
          </CardTitle>
          <CardDescription>
            To enable AI-powered symptom analysis, please provide your Google Gemini API key.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-accent/30 rounded-lg text-sm">
            <p className="mb-2"><strong>How to get your API key:</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Visit Google AI Studio</li>
              <li>Sign in with your Google account</li>
              <li>Create a new API key</li>
              <li>Copy and paste it below</li>
            </ol>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get API Key
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Gemini API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Gemini API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                variant="gradient" 
                className="flex-1"
                disabled={!apiKey.trim() || isValidating}
              >
                {isValidating ? 'Setting up...' : 'Continue'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isValidating}
              >
                Cancel
              </Button>
            </div>
          </form>
          
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Your API key is stored locally in your browser for this session only. 
            In a production app, this would be handled securely by the backend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeminiApiKeyPrompt;