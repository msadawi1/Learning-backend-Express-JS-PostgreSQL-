/* 
1. Use the inquirer npm package to get user input.
2. Use the qr-image npm package to turn the user entered URL into a QR code image.
3. Create a txt file to save the user input using the native fs node module.
*/

import inquirer from 'inquirer';
import qr from 'qr-image'
import fs from 'fs'


inquirer.prompt([
        {
            name: "url",
            message: "Enter a url: ",
        }
    ])
    .then((answers) => {
        "Generating qr image...";
        var qr_img = qr.image(answers.url, { type: 'png' });
        qr_img.pipe(fs.createWriteStream('qr_image.png'));
        fs.writeFile("URL.txt", answers.url, (err) => {
            if (err) throw err;
            console.log("File saved.");
        })
        console.log("QR Image generated!");
    })
    .catch((error) => {
        if (error.isTtyError) {
            // Prompt couldn't be rendered in the current environment
        } else {
            // Something else went wrong
        }
    });
