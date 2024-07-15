type Props = Record<string, any> | null;

interface ZeactElement {
  type: keyof HTMLElementTagNameMap | "TEXT_ELEMENT";
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

function render(element: ZeactElement, container: HTMLElement | Text) {
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  //setting attributes
  const isProperty = (key: string) => key !== "children";
  element.props &&
    Object.keys(element.props)
      .filter(isProperty)
      .forEach((name) => {
        // stop ts bitching
        (dom as any)[name] = element.props![name];
      });
  //recursive call
  element.props?.children.forEach((child: ZeactElement) => render(child, dom));

  container.appendChild(dom);
}

const rootContainer = document.getElementById("root") as HTMLElement;
render(element, rootContainer);
