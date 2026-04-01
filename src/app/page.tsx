"use client";

import { DebtorsManager } from "@/components/DebtorsManager";
import "dayjs/locale/ru";

export default function Home() {
  return (
    <main>
      <DebtorsManager />
    </main>
  );
}
