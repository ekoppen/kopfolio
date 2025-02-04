import { useEffect } from 'react';
import api from '../utils/api';

const FontLoader = () => {
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const response = await api.get('/settings/fonts');
        console.log('Loaded fonts from server:', response.data);

        // Filter custom fonts
        const customFonts = response.data.filter(font => font.type !== 'system');
        console.log('Custom fonts to load:', customFonts);

        const styleSheet = document.createElement('style');
        
        const fontFaces = customFonts.map(font => {
          // Bepaal het juiste format voor verschillende bestandstypen
          let format;
          switch (font.type) {
            case 'woff2':
              format = 'woff2';
              break;
            case 'woff':
              format = 'woff';
              break;
            case 'ttf':
              format = 'truetype';
              break;
            case 'otf':
              format = 'opentype';
              break;
            default:
              format = font.type;
          }

          // Bouw de font URL op
          const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
          const fontUrl = `${baseUrl}/fonts/${font.file}`;
          console.log('Loading font from URL:', fontUrl);

          const fontFace = `
            @font-face {
              font-family: '${font.value}';
              src: url('${fontUrl}') format('${format}');
              font-weight: normal;
              font-style: normal;
              font-display: block;
            }
          `;
          console.log('Generated @font-face:', fontFace);
          return { fontFace, format, fontUrl };
        });

        console.log('All @font-face rules:', fontFaces);
        styleSheet.textContent = fontFaces.map(f => f.fontFace).join('\n');
        document.head.appendChild(styleSheet);

        // Preload fonts
        fontFaces.forEach(({ format, fontUrl }, index) => {
          const font = customFonts[index];
          console.log('Preloading font:', fontUrl);

          const link = document.createElement('link');
          link.href = fontUrl;
          link.rel = 'preload';
          link.as = 'font';
          link.type = `font/${font.type}`;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);

          // Laad de font direct
          const loader = new FontFace(font.value, `url(${fontUrl}) format('${format}')`);
          loader.load().then(() => {
            document.fonts.add(loader);
            console.log('Successfully loaded font:', font.value);
          }).catch(err => {
            console.error('Error loading font:', font.value, err);
          });
        });

      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    };

    loadFonts();
  }, []);

  return null; // Deze component rendert niets
};

export default FontLoader; 