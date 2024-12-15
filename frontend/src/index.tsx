/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App.tsx";
import { WebSocketProvider } from "./context/webSocketContext.tsx";

const root = document.getElementById("root");

render(
  () => (
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  ),
  root!
);
