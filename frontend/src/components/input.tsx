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
    <div class="  w-full py-8  ">
      <form class="flex gap-2 sm:gap-4 px-4 mx-auto" onSubmit={sendMessage}>
        <input
          class="flex-1 rounded px-4 py-2 border-black border-2"
          type="text"
          value={message()}
          onInput={(e) => setMessage(e.target.value)}
          onBeforeInput={(e) => {
            const data = e.data;
            if (data && (!/^[a-zA-Z]*$/.test(data) || message().length >= 45)) {
              e.preventDefault();
            }
          }}
          placeholder="Type your favourite word..."
        />

        <button
          class="bg-black text-white px-4 py-2 "
          type="submit"
          disabled={message().length === 0}
        >
          Send
        </button>
      </form>
    </div>
  );
}
