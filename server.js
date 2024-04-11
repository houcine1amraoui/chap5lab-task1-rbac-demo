import express from "express";
import { v4 as uuidv4 } from "uuid";
import cookieParser from "cookie-parser";
const app = express();
app.use(express.json());
app.use(cookieParser());

let users = [
  {
    username: "admin",
    password: "admin",
    role: "admin",
  },
  {
    username: "mohamed-msila",
    password: "mohamed2024",
    role: "user",
  },
  {
    username: "amina-msila",
    password: "amina2024",
    role: "user",
  },
];

let posts = [
  {
    title: "Post 1",
    author: "mohamed-msila",
  },
  {
    title: "Post 2",
    author: "amina-msila",
  },
];

// get post of a specific user
// user should authenticate
// then authorization is performed based on username
app.get("/posts", cookieAuth, async (req, res) => {
  const user = req.user;
  // RBAC
  if (user.role === "admin") return res.send(posts);
  // ABAC
  res.json(posts.filter((post) => post.author === user.username));
});

// create a post by a specific user
// user should authenticate
app.post("/posts", cookieAuth, async (req, res) => {
  const username = req.username;
  const { title } = req.body;
  if (!title) {
    return res.send("Title are required");
  }
  const newPost = { title, author: username };
  posts.push(newPost);
  res.send("Post created successfully");
});

let sessions = [];
// user logs in only one time
// then authentication is done using cookies
app.post("/login", (req, res) => {
  const { username, password, role } = req.body;
  // Check username and password value existence
  if (!username || !password) {
    return res.send("Uusername and password are required");
  }
  // Check user existence
  const exist = users.find((user) => user.username === username);
  if (!exist) {
    return res.send("Invalid username or password");
  }
  // Check password matching
  if (exist.password !== password) {
    return res.send("Invalid username or password");
  }

  const sessionId = uuidv4();
  const newSession = { sessionId, username };
  sessions.push(newSession);
  res.cookie("session", sessionId, {
    // maxAge: 5000,
  });
  res.send("You have successfully logged in");
});

function cookieAuth(req, res, next) {
  const cookies = req.cookies;
  if (!cookies) {
    return res.status(401).send("Unauthenticated");
  }
  const sessionId = cookies.session;
  const userSession = sessions.find(
    (session) => session.sessionId === sessionId
  );
  if (!userSession) {
    return res.status(401).send("Unauthenticated");
  }
  // find user
  const user = users.find((user) => user.username === userSession.username);
  req.user = user;
  next();
}

const PORT = 1000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
