const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { Customer, checkCustomerAndSave } = require("../Models/Customer");
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
  } else if (token === "null") {
    return res.status(102).json({ message: "waiting for token" });
  } else {
    jwt.verify(
      token.replace(/^Bearer\s/, ""),
      public,
      { algorithms: algorithms },
      async (err, decoded) => {
        if (err) {
          console.log("Error verifying token", err.message);
          return res.status(401).json({ message: "Unauthorized" });
        }

        if (decoded.userType === "Customer") {
          req.customer = decoded;

          if (!req.customer) {
            return res.status(401).json({ message: "Unauthorized" });
          } else if (
            req.customer.license.status === "inactive" ||
            new Date(req.customer.license.expiration_license) < new Date() ||
            new Date(req.customer.license.expiration_system) < new Date() ||
            req.customer.license.active === false
          ) {
            // Actualizamos el estado is_active a false
            await Customer.updateOne(
              { email: req.customer.email },
              { $set: { is_active: false } }
            );
            return res.status(401).json({ message: "Unauthorized" });
          } else {
            // Si todas las condiciones de licencia y vencimiento se cumplen, reactivamos el cliente
            if (!req.customer.is_active) {
              await Customer.updateOne(
                { email: req.customer.email },
                { $set: { is_active: true } }
              );
            }
            req.customer = await checkCustomerAndSave(decoded);
            next();
          }
        } else {
          return res.status(401).json({ message: "Unauthorized" });
        }
      }
    );
  }
};

module.exports = authenticate;
