type Props = Record<string, any>;

interface ZeactElement {
  type?: keyof HTMLElementTagNameMap | "TEXT_ELEMENT" | Function;
  props: Props;
}

//creates react element tree
function createElement(
  type: keyof HTMLElementTagNameMap,
  props?: Props,
  ...children: Array<ZeactElement | string>
): ZeactElement {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text: string): ZeactElement {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

const Zeact = {
  createElement,
  render,
  useState,
};

function createDom(element: ZeactElement) {
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : //since we changed type to support function, this will nag about. but we only call this createDom function when element.type is not a function
        document.createElement(element.type as any);

  //setting attributes
  const isProperty = (key: string) => key !== "children";
  element.props &&
    Object.keys(element.props)
      .filter(isProperty)
      .forEach((name) => {
        // stop ts bitching
        (dom as any)[name] = element.props![name];
      });

  return dom;
}
let nextUnitOfWork: Fiber;
let wipRoot: Fiber | null; //better name for this is, fiberTreeRoot. we only store it refrence to commit whole dom all at once
let currentRoot: Fiber | null; // in the context of reconciliation,the name should be previousRoot!
let deletions: Fiber[];

//for useState
let wipFiber: Fiber;
let hookIndex: number;

function render(element: ZeactElement, container: HTMLElement | Text) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

interface Fiber extends ZeactElement {
  dom?: HTMLElement | Text | null;
  parent?: Fiber | null;
  child?: Fiber | null;
  sibling?: Fiber | null;
  alternate?: Fiber | null;
  effectTag?: "PLACEMENT" | "UPDATE" | "DELETION";
  hooks?: Hook<any>[]; //in actual React's FiberNode, this is named as "memoizedState"
}

interface Hook<State> {
  state: State;
  queue: ((state: State) => State)[];
}

//recursivly calls the function whom paints the dom
function commitRoot() {
  deletions.forEach(commitWork); //because fibers which needs to be deleted are no longer in the(new) wipRoot.we tagged them "DELETION" in the oldFiber
  commitWork(wipRoot?.child!); //because wipRoot is pointing to the container, which already exists in HTML file
  currentRoot = wipRoot; //so when we are about to finish the commit phase;we set the currentRoot
  wipRoot = null;
}
function commitWork(fiber: Fiber) {
  if (!fiber) {
    return;
  }
  let domParentFiber = fiber.parent;
  while (!domParentFiber?.dom) {
    domParentFiber = domParentFiber?.parent;
  }
  const domParent = domParentFiber.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent?.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom as HTMLElement, fiber.alternate?.props!, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  }
  commitWork(fiber.child!);
  commitWork(fiber.sibling!);
}
function commitDeletion(fiber: Fiber, domParent: HTMLElement | Text) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child!, domParent);
  }
}
const isEvent = (key: string) => key.startsWith("on");
const isProperty = (key: string) => key !== "children";
const isNew = (prev: Props, next: Props) => (key: string) =>
  prev[key] !== next[key];
const isGone = (prev: Props, next: Props) => (key: string) => !(key in next);
function updateDom(dom: HTMLElement, prevProps: Props, nextProps: Props) {
  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom.removeAttribute(name);
    });
  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom.setAttribute(name, nextProps[name]);
    });

  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}
function workLoop(deadline: IdleDeadline) {
  let shouldContinue = true;
  while (nextUnitOfWork && shouldContinue) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)!;
    shouldContinue = deadline.timeRemaining() > 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

//in the first call the argument is Zeact element; then there are fibers
function performUnitOfWork(fiber: Fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber as any);
  } else {
    updateHostComponent(fiber);
  }

  //goes all the way down and then visit sibilings and then uncles via parent; and goes all the way up
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent!;
  }
}

function updateFunctionComponent(
  fiber: Omit<Fiber, "type"> & { type: Function }
) {
  //-----for state hook-----
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  //---------------

  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

//in actual source-code this is built upon useReducer
function useState<State>(
  initial: State
): [State, (action: (state: State) => State) => void] {
  const oldHook = wipFiber?.alternate?.hooks?.[hookIndex];
  const hook: Hook<State> = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });
  const setState = (action: (state: State) => State): void => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot?.dom,
      props: currentRoot?.props!,
      alternate: currentRoot,
    };
    //triggers re-render
    nextUnitOfWork = wipRoot; // this should only happen IF state comparison is different
    deletions = [];
  };
  wipFiber?.hooks?.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.props?.children;
  //essentially builds-up the fiber tree, before commit phase
  reconcileChildren(fiber, elements);
}

function reconcileChildren(wipFiber: Fiber, elements: ZeactElement[]) {
  let index = 0;
  let oldFiber = wipFiber.alternate?.child;
  let prevSibling: Fiber | null = null;
  //The element is the thing we want to render to the DOM and the oldFiber is what we rendered the last time.

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber: Fiber | null = null;

    /**
     React also does some optimization such as "key" to traverse through fiberTree faster
     But still has to traverse through the whole tree to find where it needs to update?
     */
    const AreSameType = element.type === oldFiber?.type;

    if (AreSameType) {
      newFiber = {
        type: oldFiber?.type,
        props: element.props,
        dom: oldFiber?.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
        child: null,
        sibling: null,
      };
    }
    if (element && !AreSameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
        child: null,
        sibling: null,
      };
    }
    if (oldFiber && !AreSameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling!.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

const element = Zeact.createElement(
  "div",
  { id: "foo" },
  Zeact.createElement("li", {}, Zeact.createElement("a", {}, "bar")),
  Zeact.createElement("div", { style: "background-color:red" }, "Hello")
);
const rootContainer = document.getElementById("root") as HTMLElement;
render(element, rootContainer);

/*
State Update in a Component: When a component updates (e.g., through a state change or props update),
 React triggers a re-render. The reconciliation process starts from the root of the fiber tree 
 and works its way down to the affected components.
*/

//i guess react is also smart enough to skip the fiberNodes whom states are not changed?
//no without compiler the whole diffing happens at runtime.
//you can only optimize the process, you can't not do it!
//the concept of "flags" in actual sourceCode is the same as what we call effectTag?

//missed parts:
//1- probably reconciliation after changing state should be different than normal(skip components that doesn't need to be checked)
//2- react avoids recursion as as it can
//2- react avoids recursion as as it can
//3- freezing props
//By avoid unnecceary re-renders we are helping the react reconciliation algorithm to skip unwanted fibers right away
