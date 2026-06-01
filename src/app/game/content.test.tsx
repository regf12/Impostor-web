import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { GamePageContent } from './content';

const mockSearchParams = new URLSearchParams({
  players: '4',
  impostors: '1',
  names: 'Jugador 1,Jugador 2,Jugador 3,Jugador 4',
  gameTime: '15',
  showHint: 'true',
});

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: () => null,
    };
  },
  useSearchParams() {
    return mockSearchParams;
  },
}));

// Mock de lucide-react para evitar problemas con importaciones ESM y HTML invalid nesting (usamos span)
jest.mock('lucide-react', () => ({
  Users: () => <span data-testid="icon-users" />,
  ShieldQuestion: () => <span data-testid="icon-shield-question" />,
  Timer: () => <span data-testid="icon-timer" />,
  Vote: () => <span data-testid="icon-vote" />,
  Skull: () => <span data-testid="icon-skull" />,
  Crown: () => <span data-testid="icon-crown" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Eye: () => <span data-testid="icon-eye" />,
  RotateCcw: () => <span data-testid="icon-rotate-ccw" />,
  Lightbulb: () => <span data-testid="icon-lightbulb" />,
  Key: () => <span data-testid="icon-key" />,
  SkipForward: () => <span data-testid="icon-skip-forward" />,
  PlayCircle: () => <span data-testid="icon-play-circle" />,
}));

// Mock de getWordAndHintAction
jest.mock('./actions', () => ({
  getWordAndHintAction: jest.fn().mockResolvedValue({
    secretWord: 'Manzana',
    hint: 'Fruta',
  }),
}));

const mockT = (key: string, options?: any) => {
  const translations: Record<string, string> = {
    loadingGame: 'Cargando juego...',
    pleaseWait: 'Por favor, espera',
    itsYourTurn: `Es el turno de ${options?.name || ''}`,
    revealRole: 'Revelar Rol',
  };
  return translations[key] || key;
};

// Mock de i18n para proveer traducciones con referencia estable a la función t
jest.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    t: mockT,
    currentLanguage: 'es',
  }),
}));

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('GamePageContent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the game loader initially and then reveals the role screen', async () => {
    await act(async () => {
      render(<GamePageContent />);
    });
    
    // Debería mostrar la pantalla de revelar rol para el primer jugador ("Jugador 1")
    const revealButton = await screen.findByText('Revelar Rol');
    expect(revealButton).toBeInTheDocument();
  });
});
