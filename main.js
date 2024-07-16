var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
//creates react element tree
function createElement(type, props) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    return {
        type: type,
        props: __assign(__assign({}, props), { children: children.map(function (child) {
                return typeof child === "object" ? child : createTextElement(child);
            }) }),
    };
}
function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    };
}
var Zeact = {
    createElement: createElement,
};
var element = Zeact.createElement("div", { id: "foo" }, Zeact.createElement("li", null, Zeact.createElement("a", null, "bar")), Zeact.createElement("div", { style: "background-color:red" }, "Hello"));
function createDom(element) {
    var dom = element.type == "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(element.type);
    //setting attributes
    var isProperty = function (key) { return key !== "children"; };
    element.props &&
        Object.keys(element.props)
            .filter(isProperty)
            .forEach(function (name) {
            // stop ts bitching
            dom[name] = element.props[name];
        });
    return dom;
}
var nextUnitOfWork;
var wipRoot;
var currentRoot;
function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
}
function commitRoot() {
    commitWork(wipRoot === null || wipRoot === void 0 ? void 0 : wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}
function commitWork(fiber) {
    if (!fiber) {
        return;
    }
    var domParent = fiber.parent.dom;
    domParent === null || domParent === void 0 ? void 0 : domParent.appendChild(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}
function workLoop(deadline) {
    var shouldContinue = true;
    while (nextUnitOfWork && shouldContinue) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldContinue = deadline.timeRemaining() > 1;
    }
    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }
    requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);
//in the first call the argument is Zeact element; then there are fibers
function performUnitOfWork(fiber) {
    var _a;
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }
    var elements = (_a = fiber.props) === null || _a === void 0 ? void 0 : _a.children;
    var index = 0;
    var prevSibling = null;
    while (index < elements.length) {
        var element_1 = elements[index];
        var newFiber = {
            type: element_1.type,
            props: element_1.props,
            parent: fiber,
            dom: null,
        };
        if (index === 0) {
            fiber.child = newFiber;
        }
        else {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber;
        index++;
    }
    //goes all the way down and then visit sibilings and then uncles via parent; and goes all the way up
    if (fiber.child) {
        return fiber.child;
    }
    var nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}
var rootContainer = document.getElementById("root");
render(element, rootContainer);
