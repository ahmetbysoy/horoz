def stream_chunks(chunks):
    text = ""
    for chunk in chunks:
        text += chunk
        yield text
