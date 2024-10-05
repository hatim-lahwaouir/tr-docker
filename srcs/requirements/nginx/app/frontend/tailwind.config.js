/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        noisy: 'shift 0.2s linear infinite both',
      },
      keyframes: {
        shift: {
          '0%': { transform: 'translateX(10%) translateY(10%)' },
          '100%': { transform: 'translateX(-10%) translateY(-10%)' },
        }
      },
      colors: {
        
        // 'text-white': '#FFFFFF',


        // 'neon-pink': '#ff00ff',
        // 'neon-blue': '#00ffff',
        // 'cyber-black': '#0f0f0f',
        // 'cyber-gray': '#1f1f1f',
        
        // 'bg-color': '#14181D',
        // 'the-grey' : '#3C3F43',
        // 'sent-msg-color' : '#2F3237',
        // 'recieved-msg-color' : '#14181D',



		// 'primary-neon-blue': '#00FFFF',
        // 'primary-neon-pink': '#FF00FF',
        // // 'secondary-deep-purple': '#2E003E',
        // 'secondary-electric-purple': '#8A2BE2',
        // 'accent-neon-green': '#39FF14',
        // 'accent-neon-orange': '#FF4500',
        // // 'background-black': '#000000',
        // // 'text-dark-gray': '#333333',

		// 'primary-teal': '#006666',
		// 'primary-pink': '#FF69B4',
		// 'secondary-dark-purple': '#1B0B24',
		// 'secondary-deep-purple': '#6A0DAD',
		// 'accent-dark-green': '#228B22',
		// 'accent-dark-orange': '#FF8C00',
		// 'background-black': '#000000',
		// 'text-light-gray': '#D3D3D3',
		// 'text-dark-gray': '#1C1C1C',

      },
      backgroundImage: theme => ({
        'gradient-to-br': 'linear-gradient(135deg, var(--tw-gradient-stops))',
      }),
      gradientColorStops: theme => ({
        ...theme('colors'),
      }),
      rotate: {
        '30': '18deg',
      },
       screens: {
      'ip': {'max': '500px'},
      'xs': {'min': '501px'},
	  'tabletMax' : {'max': '830px'},

      'maxTablet': {'max': '640px'},
      'maxTablet2': {'max': '699px'},
      'maxMobile': {'max': '480px'},
      'mobileS': '420px',
      'mobile': '481px',
      // => @media (min-width: 640px) { ... }

      
      'tablet1': '610px',
      'tablet': '640px',
      // => @media (min-width: 640px) { ... }

      'tablet2': '700px',
      'tablet3': '768px',
      
      // => @media (min-width: 640px) { ... }

      'laptop': '1024px',
      // => @media (min-width: 1024px) { ... }

      'desktop': '1280px',
      // => @media (min-width: 1280px) { ... }
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
    // ...
  ]
}