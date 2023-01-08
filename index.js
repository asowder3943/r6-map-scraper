// For fetching map info pages
import { RequestQueue, CheerioCrawler } from 'crawlee';

// for zip file downloads
import axios  from 'axios';
import * as path from 'path';
import * as fs from 'fs'



// download function credit: https://gist.github.com/senthilmpro/04ea6c086bcb592beb8083214a630548
function downloadFile(reqUrl, fileName){
    axios({
        method: "GET",
        url: reqUrl,
        responseType: "stream"
    }).then(res => {
        if (res.status == 200) {
            fileName = fileName || reqUrl.split("/").pop();

            const dir = path.resolve(fileName);
            res.data.pipe(fs.createWriteStream(dir));
            res.data.on("end", () => {
                console.log("download completed");
            });
        } else {
            console.log(`ERROR >> ${res.status}`);
        }
    }).catch(err => {
        console.log("Error ",err);
    });
}


let entry_url = `https://www.ubisoft.com/en-us/game/rainbow-six/siege/game-info/maps`
const requestQueue = await RequestQueue.open();
await requestQueue.addRequest({ url: entry_url });

let crawl_root = true

const crawler = new CheerioCrawler({
    requestQueue,
    async requestHandler({ $, request }) {
        if (crawl_root){
            crawl_root=false
            let maps = $('a').map(function(i,el){
                if (el.attribs.href.includes(`/en-us/game/rainbow-six/siege/game-info/maps/`)){
                    let map_url = `https://www.ubisoft.com${el.attribs.href}`
                    requestQueue.addRequest({ url: map_url})
                }
            })
        }
        else{
            let blueprint_zip = $('a').map(async function(i,el){
                if (el.attribs.href.includes(`.zip`)){
                    let download_url = el.attribs.href
                    downloadFile(download_url, download_url.split("/").pop())
                }
            })
           
        }
    }
})

await crawler.run();


