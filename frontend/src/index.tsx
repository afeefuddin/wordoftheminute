/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App.tsx";
import { WebSocketProvider } from "./context/webSocketContext.tsx";
import { Route, Router } from "@solidjs/router";
import History from "./history.tsx";
import { DataEntryProvider } from "./context/dataEntriesContext.tsx";

const root = document.getElementById("root");

render(
  () => (
    <DataEntryProvider>
      <WebSocketProvider>
        <Router>
          <Route path="/" component={App} />
          <Route path="/history" component={History} />
        </Router>
      </WebSocketProvider>
    </DataEntryProvider>
  ),
  root!
);
