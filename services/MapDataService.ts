const getMapData = (userId: number) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    return fetch(apiUrl + `/users/${userId}/mapdata`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });
};

const saveMapData = (userId: number, RandomAssObject: any) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    return fetch(apiUrl + `/users/${userId}/mapdata`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(RandomAssObject),
    });
};

const removeMapDataFromUser = (userId: number) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    return fetch(apiUrl + `/users/${userId}/mapdata`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export { getMapData, saveMapData, removeMapDataFromUser };