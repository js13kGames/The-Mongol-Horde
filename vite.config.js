import { defineConfig } from 'vite';
import JSZip from 'jszip';
import fs from 'fs';
import kontra from 'rollup-plugin-kontra';
import fullReload from 'vite-plugin-full-reload';
import { Packer } from 'roadroller';

export default defineConfig({
  server: {
    port: 3000,
    hmr: false
  },
  preview: {
    port: 3001
  },
  plugins: [
    kontra({
      gameObject: {
        acceleration: true,
        anchor: true,
        group: true,
        ttl: true,
        velocity: true
      },
      sprite: {
        image: true
      },
      text: {
        align: true
      },
      tileEngine: {
        camera: true,
        tiled: true
      }
    }),
    plugin(),
    fullReload(['src/**/*', 'public/**/*'])
  ],
  build: {
    target: 'esnext',
    modulePreload: {
      polyfill: false
    },
    reportCompressedSize: false,
    minify: 'terser',
    terserOptions: {
      toplevel: true,
      compress: {
        drop_console: true,
        ecma: 2020,
        module: true,
        passes: 3,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true
      },
      mangle: {
        properties: {
          // debug: '',
          keep_quoted: true,
          reserved: ['onOver', 'onDown', 'onUp', 'onOut'],
        },
        module: true,
        toplevel: true
      },
      format: {
        comments: false,
        ecma: 2020
      },
      module: true
    },
    assetsInlineLimit: 0
  }
});

async function zip(content) {
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  const jszip = new JSZip();
  const zipOptions = {
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9
    }
  };

  jszip.file('index.html', content, zipOptions);
  jszip.file('i.png', fs.readFileSync('dist/i.png'), zipOptions);

  await new Promise((resolve) => {
    jszip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream('dist/game.zip'))
      .on('finish', () => {
        const size = fs.statSync('dist/game.zip').size;
        let percent = parseInt((size / 13312) * 100, 10);
        console.log(`\nZip size: ${size}/13312B ${percent}%`);
        resolve();
      });
  });
}

async function roadroll(data) {
  const packer = new Packer([{
    data,
    type: 'js',
    action: 'eval'
  }], {});
  await packer.optimize(2);
  const { firstLine, secondLine } = packer.makeDecoder();
  return firstLine + secondLine;
}

function plugin() {
  return {
    enforce: 'post',
    generateBundle: async (options, bundle) => {
      const html = bundle['index.html'];
      const js = bundle[Object.keys(bundle).filter(i => i.endsWith('.js'))[0]];
      const packedJs = await roadroll(js.code);

      html.source = html.source
        .replace(/<script.*<\/script>/, '')
        .replace('</body>', () => `<script>${packedJs}</script>`)
        .replace(/\n+/g, '');

      await zip(html.source);

      // Delete the JS so it doesn't go into the dist folder
      delete bundle[js.fileName];
    }
  };
}
