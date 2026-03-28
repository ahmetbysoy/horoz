import typer
from rich.console import Console
from rich.panel import Panel

from agent.core import Agent
from setup_wizard import check_setup, run_setup_wizard

app = typer.Typer(help="Open-source CLI AI Agent")
console = Console()


@app.command()
def chat(
    resume: str | None = typer.Option(None, help="Resume a saved session"),
    model: str | None = typer.Option(None, help="Force a specific model"),
    verbose: bool = typer.Option(False, help="Show debug info"),
    safe_mode: bool = typer.Option(True, help="Require confirmations for risky tools"),
) -> None:
    console.print(Panel("🤖 CLI Agent v0.1\nType /quit to exit.", title="Welcome"))

    if not check_setup():
        run_setup_wizard()
        return

    agent = Agent(model=model, verbose=verbose, safe_mode=safe_mode)
    if resume:
        agent.load_session(resume)

    while True:
        user_input = console.input("[bold green]> ")
        cmd = user_input.strip()

        if cmd in {"/quit", "/exit"}:
            agent.save_session()
            break
        if cmd == "/save":
            agent.save_session()
            continue
        if cmd == "/history":
            agent.show_history()
            continue

        agent.run(user_input)


if __name__ == "__main__":
    app()
