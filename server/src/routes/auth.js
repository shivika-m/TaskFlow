
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

function makeToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email
  };
}

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// Email/password registration
router.post("/register", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    if (name.length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Enter a valid email address."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters."
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        message: "An account with that email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      passwordHash,
      authProvider: "local"
    });

    return res.status(201).json({
      token: makeToken(user._id.toString()),
      user: publicUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with that email already exists."
      });
    }

    next(error);
  }
});

// Email/password login
router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    // passwordHash is excluded by default in the User model.
    // Select it explicitly for password verification.
    const user = await User.findOne({ email })
      .select("+passwordHash");

    if (
      !user ||
      !user.passwordHash ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      return res.status(401).json({
        message: "Email or password is incorrect."
      });
    }

    return res.json({
      token: makeToken(user._id.toString()),
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
});

// Google sign-in
router.post("/google", async (req, res, next) => {
  try {
    const credential = req.body.credential;

    if (
      typeof credential !== "string" ||
      !credential ||
      !process.env.GOOGLE_CLIENT_ID
    ) {
      return res.status(400).json({
        message: "Google sign-in is not configured."
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        message: "Google account verification failed."
      });
    }

    const googleId = payload.sub;
    const email = payload.email.trim().toLowerCase();
    const name = String(payload.name || "").trim();

    if (!name) {
      return res.status(400).json({
        message: "Your Google account must provide a name."
      });
    }

    // Find an account already linked to this Google identity.
    let user = await User.findOne({ googleId });

    if (!user) {
      // Never silently link Google to an existing local account.
      const existingEmail = await User.findOne({ email });

      if (existingEmail) {
        return res.status(409).json({
          message:
            "An account with this email already exists. Sign in using your existing method first."
        });
      }

      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "google"
      });
    }

    return res.json({
      token: makeToken(user._id.toString()),
      user: publicUser(user)
    });
  } catch (error) {
    if (
      error.code === 11000 ||
      error.name === "MongoServerError"
    ) {
      if (error.code === 11000) {
        return res.status(409).json({
          message:
            "This account may already exist. Please try signing in again."
        });
      }
    }

    // Do not expose provider errors or sensitive details.
    if (error.message?.includes("Wrong recipient")) {
  console.error("Google Client ID mismatch:", error.message);

  return res.status(401).json({
    message: "Google Client ID mismatch. Check your configuration."
  });
}

console.error("Google sign-in error:", error.message);

return res.status(401).json({
  message: "Unable to verify Google sign-in."
});
    next(error);
  }
});

// Get the currently logged-in user
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
      .select("name email");

    if (!user) {
      return res.status(401).json({
        message: "Account not found."
      });
    }

    return res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

export default router;
