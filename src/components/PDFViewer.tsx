import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, BookOpen, ChevronRight, Sparkles, Key, Settings, ChevronLeft, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GeminiAPIService } from '@/services/geminiApiService';
import { toast } from 'sonner';
import APIKeySetup from './APIKeySetup';

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

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

const PDFViewer = ({ file, apiKey: propApiKey }: PDFViewerProps) => {
  const [outline, setOutline] = useState<PDFOutlineItem[]>([]);
  const [aiIndex, setAiIndex] = useState<AIGeneratedIndex[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [isGeneratingIndex, setIsGeneratingIndex] = useState(false);
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [scale, setScale] = useState(1.5);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  console.log('PDFViewer received file:', file);

  useEffect(() => {
    // Load API key from localStorage
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    } else if (propApiKey) {
      setApiKey(propApiKey);
    }
  }, [propApiKey]);

  useEffect(() => {
    if (file) {
      console.log('Loading PDF file:', file.name);
      loadPDFDocument(file);
    }
  }, [file]);

  useEffect(() => {
    if (pdfDocument && canvasRef.current) {
      renderPage(currentPage);
    }
  }, [pdfDocument, currentPage, scale]);

  const loadPDFDocument = async (file: File) => {
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log('PDF arrayBuffer size:', arrayBuffer.byteLength);
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      // Extract outline/bookmarks
      try {
        const outline = await pdf.getOutline();
        if (outline) {
          const processedOutline = await Promise.all(
            outline.map(item => processOutlineItem(item, pdf))
          );
          setOutline(processedOutline);
        }
      } catch (outlineError) {
        console.warn('Could not load PDF outline:', outlineError);
      }
    } catch (error) {
      console.error('Error loading PDF document:', error);
      toast.error('Failed to load PDF document');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async (pageNumber: number) => {
    if (!pdfDocument || !canvasRef.current) return;
    
    try {
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      console.log('Rendering page:', pageNumber);
      await page.render(renderContext).promise;
      console.log('Page rendered successfully');
    } catch (error) {
      console.error('Error rendering page:', error);
      toast.error('Failed to render PDF page');
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

  const handleApiKeyConfigured = (key: string) => {
    setApiKey(key);
    setShowApiKeySetup(false);
    toast.success('API key configured successfully!');
  };

  const generateAIIndex = async () => {
    if (!file || !apiKey || !pdfDocument) {
      if (!apiKey) {
        setShowApiKeySetup(true);
        return;
      }
      toast.error('PDF file is required');
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
    const targetPage = Math.min(Math.max(1, pageNumber), totalPages);
    setCurrentPage(targetPage);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
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

  if (showApiKeySetup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">API Key Setup</h2>
            <p className="text-gray-600 dark:text-gray-300">Configure your Gemini API key to use AI features</p>
          </div>
          <Button variant="outline" onClick={() => setShowApiKeySetup(false)}>
            Back to PDF Viewer
          </Button>
        </div>
        <APIKeySetup onKeyConfigured={handleApiKeyConfigured} currentKey={apiKey} />
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
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowApiKeySetup(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            API Settings
          </Button>
          <Button
            onClick={generateAIIndex}
            disabled={isGeneratingIndex}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGeneratingIndex ? 'Generating...' : 'Generate AI Index'}
          </Button>
        </div>
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
                  Configure API key to generate AI index
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
            <div className="w-full border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              {isLoading ? (
                <div className="flex items-center justify-center h-[600px] text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mb-4 mx-auto animate-pulse" />
                    <p>Loading PDF...</p>
                  </div>
                </div>
              ) : pdfDocument ? (
                <div className="flex flex-col">
                  {/* Zoom Controls */}
                  <div className="flex items-center justify-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 border-b">
                    <Button variant="outline" size="sm" onClick={handleZoomOut}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {Math.round(scale * 100)}%
                    </span>
                    <Button variant="outline" size="sm" onClick={handleZoomIn}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* PDF Canvas */}
                  <div className="flex justify-center p-4 overflow-auto max-h-[600px]">
                    <canvas 
                      ref={canvasRef}
                      className="border shadow-lg"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[600px] text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <AlertCircle className="w-16 h-16 mb-4 mx-auto" />
                    <p>Failed to load PDF</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Page Navigation */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
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
