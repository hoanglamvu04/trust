export function Dialog({ children }) {
  return <div>{children}</div>;
}
export function DialogTrigger({ children }) {
  return <div>{children}</div>;
}
export function DialogContent({ children, className }) {
  return <div className={className}>{children}</div>;
}
