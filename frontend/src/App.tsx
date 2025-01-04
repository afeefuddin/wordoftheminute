import { createEffect, For } from "solid-js";
import "./App.css";
import Header from "./components/header";
import { useWebSocket } from "./context/webSocketContext";
import MessageInput from "./components/input";
import { TransitionGroup } from "solid-transition-group";
import { useDataEntry } from "./context/dataEntriesContext";

interface DataEntry {
  key: string;
  value: number;
}

function App() {
  const { ws, initializeWebSocket } = useWebSocket();

  const { dataEntries, setDataEntries } = useDataEntry();

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
              return b.key.localeCompare(a.key);
            } else {
              return b.value - a.value;
            }
          });

        setDataEntries(updatedEntries);
      };
    }
  });

  return (
    <div class="bg-gray-200 h-screen">
      <div class="max-w-4xl h-full mx-auto w-full ">
        <div class="bg-white px-4 h-full flex flex-col">
          <Header showTimer />
          {ws() === null ? (
            <div class="flex items-center justify-center h-full">
              Connecting...
            </div>
          ) : (
            <>
              <div class="flex-1 mx-4 mt-2  overflow-y-auto border-2 border-black">
                <div class=" mx-auto">
                  <table class="flex flex-row gap-2">
                    <tbody class="flex flex-col w-full">
                      <TransitionGroup name="words-list">
                        <For each={dataEntries()}>
                          {(entry, idx) => (
                            <tr class="border hover:bg-gray-50 px-2 words-list w-full py-2 flex flex-row gap-2 items-center">
                              <td class="py-2 text-lg">{idx() + 1}.</td>
                              <td class="py-2 text-lg flex-1">{entry.key}</td>
                              <td class="py-2 text-end ">{entry.value}</td>
                            </tr>
                          )}
                        </For>
                      </TransitionGroup>
                    </tbody>
                  </table>
                </div>
              </div>
              <MessageInput />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
