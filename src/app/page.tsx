
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Users, ShieldQuestion, Pencil, Lightbulb, Trophy, Loader2, RefreshCw, Clock, Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { AdBanner } from "@/components/AdBanner";

const GAME_STATE_KEY = 'impostorWeb_gameState';
const PLAYER_NAMES_KEY = "impostorWeb_playerNames";
const GAME_CONFIG_KEY = "impostorWeb_gameConfig";
const USED_WORDS_KEY = 'impostorWeb_usedWords';


interface NumberInputProps {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  'aria-label': string;
}

function NumberInput({ value, onValueChange, min, max, 'aria-label': ariaLabel }: NumberInputProps) {
  const { t } = useTranslation();
  const handleDecrement = () => {
    if (value > min) {
      onValueChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onValueChange(value + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2" aria-label={ariaLabel}>
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label={t('decrease')}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <label htmlFor={`number-input-${ariaLabel.toLowerCase().replace(/\s+/g, '-')}`} className="sr-only">
        {ariaLabel}
      </label>
      <Input
        type="text"
        id={`number-input-${ariaLabel.toLowerCase().replace(/\s+/g, '-')}`}
        readOnly
        value={value}
        className="w-16 h-10 text-center text-lg font-bold"
        aria-label={ariaLabel}
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label={t('increase')}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}


function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const { t, currentLanguage } = useTranslation();

  const [players, setPlayers] = useState(4);
  const [impostors, setImpostors] = useState(1);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(true);
  const [gameTime, setGameTime] = useState("15");
  
  const [crewmateWins, setCrewmateWins] = useState(0);
  const [impostorWins, setImpostorWins] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastImpostors, setLastImpostors] = useState('');

  // Load config from URL or localStorage on initial mount
  useEffect(() => {
    // Always clean up previous game state on new setup to ensure no data leaks
    localStorage.removeItem(GAME_STATE_KEY);

    const playersParam = searchParams.get('players');
    const impostorsParam = searchParams.get('impostors');
    const gameTimeParam = searchParams.get('gameTime');
    const showHintParam = searchParams.get('showHint');
    const namesParam = searchParams.get('names');

    let loadedPlayers = 4;
    let loadedImpostors = 1;
    let loadedGameTime = '15';
    let loadedShowHint = true;
    let loadedNames: string[] = [];

    // Priority 1: URL parameters (from a finished game)
    if (namesParam) {
      loadedNames = namesParam.split(',').map(decodeURIComponent);
      loadedPlayers = loadedNames.length; // The number of players is dictated by the names from the last round
      if (impostorsParam) loadedImpostors = parseInt(impostorsParam);
      if (gameTimeParam) loadedGameTime = gameTimeParam;
      if (showHintParam) loadedShowHint = showHintParam === 'true';
    } else {
      // Priority 2: localStorage (user's previous settings)
      try {
        const savedConfig = localStorage.getItem(GAME_CONFIG_KEY);
        if (savedConfig) {
          const { players, impostors, gameTime, showHint } = JSON.parse(savedConfig);
          loadedPlayers = players;
          loadedImpostors = impostors;
          loadedGameTime = gameTime;
          loadedShowHint = showHint;
        }
        
        const savedNames = JSON.parse(localStorage.getItem(PLAYER_NAMES_KEY) || '[]');
        if (savedNames.length > 0) {
          loadedNames = savedNames;
        }

      } catch (error) {
        console.error("Could not load game config from localStorage", error);
      }
    }

    setPlayers(loadedPlayers);
    setImpostors(loadedImpostors);
    setGameTime(loadedGameTime);
    setShowHint(loadedShowHint);
    
    // Adjust names array based on final player count, preserving existing names
    const finalNames = Array.from({ length: loadedPlayers }, (_, i) => loadedNames[i] || `${t('player')} ${i + 1}`);
    setPlayerNames(finalNames);
    
    // Load scores and other params from URL
    setCrewmateWins(parseInt(searchParams.get('crewmateWins') || '0'));
    setImpostorWins(parseInt(searchParams.get('impostorWins') || '0'));
    setLastImpostors(searchParams.get('lastImpostors') || '');
    
    setIsLoaded(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, t]);

  const handlePlayersChange = useCallback((newPlayers: number) => {
    setPlayers(newPlayers);
    setPlayerNames(currentNames => {
      const newNames = Array.from({ length: newPlayers });
      return newNames.map((_, i) => currentNames[i] || `${t('player')} ${i + 1}`);
    });
    const maxImpostors = Math.max(1, Math.floor((newPlayers - 1) / 2));
    if (impostors > maxImpostors) {
      setImpostors(maxImpostors);
    }
  }, [impostors, t]);

  // Save config to localStorage whenever it changes, but only after initial load is complete.
  useEffect(() => {
    if (!isLoaded) return; 
    try {
      const config = { players, impostors, gameTime, showHint };
      localStorage.setItem(GAME_CONFIG_KEY, JSON.stringify(config));
      // Only save names that are actually being used
      localStorage.setItem(PLAYER_NAMES_KEY, JSON.stringify(playerNames.slice(0, players)));

    } catch (error) {
      console.error("Could not save game state to localStorage", error);
    }
  }, [players, impostors, gameTime, showHint, playerNames, isLoaded]);


  const handleImpostorsChange = (value: number) => {
    setImpostors(value);
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    setPlayerNames(prev => {
        const newNames = [...prev];
        newNames[index] = name;
        return newNames;
      });
  };
  
  const handleResetScores = () => {
    setCrewmateWins(0);
    setImpostorWins(0);
    setLastImpostors('');
    localStorage.removeItem(USED_WORDS_KEY);
    localStorage.removeItem(PLAYER_NAMES_KEY);
    localStorage.removeItem(GAME_CONFIG_KEY);
    
    // Reset to default game config
    const defaultPlayers = 4;
    setPlayers(defaultPlayers);
    setImpostors(1);
    setGameTime("15");
    setShowHint(true);
    setPlayerNames(Array.from({ length: defaultPlayers }, (_, i) => `${t('player')} ${i + 1}`));
    // Navigate to clear URL params
    router.push('/');
  }

  const handleStartGame = () => {
    setIsLoading(true);
    // Ensure player names are updated to match the current count
    const finalPlayerNames = playerNames.slice(0, players).map((name, index) => name.trim() || `${t('player')} ${index + 1}`);
    
    const namesQuery = finalPlayerNames.map(encodeURIComponent).join(',');
    const params = new URLSearchParams({
      players: String(players),
      impostors: String(impostors),
      names: namesQuery,
      showHint: String(showHint),
      crewmateWins: String(crewmateWins),
      impostorWins: String(impostorWins),
      gameTime: gameTime,
      lang: currentLanguage,
    });

    if (lastImpostors) {
      params.append('lastImpostors', lastImpostors);
    }

    router.push(`/game?${params.toString()}`);
  };

  const maxImpostors = Math.max(1, Math.floor((players - 1) / 2));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-5xl font-bold font-headline text-primary tracking-tighter">
          {t('gameTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('gameSubtitle')}
        </p>
      </div>

       {(crewmateWins > 0 || impostorWins > 0) && (
        <Card className="w-full max-w-md mb-6 bg-card-foreground/5">
          <CardHeader>
            <CardTitle className="text-xl text-center flex items-center justify-center gap-2"><Trophy className="text-amber-400"/> {t('scoreboard')}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around text-lg items-center">
            <div className="text-center">
              <p className="font-bold text-accent">{crewmateWins}</p>
              <p className="text-sm text-muted-foreground">{t('crewmates')}</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-primary">{impostorWins}</p>
              <p className="text-sm text-muted-foreground">{t('impostors')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {t('setupGame')}
          </CardTitle>
          <div className="flex justify-center pt-2">
            <LanguageSelector />
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-2">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label htmlFor="players" className="flex items-center text-lg">
                    <Users className="mr-2" /> {t('players')}
                </Label>
                <NumberInput
                    value={players}
                    onValueChange={handlePlayersChange}
                    min={3}
                    max={10}
                    aria-label={t('numPlayers')}
                />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label htmlFor="impostors" className="flex items-center text-lg">
                    <ShieldQuestion className="mr-2" /> {t('impostors')}
                </Label>
                <NumberInput
                    value={impostors}
                    onValueChange={handleImpostorsChange}
                    min={1}
                    max={maxImpostors}
                    aria-label={t('numImpostors')}
                />
            </div>
          </div>

          <div className="space-y-4">
             <Label htmlFor="round-duration" className="flex items-center text-lg">
                <Clock className="mr-2" /> {t('roundDuration')}
            </Label>
            <Select value={gameTime} onValueChange={setGameTime}>
                <SelectTrigger id="round-duration" aria-label={t('roundDuration')}>
                    <SelectValue placeholder={t('selectTime')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="5">{t('timeOption', { minutes: 5 })}</SelectItem>
                    <SelectItem value="10">{t('timeOption', { minutes: 10 })}</SelectItem>
                    <SelectItem value="15">{t('timeOption', { minutes: 15 })}</SelectItem>
                    <SelectItem value="20">{t('timeOption', { minutes: 20 })}</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
             <Label className="flex items-center text-lg">
                <Pencil className="mr-2" /> {t('playerNames')}
            </Label>
            <div className="grid grid-cols-2 gap-3">
            {playerNames.slice(0, players).map((name, index) => (
              <div key={index} className="flex flex-col space-y-1">
                <label htmlFor={`player-${index}`} className="sr-only">
                  {`${t('player')} ${index + 1}`}
                </label>
                <Input
                  id={`player-${index}`}
                  value={name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  placeholder={`${t('player')} ${index + 1}`}
                  aria-label={`${t('player')} ${index + 1}`}
                />
              </div>
            ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
              <Checkbox id="show-hint" checked={showHint} onCheckedChange={(checked) => setShowHint(Boolean(checked))} />
              <Label htmlFor="show-hint" className="flex items-center text-base gap-2">
                  <Lightbulb className="w-4 h-4"/> {t('giveHint')}
              </Label>
          </div>

          <Button
            onClick={handleStartGame}
            className="w-full text-lg py-6"
            size="lg"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
            {isLoading ? t('starting') : t('startGame')}
          </Button>
        </CardContent>
      </Card>
      
      {(crewmateWins > 0 || impostorWins > 0) && (
         <Button variant="destructive" onClick={handleResetScores} className="w-full max-w-md mt-6">
            <RefreshCw className="mr-2"/> {t('resetScoreboard')}
         </Button>
      )}

      {/* Renderiza el banner si está configurado en producción o muestra el placeholder de dev */}
      {(process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT_ID || process.env.NODE_ENV === "development") && (
        <div className="w-full max-w-md mt-6">
          <AdBanner dataAdSlot={process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT_ID || "1234567890"} />
        </div>
      )}

      <footer className="mt-8 text-sm text-muted-foreground">
        {t('footerText')}
      </footer>
    </main>
  );
}


export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
