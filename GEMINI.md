# Agent Operating Guidelines

## Code Modification Safety
- **Avoid Custom JS Replacement Scripts**: When modifying code files, prefer using Antigravity's built-in `replace_file_content` or `multi_replace_file_content` tools over custom JavaScript/Python string replacement scripts (e.g. `String.prototype.replace()`). 
- **Beware of Silent Failures**: If you must use a custom script for string replacement, ALWAYS check the return value or verify the file contents immediately afterwards. Methods like JS `.replace()` fail silently if the exact string is not matched due to formatting or whitespace differences, which can lead to committing unmodified files.
- **Verification**: Always verify the content of a file using `view_file` or `grep_search` after attempting to patch it, before committing or assuming the operation succeeded.
