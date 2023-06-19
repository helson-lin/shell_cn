import { Response, Request } from "express"
import * as express from 'express'
import fetch from 'node-fetch';
import 'dotenv/config'

const PORT = process.env.PORT || 3000
const ORIGIN_PROXY = process.env.ORIGIN_PROXY || 'https://nn.oimi.space'
const app = express()
const isUrl = (url: string) => {
    try {
        new URL(url)
        return true
    } catch (e) {
        return false
    }
}
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
    let baseURL = req.originalUrl.slice(1)
    if (baseURL === 'favicon.ico') {
        next()
    } else {
        console.log(req.headers['accept-language'])
        if (!isUrl(baseURL)) {
            res.end("please provide correct url")
        } else {
            const BASEURL = new URL(baseURL)
            const sourceURL = baseURL.replace(BASEURL.search, '')
            const searchParams = new URLSearchParams(BASEURL.search);
            const PROXY_WEBURL = searchParams.get('proxy') ?? ORIGIN_PROXY
            if (!sourceURL) {
                res.send("please provide correct shell script url")
            } else {
                try {
                    const shellContent = await getSourceData(sourceURL, PROXY_WEBURL)
                    res.end(shellContent)
                } catch(e) {
                    res.status(400)
                    res.send('cant resolve this url: ' + sourceURL + '\Nerror:' + e)
                }
            }
        }
    }
})

app.listen(PORT, () => {
    console.log(`server is running on: ${PORT}`);
})
