import { useEffect, useRef } from "react";
import hljs from "highlight.js";

export default function CodeBlock(
  { code, language = "javascript", style, ref }: {
    code: string;
    language: string;
    style?: React.CSSProperties;
    ref?: React.RefObject<HTMLPreElement>;
  },
) {
  const codeRef = ref || useRef<HTMLPreElement>(null);

  useEffect(() => {
    codeRef.current.innerHTML = code;
    codeRef.current.removeAttribute("data-highlighted");
    hljs.highlightElement(codeRef.current);
  }, [code, language]);

  return (
    <pre className="overflow-y-hidden w-full h-full">
      <code ref={codeRef} className={`language-${language}`} style={style}></code>
    </pre>
  );
}
