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
    render: render
};
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
var deletions;
function render(element, container) {
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
function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot === null || wipRoot === void 0 ? void 0 : wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}
function commitWork(fiber) {
    var _a;
    if (!fiber) {
        return;
    }
    var domParent = fiber.parent.dom;
    if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
        domParent === null || domParent === void 0 ? void 0 : domParent.appendChild(fiber.dom);
    }
    else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
        updateDom(fiber.dom, (_a = fiber.alternate) === null || _a === void 0 ? void 0 : _a.props, fiber.props);
    }
    else if (fiber.effectTag === "DELETION") {
        domParent === null || domParent === void 0 ? void 0 : domParent.removeChild(fiber.dom);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}
var isEvent = function (key) { return key.startsWith("on"); };
var isProperty = function (key) { return key !== "children"; };
var isNew = function (prev, next) { return function (key) {
    return prev[key] !== next[key];
}; };
var isGone = function (prev, next) { return function (key) { return !(key in next); }; };
function updateDom(dom, prevProps, nextProps) {
    // Remove old properties
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach(function (name) {
        dom.removeAttribute(name);
    });
    // Set new or changed properties
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(function (name) {
        dom.setAttribute(name, nextProps[name]);
    });
    // Add event listeners
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(function (name) {
        var eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, nextProps[name]);
    });
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
    //essentially builds-up the fiber tree, before commit phase
    reconcileChildren(fiber, elements);
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
function reconcileChildren(wipFiber, elements) {
    var _a;
    var index = 0;
    var oldFiber = (_a = wipFiber.alternate) === null || _a === void 0 ? void 0 : _a.child;
    var prevSibling = null;
    //The element is the thing we want to render to the DOM and the oldFiber is what we rendered the last time.
    while (index < elements.length || oldFiber != null) {
        var element_1 = elements[index];
        var newFiber = null;
        var AreSameType = element_1.type === (oldFiber === null || oldFiber === void 0 ? void 0 : oldFiber.type);
        if (AreSameType) {
            newFiber = {
                type: oldFiber === null || oldFiber === void 0 ? void 0 : oldFiber.type,
                props: element_1.props,
                dom: oldFiber === null || oldFiber === void 0 ? void 0 : oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
                child: null,
                sibling: null,
            };
        }
        if (element_1 && !AreSameType) {
            newFiber = {
                type: element_1.type,
                props: element_1.props,
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
        }
        else if (element_1) {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber;
        index++;
    }
}
var element = Zeact.createElement("div", { id: "foo" }, Zeact.createElement("li", {}, Zeact.createElement("a", {}, "bar")), Zeact.createElement("div", { style: "background-color:red" }, "Hello"));
var rootContainer = document.getElementById("root");
render(element, rootContainer);
