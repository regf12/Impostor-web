
import { Suspense } from "react";
import { GamePageContent, GamePageLoader } from "./content";

export default function GamePage() {
  return (
    <Suspense fallback={<GamePageLoader />}>
      <GamePageContent />
    </Suspense>
  );
}
