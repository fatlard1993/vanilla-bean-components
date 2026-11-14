# EmptyState

> ./EmptyState.js

What an emptied list or view shows. The decision is that every part is optional and follows its option, so one EmptyState can change from "loading" to "nothing yet" to "nothing matches" without being rebuilt.

## Each part follows its option

- the title and icon change in place, and a cleared icon takes no room
  - new Subject({ title: "First", icon: "seedling", appendTo: document.body }) captures e then e.options.title = "Second" then e.options.icon = null -> e.elem.textContent.includes("Second") && e._icon.elem.hidden === true
- an action given as options becomes a button that runs it
  - new Array() captures pressed then new Subject({ title: "Empty", action: { textContent: "Add", onPointerPress: () => pressed.push(1) }, appendTo: document.body }) captures e then e.elem.querySelector("button").click() -> pressed.length === 1

## Loading is the same view, on its way

A view that's fetching shows where its content will be, then becomes the empty state or goes away, so loading is an option of the one EmptyState rather than another component.

- loading shows a spinner in place of the icon, and the icon comes back when it's done
  - new Subject({ icon: "seedling", loading: true, appendTo: document.body }) captures e then e._icon.options.icon captures during then e.options.loading = false -> during === "spinner" && e._icon.options.icon === "seedling" && e.elem.classList.contains("loading") === false

## No action is no button

- an action set to nothing takes the button away, rather than drawing an empty one
  - new Subject({ action: { textContent: "Add" }, appendTo: document.body }) captures e then e.elem.querySelector(".action") captures had then (e.options.action = null) -> had !== null && e.elem.querySelector(".action") === null

## A long load can say how far it has come

A spinner says something is coming, not when. A load long enough to wait through (a game's assets, a big import) shows a bar instead of leaving the spinner to turn, and the bar is named by the title so a screen reader hears what is loading.

- a progress from 0 to 1 shows a named bar at that value, and clearing it takes the bar away
  - new Subject({ loading: true, title: "Loading the map", progress: 0.4, appendTo: document.body }) captures e then e.elem.querySelector("progress") captures bar then bar.hidden captures hiddenDuring then bar.value captures during then (e.options.progress = undefined) -> hiddenDuring === false && Math.abs(during - 0.4) < 0.001 && bar.getAttribute("aria-label") === "Loading the map" && bar.hidden === true
- a value outside 0 to 1 is held to its ends
  - new Subject({ progress: 3, appendTo: document.body }) captures e -> e.elem.querySelector("progress").value === 1
