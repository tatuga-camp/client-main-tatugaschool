import { useState, useEffect, ReactNode } from "react";

const ErrorBoundary = ({ children }: { children: ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const resetError = () => setHasError(false);

  const ErrorFallback = () => (
    <div
      className="flex items-center flex-col gap-2
     justify-center w-screen h-screen text-white
      font-Anuphan text-lg gradient-bg"
    >
      <h2 className="text-2xl font-semibold">Something went wrong.</h2>
      <p className="text-wrap w-11/12 text-center">{errorMessage}</p>
      <button className="second-button border" onClick={resetError}>
        Try Again
      </button>
      <span className="text-sm w-11/12 text-center">
        โปรดแจ้งผู้ดูแลเว็บไซต์หากเจอหน้านี้ โดยทำการแคปหน้าจอ
        และส่งข้อความไปที่ Facebook
      </span>
    </div>
  );

  useEffect(() => {
    const handleError = (error: any) => {
      setHasError(true);
      setErrorMessage(error.toString());
      console.error("Caught an error from Boundary:", error);
    };

    window.onerror = (msg, url, lineNo, columnNo, error) => {
      handleError(error);
      return true;
    };

    window.onunhandledrejection = (event) => {
      handleError(event.reason);
    };

    return () => {
      window.onerror = null;
      window.onunhandledrejection = null;
    };
  }, []);

  if (hasError) {
    return <ErrorFallback />;
  }

  return children;
};

export default ErrorBoundary;
