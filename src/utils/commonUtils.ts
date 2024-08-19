export const getUser = () => {
    const userInfo: string = sessionStorage.getItem('user') || ''
    return userInfo ? JSON.parse(userInfo) : null
}