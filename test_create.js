const db = require('./backend/src/config/db');
const quizController = require('./backend/src/controllers/quiz.controller');

async function test() {
    process.env.TURSO_DB_URL = 'libsql://quiz-platform-db-jashwanthreddy-09.aws-ap-south-1.turso.io';
    process.env.TURSO_DB_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYyMzUzNjcsImlkIjoiMDE5ZDhmZGUtZjAwMS03ZDBhLWEzMjctNmYxZWU3NzM3MzZiIiwicmlkIjoiNjZmY2M5YjktOWI0ZS00NzhkLTkxNjYtZDZjNjBkNGJhMzUyIn0.ia3P9sNFu5b0B0ny2oJTUng-aJLr7YocbqTBwQ6d28CZdYgQazpwkBWvOEdR656DXcJ29Xu3m1h5Nl-kbL6IDQ';

    const req = {
        body: {
            title: "Test Script Quiz",
            description: "Testing questions persistence",
            duration: 30,
            passing_percentage: 50,
            status: "published",
            questions: [
                {
                    type: "mcq",
                    text: "What is 1+1?",
                    options: ["1", "2"],
                    correct_answer: "2",
                    marks: 1
                },
                {
                    type: "short_answer",
                    text: "Capital of UK?",
                    correct_answer: "London",
                    marks: 2
                }
            ]
        }
    };

    const res = {
        status: function(s) { 
            console.log("Status:", s); 
            return this; 
        },
        json: function(j) { 
            console.log("JSON Response:", JSON.stringify(j, null, 2)); 
            return this; 
        }
    };

    try {
        await quizController.createQuiz(req, res);
    } catch (e) {
        console.error("Test Failed:", e);
    }
}

test();
