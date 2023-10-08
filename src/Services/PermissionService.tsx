export const hasPermission = (permissionName: string): boolean => {
    const permissionString = localStorage.getItem('organization.permissions');
    if (permissionString !== null && permissionString !== "undefined") {
        const permissions: string[] = JSON.parse(permissionString);
        return permissions.includes(permissionName);
    }
    return false;
};
