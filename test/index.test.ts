import useEventCallback from '../src';
import { createElement } from 'react';
import TestRenderer from 'react-test-renderer';

const Child = () => null;

const MyComponent = ({
  spy,
  value,
}) => {
  const eventCallback = useEventCallback((...args) => spy(value, ...args));
  return createElement(Child, { eventCallback });
};

describe('useEventCallback', () => {
  it('forwards args', () => {
    const spy = jest.fn();
    const value = 'value';
    const renderer = TestRenderer.create(createElement(MyComponent, { spy, value }));
    expect(spy).toHaveBeenCalledTimes(0);
    const child = renderer.root.findByType(Child);
    const { eventCallback } = child.props;
    expect(eventCallback).toBeInstanceOf(Function);

    TestRenderer.act(() => {
      eventCallback(1, 2);
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(value, 1, 2);
  });

  it('always return same function', () => {
    const spy = jest.fn();
    const value = 'value';
    const renderer = TestRenderer.create(createElement(MyComponent, { spy, value }));
    expect(spy).toHaveBeenCalledTimes(0);
    const child = renderer.root.findByType(Child);
    const { eventCallback } = child.props;
    expect(eventCallback).toBeInstanceOf(Function);

    const updatedSpy = jest.fn();
    const updatedValue = 'updatedValue';
    renderer.update(createElement(MyComponent, {
      spy: updatedSpy,
      value: updatedValue
    }));
    expect(spy).toHaveBeenCalledTimes(0);
    expect(updatedSpy).toHaveBeenCalledTimes(0);
    const { eventCallback: updatedEventCallback } = child.props;
    expect(updatedEventCallback).toBeInstanceOf(Function);
    expect(updatedEventCallback).toBe(eventCallback);

    TestRenderer.act(() => {
      eventCallback();
    });
    expect(spy).toHaveBeenCalledTimes(0);
    expect(updatedSpy).toHaveBeenCalledTimes(1);
    expect(updatedSpy).toHaveBeenCalledWith(updatedValue);
  });
});
