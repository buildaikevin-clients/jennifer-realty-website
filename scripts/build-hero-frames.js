#!/usr/bin/env node
/* =============================================================================
   build-hero-frames.js — turns assets/hero-source.mp4 into the three assets the
   hero needs.

   Run:  node scripts/build-hero-frames.js

   Outputs:
     assets/hero-frames/frame-001.webp .. frame-145.webp   desktop scrub
     assets/hero-mobile.mp4                                 phone loop
     assets/hero-poster.webp                                poster and og:image

   Requires ffmpeg on PATH:  winget install Gyan.FFmpeg
   (a fresh terminal is needed after installing, since PATH is read at launch)

   The outputs are committed to the repo rather than generated at deploy time,
   because Netlify runs no build step for this site. Regenerate and commit
   whenever the source video changes.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'hero-source.mp4');
const FRAME_DIR = path.join(ROOT, 'assets', 'hero-frames');

// Must match FRAME_COUNT in js/hero-scrub.js. A 12 second clip at 12fps gives
// 145 frames. If you change the source length, change both.
const FPS = 12;
const FRAME_WIDTH = 1440;
const FRAME_QUALITY = 66;    // webp. 66 lands near 49 KB per frame at 1440px
const MOBILE_WIDTH = 960;
const MOBILE_CRF = 30;

function ffmpeg() {
  // Prefer PATH. Fall back to the winget install location, because a terminal
  // opened before the install will not have picked up the PATH change yet.
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return 'ffmpeg';
  } catch { /* not on PATH */ }

  const guess = path.join(
    process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages'
  );
  if (fs.existsSync(guess)) {
    for (const dir of fs.readdirSync(guess)) {
      if (!/ffmpeg/i.test(dir)) continue;
      const base = path.join(guess, dir);
      for (const sub of fs.readdirSync(base)) {
        const bin = path.join(base, sub, 'bin', 'ffmpeg.exe');
        if (fs.existsSync(bin)) return bin;
      }
    }
  }
  console.error(
    '\nffmpeg not found.\n\n' +
    '  Install it with:  winget install Gyan.FFmpeg\n' +
    '  Then open a new terminal so PATH is picked up.\n'
  );
  process.exit(1);
}

function run(bin, args, label) {
  process.stdout.write(`  ${label} `);
  execFileSync(bin, ['-v', 'error', ...args], { stdio: ['ignore', 'ignore', 'inherit'] });
  console.log('done');
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`\nMissing ${path.relative(ROOT, SRC)}.\n` +
      '  Put the master hero video there first. It should be landscape,\n' +
      '  1080p or better, roughly 12 seconds, and silent.\n');
    process.exit(1);
  }

  const bin = ffmpeg();
  console.log(`build-hero-frames: using ${bin === 'ffmpeg' ? 'ffmpeg from PATH' : bin}\n`);

  fs.mkdirSync(FRAME_DIR, { recursive: true });
  for (const f of fs.readdirSync(FRAME_DIR)) {
    if (f.endsWith('.webp')) fs.unlinkSync(path.join(FRAME_DIR, f));
  }

  run(bin, [
    '-i', SRC,
    '-vf', `fps=${FPS},scale=${FRAME_WIDTH}:-2`,
    '-c:v', 'libwebp', '-quality', String(FRAME_QUALITY), '-compression_level', '6',
    '-y', path.join(FRAME_DIR, 'frame-%03d.webp'),
  ], 'frames');

  run(bin, [
    '-i', SRC,
    '-vf', `scale=${MOBILE_WIDTH}:-2`,
    '-an',                                   // silent. no captions needed
    '-c:v', 'libx264', '-crf', String(MOBILE_CRF), '-preset', 'slow',
    '-movflags', '+faststart', '-pix_fmt', 'yuv420p',
    '-y', path.join(ROOT, 'assets', 'hero-mobile.mp4'),
  ], 'mobile loop');

  run(bin, [
    '-i', SRC, '-frames:v', '1',
    '-vf', 'scale=1600:-2',
    '-c:v', 'libwebp', '-quality', '82',
    '-y', path.join(ROOT, 'assets', 'hero-poster.webp'),
  ], 'poster');

  const frames = fs.readdirSync(FRAME_DIR).filter((f) => f.endsWith('.webp'));
  const bytes = frames.reduce((n, f) => n + fs.statSync(path.join(FRAME_DIR, f)).size, 0);

  console.log(
    `\n  ${frames.length} frames, ${(bytes / 1024 / 1024).toFixed(2)} MB total, ` +
    `${Math.round(bytes / frames.length / 1024)} KB average.`
  );
  if (frames.length !== 145) {
    console.log(
      `\n  NOTE: js/hero-scrub.js has FRAME_COUNT = 145 but this produced ` +
      `${frames.length}.\n  Update FRAME_COUNT to match or the scrub will be wrong.`
    );
  }
}

main();
