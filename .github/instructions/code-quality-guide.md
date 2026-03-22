---
applyTo: "app/**"
---

1. **Fail Fast (Handle Errors at the Start):** Use "Guard Clauses" to validate inputs and handle error conditions at the very beginning of a function. Return or throw early to avoid nesting the main logic inside a giant if block.
2. **Keep Functions Small and Cohesive:** A function should do one thing and do it well (Single Responsibility Principle). If a function spans too many lines, it can likely be broken down into smaller, more manageable ones.
3. **Reduce Cognitive Complexity:** Avoid "Arrow Code" (deeply nested if, for, and while statements). The more indentation levels you have, the harder it is for the human brain to track the state of the logic.
4. **Avoid Nested Loops (O(n2)):** Whenever possible, avoid placing a loop inside another. This drastically hurts performance. Consider using more efficient data structures, like HashMaps or Dictionaries, to look up information in constant time.
5. **Use Semantic and Self-Explanatory Names:** Variables and functions should have names that reveal their intent. Use days_until_expiration instead of d. Good naming reduces the need for explanatory comments.
6. **Avoid "Magic Numbers" and Hardcoded Strings: Never use raw values in your code (e.g., if (status == 3)). Replace them with named constants or enums (e.g., if (status == STATUS_CANCELLED)) to make the code readable and easier to update.
7. **Don’t Repeat Yourself (DRY):** If you find yourself copying and pasting the same code snippet in multiple places, extract that logic into a reusable function or component.
8. **Prefer Immutability:** Whenever the language allows, treat your data as immutable. Changing the state of global variables or passing objects by reference that undergo unexpected mutations is a common source of hard-to-track bugs.
9. **Comments Should Explain the "Why," Not the "What":** The code itself should be clear enough to explain what it is doing. Use comments to explain complex design decisions or business logic reasons that aren't obvious from the code alone.
10. **The Boy Scout Rule: Always leave the code a little cleaner than you found it. If you come across a messy section while implementing a task, take a moment to perform a minor refactor.