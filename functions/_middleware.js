// Cloudflare Pages Functions - rewrites dynamic URLs to HTML templates with query params
export async function onRequest(context) {
    const url = new URL(context.request.url);
    const path = url.pathname;

    // Rewrite /view/123 → /view.html?id=123
    const viewMatch = path.match(/^\/view\/(\d+)$/);
    if (viewMatch) {
        return context.env.ASSETS.fetch(new Request(url.origin + '/view.html?id=' + viewMatch[1]));
    }
    
    // Rewrite /list/2 → /list.html?page=2
    const listMatch = path.match(/^\/list\/(\d+)$/);
    if (listMatch) {
        return context.env.ASSETS.fetch(new Request(url.origin + '/list.html?page=' + listMatch[1]));
    }
    
    // Rewrite /userid/456 → /userid.html?id=456
    const userMatch = path.match(/^\/userid\/(\d+)$/);
    if (userMatch) {
        return context.env.ASSETS.fetch(new Request(url.origin + '/userid.html?id=' + userMatch[1]));
    }

    if (path === '/') {
        // Rewrite / → /list.html?page=1
        return context.env.ASSETS.fetch(new Request(url.origin + '/list.html?page=1'));
    }

    // Let other requests pass through
    return context.next();
}