const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.openDevTools();
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
  console.log('app ready')

  globalShortcut.register('CommandOrControl+F', () => {
    mainWindow.setFullScreen(!mainWindow.isFullScreen())
  })

  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

const express = require('express')
const { createServer } = require('node:http')
const { join } = require('node:path')
const { Server } = require('socket.io')

const expressApp = express()
const server = createServer(expressApp)
const io = new Server(server)

expressApp.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
        <title>Babatwoosh AI - admin UI</title>
        <style>
          body { margin: 0; padding-bottom: 3rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    
          #form { background: rgba(0, 0, 0, 0.15); padding: 0.25rem; position: fixed; bottom: 0; left: 0; right: 0; display: flex; height: 3rem; box-sizing: border-box; backdrop-filter: blur(10px); }
          #input { border: none; padding: 0 1rem; flex-grow: 1; border-radius: 2rem; margin: 0.25rem; }
          #input:focus { outline: none; }
          #form > button { background: #333; border: none; padding: 0 1rem; margin: 0.25rem; border-radius: 3px; outline: none; color: #fff; }
    
          #messages { list-style-type: none; margin: 0; padding: 0; }
          #messages > li { padding: 0.5rem 1rem; }
          #messages > li:nth-child(odd) { background: #efefef; }
        </style>
      </head>
    
      <body>
        <ul id="messages"></ul>
        <form id="form" action="">
          <input id="input" autocomplete="off" /><button>Send</button>
        </form>
    
        <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
        <script>
          const socket = io();
    
          const form = document.getElementById('form');
          const input = document.getElementById('input');
          const messages = document.getElementById('messages');
    
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (input.value) {
              socket.emit('chat message', input.value);
              input.value = '';
            }
          });
    
          socket.on('chat message', (msg) => {
            const item = document.createElement('li');
            item.textContent = msg;
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
          });
        </script>
      </body>
    </html>
  `)
})

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('chat message', async (msg) => {
    mainWindow.webContents.send('generate', msg)
  })
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000')
})

try {
  require('electron-reloader')(module)
} catch (_) {}