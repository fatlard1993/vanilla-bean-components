import * as components from './components';
import { styled } from './styled';

Object.keys(components).forEach(name => {
	if (/^[A-Z]/.test(name)) styled[name] = (...args) => styled(components[name], ...args);
});

export * from './Component';
export * from './components';
export * from './Context';
export * from './Elem';
export * from './request';
export * from './styled';
export * from './utils';

export { default as theme } from './theme';

// eslint-disable-next-line unicorn/prefer-export-from
export { styled };
