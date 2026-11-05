# UI architecture
- Use semantic CSS tokens for every theme, including the home-page shell, so changing themes updates every page consistently.
- Keep theme selection in a subscribed shared browser store; initialize it at the app shell so direct page links honor the saved selection.