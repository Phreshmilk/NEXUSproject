const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const https = require('https');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const os = require('os');

ffmpeg.setFfmpegPath(ffmpegPath);

let mainWindow;
const videoCache = new Map();
const processingQueue = new Map();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      devTools: true
    },
  });

  mainWindow.loadURL('http://localhost:3000');
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function clearOldCache() {
  const now = Date.now();
  for (const [key, value] of videoCache.entries()) {
    if (now - value.timestamp > 30 * 60 * 1000) {
      videoCache.delete(key);
      fs.unlink(value.path, (err) => {
        if (err) console.error('Error deleting cached file:', err);
      });
    }
  }
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('process-video', async (event, videoUrl) => {
    clearOldCache();

    if (videoCache.has(videoUrl)) {
      return videoCache.get(videoUrl).path;
    }

    const tempDir = os.tmpdir();
    const outputPath = path.join(tempDir, `processed_${Date.now()}.mp4`);

    const processPromise = new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(outputPath);
      ffmpeg(videoUrl)
        .outputOptions([
          '-movflags frag_keyframe+empty_moov',
          '-c:v libx264',
          '-preset ultrafast',
          '-crf 28',
          '-vf scale=480:-2',
          '-c:a aac',
          '-b:a 128k'
        ])
        .toFormat('mp4')
        .on('end', () => {
          const filePath = `file://${outputPath}`;
          videoCache.set(videoUrl, { path: filePath, timestamp: Date.now() });
          resolve(filePath);
        })
        .on('error', reject)
        .pipe(stream, { end: true });

      // Notify the renderer process about progress
      stream.on('data', (chunk) => {
        event.sender.send('video-processing-progress', { videoUrl, chunk: chunk.length });
      });
    });

    return processPromise;
  });

  ipcMain.handle('fetch-gelbooru', (event, url) => {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  });

  console.log('Registering download-file handler');
  ipcMain.handle('download-file', async (event, fileUrl, fileId) => {
    console.log('Download file handler called', fileUrl, fileId);
    try {
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: path.join(app.getPath('downloads'), `${fileId}.${fileUrl.split('.').pop()}`),
      });

      if (filePath) {
        const writeStream = fs.createWriteStream(filePath);
        https.get(fileUrl, (response) => {
          response.pipe(writeStream);
          writeStream.on('finish', () => {
            writeStream.close();
            event.sender.send('download-complete', filePath);
          });
        }).on('error', (err) => {
          console.error('Error downloading file:', err);
          event.sender.send('download-error', err.message);
        });
      }
    } catch (error) {
      console.error('Error in download dialog:', error);
      event.sender.send('download-error', error.message);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
