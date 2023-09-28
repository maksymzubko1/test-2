export function openNewTab(link: string) {
  const a = document.createElement("a");
  a.href = link;
  a.target = "_blank";
  a.click();
  a.remove();
}
