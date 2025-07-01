
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PDFViewerProps {
  file: File | null;
}

const PDFViewer = ({ file }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  
  console.log('PDFViewer received file:', file);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      console.log('Created PDF URL:', url);
      
      // Cleanup function to revoke URL
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

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

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>{file.name}</span>
          </CardTitle>
          <CardDescription>
            PDF Document • {(file.size / 1024 / 1024).toFixed(2)} MB
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
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFViewer;
