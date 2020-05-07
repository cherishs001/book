
export class MakaiControl {

    static url: String = 'https://c.makai.city';

    public static tokenToUsername(token: String) {
        const res = fetch(MakaiControl.url + '/username/' + token);
        return null;
    }
    public static validToken(token: String) {
        return !(MakaiControl.tokenToUsername(token) == null);
    }
    public static saveToken(token: string) {
        window.localStorage.setItem('token', token);
    }
    public static saveUsername(username: string) {
        window.localStorage.setItem('username', username);
    }
    public static getToken() {
        return window.localStorage.getItem('token');
    }
    public static getUsername() {
        return window.localStorage.getItem('username');
    }
    public static hasToken() {
        return window.localStorage.getItem('token') != null;
    }

}