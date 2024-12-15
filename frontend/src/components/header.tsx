import { A } from "@solidjs/router";

export default function Header({ className }: { className?: string }) {
  return (
    <div
      class={`grid grid-cols-2 grid-rows-2 md:grid-rows-1 md:grid-cols-3 border-b border-black items-center px-4 py-6 gap-4 ${className}`}
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
      <h2 class="text-right md:text-center order-2 md:order-3 hover:underline">
        <A href="/history">Past wordoftheminute</A>
      </h2>
    </div>
  );
}
