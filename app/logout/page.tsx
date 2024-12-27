import { logout } from '../login/actions';

export const runtime = 'edge';

export default function LogoutPage() {
    return logout();
}
