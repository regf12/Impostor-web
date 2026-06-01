
"use client";

import * as React from "react";
import { useEffect, useReducer, useCallback, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  ShieldQuestion,
  Timer,
  Vote,
  Skull,
  Crown,
  ChevronRight,
  Eye,
  RotateCcw,
  Lightbulb,
  Key,
  SkipForward,
  PlayCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getWordAndHintAction } from "./actions";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { GameWord } from "@/lib/game-words";
import { useTranslation, type Language } from "@/lib/i18n";
import { AdBanner } from "@/components/AdBanner";

type Player = {
  name: string;
  role: "Tripulante" | "Impostor";
  isAlive: boolean;
};

type GameStatus =
  | "loading"
  | "roleReveal"
  | "startPlayerReveal"
  | "gameplay"
  | "voting"
  | "roundOver"
  | "gameOver"
  | "error";

type GameState = {
  status: GameStatus;
  players: Player[];
  secretWord: string;
  hint: string;
  showHint: boolean;
  currentPlayerReveal: number;
  isRoleVisible: boolean;
  gameDuration: number;
  timeRemaining: number;
  ejectedPlayer: Player | null;
  winner: "Tripulantes" | "Impostores" | null;
  errorMessage: string;
  startingPlayer: Player | null;
  usedWords: string[];
  selectedPlayerForEjection: Player | null;
};

type GameAction =
  | {
      type: "START_GAME";
      payload: { players: Player[]; secretWord: string; hint: string; showHint: boolean; gameDuration: number; usedWords: string[]; };
    }
  | { type: "LOAD_STATE"; payload: GameState }
  | { type: "GAME_SETUP_ERROR"; payload: { message: string } }
  | { type: "TOGGLE_ROLE_VISIBILITY" }
  | { type: "HIDE_ROLE" }
  | { type: "NEXT_PLAYER_REVEAL" }
  | { type: "DETERMINE_STARTING_PLAYER" }
  | { type: "START_GAMEPLAY"; payload: { isNewRound: boolean } }
  | { type: "TICK" }
  | { type: "START_VOTING" }
  | { type: "SELECT_PLAYER_FOR_EJECTION"; payload: Player | null }
  | { type: "EJECT_SELECTED_PLAYER" }
  | { type: "SKIP_VOTE" }
  | { type: "RESTART" };


function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "LOAD_STATE":
      return action.payload;
    case "START_GAME":
      return {
        ...state,
        status: "roleReveal",
        players: action.payload.players,
        secretWord: action.payload.secretWord,
        hint: action.payload.hint,
        showHint: action.payload.showHint,
        gameDuration: action.payload.gameDuration,
        timeRemaining: action.payload.gameDuration,
        usedWords: [...action.payload.usedWords, action.payload.secretWord],
      };
    case "GAME_SETUP_ERROR":
      return {
        ...state,
        status: "error",
        errorMessage: action.payload.message,
      };
    case "TOGGLE_ROLE_VISIBILITY":
      return { ...state, isRoleVisible: !state.isRoleVisible };
    case "HIDE_ROLE":
      return { ...state, isRoleVisible: false };
    case "NEXT_PLAYER_REVEAL":
      return {
        ...state,
        currentPlayerReveal: state.currentPlayerReveal + 1,
        isRoleVisible: false,
      };
    case "DETERMINE_STARTING_PLAYER":
        const startingPlayerIndex = Math.floor(Math.random() * state.players.length);
        return {
            ...state,
            status: "startPlayerReveal",
            startingPlayer: state.players[startingPlayerIndex],
        };
    case "START_GAMEPLAY":
        return { 
            ...state, 
            status: "gameplay", 
            ejectedPlayer: null,
            timeRemaining: action.payload.isNewRound ? state.timeRemaining : state.gameDuration,
        };
    case "TICK":
      const newTime = state.timeRemaining - 1;
      if (newTime <= 0) {
        return {
            ...state,
            timeRemaining: 0,
            status: "gameOver",
            winner: "Impostores",
        }
      }
      return {
        ...state,
        timeRemaining: newTime,
      };
    case "START_VOTING":
      return { ...state, status: "voting" };
     case "SELECT_PLAYER_FOR_EJECTION":
      return { ...state, selectedPlayerForEjection: action.payload };
    case "EJECT_SELECTED_PLAYER":
      const ejected = state.selectedPlayerForEjection;
      if (!ejected) return state;

      const updatedPlayers = state.players.map((p) =>
        p.name === ejected.name ? { ...p, isAlive: false } : p
      );
      const remainingImpostors = updatedPlayers.filter(
        (p) => p.role === "Impostor" && p.isAlive
      ).length;
      const remainingCrewmates = updatedPlayers.filter(
        (p) => p.role === "Tripulante" && p.isAlive
      ).length;
      let winner: GameState["winner"] = null;
      let nextStatus: GameStatus = "roundOver";

      if (remainingImpostors === 0) {
        winner = "Tripulantes";
        nextStatus = "gameOver";
      } else if (remainingImpostors >= remainingCrewmates) {
        winner = "Impostores";
        nextStatus = "gameOver";
      }

      return {
        ...state,
        status: nextStatus,
        ejectedPlayer: ejected,
        players: updatedPlayers,
        winner,
        selectedPlayerForEjection: null,
      };
    case "SKIP_VOTE":
      return {
        ...state,
        status: "gameplay",
        ejectedPlayer: null, // No one was ejected
        selectedPlayerForEjection: null,
      };
    case "RESTART":
      // Handled by router navigation
      return state;
    default:
      return state;
  }
}

