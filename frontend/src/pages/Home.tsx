import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [roomIdInput, setRoomIdInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const createRoom = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/rooms`, {
        method: "POST",
      });
      const data = await response.json();

      navigate(`/room/${data.id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Error connecting to backend. Is it running?");
    } finally {
      setIsLoading(false);
    }
  };

  const checkRoomExists = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/rooms`);

      if (!response.ok) {
        console.error("Failed to fetch rooms:", response.statusText);
        return false;
      }

      const rooms: any[] = await response.json();

      const exists = rooms.some((room) => room.id === id);
      return exists;
    } catch (error) {
      console.error("Network error while checking rooms:", error);
      setJoinError("Error connecting to backend. Is the server running?");
      return false;
    }
  };

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    const trimmedRoomId = roomIdInput.trim();
    if (!trimmedRoomId) {
      setJoinError("Please enter a Room ID.");
      return;
    }

    setIsLoading(true);
    const roomExists = await checkRoomExists(trimmedRoomId);
    setIsLoading(false);

    if (roomExists) {
      navigate(`/room/${trimmedRoomId}`);
    } else {
      setJoinError(
        `Room ID '${trimmedRoomId}' not found. Please check the ID or create a new room.`
      );
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen justify-center bg-base-300">
      <h1 className=" text-6xl font-bold text-white mb-8">WsScribe</h1>

      <div className="card bg-base-100 shadow-lg p-8 w-full max-w-md border border-gray-700">
        <div className="flex card-body items-center text-center">

          <button
            onClick={createRoom}
            disabled={isLoading}
            className="btn btn-primary w-full text-xl font-semibold py-3 px-6 rounded-lg transition-all mb-6"
          >
            Create New Room
            <Plus size={20} />
          </button>

          <div className="flex items-center gap-4 w-full">
            <div className="h-px bg-gray-500 flex-1"></div>
            <span className="text-gray-400 text-sm">OR</span>
            <div className="h-px bg-gray-500 flex-1"></div>
          </div>

          <form onSubmit={joinRoom} className="w-full">
            <div className="text-3xl font-bold mb-2 ">Join Room</div>
            <div className="flex flex-row">
              <label className="input w-full">
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                />
              </label>
              <button className="btn btn-primary mx-2 rounded-lg">
                <ArrowRight size={20} />
              </button>
            </div>
          </form>

        </div>
      </div>

      {joinError && (
        <div className="text-error text-sm mt-3 p-2 bg-red-800/20 rounded-lg border border-red-500/50">
          {joinError}
        </div>
      )}

    </div>
  );
};

export default Home;
