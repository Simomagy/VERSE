import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-screen bg-hud-deep items-center justify-center p-8">
          <div className="w-full max-w-2xl border border-hud-red bg-hud-red/5 p-6 font-mono">
            <p className="text-hud-red text-xs tracking-widest uppercase mb-3">
              ✕ RENDER ERROR — check DevTools console
            </p>
            <pre className="text-hud-text text-xs whitespace-pre-wrap break-all leading-5">
              {this.state.error.message}
            </pre>
            {this.state.error.stack && (
              <pre className="text-hud-muted text-[10px] whitespace-pre-wrap break-all leading-4 mt-3 max-h-48 overflow-y-auto">
                {this.state.error.stack}
              </pre>
            )}
            <button
              className="mt-4 px-4 py-2 border border-hud-cyan text-hud-cyan text-xs tracking-widest hover:bg-hud-cyan/10"
              onClick={() => this.setState({ error: null })}
            >
              RETRY
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
