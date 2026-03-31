# Install Claude Code

On Windows, run in PowerShell:

```powershell
irm https://claude.ai/install.ps1 | iex
```

You may need to add Claude to your PATH environment variable if it is not added automatically.

# Run Claude

Open terminal, then go to your project directory and run:

```bash
claude
```

You can use shortcut

```
Ctrl + `
```

to open/hide the terminal in VS Code.

# Creating a Project Memory

To create a context file for your project, run `/init` to create a `CLAUDE.md` file in your project directory. This file will be used to store the context and memory for your project.

This file should remain lean because it will be loaded into the context for each interaction with Claude.

You may want to update the `CLAUDE.md` file as you work on your project to keep the context up to date.

# Review Changes

A great way to make & review changes is to allow all edits on Claude, then review them in Source Control in the IDE.

# Plan Mode

Use `Shift + Tab` to toggle on Plan Mode, which allows you to see the plan for the current task and make adjustments as needed.

It'll draw a plan and it'll not execute the plan until you confirm it. This allows you to review the steps before they are executed, giving you more control over the process.

# Context Management

Use the `/context` command to view context usage.

Use the `/clear` command to clear the context and start fresh. This can be useful if you want to move on to a new task or if the current context is no longer relevant.

Use the `/compact` command to compact the context, which can help reduce the size of the context and improve performance. This is useful when the context has become too large and we're working on related tasks.

# Track Usage

Use the `/usage` command to track your usage of Claude, including the number of tokens used and the cost associated with that usage. This can help you manage your usage and stay within any limits you may have.
