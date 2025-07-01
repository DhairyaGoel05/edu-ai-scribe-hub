
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle } from 'lucide-react';

interface PDFViewerProps {
  file: File | null;
}

const PDFViewer = ({ file }: PDFViewerProps) => {
  console.log('PDFViewer received file:', file);

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

  // Create a blob URL for the PDF file
  const fileUrl = URL.createObjectURL(file);
  console.log('Created PDF URL:', fileUrl);

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
          <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-gray-100">
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-0"
              title="PDF Viewer"
              onLoad={() => console.log('PDF iframe loaded successfully')}
              onError={() => console.error('PDF iframe failed to load')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFViewer;
