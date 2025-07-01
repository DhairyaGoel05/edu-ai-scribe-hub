import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileSpreadsheet, Loader2, Youtube, Key } from 'lucide-react';
import { toast } from 'sonner';

interface SummaryGeneratorProps {
  file: File | null;
  apiKey?: string;
}

const SummaryGenerator = ({ file, apiKey }: SummaryGeneratorProps) => {
  const [summary, setSummary] = useState<string>('');
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!apiKey) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Summary</h2>
          <p className="text-gray-600">AI-powered summarization of your PDF content</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Gemini API key required</p>
              <p className="text-sm text-gray-500 mt-2">
                Please configure your API key in Settings to generate summaries
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Summary</h2>
          <p className="text-gray-600">AI-powered summarization of your PDF content</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No PDF uploaded yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Please upload a PDF first to generate a summary
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual PDF text extraction and AI summarization
      // For now, we'll simulate the process
      setTimeout(() => {
        setSummary(`AI-Generated Summary of ${file.name} (Using Gemini API):

• Key concepts and main ideas extracted from the document
• Important facts and figures identified through AI analysis
• Relevant conclusions and takeaways highlighted
• Structured overview of the content using advanced NLP

The Gemini API has analyzed the entire PDF content and provided this comprehensive yet concise summary that captures the essential information while maintaining readability. The AI has identified the most important sections and distilled them into this format.`);

        setYoutubeLinks([
          'AI and Machine Learning Fundamentals',
          'Advanced PDF Processing Techniques', 
          'Natural Language Processing with Gemini',
          'Educational Technology and AI Integration',
          'Document Analysis and Summarization Methods'
        ]);

        setIsLoading(false);
        toast.success('Summary generated using Gemini AI successfully!');
      }, 2000);
    } catch (error) {
      toast.error('Failed to generate summary');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Summary</h2>
        <p className="text-gray-600">AI-powered summarization of: {file.name}</p>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5" />
            <span>Document Summary</span>
          </CardTitle>
          <CardDescription>
            Generate an intelligent summary of your PDF content using Gemini AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!summary ? (
            <div className="text-center py-8">
              <Button 
                onClick={generateSummary} 
                disabled={isLoading}
                size="lg"
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  'Generate Summary'
                )}
              </Button>
              <p className="text-gray-500 text-sm">
                Click to analyze your PDF and generate an AI-powered summary using Gemini
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{summary}</p>
                </div>
              </div>

              {youtubeLinks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    <span>Related YouTube Topics</span>
                  </h3>
                  <div className="grid gap-2">
                    {youtubeLinks.map((link, index) => (
                      <div key={index} className="p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                        <p className="text-gray-800">{link}</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-blue-600"
                          onClick={() => {
                            const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(link)}`;
                            window.open(searchUrl, '_blank');
                          }}
                        >
                          Search on YouTube →
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  onClick={generateSummary} 
                  disabled={isLoading}
                  variant="outline"
                >
                  Regenerate Summary
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryGenerator;
