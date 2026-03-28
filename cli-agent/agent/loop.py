from collections import Counter

from agent.prompt_builder import build_prompt
from agent.response_parser import parse_response


MAX_SAME_TOOL_CALLS = 3


def run_agent_loop(user_input, state, memory, tools_text, router, permission, tool_executor):
    tool_counter = Counter()

    while not state.should_stop():
        task_type = router.detect_task_type(user_input)
        prompt = build_prompt(user_input=user_input, memory=memory.get_context(), tools=tools_text, state=state.serialize())
        response = router.call(prompt, task_type=task_type)
        parsed = parse_response(response)

        if parsed.type == "text":
            state.status = "completed"
            return parsed.content or ""

        if parsed.type == "tool_call" and parsed.tool_call:
            tool_name = parsed.tool_call.get("tool", "unknown")
            tool_counter[tool_name] += 1
            if tool_counter[tool_name] >= MAX_SAME_TOOL_CALLS:
                state.status = "stopped"
                return f"Tool cooldown triggered for '{tool_name}' after repeated calls."

            if not permission.check(parsed.tool_call):
                state.status = "stopped"
                return "Tool call denied by user."

            result = tool_executor.execute(parsed.tool_call)
            memory.add("tool", str(parsed.tool_call))
            memory.add("observation", result)

            if result.startswith("Tool error") or result.startswith("[SECURITY]"):
                user_input = f"ERROR OBSERVATION:\n{result}\nPlease produce a safer plan."
            else:
                user_input = f"TOOL RESULT:\n{result}"

            state.step += 1
            continue

        state.consecutive_errors += 1
        user_input = "Parser could not classify response. Return valid JSON or text response."

    return "Stopped due to loop limits."
