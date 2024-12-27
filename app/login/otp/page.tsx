import { verify } from '../actions';

export const runtime = 'edge';

export default async function LoginPage({ searchParams }) {
    const email = (await searchParams).email;
    return (
        <form>
            <label htmlFor="email">Email:</label>
            <input id="email" name="email" type="email" required value={email} />
            <label htmlFor="token">Token:</label>
            <input id="token" name="token" type="text" required />
            <button formAction={verify}>Login / Sign up</button>
        </form>
    );
}
