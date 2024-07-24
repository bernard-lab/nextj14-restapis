
//This will return the method used and the url
export function logMiddleware(req: Request) {
    return {response: 'This is the method log: ' + req.method + " " + req.url};
}