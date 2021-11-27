/**
 * Example someHost is set up to take in a JSON request
 * Replace url with the host you wish to send requests to
 * @param {string} someHost the host to send the request to
 * @param {string} url the URL to send the request to
 */
const remoteHost = "https://api.github.com/"
const remoteUrl = remoteHost + "repos/github/gitignore/contents"

const contentHost = "https://raw.githubusercontent.com/"
const contentUrl = contentHost + "github/gitignore/master"


/**
 * gatherResponse awaits and returns a response body as a string.
 * Use await gatherResponse(..) in an async function to get the response body
 * @param {Response} response
 */
async function gatherResponse(response) {
  const { headers } = response
  const contentType = headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    const json = await response.json()
    return JSON.stringify(json.filter(file => file.path.endsWith(".gitignore")))
  }
  else {
    return response.text()
  }
}

function getFileUrl (path) {
  if(path === '/') {
    return remoteUrl
  } else if (path.endsWith('.gitignore')) {
    return contentUrl + path
  }
}
 
 async function handleRequest(request) {
  const requestUrl = new URL(request.url)
  const url = getFileUrl(requestUrl.pathname)

  if(url) {
    const init = {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "User-Agent": "gitignore-fetch",
        "Authorization": `token ${OAUTH_TOKEN}`,
        "Cache-Control": "max-age=86400"
      },
      cf: {
        // Always cache this fetch regardless of content type
        // for a max of 5 seconds before revalidating the resource
        cacheTtl: 86400,
        cacheEverything: true
      },
    }
    const response = await fetch(url, init)
    const results = await gatherResponse(response)
    return new Response(results, init)
  } else {
    return new Response("404: Not Found", {status: 404})
  }  
}
 
addEventListener("fetch", event => {
  return event.respondWith(handleRequest(event.request))
})