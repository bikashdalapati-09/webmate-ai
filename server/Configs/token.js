import jwt from "jsonwebtoken";
import { get } from "mongoose";

const getToken = async (userId) => {
  try {
    const token = await jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token
  } catch (error) {
    console.log(`Problem in token.js`);
    console.log(error);
  }
};

export default getToken
