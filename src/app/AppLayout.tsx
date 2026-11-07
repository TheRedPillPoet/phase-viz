import Box from '@mui/material/Box';
import { BRAND } from '../brand/tokens';
import CanvasStage from './CanvasStage';
import Header from './Header';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import type { AspectRatio, AudioAnalysis, DisplayMode, LiveHelpLanguage } from '../store';
import type { ExportFrameRenderer, FrameRecorder } from '../export/recorder';

interface AppLayoutProps {
  analysis: AudioAnalysis | null;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  displayMode: DisplayMode;
  aspectRatio: AspectRatio;
  exportRendererRef: React.MutableRefObject<ExportFrameRenderer | null>;
  recorderRef: React.MutableRefObject<FrameRecorder | null>;
  isFullscreen: boolean;
  isLiveMode: boolean;
  liveUiVisible: boolean;
  liveHelpOpen: boolean;
  liveHelpLanguage: LiveHelpLanguage;
  liveIntensity: number;
  liveBoost: boolean;
  showChrome: boolean;
  onExport: () => void;
  onCancelExport: () => void;
  onToggleFullscreen: () => void;
  onExitLiveMode: () => void;
  onHideLiveUi: () => void;
  onOpenLiveHelp: () => void;
  onCloseLiveHelp: () => void;
  onLiveHelpLanguageChange: (language: LiveHelpLanguage) => void;
}

export default function AppLayout({
  analysis,
  containerRef,
  displayMode,
  aspectRatio,
  exportRendererRef,
  recorderRef,
  isFullscreen,
  isLiveMode,
  liveUiVisible,
  liveHelpOpen,
  liveHelpLanguage,
  liveIntensity,
  liveBoost,
  showChrome,
  onExport,
  onCancelExport,
  onToggleFullscreen,
  onExitLiveMode,
  onHideLiveUi,
  onOpenLiveHelp,
  onCloseLiveHelp,
  onLiveHelpLanguageChange,
}: AppLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 0%, ${BRAND.color.atmosphere}, transparent 42rem), ${BRAND.color.nearBlack}`,
      }}
    >
      {showChrome && <Header />}

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {showChrome && !isFullscreen && <LeftPanel analysis={analysis} />}

        <CanvasStage
          analysisReady={Boolean(analysis)}
          containerRef={containerRef}
          displayMode={displayMode}
          aspectRatio={aspectRatio}
          exportRendererRef={exportRendererRef}
          recorderRef={recorderRef}
          isFullscreen={isFullscreen}
          isLiveMode={isLiveMode}
          liveUiVisible={liveUiVisible}
          liveHelpOpen={liveHelpOpen}
          liveHelpLanguage={liveHelpLanguage}
          liveIntensity={liveIntensity}
          liveBoost={liveBoost}
          showChrome={showChrome}
          onToggleFullscreen={onToggleFullscreen}
          onExitLiveMode={onExitLiveMode}
          onHideLiveUi={onHideLiveUi}
          onOpenLiveHelp={onOpenLiveHelp}
          onCloseLiveHelp={onCloseLiveHelp}
          onLiveHelpLanguageChange={onLiveHelpLanguageChange}
        />

        {showChrome && !isFullscreen && (
          <RightPanel onExport={onExport} onCancelExport={onCancelExport} />
        )}
      </Box>
    </Box>
  );
}
