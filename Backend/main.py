# from langchain_ollama.llms import OllamaLLM
# from langchain_core.prompts import ChatPromptTemplate
# from vector import retriever
# from fastapi import FastAPI, Request
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware

# #uvicorn app:app --reload --port 8000

# from langchain_ollama.llms import OllamaLLM
# from langchain_core.prompts import ChatPromptTemplate

# # Load your model
# #deepseek-r1:8b
# #phi3:14b
# model = OllamaLLM(model="phi3:14b")  # Or "phi3:14b"

# template = """
# You are an intelligent assistant for study tasks.

# Your job is to return valid JSON in the following format DO NOT include any text outside the JSON object:
# {{
#   "flashcards": [ {{ "question": "...", "answer": "..." }}],
#   "content": "...",
#   "ocrText": ""
# }}

# example JSON:
# {{
#  "flashcards": [ {{ "question": "Why don't cars instantly halt when you release the gas pedal?", "answer": "Even after releasing the gas, a car does not stop immediately due to inertia. The moving car wants to keep moving forward because of its momentum. It gradually slows down as friction (between tires and road) and air resistance work against it."}}],
#   "content": "<div><p>Hi! I see you're curious about why cars don't instantly stop when we let go off the gas pedal.</p><ul><li>The answer lies in a principle of physics called inertia. In simpler terms, an object at rest tends to stay at rest and an object in motion tends to stay in motion until acted upon by an external force (as per Newton's First Law).</li><li>So when you press the gas pedal, your car moves forward due to the force generated.</li><li>When you release it, there isn't any immediate opposing force to stop it instantly. However, two factors work against the motion: friction between the tires and the road, and air resistance (or drag).</li><li>These forces gradually slow down your car until it finally comes to a halt.</li></ul></div>"
# }}

# Guidelines:
# - Output ONLY the JSON object. No extra commentary.
# - The "content" field must be a **single string** using clean HTML, like <div>, <h1>, <p>, <ul>, <table>, etc.
# - DO NOT put flashcards inside "content".
# - Format the HTML properly and safely inside a single quoted string.
# - Engage in a friendly, helpful tone, like a human tutor and put those in the `"content"` field.
# - IMPORTANT DO NOT include any text outside the JSON object.
# - DO NOT include ```json or any code blocks in the output.
# - Do NOT insert `/*`, comment syntax, or unfinished tags in the content.
# - Ensure all quotes are paired properly in keys and values.
# - Always return valid HTML wrapped inside the "content" string.
# - Escape newlines as `\\n` if necessary.

# Now answer the following instruction using valid HTML in the content field:
# {message}
# """

# prompt = ChatPromptTemplate.from_template(template)
# chain = prompt | model

# def generate_response(message):
#     return chain.invoke({"message": message})

# # Optional: CLI Test
# if __name__ == "__main__":
#     while True:
#         print("\n\n-----------------------------------------------")
#         message = input("Paste message (q to quit): ")
#         if message.lower() == "q":
#             break

#         result = generate_response(message)
#         print("\nFLASHCARDS:\n", result["flashcards"])
#         print("\nSUMMARY:\n", result["summary"])



from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from vector import retriever
from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

#uvicorn app:app --reload --port 8000

from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate

# Load your model
#deepseek-r1:8b
#phi3:14b
model = OllamaLLM(model="phi3:14b")  # Or "phi3:14b"

