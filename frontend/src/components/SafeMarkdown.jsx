// components/SafeMarkdown.js
import ReactMarkdown from 'react-markdown';

const SafeMarkdown = ({ content }) => {
  return (
    <div className="prose prose-sm max-w-none text-white whitespace-pre-wrap">
      <ReactMarkdown>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default SafeMarkdown;
