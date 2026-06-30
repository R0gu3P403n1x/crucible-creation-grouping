console.log("Ancestry grouping hook fired");

Hooks.on("renderCrucibleHeroCreationSheet", async (app, html) => {
  // html is the actual DOM element, not a jQuery object
  const menu = html.querySelector("#ancestry-selection.selection-menu");
  if (!menu) {
    console.log("Ancestry menu not found");
    return;
  }

  console.log("Ancestry menu found, grouping begins…");

  const crucible = game.system;
  const packIds = Array.from(crucible.CONFIG.packs.ancestry ?? []);
  if (packIds.length <= 1) {
    console.log("Only one ancestry pack, skipping grouping");
    return;
  }

  const options = Array.from(menu.querySelectorAll("li.option"));
  if (!options.length) {
    console.log("No ancestry options found");
    return;
  }

  // Build identifier → pack label map
  const idToPackLabel = {};
  for (const id of packIds) {
    const pack = game.packs.get(id);
    if (!pack) continue;
    const label = pack.metadata.label;
    const docs = await pack.getDocuments({ type: "ancestry" });
    for (const doc of docs) {
      const identifier = doc.system?.identifier;
      if (!identifier) continue;
      idToPackLabel[identifier] = label;
    }
  }

  // Group options by pack label
  const byPack = {};
  for (const li of options) {
    const identifier = li.dataset.ancestryId;
    const label = idToPackLabel[identifier] ?? "Other Ancestries";
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

  console.log("Ancestry grouping complete");
});
