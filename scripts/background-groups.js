console.log("Background grouping hook fired");

Hooks.on("renderCrucibleHeroCreationSheet", async (app, html) => {
  // Find the background selection menu
  const menu = html.querySelector("#background-selection.selection-menu");
  if (!menu) {
    console.log("Background menu not found");
    return;
  }

  console.log("Background menu found, grouping begins…");

  const crucible = game.system;
  const packIds = Array.from(crucible.CONFIG.packs.background ?? []);
  if (packIds.length <= 1) {
    console.log("Only one background pack, skipping grouping");
    return;
  }

  const options = Array.from(menu.querySelectorAll("li.option"));
  if (!options.length) {
    console.log("No background options found");
    return;
  }

  // Build identifier → pack label map
  const idToPackLabel = {};
  for (const id of packIds) {
    const pack = game.packs.get(id);
    if (!pack) continue;
    const label = pack.metadata.label;
    const docs = await pack.getDocuments({ type: "background" });
    for (const doc of docs) {
      const identifier = doc.system?.identifier;
      if (!identifier) continue;
      idToPackLabel[identifier] = label;
    }
  }

  // Group options by pack label
  const byPack = {};
  for (const li of options) {
    const identifier = li.dataset.backgroundId;
    const label = idToPackLabel[identifier] ?? "Other Backgrounds";
    (byPack[label] ??= []).push(li);
  }

  // Rebuild menu with headers + groups
  menu.innerHTML = "";

  for (const [label, groupOptions] of Object.entries(byPack)) {
    const header = document.createElement("div");
    header.classList.add("ccg-pack-header");
    header.innerHTML = `<span class="ccg-chevron"></span><span class="ccg-label">${label}</span>`;

    const group = document.createElement("div");
    group.classList.add("ccg-pack-group", "collapsed");

    for (const li of groupOptions) group.appendChild(li);

    header.addEventListener("click", () => {
      group.classList.toggle("collapsed");
      header.classList.toggle("open");
    });

    menu.appendChild(header);
    menu.appendChild(group);
  }

  console.log("Background grouping complete");
});
