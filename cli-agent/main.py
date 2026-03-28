import sys

import typer
from rich.console import Console
from rich.panel import Panel

from agent.core import Agent
from agent.self_test import run_self_test
from setup_wizard import check_setup, run_setup_wizard

app = typer.Typer(help="Open-source CLI AI Agent")
console = Console()


@app.command()
def chat(
    resume: str | None = typer.Option(None, help="Resume a saved session"),
    resume_latest: bool = typer.Option(False, help="Resume the most recent session"),
    model: str | None = typer.Option(None, help="Force a specific model"),
    verbose: bool = typer.Option(False, help="Show debug info"),
    safe_mode: bool = typer.Option(True, help="Require confirmations for risky tools"),
    stream: bool = typer.Option(False, help="Enable streaming output"),
) -> None:
    console.print(Panel("🤖 CLI Agent v0.5\nType /quit to exit.", title="Welcome"))

    if not check_setup():
        run_setup_wizard()
        return

    agent = Agent(model=model, verbose=verbose, safe_mode=safe_mode)

    if resume_latest and not resume:
        latest = agent.session_manager.latest_session_id()
        if latest:
            resume = latest

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
        if cmd == "/sessions":
            for item in agent.session_manager.list_sessions_with_meta():
                print(f"{item['id']} | {item['modified']}")
            continue
        if cmd == "/export":
            print(agent.export_current_session_markdown())
            continue
        if cmd == "/stats":
            print(agent.stats())
            continue

        agent.run(user_input, stream=stream)


@app.command("self-test")
def self_test() -> None:
    raise typer.Exit(code=run_self_test())


if __name__ == "__main__":
    if "--test" in sys.argv:
        raise SystemExit(run_self_test())
    app()
