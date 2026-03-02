import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-4xl mb-4">!</div>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">
              Đã xảy ra lỗi
            </h2>
            <p className="text-sm text-stone-500 mb-4">
              Trang gặp sự cố. Vui lòng tải lại.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark text-sm"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
