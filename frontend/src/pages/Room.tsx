import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Copy, Check, ArrowLeft } from "lucide-react";

const Room = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [code, setCode] = useState("# Code here");
  const [suggestion, setSuggestion] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<
    { message: string; type: "success" | "error" }[]
  >([]);
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const WS_URL = import.meta.env.VITE_WEBSOCKET_BASE_URL

  const socketRef = useRef<WebSocket | null>(null);
  const editorRef = useRef<any>(null);

  const addToast = (message: string, type: "success" | "error") => {
    setToast((prev) => [...prev, { message, type }]);

    setTimeout(() => {
      setToast((prev) => prev.slice(1));
    }, 3000);
  };

  const handleHomeButton = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    navigate("/");
  };

  const applySuggestion = () => {
    if (suggestion) {
      const newCode = code + suggestion;
      setCode(newCode);
      handleEditorChange(newCode);
      setSuggestion("");
    }
  };

  const dismissSuggestion = () => {
    setSuggestion("");
  };

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(`${WS_URL}/ws/room/${roomId}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to Room:", roomId);
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        setCode(event.data);
        return;
      }
      if (typeof data === "object" && data !== null) {
        if (data.joined) {
          addToast(data.joined, "success");
          return;
        }
        if (data.left) {
          addToast(data.left, "error");
          return;
        }
      }
      setCode(event.data);
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (code.length < 5) return;

      try {
        const response = await fetch(
          `${API_URL}/autocomplete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code_context: code,
              cursor_line: 0,
              cursor_column: 0,
              language: "python",
            }),
          }
        );
        const data = await response.json();
        setSuggestion(data.suggestion);
      } catch (err) {
        console.error("AI Error:", err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    const editor = editorRef.current;
    let disposable: any;

    if (editor && suggestion) {
      disposable = editor.onKeyDown((e: any) => {
        const { KeyCode } = (window as any).monaco;

        if (e.keyCode === KeyCode.Tab) {
          e.preventDefault();
          applySuggestion();
          return;
        }

        if (e.keyCode === KeyCode.Escape) {
          e.preventDefault();
          dismissSuggestion();
          return;
        }

        if (e.keyCode !== KeyCode.Tab && e.keyCode !== KeyCode.Escape) {
          dismissSuggestion();
        }
      });
    }

    return () => {
      if (disposable) {
        disposable.dispose();
      }
    };
  }, [editorRef.current, suggestion, code]);
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);

      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(value);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-base-300 text-white">
      <div className="flex items-center justify-between px-6 py-3 bg-base-100 border-b border-gray-700">

        <div className="text-xl font-semibold text-blue-400">
          <button
            className=" btn btn-primary flex fles-row px-3 py-1.5 rounded-md text-sm"
            onClick={handleHomeButton}
          >
            <ArrowLeft size={30} />
            Home
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={copyToClipboard}
            className="btn btn-primary flex items-center gap-2 px-3 py-1.5 rounded-md text-sm"
          >
            {copied ? (
              <Check size={16} className="text-green-400" />
            ) : (
              <Copy size={16} />
            )}
            {copied ? "Copied!" : "Share URL"}
          </button>
        </div>

      </div>

      <div className="flex-1 flex flex-col relative">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            wordWrap: "on",
            automaticLayout: true,
          }}
        />

        <div className="toast toast-end toast-bottom z-50">
          {toast.map((t, i) => (
            <div
              key={i}
              className={`alert ${
                t.type === "success" ? "alert-success" : "alert-error"
              }`}
            >
              <span>{t.message}</span>
            </div>
          ))}
        </div>

        {suggestion && (
          <div className="absolute bottom-4 right-4 bg-base-100 border border-yellow-500/50 p-4 rounded-lg shadow-2xl max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">

              <span className="text-xs font-bold text-yellow-500 uppercase">
                AI Suggestion
              </span>

              <button
                onClick={() => setSuggestion("")}
                className="text-gray-400 hover:text-white text-xs"
              >
                Dismiss
              </button>

            </div>

            <pre className="bg-black/30 p-2 rounded text-sm font-mono text-gray-300 mb-2 overflow-x-auto">
              {suggestion}
            </pre>

            <button
              onClick={() => {
                const newCode = code + suggestion;
                setCode(newCode);
                handleEditorChange(newCode);
                setSuggestion("");
              }}
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-white text-sm py-1 rounded transition-colors"
            >
              Apply Suggestion (Tab)
            </button>

          </div>
        )}
        
      </div>
    </div>
  );
};

export default Room;
