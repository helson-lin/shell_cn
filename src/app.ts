import { Response, Request } from "express"
import * as express from 'express'
import fetch from 'node-fetch';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const ORIGIN_PROXY = 'https://nn.oimi.space'
const app = express()
const isUrl = (url: string) => url.startsWith("http://") || url.startsWith("https://")
const isShell = (url: string) => url.endsWith(".sh")
const handlerGithubURL = (content: string, proxy: string) => {
    const handerKeys = ['https://github.com', 'https://raw.githubusercontent.com']
    handerKeys.forEach(key => {
        content = content.replaceAll(key, `${proxy}/${key}`)
    })
    return content
}
const getSourceData = (url: string, proxy: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`${proxy}/${url}`)
            const text = await response.text();
            resolve(handlerGithubURL(text, proxy))
        } catch(e) {
            reject(e)
        }
    })
}


app.use('/', async (req: Request, res: Response, next: Function) => {
    const baseURL = req.originalUrl.slice(1)
    if (!isUrl(baseURL)) {
        res.end("please provide correct shell script url")
    } else {
        const BASEURL = new URL(baseURL)
        const sourceURL = baseURL.replace(BASEURL.search, '')
        const searchParams = new URLSearchParams(BASEURL.search);
        const PROXY_WEBURL = searchParams.get('proxy') ?? ORIGIN_PROXY
        if (!sourceURL || !isShell(sourceURL)) {
            res.send("please provide correct shell script url")
        } else {
            try {
                const shellContent = await getSourceData(sourceURL, PROXY_WEBURL)
                res.end(shellContent)
            } catch(e) {
                res.status(400)
                res.end(e + '')
            }
        }
    }
})

app.listen(3000, () => {
    console.log("shell script server tranformer on");
})
