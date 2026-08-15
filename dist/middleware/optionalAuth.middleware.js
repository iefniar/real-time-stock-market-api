import { auth } from '../lib/better-auth/auth.js';
export async function optionalAuth(req, _res, next) {
    try {
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') {
                headers.append(key, value);
            }
            else if (Array.isArray(value)) {
                value.forEach(v => headers.append(key, v));
            }
        }
        const session = await auth.api.getSession({
            headers
        });
        if (session?.user) {
            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name
            };
        }
        next();
    }
    catch (error) {
        console.error(error);
        next();
    }
}
