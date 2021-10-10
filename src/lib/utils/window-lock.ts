let bodyStyle = {
  top: "",
  position: "",
  height: "",
  minWidth: "",
};
export function windowLock(node?: HTMLElement): void {
  const { top, position, height, minWidth } = document.body.style;
  bodyStyle = {
    top,
    position,
    height,
    minWidth,
  };
  document.body.style.top = `-${window.scrollY}px`;
  document.body.style.position = "fixed";
  document.body.style.height = "100vh";
  document.body.style.minWidth = "100%";

  if (node) node.focus();
}

export function windowUnlock(): void {
  const scrollY: string = document.body.style.top;
  document.body.style.position = bodyStyle.position;
  document.body.style.top = bodyStyle.top;
  document.body.style.height = bodyStyle.height;
  document.body.style.minWidth = bodyStyle.minWidth;
  window.scrollTo(0, parseInt(scrollY || "0") * -1);
}
