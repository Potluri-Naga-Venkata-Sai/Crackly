import os
import json
import logging
from groq import Groq
import google.generativeai as genai
from openai import OpenAI

# Setup logging
logger = logging.getLogger(__name__)

# Initialize Clients
groq_api_keys = []
for key, value in os.environ.items():
    if key.startswith("GROQ_API_KEY") and value:
        groq_api_keys.append(value)

if not groq_api_keys and os.environ.get("GROQ_API_KEY"):
    groq_api_keys.append(os.environ.get("GROQ_API_KEY"))

current_groq_key_index = 0
groq_client = None
if groq_api_keys:
    groq_client = Groq(api_key=groq_api_keys[0], timeout=15.0) # Set timeout to fail fast

gemini_initialized = False
if os.environ.get("GEMINI_API_KEY"):
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    gemini_initialized = True

openai_client = None
if os.environ.get("OPENAI_API_KEY"):
    openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"), timeout=15.0)

def generate_content(prompt: str, system_prompt: str = "", json_mode: bool = True, fallback_to_groq: bool = True) -> str:
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    last_error = None
    
    # 1. Try Groq First (Fastest)
    global current_groq_key_index, groq_client
    if groq_api_keys:
        completion_args = {
            "model": "llama-3.3-70b-versatile",
            "messages": messages.copy(),
            "temperature": 0.7,
            "max_tokens": 4000,
        }
        if json_mode:
            if not system_prompt:
                completion_args["messages"].insert(0, {"role": "system", "content": "You output only raw valid JSON."})
            completion_args["response_format"] = {"type": "json_object"}

        for i in range(len(groq_api_keys)):
            try:
                if not groq_client:
                    groq_client = Groq(api_key=groq_api_keys[current_groq_key_index], timeout=15.0)
                completion = groq_client.chat.completions.create(**completion_args)
                return completion.choices[0].message.content
            except Exception as e:
                logger.warning(f"Groq key {current_groq_key_index} failed: {e}. Trying next...")
                last_error = e
                current_groq_key_index = (current_groq_key_index + 1) % len(groq_api_keys)
                groq_client = Groq(api_key=groq_api_keys[current_groq_key_index], timeout=15.0)

    # 2. Try OpenAI (Very fast and reliable)
    if openai_client:
        try:
            openai_args = {
                "model": "gpt-4o-mini",
                "messages": messages.copy(),
                "temperature": 0.7,
                "max_tokens": 4000,
            }
            if json_mode:
                openai_args["response_format"] = {"type": "json_object"}
            completion = openai_client.chat.completions.create(**openai_args)
            return completion.choices[0].message.content
        except Exception as e:
            logger.warning(f"OpenAI fallback failed: {e}")
            last_error = e

    # 3. Try Gemini (Fallback)
    if gemini_initialized:
        try:
            model_name = "gemini-2.5-flash"
            if system_prompt:
                model = genai.GenerativeModel(model_name=model_name, system_instruction=system_prompt)
            else:
                model = genai.GenerativeModel(model_name=model_name)
                
            generation_config = genai.types.GenerationConfig(temperature=0.7)
            if json_mode:
                generation_config.response_mime_type = "application/json"
            
            response = model.generate_content(prompt, generation_config=generation_config)
            if response.text:
                return response.text
        except Exception as e:
            logger.warning(f"Gemini fallback failed: {e}")
            last_error = e

    raise Exception(f"All LLM providers (Groq, OpenAI, Gemini) failed to generate content. Last error: {last_error}")
