export const rand = (min, max) => Math.random() * (max - min) + min;

export const randInt = (min, max) => Number.parseInt(rand(min, max));

export const randFromArray = array => array[randInt(0, array.length)];
