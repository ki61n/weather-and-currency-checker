// components/SafeMarkdown.js
import ReactMarkdown from 'react-markdown';

const SafeMarkdown = ({ content }) => {
  return (
    <div className="prose prose-sm max-w-none text-white">
      <ReactMarkdown>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default SafeMarkdown;
