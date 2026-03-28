from agent.prompt_builder import build_prompt
from agent.response_parser import parse_response


def run_agent_loop(user_input, state, memory, tools_text, router, permission, tool_executor):
    while not state.should_stop():
        task_type = router.detect_task_type(user_input)
        prompt = build_prompt(user_input=user_input, memory=memory.get_context(), tools=tools_text, state=state.serialize())
        response = router.call(prompt, task_type=task_type)
        parsed = parse_response(response)

        if parsed.type == "text":
            state.status = "completed"
            return parsed.content or ""

        if parsed.type == "tool_call" and parsed.tool_call:
            if not permission.check(parsed.tool_call):
                state.status = "stopped"
                return "Tool call denied by user."
            result = tool_executor.execute(parsed.tool_call)
            memory.add("tool", str(parsed.tool_call))
            memory.add("observation", result)
            user_input = f"TOOL RESULT:\n{result}"
            state.step += 1

    return "Stopped due to loop limits."
