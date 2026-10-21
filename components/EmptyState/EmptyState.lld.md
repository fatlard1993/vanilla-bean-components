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
