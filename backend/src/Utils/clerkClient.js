import { Clerk } from "@clerk/clerk-sdk-node";
import AppConfig from "../Config/AppConfig.js"

const clerk = new Clerk({ apiKey: AppConfig.CLERK_SECRET_KEY });

export default clerk;
