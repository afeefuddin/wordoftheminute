import { createSignal, JSX } from "solid-js";
import { useWebSocket } from "../context/webSocketContext";

export default function MessageInput() {
  const { ws } = useWebSocket();
  const [message, setMessage] = createSignal("");

  const sendMessage: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (e) => {
    e.preventDefault();
    ws()?.send(message());
    setMessage("");
  };

  return (
    <div class="px-4  sm:px-8 md:px-16 py-8 border-t border-black">
      <form
        class="flex gap-2 sm:gap-4 max-w-2xl mx-auto"
        onSubmit={sendMessage}
      >
        <input
          class="flex-1 rounded px-4 py-2 border border-gray-300"
          type="text"
          value={message()}
          onInput={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
          disabled={message().length === 0}
        >
          Send
        </button>
      </form>
    </div>
  );
}
