import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#020617',
        'deep-blue': '#061A40',
        'primary-glow': '#00E5FF',
        'secondary-blue': '#2563EB',
        'hud-text': '#DFFBFF',
        'hud-muted': '#7DD3FC',
        'panel-bg': 'rgba(2, 20, 45, 0.72)',
        'panel-border': 'rgba(0, 229, 255, 0.35)',
        'hud-warning': '#FACC15',
        'hud-error': '#FB7185',
        'hud-success': '#22C55E',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        orbPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        rotateRing: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        waveformBars: {
          '0%, 100%': { height: '20%' },
          '50%': { height: '100%' },
        },
        listeningWave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        speakingWave: {
          '0%': { transform: 'scaleX(1)' },
          '50%': { transform: 'scaleX(1.2)' },
          '100%': { transform: 'scaleX(1)' },
        },
        gridMove: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 229, 255, 0.6)' },
        },
        hudFlicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.97' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        corePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.04)', opacity: '1' },
        },
        rippleExpand: {
          '0%': { transform: 'scale(0.3)', opacity: '0.5' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        particleFloat: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '25%': { transform: 'translateY(-10px) translateX(6px)' },
          '50%': { transform: 'translateY(3px) translateX(-5px)' },
          '75%': { transform: 'translateY(-5px) translateX(4px)' },
        },
        pulseOpacity: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        idlePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.03)', opacity: '0.9' },
        },
        activePulse: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '25%': { transform: 'scale(1.06)', opacity: '1' },
          '50%': { transform: 'scale(0.98)', opacity: '0.85' },
          '75%': { transform: 'scale(1.04)', opacity: '0.95' },
          '100%': { transform: 'scale(0.95)', opacity: '0.8' },
        },
        coreFlash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        rippleFast: {
          '0%': { transform: 'scale(0.2)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        dataStream: {
          '0%': { transform: 'translate(0, 0)', opacity: '1' },
          '50%': { opacity: '0.3' },
          '100%': { transform: 'translate(var(--dx, 30px), var(--dy, -30px))', opacity: '0' },
        },
      },
      animation: {
        orbPulse: 'orbPulse 3s ease-in-out infinite',
        rotateRing: 'rotateRing 4s linear infinite',
        scanLine: 'scanLine 2s linear infinite',
        waveformBars: 'waveformBars 1s ease-in-out infinite',
        listeningWave: 'listeningWave 0.8s ease-in-out infinite',
        speakingWave: 'speakingWave 0.5s ease-in-out infinite',
        gridMove: 'gridMove 20s linear infinite',
        glowPulse: 'glowPulse 2s ease-in-out infinite',
        hudFlicker: 'hudFlicker 0.1s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
