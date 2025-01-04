import { A } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";

export default function Header({
  className,
  showTimer = false,
}: {
  className?: string;
  showTimer?: boolean;
}) {
  const [seconds, setSeconds] = createSignal(new Date().getSeconds());
  const [hours, setHours] = createSignal(new Date().getHours());
  const [minutes, setMinutes] = createSignal(new Date().getMinutes());
  createEffect(() => {
    setInterval(() => {
      setSeconds(new Date().getSeconds());
      setMinutes(new Date().getMinutes());
      setHours(new Date().getHours());
    }, 1000);
  });
  return (
    <div class={` px-4 py-4 pb-2 md:pt-6 flex flex-col  md:gap-4 ${className}`}>
      <div
        class={`grid grid-cols-2 grid-rows-2 md:grid-rows-1 md:grid-cols-3 items-center  gap-4 `}
      >
        <h2 class="text-left md:text-center order-2 md:order-1">
          Made by{" "}
          <a
            href="https://github.com/afeefuddin"
            target="_blank"
            class="underline"
          >
            afeef
          </a>
        </h2>
        <h1 class="text-center col-span-2  md:col-span-1 text-3xl font-semibold order-1 md:order-2">
          <A href="/">wordoftheminute</A>
        </h1>

        {showTimer ? (
          <h2 class="text-right md:text-center order-2 md:order-3 hover:underline">
            <A href="/history">
              Past{" "}
              <span class=" hover:underline hidden md:inline-block">
                wordoftheminute
              </span>{" "}
              <span class="inline-block md:hidden">wotm</span>
            </A>
          </h2>
        ) : (
          <h2 class="text-right md:text-center order-2 md:order-3 hover:underline">
            <A href="/">
              Current{" "}
              <span class=" hover:underline hidden md:inline-block">
                wordoftheminute
              </span>{" "}
              <span class="inline-block md:hidden">wotm</span>
            </A>
          </h2>
        )}
      </div>
      <div class="border border-black"></div>
      {showTimer && (
        <div class="border-black mt-4 md:mt-0 border-2 p-2 bg-gray-100">
          <div class="countdown font-mono text-xl mx-auto w-fit">
            <span>{String(hours()).padStart(2, "0")}</span>:
            <span>{String(minutes()).padStart(2, "0")}</span>:
            <span>{String(seconds()).padStart(2, "0")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
