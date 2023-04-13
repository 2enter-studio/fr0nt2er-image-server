import { Server } from "node-osc";
import "dotenv/config";

const OSC_PORT = process.env.OSC_PORT_2;
const OSC_IP = process.env.OSC_IP;

export default new Server(OSC_PORT, OSC_IP, () => {
  console.log(`OSC Server is listening on port ${OSC_PORT}`);
});
