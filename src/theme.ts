import { createTheme } from '@mui/material/styles';
import { BRAND } from './brand/tokens';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: BRAND.color.crimson,
      light: BRAND.color.crimsonLight,
      dark: BRAND.color.crimsonDark,
      contrastText: BRAND.color.white,
    },
    secondary: {
      main: BRAND.color.mistBlue,
      light: BRAND.color.silverBlue,
      dark: BRAND.color.mistDark,
      contrastText: BRAND.color.nearBlack,
    },
    success: {
      main: BRAND.color.digitalGreen,
    },
    background: {
      default: BRAND.color.nearBlack,
      paper: BRAND.color.charcoal,
    },
    text: {
      primary: BRAND.color.silver,
      secondary: BRAND.color.silverMuted,
    },
    divider: BRAND.color.border,
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: BRAND.typography.body,
    h1: { fontFamily: BRAND.typography.literary },
    h2: { fontFamily: BRAND.typography.literary },
    h3: { fontFamily: BRAND.typography.literary },
    h4: { fontFamily: BRAND.typography.literary },
    h5: { fontFamily: BRAND.typography.literary },
    h6: { fontFamily: BRAND.typography.literary, fontWeight: 500, letterSpacing: '0.025em' },
    caption: { fontFamily: BRAND.typography.technical, letterSpacing: '0.08em' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${BRAND.color.border}`,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { color: BRAND.color.crimson },
        thumb: {
          '&:hover, &.Mui-focusVisible': {
            boxShadow: `0 0 0 8px ${BRAND.color.crimsonWash}`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          letterSpacing: '0.04em',
          '&:focus-visible': {
            outline: `2px solid ${BRAND.color.silverBlue}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderColor: BRAND.color.border,
          '&.Mui-selected': {
            color: BRAND.color.silver,
            borderColor: BRAND.color.crimson,
            backgroundColor: BRAND.color.crimsonWash,
          },
          '&.Mui-selected:hover': {
            backgroundColor: BRAND.color.crimsonWash,
          },
          '&:focus-visible': {
            outline: `2px solid ${BRAND.color.silverBlue}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          color: BRAND.color.silver,
          backgroundColor: BRAND.color.nearBlack,
          fontFamily: BRAND.typography.body,
        },
        '::selection': {
          color: BRAND.color.silver,
          backgroundColor: BRAND.color.crimson,
        },
      },
    },
  },
});

export default theme;
