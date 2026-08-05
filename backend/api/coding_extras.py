import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq

# We will import this in coding.py to keep it clean, or just append to coding.py directly.
