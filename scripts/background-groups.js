Hooks.on("renderCrucibleHeroCreation", async (app, html) => {
  const menu = html[0].querySelector("#background-selection.selection-menu");
  if (!menu) return;

  const packIds = game.settings.get("crucible", "backgroundSources") ?? [];
  if (packIds.length <= 1) return;

  const options = Array.from(menu.querySelectorAll("li.option"));
  if (!options.length) return;

  const packs = packIds
    .map(id => game.packs.get(id))
    .filter(p => p);

  const byPack = {};
  for (const pack of packs) {
    const label = pack.metadata.label;
    byPack[label] = [];
  }

  for (const li of options) {
    const id = li.dataset.backgroundId;
    const packId = li.dataset.pack || null;
    const pack = packs.find(p => p.metadata.id === packId);
    const label = pack ? pack.metadata.label : "Other Backgrounds";
    (byPack[label] ??= []).push(li);
  }

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
});
