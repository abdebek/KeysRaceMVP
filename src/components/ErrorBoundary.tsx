import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { withTranslation, WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryComponent extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    const { t } = this.props;
    
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center p-4">
          <div className="glass-card p-8 max-w-md w-full text-center">
            <div className="bg-error-600/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-error-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-200 mb-4">
              {t('errorBoundary.somethingWentWrong')}
            </h2>
            
            <p className="text-gray-400 mb-6">
              {t('errorBoundary.sorryUnexpected')}
            </p>
            
            <button
              onClick={this.handleReload}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('errorBoundary.refreshPage')}</span>
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-gray-400 cursor-pointer">{t('errorBoundary.errorDetails')}</summary>
                <pre className="mt-2 p-4 bg-dark-800 rounded text-xs text-gray-300 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryComponent);