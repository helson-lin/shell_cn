"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const node_fetch_1 = require("node-fetch");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const ORIGIN_PROXY = 'https://nn.oimi.space';
const app = express();
const isUrl = (url) => url.startsWith("http://") || url.startsWith("https://");
const isShell = (url) => url.endsWith(".sh");
const handlerGithubURL = (content, proxy) => {
    const handerKeys = ['https://github.com', 'https://raw.githubusercontent.com'];
    handerKeys.forEach(key => {
        content = content.replaceAll(key, `${proxy}/${key}`);
    });
    return content;
};
const getSourceData = (url, proxy) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await (0, node_fetch_1.default)(`${proxy}/${url}`);
            const text = await response.text();
            resolve(handlerGithubURL(text, proxy));
        }
        catch (e) {
            reject(e);
        }
    });
};
app.use('/', async (req, res, next) => {
    const baseURL = req.originalUrl.slice(1);
    if (!isUrl(baseURL)) {
        res.end("please provide correct shell script url");
    }
    else {
        const BASEURL = new URL(baseURL);
        const sourceURL = baseURL.replace(BASEURL.search, '');
        const searchParams = new URLSearchParams(BASEURL.search);
        const PROXY_WEBURL = searchParams.get('proxy') ?? ORIGIN_PROXY;
        if (!sourceURL || !isShell(sourceURL)) {
            res.send("please provide correct shell script url");
        }
        else {
            try {
                const shellContent = await getSourceData(sourceURL, PROXY_WEBURL);
                res.end(shellContent);
            }
            catch (e) {
                res.status(400);
                res.end(e + '');
            }
        }
    }
});
app.listen(3000, () => {
    console.log("shell script server tranformer on");
});
