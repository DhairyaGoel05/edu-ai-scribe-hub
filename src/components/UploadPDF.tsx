
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X } from 'lucide-react';
import { toast } from 'sonner';

interface UploadPDFProps {
  onPDFUpload: (file: File) => void;
}

const UploadPDF = ({ onPDFUpload }: UploadPDFProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      onPDFUpload(file);
      toast.success('PDF uploaded successfully!');
    } else {
      toast.error('Please upload a valid PDF file');
    }
  }, [onPDFUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload PDF</h2>
        <p className="text-gray-600">Upload your PDF document to start analyzing and generating content</p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
          <CardDescription>
            Drag and drop your PDF file here, or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!uploadedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the PDF here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop a PDF file here, or click to select
                  </p>
                  <Button variant="outline">Browse Files</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedFile && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-green-600 font-medium mb-4">✅ PDF uploaded successfully!</p>
              <p className="text-gray-600 mb-4">
                You can now view, chat with, or generate content from your PDF using the sidebar navigation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadPDF;