export function GamePageLoader() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-bold">{t('loadingGame')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('pleaseWait')}
        </p>
        <div className="w-full max-w-md mt-8 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </main>
  );
}

const GAME_STATE_KEY = 'impostorWeb_gameState';
const USED_WORDS_KEY = 'impostorWeb_usedWords';


function TimerDisplay({ timeRemaining, gameDuration }: { timeRemaining: number; gameDuration: number; }) {
  const { t } = useTranslation();
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl flex items-center justify-center gap-2">
          <Timer /> {t('timeRemaining')}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p 
          className="text-5xl font-mono font-bold text-primary" 
          aria-label={`${t('timeRemaining')}: ${minutes} ${t('minutes') || 'minutos'} y ${seconds} ${t('seconds') || 'segundos'}`}
        >
          {String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </p>
        <Progress
          value={(timeRemaining / gameDuration) * 100}
          className="mt-4"
        />
      </CardContent>
    </Card>
  );
}


export function GamePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  
  const initialState: GameState = {
    status: "loading",
    players: [],
    secretWord: "",
    hint: "",
    showHint: true,
    currentPlayerReveal: 0,
    isRoleVisible: false,
    gameDuration: 15 * 60,
    timeRemaining: 15 * 60,
    ejectedPlayer: null,
    winner: null,
    errorMessage: "",
    startingPlayer: null,
    usedWords: [],
    selectedPlayerForEjection: null,
  };

  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load state from localStorage on mount or start new game
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(GAME_STATE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Quick validation to see if the saved state seems valid for the current URL
        if (parsedState.players.length === parseInt(searchParams.get("players") || "0")) {
          dispatch({ type: 'LOAD_STATE', payload: parsedState });
          return;
        }
      }
    } catch (error) {
      console.error("Could not load game state from localStorage", error);
      localStorage.removeItem(GAME_STATE_KEY); // Clear corrupted state
    }
    
    // If no saved state, setup a new game
    async function setupGame() {
      const usedWordsFromStorage = localStorage.getItem(USED_WORDS_KEY);
      const usedWords = usedWordsFromStorage ? JSON.parse(usedWordsFromStorage) : [];
      const lang = (searchParams.get('lang') as Language) || 'es';
      
      const wordAndHint = await getWordAndHintAction(usedWords, lang);
      const numPlayers = parseInt(searchParams.get("players") || "4");
      const numImpostors = parseInt(searchParams.get("impostors") || "1");
      const gameTimeInMinutes = parseInt(searchParams.get('gameTime') || '15');
      const gameDuration = gameTimeInMinutes * 60;
      const namesParam = searchParams.get("names");
      const showHint = searchParams.get("showHint") === 'true';
      const lastImpostorsParam = searchParams.get("lastImpostors");
      const lastImpostors = lastImpostorsParam ? lastImpostorsParam.split(',').map(decodeURIComponent) : [];

      const { secretWord, hint } = wordAndHint;
      
      if (!secretWord || secretWord === 'Error') {
          dispatch({ type: 'GAME_SETUP_ERROR', payload: { message: hint || t('unknownError') } });
          return;
      }

      const playerNames = namesParam
        ? namesParam.split(',').map(decodeURIComponent)
        : Array.from({ length: numPlayers }, (_, i) => `${t('player')} ${i + 1}`);

      const eligibleForImpostor = playerNames.map((name, index) => ({ name, index })).filter(p => !lastImpostors.includes(p.name));
      
      let impostorIndices = new Set<number>();
      
      const candidates = eligibleForImpostor.length >= numImpostors ? eligibleForImpostor : playerNames.map((name, index) => ({ name, index }));

      while (impostorIndices.size < numImpostors) {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const chosenPlayerOriginalIndex = candidates[randomIndex].index;
        impostorIndices.add(chosenPlayerOriginalIndex);
        candidates.splice(randomIndex, 1);
      }

      const players: Player[] = playerNames.map((name, index) => ({
        name,
        role: impostorIndices.has(index) ? "Impostor" : "Tripulante",
        isAlive: true,
      }));

      dispatch({ type: "START_GAME", payload: { players, secretWord, hint, showHint, gameDuration, usedWords } });
    }
    setupGame();
  }, [searchParams, t]);

  // Save state to localStorage on change
  useEffect(() => {
    if (state.status !== 'loading' && state.status !== 'error') {
      try {
        localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
        // Save used words separately to persist them across full games
        if (state.usedWords.length > 0) {
            localStorage.setItem(USED_WORDS_KEY, JSON.stringify(state.usedWords));
        }
      } catch (error) {
        console.error("Could not save game state to localStorage", error);
      }
    }
     // Clear state on game over to start fresh next time for the next round
    if (state.status === 'gameOver') {
      localStorage.removeItem(GAME_STATE_KEY);
    }
  }, [state]);

  // Timer effect
  useEffect(() => {
    if (state.status === "gameplay" || state.status === "voting") {
      const timer = setInterval(() => {
        dispatch({ type: "TICK" });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state.status]);

  const handlePlayAgain = () => {
    const currentCrewmateWins = parseInt(searchParams.get('crewmateWins') || '0');
    const currentImpostorWins = parseInt(searchParams.get('impostorWins') || '0');

    const newCrewmateWins = state.winner === 'Tripulantes' ? currentCrewmateWins + 1 : currentCrewmateWins;
    const newImpostorWins = state.winner === 'Impostores' ? currentImpostorWins + 1 : currentImpostorWins;
    
    const lastImpostors = state.players.filter(p => p.role === 'Impostor').map(p => encodeURIComponent(p.name)).join(',');

    const numPlayers = state.players.length;
    const numImpostors = state.players.filter(p => p.role === 'Impostor').length;
    const playerNames = state.players.map(p => encodeURIComponent(p.name)).join(',');
    const gameTime = String(state.gameDuration / 60);

    localStorage.removeItem(GAME_STATE_KEY);

    const params = new URLSearchParams({
      crewmateWins: String(newCrewmateWins),
      impostorWins: String(newImpostorWins),
      lastImpostors: lastImpostors,
      players: String(numPlayers),
      impostors: String(numImpostors),
      names: playerNames,
      gameTime: gameTime,
      showHint: String(state.showHint),
      lang: currentLanguage,
    });
    
    router.push(`/?${params.toString()}`);
  }

  const handleNextPlayer = useCallback(() => {
    if (state.currentPlayerReveal >= state.players.length - 1) {
        dispatch({ type: "DETERMINE_STARTING_PLAYER" });
        return;
    }
    dispatch({ type: "HIDE_ROLE" });
    setIsTransitioning(true);
    setTimeout(() => {
      dispatch({ type: "NEXT_PLAYER_REVEAL" });
      setIsTransitioning(false);
    }, 700);
  }, [state.currentPlayerReveal, state.players.length]);

  const renderContent = () => {
    if (state.status === "loading") {
      return <GamePageLoader />;
    }

    if (state.status === "error") {
        return (
          <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md text-center p-8">
              <CardTitle className="text-2xl text-destructive mb-4">{t('errorTitle')}</CardTitle>
              <p className="text-muted-foreground mb-6">{state.errorMessage}</p>
              <Button onClick={() => router.push('/')}>
                <RotateCcw className="mr-2" /> {t('backToHome')}
              </Button>
            </Card>
          </main>
        )
      }

    switch (state.status) {
      case "roleReveal":
        const currentPlayer = state.players[state.currentPlayerReveal];
        
        if (!currentPlayer) {
          return null; 
        }

        return (
          <div className="w-full max-w-sm text-center">
            <h2 className="text-2xl font-bold mb-4">
              {t('itsYourTurn', { name: currentPlayer.name })}
            </h2>

            <div className="perspective">
              <div
                className={cn(
                  "relative w-full h-64 transition-transform duration-700 preserve-3d",
                  { "rotate-y-180": state.isRoleVisible }
                )}
              >
                {/* Card Front */}
                <div className="absolute w-full h-full backface-hidden">
                  <Button
                    variant="outline"
                    className="w-full h-full text-lg flex-col"
                    disabled={isTransitioning}
                    onClick={() => !isTransitioning && dispatch({ type: "TOGGLE_ROLE_VISIBILITY" })}
                    aria-expanded={state.isRoleVisible}
                  >
                    <Eye className="w-12 h-12 mb-2" />
                    {t('revealRole')}
                  </Button>
                </div>
                {/* Card Back */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180" aria-live="polite" aria-atomic="true">
                  <Card
                    className={cn(
                      "w-full h-full flex flex-col items-center justify-center",
                      currentPlayer.role === "Impostor"
                        ? "border-primary bg-primary/10"
                        : "border-accent bg-accent/10"
                    )}
                  >
                    <CardHeader>
                      <CardTitle
                        className={cn(
                          "text-3xl flex items-center gap-2",
                          currentPlayer.role === "Impostor"
                            ? "text-primary"
                            : "text-accent"
                        )}
                      >
                        {currentPlayer.role === "Impostor" ? (
                          <ShieldQuestion />
                        ) : (
                          <Users />
                        )}
                        {t('youAre', { role: t(currentPlayer.role === 'Impostor' ? 'impostor' : 'crewmate')})}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      {currentPlayer.role === "Impostor" && state.showHint && (
                        <>
                          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                            <Lightbulb className="w-4 h-4" />
                            {t('yourHintIs')}
                          </p>
                          <p className="font-semibold text-lg">{state.hint}</p>
                        </>
                      )}
                      {currentPlayer.role === "Tripulante" && (
                         <>
                         <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                           <Key className="w-4 h-4" />
                           {t('secretWordIs')}
                         </p>
                         <p className="font-semibold text-lg">{state.secretWord}</p>
                       </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {state.isRoleVisible && (
              <Button
                className="w-full mt-4"
                onClick={handleNextPlayer}
              >
                {state.currentPlayerReveal === state.players.length - 1
                  ? t('seeWhoStarts')
                  : t('hideAndNext')}
                <ChevronRight className="ml-2" />
              </Button>
            )}
          </div>
        );
    
      case "startPlayerReveal":
        if (!state.startingPlayer) return null;
        return (
            <div className="w-full max-w-md text-center">
                <Card className="p-8 animate-in fade-in-0 zoom-in-95">
                    <CardHeader>
                        <CardTitle className="text-3xl">{t('allReady')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg mb-4">{t('roundStarts')}</p>
                        <p className="text-4xl font-bold text-primary mb-8">{state.startingPlayer.name}</p>
                        <Button className="w-full text-lg py-6" onClick={() => dispatch({ type: "START_GAMEPLAY", payload: { isNewRound: false } })}>
                            <PlayCircle className="mr-2" />
                            {t('startGameplay')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );

      case "gameplay":
        return (
          <div className="w-full max-w-lg space-y-6">
            <TimerDisplay timeRemaining={state.timeRemaining} gameDuration={state.gameDuration} />
            <Button
              className="w-full text-lg py-6"
              variant="destructive"
              onClick={() => dispatch({ type: "START_VOTING" })}
            >
              <Vote className="mr-2" /> {t('callMeeting')}
            </Button>
          </div>
        );

      case "voting":
        const handlePlayerSelect = (player: Player) => {
          if (state.selectedPlayerForEjection?.name === player.name) {
            dispatch({ type: 'SELECT_PLAYER_FOR_EJECTION', payload: null });
          } else {
            dispatch({ type: 'SELECT_PLAYER_FOR_EJECTION', payload: player });
          }
        };

        return (
          <div className="w-full max-w-md text-center space-y-6">
            <TimerDisplay timeRemaining={state.timeRemaining} gameDuration={state.gameDuration} />
            <div>
                <h2 className="text-3xl font-bold text-primary mb-6">
                {t('whoIsTheImpostor')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {state.players
                    .filter((p) => p.isAlive)
                    .map((player) => (
                    <Button
                        key={player.name}
                        variant={state.selectedPlayerForEjection?.name === player.name ? "default" : "outline"}
                        className="h-24 flex-col text-lg"
                        onClick={() => handlePlayerSelect(player)}
                        aria-pressed={state.selectedPlayerForEjection?.name === player.name}
                    >
                        <Users className="mb-1" />
                        {player.name}
                    </Button>
                    ))}
                </div>
                <div className="space-y-3">
                    <Button
                        className="w-full"
                        variant="destructive"
                        disabled={!state.selectedPlayerForEjection}
                        onClick={() => dispatch({ type: "EJECT_SELECTED_PLAYER" })}
                    >
                        <Skull className="mr-2"/> {t('ejectPlayer', { name: state.selectedPlayerForEjection?.name || '...' })}
                    </Button>
                    <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => dispatch({ type: "SKIP_VOTE" })}
                    >
                        <SkipForward className="mr-2"/> {t('skipVote')}
                    </Button>
                </div>
            </div>
          </div>
        );

      case "roundOver":
      case "gameOver":
        const ejected = state.ejectedPlayer;
        return (
          <div className="w-full max-w-md text-center">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-2">
                {state.status === 'gameOver' ? t('gameOver') : t('votingOver')}
              </h2>
              
              {!ejected && state.status !== 'gameOver' && (
                 <p className="text-lg my-6">{t('nobodyEjected')}</p>
              )}
              
              {state.timeRemaining <= 0 && (
                <p className="text-lg my-6 text-primary font-bold">{t('timeUp')}</p>
              )}


              {ejected && (
                <>
                <p className="text-lg">
                  <span className="font-bold text-primary">{ejected.name}</span>{" "}
                  {t('wasEjected')}
                </p>
                <div className="my-6 flex flex-col items-center">
                  {ejected.role === "Impostor" ? (
                    <>
                      <Skull className="w-16 h-16 text-green-500" />
                      <p className="text-xl font-bold mt-2 text-green-500">
                        {t('wasAnImpostor')}
                      </p>
                    </>
                  ) : (
                    <>
                      <Users className="w-16 h-16 text-red-500" />
                      <p className="text-xl font-bold mt-2 text-red-500">
                        {t('wasNotAnImpostor')}
                      </p>
                    </>
                  )}
                </div>
                </>
              )}

              {state.winner ? (
                <div className="bg-card-foreground/10 p-4 rounded-lg">
                  <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Crown
                      className={cn(
                        "w-8 h-8",
                        state.winner === "Tripulantes"
                          ? "text-blue-400"
                          : "text-red-400"
                      )}
                    />
                    {t('winners', { winner: t(state.winner === 'Tripulantes' ? 'crewmates' : 'impostors')})}
                  </h3>
                  <div className="mt-2 text-sm">
                    {state.players.map(p => (
                      <div key={p.name} className="flex justify-center items-center gap-2">
                        <span>{p.name}</span>
                        <Badge variant={p.role === 'Impostor' ? 'destructive' : 'secondary'}>{t(p.role === 'Impostor' ? 'impostor' : 'crewmate')}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {state.status === 'gameOver' ? (
                 <Button
                    className="w-full mt-8"
                    onClick={handlePlayAgain}
                  >
                    <RotateCcw className="mr-2" /> {t('playAgain')}
                  </Button>
              ) : (
                <Button className="w-full mt-8" onClick={() => dispatch({ type: 'START_GAMEPLAY', payload: { isNewRound: true } })}>
                  <ChevronRight className="mr-2" /> {t('continueGame')}
                </Button>
              )}
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {renderContent()}

      {/* Renderiza el banner si está configurado en producción o muestra el placeholder de dev */}
      {(process.env.NEXT_PUBLIC_ADSENSE_GAME_SLOT_ID || process.env.NODE_ENV === "development") && state.status !== "loading" && state.status !== "error" && (
        <div className="w-full max-w-md mt-6">
          <AdBanner dataAdSlot={process.env.NEXT_PUBLIC_ADSENSE_GAME_SLOT_ID || "1234567890"} />
        </div>
      )}
    </main>
  );
}
