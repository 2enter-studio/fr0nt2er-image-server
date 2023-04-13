import valid_images from "./valid_images.js";
import messages from "./messages.js";
import osc_server from "./osc-receiver.js";

import "dotenv/config";
import express, { Express, Request, Response } from "express";
import body_parser from "body-parser";
import exif from "exif";
import fs from "fs";
import path from "path";
import cors from "cors";
import { Client } from "node-osc";

const osc_client = new Client(process.env.OSC_IP, process.env.OSC_PORT_1);

let progress_value: number = 0;

osc_server.on("message", (msg, rinfo) => {
	if (msg[0] === "/composition/layers/3/clips/1/transport/position") {
		// progress_value = msg[1];
		progress_value = (msg[1] * 2512).toFixed(1);
		// console.log(msg[1]);
		// console.log(rinfo);
	}
});

const __dirname = path.resolve();

const app: Express = express();
const port = process.env.PORT || 3000;

// get image metadata by id use exif parser
// if file not found return 'file not found'
// if exif parser error return 'exif parser error'
// else return exif data
const get_img_metadata_by_id = async (img_id: number) => {
	if (fs.existsSync(`./images/${img_id}.jpg`)) {
		return new Promise((resolve) => {
			fs.readFile(`./images/${img_id}.jpg`, (err: Error, data: File) => {
				exif(data, (err: Error, data: File) => {
					if (err) resolve({ error: "exif parser error" });
					else resolve(data);
				});
			});
		});
	} else {
		return new Promise((resolve) => {
			resolve({ error: "file not found" });
		});
	}
};

function parse_exif(data) {
	if (data.error) return data;
	const new_data = {};
	new_data.brand = data.image.Make;
	new_data.model = data.image.Model;
	new_data.date = data.exif.CreateDate;
	new_data.lens = data.image.LensModel;
	new_data.software = data.image.Software;
	new_data.f_number = data.exif.FNumber;
	new_data.iso = data.exif.ISO;
	new_data.focal_length = data.exif.FocalLength;
	new_data.flash = data.exif.Flash;
	new_data.raw = data;

	return new_data;
}

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

app.use(
	cors({
		origin: "http://0.0.0.0:8080",
	}),
);

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"OPTIONS, GET, POST, PUT, PATCH, DELETE", // what matters here is that OPTIONS is present
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	next();
});

app.get("/img/:id", async (req: Request, res: Response) => {
	const img_id = valid_images[parseInt(req.params.id)];
	if (fs.existsSync(`./images/${img_id}.jpg`)) {
		res.sendFile(`./images/${img_id}.jpg`, { root: __dirname });
	} else {
		res.sendFile("./black.png", { root: __dirname });
	}
});

app.get("/imginfo/:id", async (req: Request, res: Response) => {
	const img_id = valid_images[parseInt(req.params.id)];
	console.log(`requesting image ${img_id}`);
	get_img_metadata_by_id(img_id).then((img_metadata) => {
		img_metadata = parse_exif(img_metadata);
		img_metadata.frontier_msg = messages[img_id];
		img_metadata.frontier_id = img_id;
		res.send(JSON.stringify(img_metadata, null, 2));
	});
});

app.get("/send/:data", (req, res) => {
	osc_client.send(
		"/composition/layers/3/clips/1/transport/position",
		parseFloat(req.params.data),
		() => {
			console.log(`Message sent, ${req.params.data}`);
		},
	);
	res.send("ok");
});

app.get("/osc-info", (req: Request, res: Response) => {
	// res.send(JSON.stringify({ value: ~~(progress_value * 10 ** 10) }));
	// res.send((~~(progress_value * 10 ** 6)).toString());
	res.send(progress_value.toString());
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
