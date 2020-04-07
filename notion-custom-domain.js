const MY_DOMAIN = "YOUR_DOMAIN"
const START_PAGE = "URL_TO_NOTION_LANDING_PAGE"

addEventListener('fetch', event => {
    event.respondWith(fetchAndApply(event.request))
})

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST,PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

function handleOptions(request) {
    if (request.headers.get("Origin") !== null &&
        request.headers.get("Access-Control-Request-Method") !== null &&
        request.headers.get("Access-Control-Request-Headers") !== null) {
        // Handle CORS pre-flight request.
        return new Response(null, {
            headers: corsHeaders
        })
    } else {
        // Handle standard OPTIONS request.
        return new Response(null, {
            headers: {
                "Allow": "GET, HEAD, POST, PUT, OPTIONS",
            }
        })
    }
}

async function fetchAndApply(request) {
    if (request.method === "OPTIONS") {
        return handleOptions(request)
    }
    let url = new URL(request.url)
    let response
    if (url.pathname.startsWith("/app") && url.pathname.endsWith("js")) {
        // skip validation in app.js
        response = await fetch(`https://www.notion.so${url.pathname}`)
        let body = await response.text()
        try {
            response = new Response(body.replace(/www.notion.so/g, MY_DOMAIN).replace(/notion.so/g, MY_DOMAIN), response)
            response.headers.set('Content-Type', "application/x-javascript")
            console.log("get rewrite app.js")
        } catch (err) {
            console.log(err)
        }

    } else if ((url.pathname.startsWith("/api"))) {
        // Forward API
        response = await fetch(`https://www.notion.so${url.pathname}`, {
            body: request.body, // must match 'Content-Type' header
            headers: {
                'content-type': 'application/json;charset=UTF-8',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
            },
            method: "POST", // *GET, POST, PUT, DELETE, etc.
        })
        response = new Response(response.body, response)
        response.headers.set('Access-Control-Allow-Origin', "*")
    } else if (url.pathname === `/`) {
        // 301 redrict
        let pageUrlList = START_PAGE.split("/")
        let redrictUrl = `https://${MY_DOMAIN}/${pageUrlList[pageUrlList.length - 1]}`
        return Response.redirect(redrictUrl, 301)
    } else {
        response = await fetch(`https://www.notion.so${url.pathname}`, {
            body: request.body, // must match 'Content-Type' header
            headers: request.headers,
            method: request.method, // *GET, POST, PUT, DELETE, etc.
        })
        response = new Response(response.body, response)
    }

    response.headers.delete("Content-Security-Policy")
    return new HTMLRewriter().on('body', new ElementHandler()).transform(response)
    return response
}

class ElementHandler {
    element(element) {
        element.append(`
<script src=https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js></script>
<script src=https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js></script>
<script src=https://cdn.jsdelivr.net/gh/howyay/javascript-hosting/notion-inline-latex-sv.js></script>
`, {
            html: true
        })
    }
}