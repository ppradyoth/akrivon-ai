declare module "react-markdown" {
  import * as React from "react";

  interface ReactMarkdownProps {
    children: string;
  }

  const ReactMarkdown: React.FC<ReactMarkdownProps>;
  export default ReactMarkdown;
}