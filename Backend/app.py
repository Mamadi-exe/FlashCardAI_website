# app.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from main import generate_response
from main import generate_quiz_response
from vector import add_flashcards_to_chroma
import json
import re
import ast  # For safe eval fallback
import json5


#py -m uvicorn app:app --reload --port 8000

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def sanitize_json(json_text):
    try:
        return json.loads(json_text)  # Try parsing as is
    except json.JSONDecodeError:
        match = re.search(r'"content"\s*:\s*"([\s\S]*?)"', json_text)
        if match:
            content = match.group(1)
            fixed = content.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
            new_text = re.sub(r'"content"\s*:\s*"([\s\S]*?)"', f'"content": "{fixed}"', json_text)
            return json.loads(new_text)
        else:
            raise ValueError("No content field found")

# def extract_clean_json(raw_text):
#     match = re.search(r"<start-json>(.*?)<end-json>", raw_text, re.DOTALL)
#     if not match:
#         print("❌ No <start-json> ... <end-json> block found.")
#         return None

#     json_text = match.group(1).strip()

#     print("✅ Extracted JSON candidate:")
#     print(json_text)

#     try:
#         return json.loads(json_text)
#     except json.JSONDecodeError as e:
#         print("❌ Standard JSON failed:", e)

#     try:
#         return json5.loads(json_text)
#     except Exception as e:
#         print("❌ JSON5 also failed:", e)

#     # 👉 Attempt to sanitize and parse again
#     try:
#         print("🔧 Attempting to sanitize JSON...")
#         return sanitize_json(json_text)
#     except Exception as e:
#         print("❌ Sanitization also failed:", e)

#     return None

def extract_clean_json(raw_text, regenerate_fn=None, max_retries=3):
    """
    Attempts to extract and parse JSON from the raw_text.
    If parsing fails, will call regenerate_fn (if provided) to get a new response, up to max_retries.
    """
    for attempt in range(max_retries):
        match = re.search(r"<start-json>(.*?)<end-json>", raw_text, re.DOTALL)
        if not match:
            print("❌ No <start-json> ... <end-json> block found.")
            if regenerate_fn:
                print(f"🔄 Regenerating response (attempt {attempt+1})...")
                raw_text = regenerate_fn()
                continue
            return None

        json_text = match.group(1).strip()

        print("✅ Extracted JSON candidate:")
        print(json_text)

        try:
            return json.loads(json_text)
        except json.JSONDecodeError as e:
            print("❌ Standard JSON failed:", e)

        try:
            return json5.loads(json_text)
        except Exception as e:
            print("❌ JSON5 also failed:", e)

        # 👉 Attempt to sanitize and parse again
        try:
            print("🔧 Attempting to sanitize JSON...")
            return sanitize_json(json_text)
        except Exception as e:
            print("❌ Sanitization also failed:", e)

        # If we reach here, all parsing failed
        if regenerate_fn:
            print(f"🔄 Regenerating response (attempt {attempt+1})...")
            raw_text = regenerate_fn()
        else:
            break

    return None


@app.post("/generate-quiz")
async def generate_test(req: Request):
    body = await req.json()
    print(f"Received request body: {body}")
    category = body.get("category")
    question_count = body.get("questionCount", 10)

    if not category or not isinstance(category, dict):
        return {"error": "Category data is missing or invalid."}

    flashcards = category.get("cards", [])
    textItems = category.get("textItems", [])

    # Build the quiz content
    all_content = []
    for fc in flashcards:
        all_content.append(f"Q: {fc.get('question', '')}\nA: {fc.get('answer', '')}")
    for note in textItems:
        all_content.append(f"Note: {note}")
        
    

    joined = "\n\n".join(all_content)
    
    def regenerate():
        print("🔁 Calling model to regenerate response...")
        return generate_quiz_response(prompt)

    prompt = f"""
        You are a smart assistant that generates multiple choice quizzes for learners.

        Below is some study content from a user-selected category:
        - {len(flashcards)} flashcards
        - {len(textItems)} notes
        - The user wants **{question_count}** multiple choice questions

        --- STUDY CONTENT START ---
        {joined}
        --- STUDY CONTENT END ---

        ALWAYS return your result in this format:

        <start-json>
        {{{{
          "questions": [
            {{{{
              "question": "<h3>What is the role of enzymes?</h3>",
              "correctAnswer": "<p>Enzymes act as biological catalysts that speed up chemical reactions without being consumed.</p>",
              "wrongAnswers": [
                  "<p>Enzymes are a type of carbohydrate used for energy.</p>",
                  "<p>Enzymes break down only fats in the body.</p>",
                  "<p>Enzymes slow down the body's metabolism to preserve energy.</p>"]
            }}}},
            ...
          ],
          "feedback": "<p>Good job! Review the role of enzymes and their specificity.</p>"
        }}}}
        <end-json>
        
        
        DO NOT DO THIS OR ELSE YOU WILL BE TERMINATED: 
        <start-json>
        {{{{
          "flashcards": [{{{{"question": "...", "answer": "..."}}}}],
          "content": "...",
          "ocrText": ""
        }}}}
        <end-json>
        
        Guidelines:
        - Format the HTML properly and safely inside a single quoted string.
        - Ensure all quotes are paired properly in keys and values.
        - Always return valid HTML.
        - ALWAYS wrap the full sentence in a single <p>...</p> block, with no extra quotation marks.
    """

    raw = generate_quiz_response(prompt)
    print("=== RAW MODEL OUTPUT (QUIZ) ===")
    print(raw)
    print("===============================")

    parsed = extract_clean_json(raw, regenerate_fn=regenerate)
    if parsed:
        return {
            "questions": parsed.get("questions", []),
            "feedback": parsed.get("feedback", "")
        }

    return {
        "questions": [],
        "feedback": "⚠️ Failed to parse quiz. Please try again or adjust the input.",
    }


@app.post("/generate")
async def generate(req: Request):
    body = await req.json()
    message = body.get("message", "")

    if not message:
        return {"error": "Message is empty"}
    
    def regenerate():
        print("🔁 Calling model to regenerate response...")
        return generate_response(message)


    raw = generate_response(message)
    print("=== RAW MODEL OUTPUT ===")
    print(raw)
    print("========================")

    parsed = extract_clean_json(raw, regenerate_fn=regenerate)
    if parsed:
        return {
            "flashcards": parsed.get("flashcards", []),
            "content": parsed.get("content", ""),
            "ocrText": parsed.get("ocrText", "")
        }

    return {
        "flashcards": [],
        "content": "⚠️ Failed to parse response from model. Please try again or check your prompt format.",
        "ocrText": ""
    }