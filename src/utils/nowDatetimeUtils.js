export const nowDatetime = () => {
    const date = new Date();
    const now = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const isoNow = now.toISOString();
    console.log("Iso now ", isoNow);
    
    return isoNow;
}

// export default { nowDatetime };