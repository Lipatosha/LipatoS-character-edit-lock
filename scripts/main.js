const MODULE_ID = "lipatos-character-edit-lock";

function isRestrictedPlayer() {
  return !!game.user && !game.user.isGM;
}

function normalizeText(element) {
  return (element?.textContent ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getActor(app) {
  return app?.actor ?? app?.document ?? app?.object ?? null;
}

function removeEditControls(root, app) {
  if (!isRestrictedPlayer()) return;

  const actor = getActor(app);
  if (actor?.type !== "character") return;

  for (const element of root.querySelectorAll(
    "button, a, [data-action], [data-tooltip], [aria-label]"
  )) {
    const action = (element.dataset?.action ?? "").toLowerCase();
    const meta = [
      element.title ?? "",
      element.getAttribute?.("aria-label") ?? "",
      element.dataset?.tooltip ?? "",
      normalizeText(element)
    ].join(" ").toLowerCase();

    const isEditMode =
      /editmode|toggleedit|edit-mode/.test(action) ||
      /изменение|режим редактирования|edit mode/.test(meta);

    if (isEditMode) element.remove();
  }
}

function patchSheet(app, html) {
  if (!isRestrictedPlayer()) return;

  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root) return;

  const run = () => removeEditControls(root, app);
  run();

  if (!root._lipatosCharacterEditObserver) {
    const observer = new MutationObserver(() => queueMicrotask(run));
    observer.observe(root, { childList: true, subtree: true });
    root._lipatosCharacterEditObserver = observer;
  }
}

Hooks.on("renderApplicationV2", patchSheet);
Hooks.on("renderActorSheet", patchSheet);

Hooks.once("ready", () => {
  console.log(`${MODULE_ID} | 1.0.0 ready`);
});