template = """
Your job is to output a valid JSON object with flashcards and a markdown explanation.

IMPORTANT: The `content` value must be ONE single string. Use \\n for newlines, and DO NOT split the content into multiple string blocks.
IMPORTANT: always include <start-json> and <end-json> markers in the output when the json part starts and ends.
IMPORTANT: dont include   ```json only use <start-json> and <end-json> markers.
<start-json>
{{
  "flashcards": [{{"question": "...", "answer": "..."}}],
  "content": "...",
  "ocrText": ""
}}
<end-json>


example JSON format:
<start-json>
{{
  "flashcards": [
    {{
      "question": "What is energy conversion?",
      "answer": "Energy conversion refers to the process of changing energy from one form into another."
    }},
    {{
      "question": "Give an example of energy conversion.",
      "answer": "An example would be a light bulb. When electrical energy enters the light bulb, it is converted into both heat and light energy."
    }},
    {{
      "question": "What law governs energy conversion?",
      "answer": "The First Law of Thermodynamics states that energy cannot be created or destroyed but can only change from one form to another. This is also known as the principle of conservation of energy."
    }},
    {{
      "question": "Why is understanding energy conversion important?",
      "answer": "Understanding how energy converts from one type to another helps us use our resources more efficiently and develop technologies that are better for the environment."
    }}
  ],
  "content": "<div><p>Hello! You're interested in learning about energy conversions. Energy conversion is a fundamental concept in physics, referring to changing energy from one form into another.</p><ul><li>For example, consider an electric heater. When you switch it on, electrical energy is converted into heat and light energy which warms up your room.</li></ul><h2>Understanding the Laws of Thermodynamics</h2><p>According to the First Law of Thermodynamics, energy cannot be created or destroyed — it only changes form.</p><table><tr><th>Term</th><th>Meaning</th></tr><tr><td>Energy Conversion</td><td>Process of changing energy from one form to another.</td></tr></table><p>Understanding how and why these conversions occur can help us develop more efficient technologies, as well as appreciate the balance and conservation principles inherent in our universe. It's an exciting topic with wide-ranging implications!</p></div>",
  "ocrText": ""
}}
<end-json>


Guidelines:
- The "content" field must be a **single string** using clean HTML, like <div>, <h1>, <p>, <ul>, <table>, etc.
- DO NOT put flashcards inside "content".
- Format the HTML properly and safely inside a single quoted string.
- Do NOT insert `/*`, comment syntax, or unfinished tags in the content.
- Ensure all quotes are paired properly in keys and values.
- Always return valid HTML wrapped inside the "content" string.
- Include the flashcards in the `"flashcards"` field as structured objects.
- DO NOT forget the comma after `"question"` and `"answer"`
- ensure all HTML tags are closed properly



Now generate the output for this instruction:
{message}
"""

def generate_quiz_response(prompt_text):
  prompt = ChatPromptTemplate.from_template(prompt_text)
  chain = prompt | model
  return chain.invoke({})

prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model

def generate_response(message):
    return chain.invoke({"message": message})




# # Optional: CLI Test
# if __name__ == "__main__":
#     while True:
#         print("\n\n-----------------------------------------------")
#         message = input("Paste message (q to quit): ")
#         if message.lower() == "q":
#             break

#         result = generate_response(message)
#         print("\nFLASHCARDS:\n", result["flashcards"])
#         print("\nSUMMARY:\n", result["summary"])


#template = """
# You are an intelligent assistant for study tasks.

# Your job is to return valid JSON in the following format:

# {
#   "flashcards": [ { "question": "...", "answer": "..." } ],
#   "content": "...",
#   "ocrText": ""
# }

# Guidelines:
# - Output ONLY the JSON object. No extra commentary.
# - The "content" field must be a **single string** using clean HTML, like <div>, <h1>, <p>, <ul>, <table>, etc.
# - DO NOT include invalid characters or typos.
# - DO NOT put flashcards inside "content".
# - Use only ASCII characters.
# - DO NOT use markdown (like `**bold**`, `\\n`, `#`, etc.).
# - Format the HTML properly and safely inside a single quoted string.

# Now answer the following instruction using valid HTML in the content field:
# {message}
# """









# template = """
# You are an intelligent assistant for study tasks.

# Your job is to return JSON data that matches the user's intent. **Do NOT include anything outside the JSON.**

# Instructions:
# - Reply like a friendly human tutor. Use bullet points, short paragraphs, examples, analogies, even tables — but only inside the `"content"` field.
# - If the user asks for a summary or says “make it shorter,” return a short, simplified version in `"content"`.
# - If the user asks for flashcards, return them in `"flashcards"` as exactly structured objects.
# - If OCR is needed, put it in `"ocrText"`.
# - ALWAYS include `"content"` with a thoughtful explanation.
# - Do NOT include any flashcard text or explanation inside other fields.

# ---
# User message:
# {message}
# ---

# Return ONLY valid JSON in this format:

# ```json
# {{
#   "flashcards": [ { "question": "...", "answer": "..." } ],
#   "content": "Full explanation here with bullets, tables, and helpful tone.",
#   "ocrText": null
# }}
# """







# You are an intelligent assistant for study tasks.

# Your job is to return valid JSON in the following format:

