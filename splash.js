const { ipcRenderer: ipcRenderer, remote } = require("electron");
const https = require('https');
const fs = require('fs');

// ** REMEMBER THIS EVERY UPDATE, JUST INCREASE +1, TO TEST, DECREASE -1 **

const version = 21;
var downloadBtn, cancelBtn, status;

document.addEventListener('DOMContentLoaded', (event) => {
    status = document.getElementById('status');
    downloadBtn = document.getElementById('download');
    cancelBtn = document.getElementById('cancel');
    var json;

    fetch("https://zenokrunkerapi.web.app/latestVersion.json")
        .then((resp) => resp.json())
        .then((resp) => json = resp);

    setTimeout(() => {
        if (json && json.version > version) {
            status.innerHTML = `New Update Found! (Release v${json.version}) Download now?`;
            downloadBtn.style.display = "block";
            cancelBtn.style.display = "block";

            downloadBtn.addEventListener("click", () => {
                process.noAsar = !0;
                let downloadURL = `https://zenokrunkerapi.web.app/updates/v${16}.asar`;
                status.innerHTML = "Downloading Update... (Do NOT close the client)";
                downloadBtn.style.display = "none";
                cancelBtn.style.display = "none";

                let dest = __dirname.endsWith(".asar") ? __dirname : __dirname + "/app.asar";
                
                try{
                    download(downloadURL, dest, () => {
                        status.innerHTML = 'Update Downloaded. Restarting...';
                        setTimeout(() => {
                            //ipcRenderer.send('restart-client');
                        }, 2000);
                    });
                } catch (err) {
                    status.innerHTML = 'Something went wrong! Click the cancel button to proceed with the older version.';
                    cancelBtn.style.display = "block";
                }
            });

            cancelBtn.addEventListener("click", () => {
                ipcRenderer.send('noUpdate');
            });
        } else {
            console.log("No Update Found");
            status.innerHTML = 'No Update Found';
            setTimeout(ipcRenderer.send('noUpdate'), 5000);
        }
    }, 5000);
});


var download = function(url, dest, cb) {
    var request = https.get(url, function(response) {
        if(response.statusCode == 404) {
            status.innerHTML = 'Something went wrong! Click the cancel button to proceed with the older version.';
            cancelBtn.style.display = "block";
            console.log(response);
            return;
        }
        var file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);
        });
    }).on('error', function(err) {
        fs.unlink(dest);
        if (cb) cb(err.message);
    });
};