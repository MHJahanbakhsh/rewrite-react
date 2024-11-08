/******/ (() => { // webpackBootstrap
/*!******************!*\
  !*** ./test.jsx ***!
  \******************/
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var rootDom = document.getElementById('root');
var RootContainer = ReactDOM.createRoot(rootDom);
RootContainer.render(/*#__PURE__*/React.createElement(App, {
  key: 'App'
}));
function InputComponent(_ref) {
  var inputValue = _ref.inputValue,
    handleChange = _ref.handleChange;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Controlled Input:"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: inputValue,
    onChange: handleChange
  }));
}
function IndependentInputComponent() {
  var _React$useState = React.useState(''),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    localInputValue = _React$useState2[0],
    setLocalInputValue = _React$useState2[1];
  var _React$useState3 = React.useState('off'),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    dummyToggle = _React$useState4[0],
    setDummyToggle = _React$useState4[1];
  React.useEffect(function () {
    setDummyToggle(dummyToggle === 'off' ? 'on' : 'off');
  }, [localInputValue]);
  var handleLocalChange = function handleLocalChange(event) {
    setLocalInputValue(event.target.value);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
    key: 'input',
    type: "number",
    value: localInputValue,
    onChange: handleLocalChange
  }), /*#__PURE__*/React.createElement("div", {
    key: 'sibiling on input'
  }, "sibiling on input"));
}
function ToggleButton() {
  var _React$useState5 = React.useState(true),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    isH1 = _React$useState6[0],
    setIsH1 = _React$useState6[1];
  var toggleElement = function toggleElement() {
    setIsH1(!isH1);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    key: 'button',
    onClick: toggleElement
  }, "Toggle h1/p"), isH1 ? /*#__PURE__*/React.createElement("h1", {
    key: 'h1'
  }, "dynamic tag") : /*#__PURE__*/React.createElement("p", {
    key: 'p'
  }, "dynamic tag"));
}
function App() {
  return /*#__PURE__*/React.createElement(Main, {
    key: 'Main'
  });
}
function Main() {
  var _React$useState7 = React.useState(''),
    _React$useState8 = _slicedToArray(_React$useState7, 2),
    inputValue = _React$useState8[0],
    setInputValue = _React$useState8[1];
  console.log('re-render');
  var handleChange = function handleChange(event) {
    setInputValue(event.target.value);
  };
  return /*#__PURE__*/React.createElement("section", {
    key: 'section'
  }, /*#__PURE__*/React.createElement(ToggleButton, {
    key: "ToggleButton"
  }), /*#__PURE__*/React.createElement(IndependentInputComponent, {
    key: "IndependentInputComponent"
  }));
}
/******/ })()
;
//# sourceMappingURL=bundle.js.map