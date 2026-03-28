const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const https = require('https');

function formatDuration(milliseconds) {
  if (!milliseconds || milliseconds <= 0) {
    return '00:00';
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function trimText(value, maxLength) {
  const text = String(value ?? '').trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}...`;
}

function getProgress(position, duration) {
  if (!duration || duration <= 0) {
    return 0;
  }

  return clamp(position / duration, 0, 1);
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          response.resume();
          resolve(fetchBuffer(response.headers.location));
          return;
        }

        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`Request failed with status ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

async function loadArtwork(url) {
  if (!url) {
    return null;
  }

  try {
    const buffer = await fetchBuffer(url);
    return await loadImage(buffer);
  } catch (error) {
    return null;
  }
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function fillRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function strokeRoundedRect(ctx, x, y, width, height, radius, strokeStyle, lineWidth = 1) {
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function fitText(ctx, text, maxWidth, initialSize, weight = '700') {
  let fontSize = initialSize;

  while (fontSize > 18) {
    ctx.font = `${weight} ${fontSize}px "Segoe UI", Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) {
      break;
    }

    fontSize -= 2;
  }

  return fontSize;
}

function drawBackdrop(ctx, width, height, artwork) {
  if (artwork) {
    ctx.save();
    ctx.filter = 'blur(22px)';
    ctx.globalAlpha = 0.95;
    ctx.drawImage(artwork, -30, -30, width + 60, height + 60);
    ctx.restore();
  } else {
    const fallback = ctx.createLinearGradient(0, 0, width, height);
    fallback.addColorStop(0, '#202020');
    fallback.addColorStop(1, '#090909');
    ctx.fillStyle = fallback;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.fillStyle = 'rgba(8, 8, 8, 0.18)';
  ctx.fillRect(0, 0, width, height);
}

function drawArtwork(ctx, artwork, x, y, size) {
  ctx.save();
  drawRoundedRect(ctx, x, y, size, size, 26);
  ctx.clip();

  if (artwork) {
    ctx.drawImage(artwork, x, y, size, size);
  } else {
    const filler = ctx.createLinearGradient(x, y, x + size, y + size);
    filler.addColorStop(0, '#232323');
    filler.addColorStop(1, '#111111');
    ctx.fillStyle = filler;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = '700 18px "Segoe UI", Arial, sans-serif';
    const text = 'NO ART';
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, x + (size - textWidth) / 2, y + size / 2 + 6);
  }

  ctx.restore();
  strokeRoundedRect(ctx, x, y, size, size, 26, 'rgba(255,255,255,0.45)', 2);
}

function drawBadge(ctx, text, x, y) {
  ctx.font = '600 14px "Segoe UI", Arial, sans-serif';
  const width = ctx.measureText(text).width + 26;
  fillRoundedRect(ctx, x, y, width, 30, 15, 'rgba(255,255,255,0.10)');
  strokeRoundedRect(ctx, x, y, width, 30, 15, 'rgba(255,255,255,0.12)', 1);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText(text, x + 13, y + 20);
  return width;
}

async function createNowPlayingCard(track, position) {
  const width = 708;
  const height = 232;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const artwork = await loadArtwork(track.info.thumbnail);
  const title = trimText(track.info.title || 'Unknown Song', 52);
  const author = trimText(track.info.author || 'Unknown Artist', 42);
  const requester = trimText(track.info.requester?.username || 'Unknown listener', 22);
  const progress = getProgress(position, track.info.length);
  const elapsed = formatDuration(position);
  const total = formatDuration(track.info.length);

  drawBackdrop(ctx, width, height, artwork);
  fillRoundedRect(ctx, 0, 0, width, height, 30, 'rgba(7,7,7,0.24)');
  strokeRoundedRect(ctx, 0.75, 0.75, width - 1.5, height - 1.5, 30, 'rgba(255,255,255,0.22)', 1.5);

  drawArtwork(ctx, artwork, width - 190, 34, 138);

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '600 14px "Segoe UI", Arial, sans-serif';
  ctx.fillText('NOW PLAYING', 34, 38);

  const titleSize = fitText(ctx, title, 418, 34, '800');
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${titleSize}px "Segoe UI", Arial, sans-serif`;
  ctx.fillText(title, 34, 82);

  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.font = '600 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText(author, 34, 112);

  drawBadge(ctx, `Requested by ${requester}`, 34, 128);

  const barX = 34;
  const barY = 183;
  const barWidth = 486;
  const progressWidth = Math.max(10, Math.round(barWidth * progress));

  fillRoundedRect(ctx, barX, barY, barWidth, 10, 5, 'rgba(255,255,255,0.14)');
  const progressGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
  progressGradient.addColorStop(0, '#ffffff');
  progressGradient.addColorStop(1, '#d4d4d4');
  fillRoundedRect(ctx, barX, barY, progressWidth, 10, 5, progressGradient);

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(barX + progressWidth, barY + 5, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.84)';
  ctx.font = '600 15px "Segoe UI", Arial, sans-serif';
  ctx.fillText(elapsed, barX, 212);
  const totalWidth = ctx.measureText(total).width;
  ctx.fillText(total, barX + barWidth - totalWidth, 212);

  return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'now-playing-card.png' });
}

module.exports = {
  createNowPlayingCard,
  formatDuration,
};
