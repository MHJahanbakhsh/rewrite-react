type Props = Record<string, any>;

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
  render,
};

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
let currentRoot: Fiber | null; // in the context of reconciliation,the name should be previousRoot!
let deletions: Fiber[];

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
  const domParent = fiber.parent!.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent?.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom as HTMLElement, fiber.alternate?.props!, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    domParent?.removeChild(fiber.dom!);
  }
  commitWork(fiber.child!);
  commitWork(fiber.sibling!);
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
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.props?.children;
  //essentially builds-up the fiber tree, before commit phase
  reconcileChildren(fiber, elements);
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
