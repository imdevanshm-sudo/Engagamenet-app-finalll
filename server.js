import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);

// --- SOCKET CONFIGURATION ---
const io = new Server(httpServer, {
  cors: {
    // We allow your Firebase app AND localhost (for testing)
    origin: [
      "https://weengagedgit-95729857-ba728.web.app",
      "http://localhost:5173", 
      "http://localhost:4173"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// --- State Management ---
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
    { id: '10', src: '/gallery/10.jpeg', caption: '' },
  ],
  guestList: [],
  locations: {},
  quiz: {
    questions: [
        {
            "id": 1,
            "question": "Where did the couple first meet?",
            "options": ["At a concert", "In a coffee shop", "At a wedding", "On a dating app"],
            "answer": "At a wedding",
            "fun_fact": "It was at the wedding of their mutual friends, Sarah and Tom!"
        },
        {
            "id": 2,
            "question": "What is the couple's favorite shared hobby?",
            "options": ["Hiking", "Cooking", "Watching movies", "Board games"],
            "answer": "Hiking",
            "fun_fact": "They've hiked in 5 different national parks together!"
        },
        {
            "id": 3,
            "question": "Who is the better cook?",
            "options": ["Partner 1", "Partner 2", "They're both amazing", "They both order takeout"],
            "answer": "Partner 1",
            "fun_fact": "Partner 1 makes a legendary lasagna from a secret family recipe."
        },
        {
            "id": 4,
            "question": "What was the destination of their first vacation together?",
            "options": ["Paris", "Bali", "A local camping trip", "New York City"],
            "answer": "A local camping trip",
            "fun_fact": "It rained the entire time, but they still had a blast!"
        },
        {
            "id": 5,
            "question": "Who said 'I love you' first?",
            "options": ["Partner 1", "Partner 2", "It was mutual at the same time", "Their dog"],
            "answer": "Partner 2",
            "fun_fact": "Partner 2 blurted it out during a movie night."
        }
    ],
    "currentQuestionIndex": 0,
    "scores": {},
    "showResults": false
},
  chatMessages: [],
  hearts: 0,
  lanterns: []
};

const broadcastState = () => {
    io.emit('sync_data', currentState);
}

io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);
    
    socket.emit('sync_data', currentState);

    // --- User & Map Logic ---
    socket.on('user_join', (user) => {
        console.log(`👤 User joined: ${user.name} (${user.role})`);
        currentState.guestList = currentState.guestList.filter(g => g.name !== user.name);
        currentState.guestList.push(user);
        broadcastState();
    });
  
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

    socket.on('send_rsvp', (data) => {
        const user = currentState.guestList.find(g => g.name === data.name);
        if (user) {
            user.rsvp = true;
            broadcastState();
        }
    });

    socket.on('request_sync', () => {
        socket.emit('sync_data', currentState);
    });

    socket.on('slide_change', (newSlide) => {
        currentState.activeSlide = newSlide;
        io.emit('slide_changed', newSlide);
    });
    
    // --- Quiz Logic ---
    socket.on('quiz_start', () => {
        currentState.quiz.currentQuestionIndex = 0;
        currentState.quiz.showResults = false;
        currentState.quiz.scores = {};
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

    socket.on('quiz_next_question', () => {
        if (currentState.quiz.currentQuestionIndex < currentState.quiz.questions.length - 1) {
            currentState.quiz.currentQuestionIndex++;
        } else {
            currentState.quiz.showResults = true;
        }
        broadcastState();
    });

    socket.on('quiz_reset', () => {
        currentState.quiz.currentQuestionIndex = 0;
        currentState.quiz.showResults = false;
        currentState.quiz.scores = {};
        broadcastState();
    });

    socket.on('gallery_sync', (gallery) => {
        currentState.gallery = gallery;
        broadcastState();
    });

    socket.on('send_message', (message) => {
        currentState.chatMessages.push(message);
        broadcastState();
    });

    socket.on('add_heart', () => {
        currentState.hearts++;
        broadcastState();
    });

    socket.on('release_lantern', (lantern) => {
        currentState.lanterns.push(lantern);
        broadcastState();
    });

    socket.on('sync', () => {
        broadcastState();
    })

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.get('/', (req, res) => {
    res.send('<h1>EngagaMeNet Server is Running (ESM)</h1>');
});

// Note: We use httpServer.listen, NOT server.listen
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});