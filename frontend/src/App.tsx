import { createEffect, createSignal, For } from "solid-js";
import "./App.css";
import Header from "./components/header";
import { useWebSocket } from "./context/webSocketContext";
import MessageInput from "./components/input";
import { TransitionGroup } from "solid-transition-group";

interface DataEntry {
  key: string;
  value: number;
}

function App() {
  const { ws, initializeWebSocket } = useWebSocket();

  const [dataEntries, setDataEntries] = createSignal<DataEntry[]>([]);

  createEffect(() => {
    if (!ws()) {
      initializeWebSocket();
    }
  });

  createEffect(() => {
    if (ws()) {
      ws()!.onmessage = (event) => {
        let rawData = event.data as string;

        if (!rawData.trim()) return;
        rawData = rawData.replace(/"/g, "");

        if (rawData.trim() === "##") {
          setDataEntries([]);
          return;
        }

        const updatedEntries = rawData
          .replace(/"/g, "")
          .split(",")
          .reduce<DataEntry[]>(
            (acc, item) => {
              const [key, valueStr] = item.split("#");

              if (key && valueStr) {
                const value = parseInt(valueStr, 10);

                if (!isNaN(value)) {
                  const existingEntryIndex = acc.findIndex(
                    (entry) => entry.key === key
                  );

                  if (existingEntryIndex !== -1) {
                    acc[existingEntryIndex] = {
                      key,
                      value: acc[existingEntryIndex].value + value,
                    };
                  } else {
                    acc.push({ key, value });
                  }
                }
              }

              return acc;
            },
            [...dataEntries()]
          )
          .sort((a, b) => {
            if (a.value === b.value) {
              return a.key.localeCompare(b.key);
            } else {
              return b.value - a.value;
            }
          });

        setDataEntries(updatedEntries);
      };
    }
  });

  return (
    <div class="bg-gray-200 h-screen flex flex-col">
      <Header />
      {ws() === null ? (
        <div class="flex items-center justify-center h-full">Connecting...</div>
      ) : (
        <>
          <div class="flex-1 px-4 py-4 overflow-y-auto">
            <div class="max-w-xl mx-auto">
              <div class="flex flex-row gap-2">
                <div class="flex flex-col">
                  {dataEntries().map((_, idx) => (
                    <div class="flex gap-2 items-center">
                      <div class="text-lg">{idx + 1}.</div>
                    </div>
                  ))}
                </div>

                <div class="flex flex-col w-full">
                  <TransitionGroup name="words-list">
                    <For each={dataEntries()}>
                      {(entry) => (
                        <div class="flex w-full justify-between items-center words-list">
                          <div class="text-lg">{entry.key}</div>
                          <div>{entry.value}</div>
                        </div>
                      )}
                    </For>
                  </TransitionGroup>
                </div>
              </div>
            </div>
          </div>
          <MessageInput />
        </>
      )}
    </div>
  );
}

export default App;
