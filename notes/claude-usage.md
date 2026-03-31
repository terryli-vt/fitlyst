# Install Claude Code

On Windows, run in PowerShell:

```powershell
irm https://claude.ai/install.ps1 | iex
```

You may need to add Claude to your PATH environment variable if it is not added automatically.

Then go to your project directory and run:

```bash
claude
```

# Creating a Project Memory

To create a context file for your project, run `/init` to create a `CLAUDE.md` file in your project directory. This file will be used to store the context and memory for your project.

# Review Changes

A great way to make & review changes is to allow all edits on Claude, then review them in Source Control in the IDE.
