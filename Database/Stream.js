import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// Check if credentials missing
if (!apiKey || !apiSecret) {
  console.log("❌ Stream API Key or Secret missing in .env");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

// CREATE OR UPDATE USER IN STREAM
export const upsertStreamUser = async (userData) => {
  try {
    // IMPORTANT: userData MUST contain at least "id"
    await streamClient.upsertUser(userData);

    return userData;

  } catch (error) {
    console.error("❌ Error upserting user:", error);
  }
};

// GENERATE STREAM CHAT TOKEN
export const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr)
  } catch (error) {
    console.error("❌ Error generating Stream Token:", error);
    return 
  }
};
