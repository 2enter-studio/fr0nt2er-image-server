import { Server } from "node-osc";
import "dotenv/config";

const OSC_PORT = process.env.MAIN_OSC_PORT_OUTPUT;
const OSC_IP = process.env.MAIN_PC_IP;

export default new Server(OSC_PORT, OSC_IP, () => {
	console.log(`OSC Server is listening on port ${OSC_PORT}`);
});
