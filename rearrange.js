import fs from 'fs'
let json_data;
let new_json_data  = {};

fs.readFile('./messages.json', 'utf8', (err, data) => {
  // console.log(JSON.parse(data))
  json_data = JSON.parse(data)
  Object.keys(json_data).forEach((key) => {
    const value = json_data[key];
    console.log(key, value.message, value.id)
    new_json_data[value.id - 1] = value.message;
  })
  console.log(new_json_data)
  fs.writeFile('./new_messages.json', JSON.stringify(new_json_data, null, 2), (err) => {});
});

// console.log(json_data)
