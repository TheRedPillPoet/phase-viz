import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { BRAND } from '../brand/tokens';
import type { LiveHelpLanguage } from '../store';

interface Props {
  language: LiveHelpLanguage;
  onLanguageChange: (language: LiveHelpLanguage) => void;
  onClose: () => void;
}

const HELP_COPY: Record<
  LiveHelpLanguage,
  {
    title: string;
    close: string;
    languageLabel: string;
    shortcuts: { keyName: string; action: string }[];
  }
> = {
  en: {
    title: 'Live / VJ Mode Shortcuts',
    close: 'Close',
    languageLabel: 'Shortcut language',
    shortcuts: [
      { keyName: 'F', action: 'Toggle fullscreen' },
      { keyName: 'H', action: 'Hide / show UI, or close this help' },
      { keyName: '1-5', action: 'Switch presets for the current visualizer' },
      { keyName: 'Space', action: 'Hold for effect boost' },
      { keyName: 'Up / Down', action: 'Adjust live effect intensity' },
      { keyName: 'Left / Right', action: 'Move through presets' },
      { keyName: 'Esc', action: 'Close help or exit fullscreen' },
      { keyName: '?', action: 'Show this shortcut list' },
    ],
  },
  ja: {
    title: 'Live / VJ Mode ショートカット',
    close: '閉じる',
    languageLabel: 'ショートカット一覧の言語',
    shortcuts: [
      { keyName: 'F', action: 'フルスクリーンを切り替え' },
      { keyName: 'H', action: 'UIの表示/非表示、またはこの一覧を閉じる' },
      { keyName: '1-5', action: '現在のビジュアライザーのプリセットを切り替え' },
      { keyName: 'Space', action: '押している間だけエフェクトを強調' },
      { keyName: 'Up / Down', action: 'ライブ用エフェクト強度を調整' },
      { keyName: 'Left / Right', action: 'プリセットを前後に移動' },
      { keyName: 'Esc', action: '一覧を閉じる、またはフルスクリーンを解除' },
      { keyName: '?', action: 'このショートカット一覧を表示' },
    ],
  },
};

export default function LiveVJHelp({ language, onLanguageChange, onClose }: Props) {
  const copy = HELP_COPY[language];

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: 'min(560px, 92vw)',
          borderRadius: 2,
          p: 2,
          bgcolor: 'rgba(5, 5, 8, 0.82)',
          borderColor: BRAND.color.mistBorder,
          backdropFilter: 'blur(14px)',
          pointerEvents: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1.25 }}>
          <Chip label="LIVE" size="small" color="primary" sx={{ height: 20, fontSize: 10, borderRadius: 1 }} />
          <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 700, flex: 1, minWidth: 180, lineHeight: 1.35 }}>
            {copy.title}
          </Typography>
          <ToggleButtonGroup
            value={language}
            exclusive
            size="small"
            aria-label={copy.languageLabel}
            onChange={(_, value: LiveHelpLanguage | null) => {
              if (value) onLanguageChange(value);
            }}
            sx={{
              '& .MuiToggleButton-root': {
                px: 0.75,
                py: 0.25,
                minWidth: 32,
                fontSize: 10,
                lineHeight: 1.3,
                letterSpacing: 0,
              },
            }}
          >
            <ToggleButton value="en" aria-label="English">
              EN
            </ToggleButton>
            <ToggleButton value="ja" aria-label="Japanese">
              JA
            </ToggleButton>
          </ToggleButtonGroup>
          <Button size="small" variant="outlined" onClick={onClose}>
            {copy.close}
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(84px, 0.35fr) 1fr', gap: 0.75 }}>
          {copy.shortcuts.map(({ keyName, action }) => (
            <Box key={keyName} sx={{ display: 'contents' }}>
              <Typography
                variant="caption"
                sx={{
                  alignSelf: 'center',
                  justifySelf: 'start',
                  px: 0.75,
                  py: 0.35,
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'primary.light',
                  letterSpacing: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {keyName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', fontSize: 11 }}>
                {action}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
