
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, BookOpen, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface PDFViewerProps {
  file: File | null;
}

interface PDFOutlineItem {
  title: string;
  dest: any;
  items?: PDFOutlineItem[];
  page?: number;
}

const PDFViewer = ({ file }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [outline, setOutline] = useState<PDFOutlineItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  
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

  const navigateToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    const iframe = document.querySelector('embed') as HTMLEmbedElement;
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

  if (!file) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF Viewer</h2>
          <p className="text-gray-600">View your uploaded PDF document</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No PDF uploaded yet</p>
              <p className="text-sm text-gray-500 mt-2">
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF Viewer</h2>
        <p className="text-gray-600">Currently viewing: {file.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* PDF Index/Table of Contents */}
        {outline.length > 0 && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Table of Contents</span>
              </CardTitle>
              <CardDescription>
                Click on any heading to navigate to that page
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <div className="space-y-1">
                {outline.map(item => renderOutlineItem(item))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* PDF Viewer */}
        <Card className={outline.length > 0 ? "lg:col-span-3" : "lg:col-span-4"}>
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
            <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-gray-50">
              {pdfUrl && (
                <embed
                  src={pdfUrl}
                  type="application/pdf"
                  className="w-full h-full"
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
                <span className="text-sm text-gray-600">
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
