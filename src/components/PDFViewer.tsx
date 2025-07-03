
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, BookOpen, ChevronRight, Sparkles, Key } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GeminiAPIService } from '@/services/geminiApiService';
import { toast } from 'sonner';

interface PDFViewerProps {
  file: File | null;
  apiKey?: string;
}

interface PDFOutlineItem {
  title: string;
  dest: any;
  items?: PDFOutlineItem[];
  page?: number;
}

interface AIGeneratedIndex {
  title: string;
  page: number;
  summary?: string;
}

const PDFViewer = ({ file, apiKey }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [outline, setOutline] = useState<PDFOutlineItem[]>([]);
  const [aiIndex, setAiIndex] = useState<AIGeneratedIndex[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [isGeneratingIndex, setIsGeneratingIndex] = useState(false);
  
  console.log('PDFViewer received file:', file);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      console.log('Created PDF URL:', url);
      
      // Load PDF document for outline extraction
      loadPDFDocument(file);
      
      // Cleanup function to revoke URL
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const loadPDFDocument = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      
      // Extract outline/bookmarks
      const outline = await pdf.getOutline();
      if (outline) {
        const processedOutline = await Promise.all(
          outline.map(item => processOutlineItem(item, pdf))
        );
        setOutline(processedOutline);
      }
    } catch (error) {
      console.error('Error loading PDF document:', error);
    }
  };

  const processOutlineItem = async (item: any, pdf: any): Promise<PDFOutlineItem> => {
    let pageNumber = 1;
    
    try {
      if (item.dest) {
        const dest = await pdf.getDestination(item.dest);
        if (dest && dest[0]) {
          const pageRef = dest[0];
          const pageIndex = await pdf.getPageIndex(pageRef);
          pageNumber = pageIndex + 1;
        }
      }
    } catch (error) {
      console.error('Error getting page number for outline item:', error);
    }

    const processedItem: PDFOutlineItem = {
      title: item.title,
      dest: item.dest,
      page: pageNumber,
    };

    if (item.items && item.items.length > 0) {
      processedItem.items = await Promise.all(
        item.items.map((subItem: any) => processOutlineItem(subItem, pdf))
      );
    }

    return processedItem;
  };

  const generateAIIndex = async () => {
    if (!file || !apiKey || !pdfDocument) {
      toast.error('PDF file and API key are required');
      return;
    }

    setIsGeneratingIndex(true);
    try {
      // Extract text from first few pages to analyze structure
      let sampleText = '';
      const pagesToAnalyze = Math.min(5, totalPages);
      
      for (let i = 1; i <= pagesToAnalyze; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        sampleText += `Page ${i}: ${pageText}\n\n`;
      }

      const geminiService = new GeminiAPIService(apiKey);
      const prompt = `Analyze this PDF content and generate a smart index/table of contents. 
      Identify the main sections, headings, and topics. Return a JSON array with objects containing:
      - title: The section/topic title
      - page: Estimated page number where this topic appears
      - summary: Brief description of the content

      PDF Content Sample:
      ${sampleText}

      Return only valid JSON array format.`;

      const response = await geminiService.generateContent(prompt);
      
      try {
        // Try to parse the response as JSON
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const generatedIndex = JSON.parse(cleanResponse);
        
        if (Array.isArray(generatedIndex)) {
          setAiIndex(generatedIndex);
          toast.success('AI index generated successfully!');
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        // Fallback: create a simple index based on page count
        const fallbackIndex = [];
        const sectionsPerPage = Math.ceil(totalPages / 5);
        for (let i = 0; i < 5 && i * sectionsPerPage < totalPages; i++) {
          fallbackIndex.push({
            title: `Section ${i + 1}`,
            page: i * sectionsPerPage + 1,
            summary: `Content from page ${i * sectionsPerPage + 1}`
          });
        }
        setAiIndex(fallbackIndex);
        toast.success('Basic index generated');
      }
    } catch (error) {
      console.error('Error generating AI index:', error);
      toast.error('Failed to generate AI index');
    } finally {
      setIsGeneratingIndex(false);
    }
  };

  const navigateToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (iframe) {
      // Update the PDF URL to include page number
      const newUrl = `${pdfUrl}#page=${pageNumber}`;
      iframe.src = newUrl;
    }
  };

  const renderOutlineItem = (item: PDFOutlineItem, level = 0) => (
    <div key={item.title} className={`ml-${level * 4}`}>
      <Button
        variant="ghost"
        className="w-full justify-start text-left p-2 h-auto"
        onClick={() => item.page && navigateToPage(item.page)}
      >
        <ChevronRight className="w-3 h-3 mr-2 flex-shrink-0" />
        <span className="truncate">{item.title}</span>
        {item.page && (
          <span className="ml-auto text-xs text-gray-500">p.{item.page}</span>
        )}
      </Button>
      {item.items && item.items.map(subItem => renderOutlineItem(subItem, level + 1))}
    </div>
  );

  const renderAIIndexItem = (item: AIGeneratedIndex) => (
    <div key={item.title} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
      <Button
        variant="ghost"
        className="w-full justify-start text-left p-3 h-auto flex-col items-start"
        onClick={() => navigateToPage(item.page)}
      >
        <div className="flex items-center justify-between w-full">
          <span className="font-medium truncate">{item.title}</span>
          <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
            p.{item.page}
          </span>
        </div>
        {item.summary && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-left">
            {item.summary}
          </span>
        )}
      </Button>
    </div>
  );

  if (!file) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">PDF Viewer</h2>
          <p className="text-gray-600 dark:text-gray-300">View your uploaded PDF document</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">No PDF uploaded yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Please upload a PDF first to view it here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">PDF Viewer</h2>
          <p className="text-gray-600 dark:text-gray-300">Currently viewing: {file.name}</p>
        </div>
        {apiKey && (
          <Button
            onClick={generateAIIndex}
            disabled={isGeneratingIndex}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGeneratingIndex ? 'Generating...' : 'Generate AI Index'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* PDF Index/Table of Contents */}
        {(outline.length > 0 || aiIndex.length > 0) && (
          <Card className="lg:col-span-1 max-h-[600px] overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Document Index</span>
              </CardTitle>
              <CardDescription>
                Click on any heading to navigate to that page
              </CardDescription>
              {!apiKey && (
                <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                  <Key className="w-3 h-3 inline mr-1" />
                  Add API key to generate AI index
                </div>
              )}
            </CardHeader>
            <CardContent className="overflow-y-auto">
              {aiIndex.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Generated Index
                  </h4>
                  <div className="space-y-1">
                    {aiIndex.map(item => renderAIIndexItem(item))}
                  </div>
                </div>
              )}
              
              {outline.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Document Outline
                  </h4>
                  <div className="space-y-1">
                    {outline.map(item => renderOutlineItem(item))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* PDF Viewer */}
        <Card className={(outline.length > 0 || aiIndex.length > 0) ? "lg:col-span-3" : "lg:col-span-4"}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>{file.name}</span>
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>PDF Document • {(file.size / 1024 / 1024).toFixed(2)} MB</span>
              {totalPages > 0 && (
                <span>Page {currentPage} of {totalPages}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
              {pdfUrl && (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="PDF Viewer"
                  onLoad={() => console.log('PDF loaded successfully')}
                />
              )}
            </div>
            
            {/* Page Navigation */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PDFViewer;
