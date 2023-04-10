// import fs from 'fs'
import "dotenv/config";
import fs from "fs";

const img_has_both = [];
const brand_count = {};
const date_count = {};
const model_count = {};
const IMG_TO_PARSE = 8700;
const valid_images = [];

async function main() {
	for (let i = 0; i < IMG_TO_PARSE; i++) {
		await sleep(1);
		fetch(`http://localhost:${process.env.PORT}/imginfo/${i}`)
			.then(async (res) => {
				res.json().then((data) => {
					// console.log(data);
					if (data.date && data.brand && data.model && data.frontier_msg) {
						const [date, brand, model] = [
							data.date.split(" ")[0],
							data.brand,
							`${data.brand} ${data.model}`,
						];

						img_has_both.push({
							date_msg: `${date}: ${data.frontier_msg}, ${data.frontier_id}`,
							model: { model },
						});

						if (brand_count[brand]) brand_count[brand] += 1;
						else brand_count[brand] = 1;

						if (date_count[date]) date_count[date] += 1;
						else date_count[date] = 1;

						if (model_count[model]) model_count[model] += 1;
						else model_count[model] = 1;

						console.log(
							`Found one image has date & brand --> ${data.frontier_id}: ${date}, ${brand}, ${model}, ${data.frontier_msg}`,
						);

						valid_images.push(data.frontier_id);
						// return;
					}
				});
			})
			.catch((err) => {
				console.log(`Failed to fetch image ${i}`);
				console.log(err);
			});
	}
}

function print_obj(obj) {
	for (const [key, value] of Object.entries(obj).sort(
		([, a], [, b]) => b - a,
	)) {
		console.log(`${key}: ${value}`);
	}
}

main().then(() => {
	console.log("\nImage that has all:");
	console.log(img_has_both);
	console.log(`\nAmount: ${img_has_both.length}`);

	console.log("\nDate Count");
	print_obj(date_count);

	console.log("\nModel Count");
	print_obj(model_count);

	console.log("\nBrand Count");
	print_obj(brand_count);

	fs.writeFile("./valid_images.txt", valid_images.toString(), (err) => {
		if (err) return console.log(err);
		console.log("file writed");
	});
});

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
