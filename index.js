import { Elem } from './Elem';
import { Component } from './Component';
import * as components from './components';
import { styled } from './styled';

Object.entries({ Elem, Component, ...components }).forEach(([name, component]) => {
	if (/^[A-Z]/.test(name)) styled[name] = (...args) => styled(component, ...args);
});

export * from './Component';
export * from './components';
export { Oxject } from '@vanilla-bean/oxject';
export { GET, POST, PUT, PATCH, DELETE, resource, failureReason, resetRequest } from '@vanilla-bean/hypertether';
export * from './Elem';
export * from './styled';
export * from './utils';

export { default as theme } from './theme';

export { styled };