# {
#   "flashcards": [ { "question": "...", "answer": "..." } ],
#   "content": "This is a markdown-formatted explanation.\n\nUse **bold**, tables, bullet points, and math like `τ = F × d`.\n\nAlways keep it valid JSON.",
#   "ocrText": ""
# }

# Guidelines:
# - The "content" field should be markdown-formatted text as a single double-quoted string.
# - Use `\\n` for new lines, not raw newlines.
# - Do not use `\\(` or LaTeX math environments. Use inline math like `F × d` instead.
# - Never include backslashes before parentheses.
# - Escape quotes inside strings like this: `\"` if needed.
# - DO NOT format the response using triple backticks or code blocks.
# - DO NOT include any text outside the JSON object.











# Your job is to return a **valid JSON object** with these keys:

# - "flashcards": a list of objects, each with "question" and "answer"
# - "content": a single markdown string, use \\n for newlines
# - "ocrText": can be an empty string ""

# Rules:
# - Output ONLY a valid JSON object. No explanations or markdown blocks.
# - Use double quotes for all keys and values.
# - Do NOT wrap anything in <start-json> or <end-json>.
# - Escape inner double quotes properly.
# - Example format:
# {{
#   "flashcards": [{{"question": "Q?", "answer": "A"}}],
#   "content": "This is **markdown**.\\n\\nUse tables like:\\n| Term | Meaning |\\n|------|---------|",
#   "ocrText": ""
# }}



# You are an intelligent assistant for study tasks.

# Your job is to return valid JSON in the following format:

# {{
#   "flashcards": [ {{ "question": "...", "answer": "..." }} ],
#   "content": "...",
#   "ocrText": ""
# }}

# Guidelines:
# - Output ONLY the JSON object. No extra commentary.
# - The `"content"` field must be a **single string** with newlines written as `\\n`, not actual newlines.
# - DO NOT include invalid characters, typos, or partial answers.
# - DO NOT use smart quotes or non-ASCII characters.
# - DO NOT put flashcards in the `"content"` field.
# - Use proper escape sequences inside strings if needed (e.g., escape double quotes).
# - DO NOT format anything other than the `"content"` field with markdown or code blocks.
# - Engage in a friendly, helpful tone, like a human tutor and put those in the `"content"` field.

# Now answer the following instruction strictly following the rules:
# {message}


# template = """
# You are an intelligent assistant for study tasks.

# Your job is to return valid JSON in the following format DO NOT include any text outside the JSON object:
# {{
#   "flashcards": [ {{ "question": "...", "answer": "..." }}],
#   "content": "...",
#   "ocrText": ""
# }}

# example JSON:
# {{
#  "flashcards": [ {{ "question": "Why don't cars instantly halt when you release the gas pedal?", "answer": "Even after releasing the gas, a car does not stop immediately due to inertia. The moving car wants to keep moving forward because of its momentum. It gradually slows down as friction (between tires and road) and air resistance work against it."}}],
#   "content": "<div><p>Hi! I see you're curious about why cars don't instantly stop when we let go off the gas pedal.</p><ul><li>The answer lies in a principle of physics called inertia. In simpler terms, an object at rest tends to stay at rest and an object in motion tends to stay in motion until acted upon by an external force (as per Newton's First Law).</li><li>So when you press the gas pedal, your car moves forward due to the force generated.</li><li>When you release it, there isn't any immediate opposing force to stop it instantly. However, two factors work against the motion: friction between the tires and the road, and air resistance (or drag).</li><li>These forces gradually slow down your car until it finally comes to a halt.</li></ul></div>"
# }}

# Guidelines:
# - Output ONLY the JSON object. No extra commentary.
# - The "content" field must be a **single string** using clean HTML, like <div>, <h1>, <p>, <ul>, <table>, etc.
# - DO NOT put flashcards inside "content".
# - Format the HTML properly and safely inside a single quoted string.
# - Engage in a friendly, helpful tone, like a human tutor and put those in the `"content"` field.
# - IMPORTANT DO NOT include any text outside the JSON object.
# - DO NOT include ```json or any code blocks in the output.
# - Do NOT insert `/*`, comment syntax, or unfinished tags in the content.
# - Ensure all quotes are paired properly in keys and values.
# - Always return valid HTML wrapped inside the "content" string.
# - Escape newlines as `\\n` if necessary.

# Now answer the following instruction using valid HTML in the content field:
# {message}
# """