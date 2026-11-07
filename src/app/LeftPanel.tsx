import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { BRAND } from '../brand/tokens';
import Uploader from '../ui/Uploader';
import type { AudioAnalysis } from '../store';

interface LeftPanelProps {
  analysis: AudioAnalysis | null;
}

export default function LeftPanel({ analysis }: LeftPanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: 220,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: 1.5,
        borderRadius: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        overflow: 'auto',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 9 }}>
        Input
      </Typography>
      <Uploader />

      {analysis && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 9, display: 'block', mb: 0.5 }}>
            Waveform
          </Typography>
          <WaveformMini waveform={analysis.waveform} />
        </Box>
      )}
    </Paper>
  );
}

function WaveformMini({ waveform }: { waveform: Float32Array }) {
  const width = 186;
  const height = 40;
  const points = Array.from(waveform);
  const step = width / points.length;

  const pathTop = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${i * step},${height / 2 - v * (height / 2 - 2)}`)
    .join(' ');
  const pathBottom = points
    .map((v, i) => `${i * step},${height / 2 + v * (height / 2 - 2)}`)
    .reverse()
    .join(' L');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path
        d={`${pathTop} L${(points.length - 1) * step},${height / 2} ${pathBottom} Z`}
        fill={BRAND.color.mistWash}
        stroke={BRAND.color.mistBlue}
        strokeWidth="0.5"
      />
    </svg>
  );
}
