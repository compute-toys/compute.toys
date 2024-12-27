import { login } from './actions';

export const runtime = 'edge';

export default function LoginPage() {
    return (
        <form>
            <label htmlFor="email">Email:</label>
            <input id="email" name="email" type="email" required />
            <button formAction={login}>Login / Sign up</button>
        </form>
    );
}
