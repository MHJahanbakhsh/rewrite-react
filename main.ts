type Props = Record<string, any> | null;

interface ZeactElement {
  type?: keyof HTMLElementTagNameMap | "TEXT_ELEMENT";
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
};

const element = Zeact.createElement(
  "div",
  { id: "foo" },
  Zeact.createElement("li", null, Zeact.createElement("a", null, "bar")),
  Zeact.createElement("div", { style: "background-color:red" }, "Hello")
);

function createDom(element: ZeactElement) {
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type!);

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

function render(element: ZeactElement, container: HTMLElement | Text) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };
  nextUnitOfWork = wipRoot;
}

interface Fiber extends ZeactElement {
  dom?: HTMLElement | Text | null;
  parent?: Fiber | null;
  child?: Fiber | null;
  sibling?: Fiber | null;
}

//recursivly calls the function whom paints the dom
function commitRoot() {
  commitWork(wipRoot?.child!); //because wipRoot is pointing to the container, which already is exist in HTML file 
  wipRoot = null;
}
function commitWork(fiber: Fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent!.dom;
  domParent?.appendChild(fiber.dom!);
  commitWork(fiber.child!);
  commitWork(fiber.sibling!);
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
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.props?.children;
  let index = 0;
  let prevSibling = null;
  while (index < elements.length) {
    const element = elements[index];
    const newFiber: Fiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling!.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
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

const rootContainer = document.getElementById("root") as HTMLElement;
render(element, rootContainer);
