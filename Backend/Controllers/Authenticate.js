const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("dotenv").config();

const public = process.env.JWT_PUBLIC_KEY;
const private = process.env.JWT_PRIVATE_KEY;
const algorithms = process.env.JWT_ALGORITHM || "RS256";

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: private,
    },
    async (payload, done) => {
      try {
        if (!payload) {
          return done(null, false, { message: "Invalid token" });
        }
        const customer = payload.customer;
        if (!customer) {
          return done(null, false, { message: "Invalid customer" });
        }
        return done(null, customer);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(
    token.replace(/^Bearer\s/, ""),
    public,
    { algorithms: algorithms },
    async (err, decoded) => {
      if (err) {
        console.log("Error verifying token", err.message);
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.customer = await decoded;
      console.log("req.customer", req.customer);

      if (!req.customer) {
        return res.status(401).json({ message: "Unauthorized" });
      } else if (req.customer.licence.status === "inactivo") {
        return res.status(401).json({ message: "Unauthorized" });
      } else if (req.customer.licence.expiration_license < Date.now()) {
        return res.status(401).json({ message: "Unauthorized" });
      } else if (req.customer.licence.expiration_system < Date.now()) {
        return res.status(401).json({ message: "Unauthorized" });
      } else if (req.customer.licence.active === false) {
        return res.status(401).json({ message: "Unauthorized" });
      } else {
        next();
      }
    }
  );
};

module.exports = authenticate;
