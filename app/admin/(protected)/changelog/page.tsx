import fs from "fs/promises";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Changelog page - read CHANGELOG.md from the project root and renders it.
 * Server component : the file is read at request time, no API route needed
 * @returns
 */

export default async function ChangelogPage() {
  const filePath = path.join(process.cwd(), "CHANGELOG.md");
  const raw = await fs.readFile(filePath, "utf-8");

  return (
    <div className="space-y-6 w-full">
      <div className="bg-white max-w-7xl mx-auto">
        <div className="prose prose-gray prose-headings:text-brand-color-500 prose-h2:text-xl prose-h2:font-bold prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h3:text-base prose-h3:font-semibold prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-700 prose-a:text-brand-color-500 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{raw}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
