import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { BRAND } from '../brand/tokens';

export default function Header() {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 0.75,
        minHeight: 76,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: BRAND.color.pureBlack,
        gap: 2,
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      <Box
        component="img"
        src="/brand/the-red-pill-poet-logo.png"
        alt="The Red Pill Poet"
        sx={{
          display: 'block',
          width: 'clamp(132px, 17vw, 205px)',
          height: 'auto',
          flexShrink: 0,
          filter: `drop-shadow(0 0 12px ${BRAND.color.logoGlow})`,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontSize: 16,
          fontWeight: 400,
          color: BRAND.color.silver,
          flex: 1,
        }}
      >
        Creative Visualiser Studio
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: 10, color: BRAND.color.silverMuted, whiteSpace: 'nowrap' }}
      >
        AUDIO // VISUAL // EXPORT
      </Typography>
    </Box>
  );
}
