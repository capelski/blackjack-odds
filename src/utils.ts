export const cartesianProduct = <T, U, R>(
    firstArray: T[],
    secondArray: U[],
    elementBuilder: (t: T, u: U) => R
): R[] => {
    return firstArray.reduce<R[]>((product, x) => {
        return product.concat(secondArray.map((y) => elementBuilder(x, y)));
    }, []);
};

export const removeDuplicates = <T>(items: T[]) => {
    for (let i = items.length; i > 0; --i) {
        if (items[i] === items[i - 1]) {
            items.splice(i, 1);
        }
    }
};
