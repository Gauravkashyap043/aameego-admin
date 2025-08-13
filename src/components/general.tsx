import { useState } from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

export function ProfileCode({ record }: { record: { profileCode: string } }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(record.profileCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2s
  };

  return (
    <div className="text-xs text-gray-500 flex items-center space-x-1">
      {/* <span>Profile Code–</span> */}
      <span className="font-bold">{record.profileCode}</span>
      <span
        className="ml-1 cursor-pointer text-gray-400 hover:text-black transition"
        title={copied ? "Copied!" : "Copy"}
        onClick={handleCopy}
      >
        {copied ? (
          <CheckIcon className="w-4 h-4 text-green-500" />
        ) : (
          <ClipboardIcon className="w-4 h-4" />
        )}
      </span>
    </div>
  );
}
