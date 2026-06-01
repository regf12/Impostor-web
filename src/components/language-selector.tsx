
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import { Languages } from 'lucide-react';

export function LanguageSelector() {
  const { currentLanguage, changeLanguage, t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="sr-only">
        {t('selectLanguage')}
      </label>
      <Languages className="h-5 w-5 text-muted-foreground" />
      <Select value={currentLanguage} onValueChange={changeLanguage}>
        <SelectTrigger id="language-select" className="w-[180px]" aria-label={t('selectLanguage')}>
          <SelectValue placeholder={t('selectLanguage')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="es">Español</SelectItem>
          <SelectItem value="de">Deutsch</SelectItem>
          <SelectItem value="fr">Français</SelectItem>
          <SelectItem value="it">Italiano</SelectItem>
          <SelectItem value="pt">Português</SelectItem>
          <SelectItem value="ja">日本語</SelectItem>
          <SelectItem value="ru">Русский</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
