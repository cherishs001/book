export const makaiUrl = 'https://c.makai.city';
export function tokenToUsername(token: String) {
    // const res = fetch(makaiUrl + '/username/' + token);
    return null;
}
export function validToken(token: String) {
    return !(tokenToUsername(token) === null);
}
export function saveToken(token: string) {
    window.localStorage.setItem('token', token);
}
export function saveUsername(username: string) {
    window.localStorage.setItem('username', username);
}
export function getToken() {
    return window.localStorage.getItem('token');
}
export function getUsername() {
    return window.localStorage.getItem('username');
}
export function hasToken() {
    return window.localStorage.getItem('token') !== null;
}
