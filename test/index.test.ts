import useEventCallback from '../src';
import { createElement } from 'react';
import TestRenderer from 'react-test-renderer';
import { renderHook } from "@testing-library/react-hooks";

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

  it("given the hook is re-rendered, it returns the same function value", () => {
    const hookData = renderHook(() => {
      function functionThatChangesOnEachRender() {
        return "value";
      }
      return useEventCallback(functionThatChangesOnEachRender);
    });
    const initialReturn = hookData.result.current;
    hookData.rerender();
    const secondaryReturn = hookData.result.current;
    expect(initialReturn === secondaryReturn).toBeTruthy();
  });

  it("given the hook is called before and after re-rendering, the right value is returned", () => {
    let callCount = 0;
    function factory() {
      callCount = callCount + 1;
      return callCount;
    }
    const hookData = renderHook(() => useEventCallback(factory));
    expect(hookData.result.current()).toEqual(1);
    hookData.rerender();
    expect(hookData.result.current()).toEqual(2);
  });
});
