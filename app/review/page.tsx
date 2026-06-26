import { CodeInputForm } from "./components/code-input-form";

/** Static server-component shell for the /review route. */
export default function ReviewPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Code Review Assistant
          </h1>
          <p className="text-gray-500 max-w-xl">
            Paste any code snippet below. An AI agent will analyse it for style
            issues, potential bugs, missing error handling, and security
            concerns — then automatically produce a corrected version if needed.
          </p>
        </header>

        {/* Interactive client island */}
        <CodeInputForm />
      </div>
    </main>
  );
}

export const metadata = {
  title: "Code Review Assistant",
  description: "AI-powered code review using Claude and LangGraph",
};
