interface FiberNode {
  tag: WorkTag; // Type of fiber (e.g., ClassComponent, FunctionComponent, HostComponent)
  key: null | string; // The key used to identify this node
  elementType: any; // The type of the element (e.g., a function for a function component)
  type: any; // The resolved type of the element (can be different from elementType for higher-order components)
  stateNode: any; // The local state associated with this fiber (e.g., the instance of a class component)
  return: FiberNode | null; // The parent fiber node
  child: FiberNode | null; // The first child fiber node
  sibling: FiberNode | null; // The next sibling fiber node
  index: number; // Index of this fiber in its parent's child list
  ref: any; // Reference to be passed to the component
  pendingProps: any; // Props that will be applied on the next render
  memoizedProps: any; // Props that were used during the last render
  updateQueue: UpdateQueue | null; // Queue of updates to apply to this component
  memoizedState: any; // State used during the last render
  dependencies: Dependencies | null; // Context dependencies
  mode: TypeOfMode; // The mode in which this fiber is rendered (e.g., ConcurrentMode, StrictMode)
  effectTag: SideEffectTag; // Effect associated with this fiber (e.g., Placement, Update)
  nextEffect: FiberNode | null; // Next fiber with side-effects
  firstEffect: FiberNode | null; // First fiber with side-effects in the subtree
  lastEffect: FiberNode | null; // Last fiber with side-effects in the subtree
  expirationTime: ExpirationTime; // Time when this work should be completed
  alternate: FiberNode | null; // The alternate fiber for this node (used during reconciliation)
}

// Example enums and types for understanding:
type WorkTag =
  | "FunctionComponent"
  | "ClassComponent"
  | "HostComponent"
  | "HostText"
  | "Fragment"
  | "ContextProvider"
  | "ContextConsumer"
  | "SuspenseComponent"
  | "ForwardRef"
  | "MemoComponent"
  | "LazyComponent";

type TypeOfMode = number;

type SideEffectTag = number;

type ExpirationTime = number;

interface UpdateQueue {
  // Simplified; actual structure is more complex
  baseState: any;
  firstUpdate: any;
  lastUpdate: any;
}

interface Dependencies {
  firstContext: any;
}
