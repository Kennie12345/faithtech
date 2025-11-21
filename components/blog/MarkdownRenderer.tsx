/**
 * Markdown Renderer Component
 * Renders markdown content with proper styling
 *
 * Note: This is a simple implementation for MVP.
 * For production, consider adding a markdown library like:
 * - react-markdown (https://github.com/remarkjs/react-markdown)
 * - marked (https://marked.js.org/)
 *
 * For now, we're using Tailwind's prose classes with whitespace-pre-wrap
 * to preserve basic formatting.
 */

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none ${className}`}
    >
      <div className="whitespace-pre-wrap">{content}</div>
    </div>
  );
}

/**
 * TODO: Enhance markdown rendering
 *
 * To add full Markdown support in the future:
 *
 * 1. Install react-markdown:
 *    npm install react-markdown remark-gfm
 *
 * 2. Replace the component with:
 *    import ReactMarkdown from 'react-markdown';
 *    import remarkGfm from 'remark-gfm';
 *
 *    export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
 *      return (
 *        <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
 *          <ReactMarkdown remarkPlugins={[remarkGfm]}>
 *            {content}
 *          </ReactMarkdown>
 *        </div>
 *      );
 *    }
 *
 * 3. Add Tailwind typography plugin to tailwind.config.ts if not already present:
 *    plugins: [require('@tailwindcss/typography')]
 */
