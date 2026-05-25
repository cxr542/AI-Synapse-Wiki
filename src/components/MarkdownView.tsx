import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { Link } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { resolveWikiHref } from "../lib/wiki-link";

interface Props {
  content: string;
  /** admin 보기: 공개 주제는 사용자 Wiki, 나머지는 관리 경로 */
  linkContext?: "admin" | "user";
}

export function MarkdownView({ content, linkContext = "user" }: Props) {
  const components: Components = {
    a: ({ href, children, ...rest }) => {
      const wiki = href ? resolveWikiHref(href, linkContext) : null;
      if (wiki) {
        return (
          <Link
            to={wiki.to}
            className={
              wiki.isPublicWiki ? "wiki-internal-link wiki-public-link" : "wiki-internal-link"
            }
            title={
              wiki.isPublicWiki
                ? `Wiki: ${wiki.entry.title}`
                : `관리: ${wiki.entry.title}`
            }
          >
            {children}
          </Link>
        );
      }
      if (href?.match(/^https?:\/\//i)) {
        return (
          <a href={href} target="_blank" rel="noreferrer" {...rest}>
            {children}
          </a>
        );
      }
      return (
        <a href={href} {...rest}>
          {children}
        </a>
      );
    },
  };

  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
