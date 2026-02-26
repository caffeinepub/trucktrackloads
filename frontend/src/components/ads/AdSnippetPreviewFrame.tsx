import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface AdSnippetPreviewFrameProps {
  snippet: string;
  className?: string;
  style?: React.CSSProperties;
  showDiagnostics?: boolean;
}

export default function AdSnippetPreviewFrame({
  snippet,
  className = '',
  style,
  showDiagnostics = true,
}: AdSnippetPreviewFrameProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [snippet]);

  const isEmpty = !snippet || snippet.trim().length === 0;

  if (isEmpty && showDiagnostics) {
    return (
      <div
        className={`flex items-center justify-center p-6 border rounded-md bg-muted/30 ${className}`}
        style={style}
      >
        <div className="text-center text-sm text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No ad snippet configured</p>
        </div>
      </div>
    );
  }

  const handleLoad = () => {
    setIsLoaded(true);
    // Check if iframe loaded successfully after a short delay
    setTimeout(() => {
      // If still no error after load, consider it successful
      setHasError(false);
    }, 500);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className={`relative ${className}`}>
      <iframe
        srcDoc={snippet}
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
        className="w-full border-0 rounded-md"
        style={style}
        title="Advertisement Preview"
        onLoad={handleLoad}
        onError={handleError}
      />
      {showDiagnostics && hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
          <div className="text-center text-sm text-muted-foreground p-4">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
            <p className="font-medium">Ad failed to load</p>
            <p className="text-xs mt-1">Check snippet syntax or network connection</p>
          </div>
        </div>
      )}
    </div>
  );
}
