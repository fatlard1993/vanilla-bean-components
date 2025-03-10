import { Elem } from './Elem';
import { Component } from './Component';
import * as components from './components';
import { styled } from './styled';

Object.entries({ Elem, Component, ...components }).forEach(([name, component]) => {
	if (/^[A-Z]/.test(name)) styled[name] = (...args) => styled(component, ...args);
});

export * from './Component';
export * from './components';
export * from './Context';
export * from './Elem';
export * from './request';
export * from './styled';
export * from './utils';

export { default as theme } from './theme';

export { styled };
