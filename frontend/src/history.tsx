import { createEffect, createSignal } from "solid-js";
import Header from "./components/header";

interface WordData {
  Timestamp: string;
  First: string;
  Second: string;
  Third: string;
}

export default function History() {
  const [data, setData] = createSignal<WordData[] | null>(null);

  createEffect(() => {
    const backend_url = import.meta.env.VITE_BACKEND_URL;
    fetch(backend_url + "/history", {
      method: "GET",
    })
      .then((value) => value.json())
      .then((data) => {
        setData(data as WordData[]);
      });
  });

  return (
    <div class="min-h-screen bg-gray-200">
      <div class="max-w-4xl mx-auto w-full min-h-screen">
        <div class="bg-white flex flex-col h-full min-h-screen">
          <Header className="sticky top-0 z-10 bg-white" />
          {data() === null ? (
            <div class="flex items-center flex-1 justify-center h-full">
              Loading...
            </div>
          ) : (
            <div class="max-w-4xl px-4 mx-auto h-full flex flex-col gap-2 w-full">
              <div class="overflow-x-auto relative">
                <table class="border-collapse w-full text-left text-sm text-gray-600">
                  <thead class=" w-full">
                    <tr class="bg-gray-100 text-gray-800">
                      <th class="p-4 border-b-2 border-gray-300">Minute</th>
                      <th class="p-4 border-b-2 border-gray-300">First</th>
                      <th class="p-4 border-b-2 border-gray-300">Second</th>
                      <th class="p-4 border-b-2 border-gray-300">Third</th>
                    </tr>
                  </thead>
                  <tbody class="overflow-x-auto">
                    {data()?.map((w) => (
                      <tr class="hover:bg-gray-50">
                        <td class="p-4 border-b border-gray-300">
                          {new Date(
                            parseInt(w.Timestamp) * 1000
                          ).toLocaleString("en-GB", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </td>
                        <td class="p-4 border-b border-gray-300">{w.First}</td>
                        <td class="p-4 border-b border-gray-300">{w.Second}</td>
                        <td class="p-4 border-b border-gray-300">{w.Third}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
