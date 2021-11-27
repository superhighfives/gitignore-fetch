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
    return JSON.stringify(await response.json())
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
        "Authorization": `token ${OAUTH_TOKEN}`
      }
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