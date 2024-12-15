import {
  createContext,
  createSignal,
  useContext,
  onCleanup,
  JSX,
  Accessor,
} from "solid-js";

const WebSocketContext = createContext<{
  ws: Accessor<WebSocket | null>;
  initializeWebSocket: () => void;
}>();

export const WebSocketProvider = (props: { children: JSX.Element }) => {
  const [ws, setWs] = createSignal<WebSocket | null>(null);

  const initializeWebSocket = () => {
    const socket = new WebSocket("ws://localhost:8000/connect");

    socket.onopen = () => {
      console.log("WebSocket is open now.");
      setWs(socket);
    };

    // socket.onmessage = (event) => {
    //   console.log("Message from server: ", event.data);
    // };

    socket.onerror = (error) => {
      console.log("WebSocket error: ", error);
    };

    socket.onclose = () => {
      console.log("WebSocket closed.");
      setWs(null);
    };
  };

  onCleanup(() => {
    if (ws()) {
      ws()?.close();
    }
  });

  return (
    <WebSocketContext.Provider value={{ ws: ws, initializeWebSocket }}>
      {props.children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
