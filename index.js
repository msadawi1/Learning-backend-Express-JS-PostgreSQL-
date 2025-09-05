const fs = require('node:fs');

// fs.writeFile("message.txt", "Hello world!", (err) => {
//     if(err) throw err;
//     console.log("Successfully saved the file");
// })

let data;
fs.readFile("message.txt", 'utf-8', (err, data) => {
    if (err) throw err;
    console.log(data);
})