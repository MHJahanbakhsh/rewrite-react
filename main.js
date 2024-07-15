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
function render(element, container) {
    var _a;
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
    //recursive call
    (_a = element.props) === null || _a === void 0 ? void 0 : _a.children.forEach(function (child) { return render(child, dom); });
    container.appendChild(dom);
}
var rootContainer = document.getElementById("root");
render(element, rootContainer);
