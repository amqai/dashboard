const BASE_URL = process.env.REACT_APP_BASE_URL;

export async function fetchProjects(jwt: string) {
    const response = await fetch(`${BASE_URL}/api/person/projects`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        },
    });

    let content = null;
    if (response.status === 403) {
        localStorage.removeItem("jwt");
    } else if (response.ok) {
        content = await response.json();
    }
    return { status: response.status, data: content };
}