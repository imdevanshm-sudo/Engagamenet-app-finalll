import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);

// --- SOCKET CONFIGURATION (FINAL PERMISSIVE CORS) ---
const io = new Server(httpServer, {
  cors: {
    // Magic Bullet: Allows ANY origin connection, fixing all connection issues
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// --- 💾 CENTRAL STATE (Single Source of Truth) ---
let currentState = {
  activeSlide: 0,
  gallery: [
    { id: '1', src: '/gallery/1.jpeg', caption: '' },
    { id: '2', src: '/gallery/2.jpeg', caption: '' },
    { id: '3', src: '/gallery/3.jpeg', caption: '' },
    { id: '4', src: '/gallery/4.jpeg', caption: '' },
    { id: '5', src: '/gallery/5.jpeg', caption: '' },
    { id: '6', src: '/gallery/6.jpeg', caption: '' },
    { id: '7', src: '/gallery/7.jpeg', caption: '' },
    { id: '8', src: '/gallery/8.jpeg', caption: '' },
    { id: '9', src: '/gallery/9.jpeg', caption: '' },
    { id: '10', src: '/gallery/10.jpeg', caption: '' }
  ],
  guestList: [],
  locations: {},
  adminAnnouncement: null, // New Admin State
  chatMessages: [],
  hearts: 0,
  lanterns: [],
  quiz: {
    questions: [
        {
            id: 1,
            question: "Where did the couple first meet?",
            options: ["At a concert", "In a coffee shop", "At a wedding", "On a dating app"],
            answer: "At a wedding",
            fun_fact: "It was at the wedding of their mutual friends, Sarah and Tom!"
        },
        {
            id: 2,
            question: "What is the couple's favorite shared hobby?",
            options: ["Hiking", "Cooking", "Watching movies", "Board games"],
            answer: "Hiking",
            fun_fact: "They've hiked in 5 different national parks together!"
        },
        {
            id: 3,
            question: "Who is the better cook?",
            options: ["Partner 1", "Partner 2", "They're both amazing", "They both order takeout"],
            answer: "Partner 1",
            fun_fact: "Partner 1 makes a legendary lasagna from a secret family recipe."
        },
        {
            id: 4,
            question: "What was the destination of their first vacation together?",
            options: ["Paris", "Bali", "A local camping trip", "New York City"],
            answer: "A local camping trip",
            fun_fact: "It rained the entire time, but they still had a blast!"
        },
        {
            id: 5,
            question: "Who said 'I love you' first?",
            options: ["Partner 1", "Partner 2", "It was mutual at the same time", "Their dog"],
            answer: "Partner 2",
            fun_fact: "Partner 2 blurted it out during a movie night."
        }
    ],
    currentQuestionIndex: 0,
    scores: {},
    showResults: false
  }
};

// Helper: Broadcast the entire state to all connected devices
const broadcastState = () => {
    io.emit('sync_data', currentState);
};

io.on('connection', (socket) => {
    console.log('✅ Device Connected:', socket.id);
    
    socket.emit('sync_data', currentState);

    // --- 👤 USER PROFILES (Req 4: Couple Account Check) ---
    socket.on('user_join', (user) => {
        if (user && user.role === 'couple' && COUPLE_NAMES.includes(user.name)) {
            // Store the couple's socket ID for targeted broadcasting (Req 3, 5)
            coupleSockets[user.name] = socket.id;
        }
        
        // Update guest list globally
        currentState.guestList = currentState.guestList.filter(g => g.name !== user.name);
        currentState.guestList.push(user);
        broadcastState(); // Syncs profiles (Req 1, 2, 6)
    });

    // --- 🏮 LANTERNS (Req 3: Selective Sync) ---
    socket.on('release_lantern', (lantern) => {
        // 1. Send to the SENDER ONLY (Guest)
        io.to(socket.id).emit('receive_lantern', lantern); 
        
        // 2. Send to Couple Accounts ONLY
        Object.values(coupleSockets).forEach(coupleSocketId => {
            io.to(coupleSocketId).emit('receive_lantern', lantern);
        });

        // 3. Update global state for general cleanup (only the cleanup broadcast uses sync_data)
        currentState.lanterns.push(lantern); 
        setTimeout(() => {
            currentState.lanterns = currentState.lanterns.filter(l => l.id !== lantern.id);
            broadcastState(); // Broadcast the state *without* the lantern after timeout
        }, 15000);
    });

    // --- GLOBAL SYNC EVENTS (Req 1, 2, 6) ---
    // All other events (chat, hearts, admin settings) still call broadcastState()
    socket.on('add_heart', () => { // Req 2: Cumulative Adore Meter
        currentState.hearts++;
        broadcastState();
    });

    socket.on('send_message', (message) => { // Req 1: Global Chat Sync
        currentState.chatMessages.push(message);
        broadcastState();
    });
    
    socket.on('admin_update_settings', (newSettings) => { // Req 6: Instant visibility
        currentState = { ...currentState, ...newSettings };
        broadcastState(); 
    });
    
    // ... (Keep all other existing handlers like quiz, gallery_upload, etc.) ...

    socket.on('disconnect', () => {
        // Remove disconnected couple from tracking
        Object.keys(coupleSockets).forEach(name => {
            if (coupleSockets[name] === socket.id) {
                delete coupleSockets[name];
            }
        });
        console.log('Device Disconnected');
    });
});

    // Must be outside io.on to maintain across connections
let coupleSockets = {}; // Stores { name: socketId } for Aman and Sneha
const COUPLE_NAMES = ['Aman', 'Sneha'];
    
    // Send existing data immediately upon connection
    socket.emit('sync_data', currentState);

    // --- ❤️ HEARTS / ADORE ---
    socket.on('add_heart', () => {
        currentState.hearts++;
        broadcastState();
    });

    // --- 🏮 LANTERNS (With Cleanup) ---
    socket.on('release_lantern', (lantern) => {
        currentState.lanterns.push(lantern);
        broadcastState();
        // Auto-remove lantern after 15s to keep state clean
        setTimeout(() => {
            currentState.lanterns = currentState.lanterns.filter(l => l.id !== lantern.id);
            broadcastState();
        }, 15000);
    });

    // --- 💬 CHAT ---
    socket.on('send_message', (message) => {
        currentState.chatMessages.push(message);
        broadcastState();
    });

    // --- 👤 USER PROFILES (Supports multiple logins/devices) ---
    socket.on('user_join', (user) => {
        // Remove previous entry for this user name
        currentState.guestList = currentState.guestList.filter(g => g.name !== user.name);
        currentState.guestList.push(user);
        broadcastState();
    });
    
    // --- 📣 ADMIN ANNOUNCEMENTS ---
    socket.on('admin_announce', (message) => {
        console.log(`📣 ADMIN ANNOUNCEMENT: ${message.text}`);
        currentState.adminAnnouncement = { text: message.text, timestamp: Date.now() };
        broadcastState();
    });

    // --- ⚙️ ADMIN SETTINGS/STATE UPDATE ---
    socket.on('admin_update_settings', (newSettings) => {
        console.log("⚙️ ADMIN SETTINGS UPDATE received:", newSettings);
        
        // Safely merge new settings into currentState (updates hearts, slides, quiz, etc.)
        currentState = {
            ...currentState,
            ...newSettings,
        };
        broadcastState();
    });

    // --- 📸 GALLERY / MEDIA ---
    socket.on('gallery_upload', (item) => {
        currentState.gallery.push(item);
        broadcastState();
    });

    // --- 🗺️ LOCATIONS ---
    socket.on('location_update', (data) => {
        if (data.name && data.lat && data.lng) {
            currentState.locations[data.name] = { 
                lat: data.lat, 
                lng: data.lng, 
                timestamp: Date.now() 
            };
            io.emit('locations_sync', currentState.locations);
        }
    });

    // Quiz & Slide Handlers
    socket.on('slide_change', (newSlide) => {
        currentState.activeSlide = newSlide;
        io.emit('slide_changed', newSlide);
        broadcastState();
    });
    
    socket.on('quiz_answer', (data) => {
        const { user, questionId, answer } = data;
        const question = currentState.quiz.questions.find(q => q.id === questionId);
        if (question) {
            if (!currentState.quiz.scores[user]) {
                currentState.quiz.scores[user] = { score: 0, name: user };
            }
            if (question.answer === answer) {
                currentState.quiz.scores[user].score += 1;
            }
        }
        broadcastState();
    });

    socket.on('request_sync', () => {
        socket.emit('sync_data', currentState);
    });

    socket.on('disconnect', () => {
        console.log('Device Disconnected');
    });
;

app.get('/', (req, res) => {
    res.send('<h1>Server is Live & Ready to Sync (Final Build)</h1>');
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});