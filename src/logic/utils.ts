import { maximumScore } from './constants';

export const cartesianProduct = <T, U, R>(
    firstArray: T[],
    secondArray: U[],
    elementBuilder: (t: T, u: U) => R
): R[] => {
    return firstArray.reduce<R[]>((product, x) => {
        return product.concat(secondArray.map((y) => elementBuilder(x, y)));
    }, []);
};

export const getValidValues = (values: number[]) => {
    const validValues = values.filter((x) => x <= maximumScore);
    return validValues.length > 0 ? validValues : [values[0]];
};

export const removeDuplicates = <T>(values: T[]) => {
    for (let i = values.length; i > 0; --i) {
        if (values[i] === values[i - 1]) {
            values.splice(i, 1);
        }
    }
};
